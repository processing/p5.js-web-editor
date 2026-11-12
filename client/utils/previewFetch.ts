export interface SketchFile {
  _id: string;
  name: string;
  fileType?: string;
  children: string[];
  url?: string;
  blobUrl?: string;
}

export type FileUrls = Record<string, string>;

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;

export function getFileUrls(files: SketchFile[]): FileUrls {
  const filesById = new Map(files.map((file) => [file._id, file]));
  const fileUrls: FileUrls = {};

  function addChildren(folder: SketchFile, folderPath: string) {
    folder.children.forEach((childId) => {
      const child = filesById.get(childId);
      if (!child) return;
      const path = `${folderPath}${child.name}`;
      const fileUrl = child.url || child.blobUrl;
      if (child.fileType === 'folder') {
        addChildren(child, `${path}/`);
      } else if (fileUrl) {
        fileUrls[path] = fileUrl;
      }
    });
  }

  const root = files.find((file) => file.name === 'root');
  if (root) addChildren(root, '');
  return fileUrls;
}

function withoutQuery(url: string): string {
  return url.split(/[?#]/)[0];
}

function folderOf(path: string): string {
  return path.slice(0, path.lastIndexOf('/') + 1);
}

function joinPath(folder: string, relativePath: string): string {
  const encodedFolder = folder.split('/').map(encodeURIComponent).join('/');
  const { pathname } = new URL(relativePath, `https://sketch/${encodedFolder}`);
  return decodeURIComponent(pathname.slice(1));
}

function isRequest(input: FetchInput): input is Request {
  return typeof input !== 'string' && !('href' in input);
}

function getUrl(input: FetchInput): string {
  if (isRequest(input)) return input.url;
  return typeof input === 'string' ? input : input.href;
}

function getMethod(input: FetchInput, init?: FetchInit): string {
  if (init?.method) return init.method.toUpperCase();
  return isRequest(input) ? input.method : 'GET';
}

function getRequestOptions(request: Request): FetchInit {
  const {
    headers,
    signal,
    mode,
    credentials,
    cache,
    redirect,
    referrer,
    referrerPolicy,
    integrity,
    keepalive
  } = request;
  return {
    headers,
    signal,
    mode,
    credentials,
    cache,
    redirect,
    referrer,
    referrerPolicy,
    integrity,
    keepalive
  };
}

export function createPreviewFetch(
  originalFetch: typeof fetch,
  fileUrls: FileUrls,
  baseUrl: string
): typeof fetch {
  const paths = Object.keys(fileUrls);
  const pathsByUrl = new Map(
    paths.map((path) => [withoutQuery(fileUrls[path]), path])
  );
  const baseFolder = new URL('.', baseUrl).href;
  let lastPath: string | undefined;

  function findNextTo(path: string, url: string): string | undefined {
    const folder = folderOf(path);
    const depth = folder.split('/').length - 1;
    let urlFolder = folderOf(withoutQuery(fileUrls[path]));
    let match: string | undefined;
    for (let up = 0; up <= depth && urlFolder && !match; up++) {
      if (url.startsWith(urlFolder)) {
        const relativePath = '../'.repeat(up) + url.slice(urlFolder.length);
        match = fileUrls[joinPath(folder, relativePath)];
      }
      urlFolder = folderOf(urlFolder.slice(0, -1));
    }
    return match;
  }

  function findNextToLoadedFile(url: string): string | undefined {
    const candidates = lastPath ? [lastPath, ...paths] : paths;
    let match: string | undefined;
    candidates.some((path) => {
      match = findNextTo(path, url);
      return Boolean(match);
    });
    return match;
  }

  function findFileUrl(input: FetchInput): string | undefined {
    const url = withoutQuery(new URL(getUrl(input), baseUrl).href);
    const knownPath = pathsByUrl.get(url);
    let fileUrl: string | undefined;
    if (knownPath) {
      lastPath = knownPath;
      if (url.startsWith('blob:')) fileUrl = fileUrls[knownPath];
    } else if (url.startsWith(baseFolder)) {
      fileUrl = fileUrls[joinPath('', url.slice(baseFolder.length))];
    } else {
      fileUrl = findNextToLoadedFile(url);
    }
    return fileUrl;
  }

  return (input, init) => {
    let method = 'GET';
    let fileUrl: string | undefined;
    try {
      method = getMethod(input, init);
      if (method === 'GET' || method === 'HEAD') {
        fileUrl = findFileUrl(input);
      }
    } catch {
      fileUrl = undefined;
    }
    if (!fileUrl) return originalFetch(input, init);

    const isBlobHead = method === 'HEAD' && fileUrl.startsWith('blob:');
    return originalFetch(fileUrl, {
      ...(isRequest(input) ? getRequestOptions(input) : {}),
      ...init,
      method: isBlobHead ? 'GET' : method
    });
  };
}
