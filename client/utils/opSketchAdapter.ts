import objectID from 'bson-objectid';

export interface OpSketch {
  visualID: number | string;
  title: string;
  userID: number;
  fileBase?: string;
  isPrivate?: number;
  mode?: string;
  description?: string;
  updatedOn?: string;
  createdOn?: string;
}

export interface OpCodeTab {
  codeID?: number;
  title: string;
  code: string;
  orderID?: number;
  createdOn: string;
  updatedOn: string;
}

export interface OpSketchFile {
  name: string;
  url: string;
}

export interface EditorFile {
  id: string;
  _id: string;
  name: string;
  content: string;
  fileType: 'file' | 'folder';
  children: string[];
  url?: string;
  isSelectedFile?: boolean;
  filePath?: string;
}

export interface CodeTabPayload {
  title: string;
  code: string;
  orderID: number;
}

function splitPath(name: string): { folders: string[]; basename: string } {
  const parts = name.split('/').filter(Boolean);
  const basename = parts.pop() ?? name;
  return { folders: parts, basename };
}

export function getFilePath(
  file: Pick<EditorFile, 'filePath' | 'name'>
): string {
  return file.filePath ? `${file.filePath}/${file.name}` : file.name;
}

export function opVisualIdToProjectId(visualID: number | string): string {
  return String(visualID);
}

// OP isPrivate int (0=public, 1+=private) → editor visibility string
export function opPrivacyToVisibility(isPrivate: number = 0): string {
  return isPrivate === 0 ? 'Public' : 'Private';
}

// editor visibility string → OP isPrivate int
export function visibilityToOpPrivacy(visibility: string): number {
  return visibility === 'Public' ? 0 : 1;
}

export function setupFolderHierarchy(files: EditorFile[]): EditorFile[] {
  const rootId = objectID().toHexString();
  const root: EditorFile = {
    id: rootId,
    _id: rootId,
    name: 'root',
    content: '',
    fileType: 'folder',
    children: []
  };
  const folderByPath = new Map<string, EditorFile>();
  const structuredFiles: EditorFile[] = [root];

  files.forEach((file) => {
    const { folders, basename } = splitPath(file.name);
    let parent = root;
    let currentPath = '';

    folders.forEach((folderName) => {
      const folderPath = currentPath
        ? `${currentPath}/${folderName}`
        : folderName;
      let folder = folderByPath.get(folderPath);

      if (!folder) {
        const id = objectID().toHexString();
        folder = {
          id,
          _id: id,
          name: folderName,
          content: '',
          fileType: 'folder',
          filePath: currentPath,
          children: []
        };
        folderByPath.set(folderPath, folder);
        parent.children.push(id);
        structuredFiles.push(folder);
      }

      parent = folder;
      currentPath = folderPath;
    });

    parent.children.push(file.id);
    structuredFiles.push({
      ...file,
      name: basename,
      filePath: currentPath
    });
  });

  return structuredFiles;
}

// Convert OP code tabs to editor file nodes, including folders implied by paths.
export function codeTabsToFiles(
  codeTabs: OpCodeTab[],
  sketchFiles: OpSketchFile[] = []
): EditorFile[] {
  const sortedTabs = [...codeTabs].sort(
    (a, b) => Date.parse(a.updatedOn) - Date.parse(b.updatedOn)
  );
  const selectedTab = sortedTabs[sortedTabs.length - 1];

  const fileNodes: EditorFile[] = codeTabs.map((tab, index) => {
    const id = objectID().toHexString();
    return {
      id,
      _id: id,
      name: tab.title,
      content: tab.code,
      fileType: 'file',
      children: [],
      filePath: '',
      isSelectedFile: tab === selectedTab
    };
  });

  const assetNodes: EditorFile[] = sketchFiles.map((file) => {
    const id = objectID().toHexString();
    return {
      id,
      _id: id,
      name: file.name,
      content: '',
      fileType: 'file',
      children: [],
      filePath: '',
      url: file.url
    };
  });

  return setupFolderHierarchy([...fileNodes, ...assetNodes]);
}

// Build a Redux-compatible project object from OP sketch metadata + code tabs
export function opSketchToProject(
  sketch: OpSketch,
  codeTabs: OpCodeTab[],
  username: string,
  sketchFiles: OpSketchFile[] = []
) {
  const files = codeTabsToFiles(codeTabs, sketchFiles);
  const savedCodeTitles = codeTabs.map((t) => t.title);
  return {
    id: opVisualIdToProjectId(sketch.visualID),
    name: sketch.title,
    visibility: opPrivacyToVisibility(sketch.isPrivate),
    fileBase: sketch.fileBase,
    files,
    savedCodeTitles,
    updatedAt: sketch.updatedOn ?? '',
    user: {
      id: String(sketch.userID),
      username
    }
  };
}

function collectCodeFiles(files: EditorFile[], parentId: string): EditorFile[] {
  const parent = files.find((f) => f.id === parentId);
  if (!parent) return [];

  return parent.children.flatMap((id) => {
    const file = files.find((f) => f.id === id);
    if (!file) return [];
    if (file.fileType === 'folder') {
      return collectCodeFiles(files, file.id);
    }
    return file.url ? [] : [file];
  });
}

// Collect text file nodes from editor files (skip folders and binary url files).
export function editorFilesToCodeTabs(files: EditorFile[]): CodeTabPayload[] {
  const root = files.find((f) => f.name === 'root' && f.fileType === 'folder');
  if (!root) return [];

  return collectCodeFiles(files, root.id).map((f, index) => ({
    title: getFilePath(f),
    code: f.content,
    orderID: index
  }));
}
