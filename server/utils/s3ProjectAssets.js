import { MAX_PROJECT_FILE_BYTES } from './safeProjectFileFetch';

const REQUEST_TIMEOUT_MS = 10000;

export function getS3BaseUrl() {
  const configuredBase =
    process.env.S3_BUCKET_URL_BASE ||
    `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET}/`;
  const base = new URL(configuredBase);
  if (
    base.protocol !== 'https:' ||
    !process.env.S3_BUCKET ||
    base.username ||
    base.password ||
    base.port ||
    base.search ||
    base.hash
  ) {
    throw new Error('Invalid configured S3 asset base URL');
  }
  return base;
}

export function hasConfiguredS3Origin(rawUrl) {
  try {
    return new URL(rawUrl).origin === getS3BaseUrl().origin;
  } catch (error) {
    return false;
  }
}

export function isS3Url(rawUrl) {
  try {
    const hostname = new URL(rawUrl).hostname.toLowerCase();
    return (
      /(^|\.)s3([.-]|$)/.test(hostname) &&
      /(?:^|\.)(?:amazonaws\.com|amazonaws\.com\.cn)$/.test(hostname)
    );
  } catch (error) {
    return false;
  }
}

export function parseS3ProjectAssetUrl(rawUrl, userId) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch (error) {
    throw new Error('Invalid project asset URL');
  }
  const base = getS3BaseUrl();
  const rawPath =
    rawUrl.match(/^[a-z][a-z\d+.-]*:\/\/[^/?#]*(\/[^?#]*)?/i)?.[1] || '/';
  let rawComponents;
  try {
    rawComponents = rawPath
      .split('/')
      .map((component) => decodeURIComponent(component));
  } catch (error) {
    throw new Error('Invalid project asset URL');
  }
  if (
    /%(?:2e|2f|5c)/i.test(rawPath) ||
    rawPath.includes('\\') ||
    rawComponents.some((component) => component === '.' || component === '..')
  ) {
    throw new Error('Unsupported project asset URL');
  }
  const basePath = base.pathname.endsWith('/')
    ? base.pathname
    : `${base.pathname}/`;
  if (
    url.protocol !== 'https:' ||
    url.origin !== base.origin ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    !url.pathname.startsWith(basePath)
  ) {
    throw new Error('Unsupported project asset URL');
  }

  let key;
  try {
    key = decodeURIComponent(url.pathname.slice(basePath.length));
  } catch (error) {
    throw new Error('Invalid project asset URL');
  }
  const components = key.split('/');
  if (
    !key.startsWith(`${userId}/`) ||
    components.some(
      (component) => !component || component === '.' || component === '..'
    ) ||
    key.includes('\\')
  ) {
    throw new Error('Unsupported project asset URL');
  }
  return { bucket: process.env.S3_BUCKET, key };
}

export async function readBoundedS3Object(client, command) {
  const controller = new AbortController();
  let body;
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
    if (body && typeof body.destroy === 'function') {
      body.destroy(new Error('Project asset fetch timed out'));
    }
  }, REQUEST_TIMEOUT_MS);
  try {
    const response = await client.send(command, {
      abortSignal: controller.signal
    });
    body = response.Body;
    if (timedOut) throw new Error('Project asset fetch timed out');
    if (response.ContentLength > MAX_PROJECT_FILE_BYTES) {
      throw new Error('Project asset exceeds the size limit');
    }
    if (!body || typeof body.on !== 'function') {
      throw new Error('Invalid project asset response');
    }
    return await new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      let settled = false;
      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        callback(value);
      };
      body.on('data', (chunk) => {
        const buffer = Buffer.from(chunk);
        size += buffer.length;
        if (size > MAX_PROJECT_FILE_BYTES) {
          controller.abort();
          body.destroy();
          finish(reject, new Error('Project asset exceeds the size limit'));
        } else {
          chunks.push(buffer);
        }
      });
      body.once('end', () => finish(resolve, Buffer.concat(chunks, size)));
      body.once('error', (error) => finish(reject, error));
    });
  } catch (error) {
    controller.abort();
    if (body && typeof body.destroy === 'function') body.destroy();
    if (body && typeof body.cancel === 'function') {
      try {
        Promise.resolve(body.cancel()).catch(() => {});
      } catch {
        // The original stream error is more useful to the caller.
      }
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
