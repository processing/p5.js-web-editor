import mime from 'mime';
import axios from 'axios';

// Lean, OpenProcessing-backed asset serving for the preview server. The editor
// no longer has its own database, so sketch files and code are fetched from OP.
// Only API_URL is required: public sketches are served without authentication.
// API_TOKEN (a shared service token) is optional and only needed to reach
// private sketches' assets.

function appendQueryString(url, queryString = '') {
  if (!queryString) {
    return url;
  }
  return `${url}${url.includes('?') ? '&' : '?'}${queryString.slice(1)}`;
}

function getOpApiConfig() {
  if (process.env.API_TOKEN) {
    return {
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`
      }
    };
  }
  return {};
}

function getQueryString(req) {
  const queryIndex = req.originalUrl?.indexOf('?') ?? -1;
  return queryIndex === -1 ? '' : req.originalUrl.slice(queryIndex);
}

/**
 * Resolve a sketch file by path from OpenProcessing. Uploaded media files are
 * served via a 302 redirect to their storage URL; code tabs are returned
 * inline. Returns true when a response was sent, false otherwise.
 */
async function serveOpSketchFile(req, res) {
  if (!process.env.API_URL) {
    return false;
  }

  const projectId = req.params.project_id;
  const filePath = req.params[0];
  const queryString = getQueryString(req);

  try {
    const filesResponse = await axios.get(
      `${process.env.API_URL}/sketch/${projectId}/files`,
      getOpApiConfig()
    );
    const file = filesResponse.data?.find(
      (candidate) => candidate.name === filePath
    );
    if (file?.url) {
      res.redirect(302, appendQueryString(file.url, queryString));
      return true;
    }

    const codeResponse = await axios.get(
      `${process.env.API_URL}/sketch/${projectId}/code`,
      getOpApiConfig()
    );
    const codeFile = codeResponse.data?.find(
      (candidate) => candidate.title === filePath
    );
    if (codeFile) {
      res.set(
        'Content-Type',
        mime.getType(codeFile.title) || 'application/octet-stream'
      );
      res.send(codeFile.code);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

export async function getProjectAsset(req, res) {
  if (!process.env.API_URL) {
    return res
      .status(500)
      .send({ message: 'OpenProcessing API is not configured' });
  }
  if (await serveOpSketchFile(req, res)) {
    return res;
  }
  return res.status(404).send({ message: 'Asset does not exist' });
}

export async function getFileContent(req, res) {
  if (!process.env.API_URL) {
    return res
      .status(500)
      .send({ message: 'OpenProcessing API is not configured' });
  }
  if (await serveOpSketchFile(req, res)) {
    return res;
  }
  return res.status(404).send({
    success: false,
    message: 'File with that name and path does not exist.'
  });
}
