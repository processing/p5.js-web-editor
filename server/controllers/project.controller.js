import JSZip from 'jszip';
import format from 'date-fns/format';
import isUrl from 'is-url';
import { JSDOM } from 'jsdom';
import mime from 'mime';
import isAfter from 'date-fns/isAfter';
import axios from 'axios';
import slugify from 'slugify';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import Project from '../models/project';
import { User } from '../models/user';
import { resolvePathToFile } from '../utils/filePath';
import { generateFileSystemSafeName } from '../utils/generateFileSystemSafeName';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  },
  region: process.env.AWS_REGION
});

export {
  default as createProject,
  apiCreateProject
} from './project.controller/createProject';
export { default as deleteProject } from './project.controller/deleteProject';
export {
  default as getProjectsForUser,
  apiGetProjectsForUser
} from './project.controller/getProjectsForUser';

export async function updateProject(req, res) {
  try {
    const project = await Project.findById(req.params.project_id).exec();
    if (!project) {
      res.status(404).send({
        success: false,
        message: 'Project with that id does not exist.'
      });
      return;
    }
    if (!project.user.equals(req.user._id)) {
      res.status(403).send({
        success: false,
        message: 'Session does not match owner of project.'
      });
      return;
    }
    if (
      req.body.updatedAt &&
      isAfter(new Date(project.updatedAt), new Date(req.body.updatedAt))
    ) {
      res.status(409).send({
        success: false,
        message: 'Attempted to save stale version of project.'
      });
      return;
    }
    // only allow whitelisted fields so ownership/slug etc can't be overwritten
    const allowedFields = ['name', 'files', 'updatedAt', 'visibility'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.project_id,
      {
        $set: updateData
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate('user', 'username')
      .exec();
    if (
      req.body.files &&
      updatedProject.files.length !== req.body.files.length
    ) {
      const oldFileIds = updatedProject.files.map((file) => file.id);
      const newFileIds = req.body.files.map((file) => file.id);
      const staleIds = oldFileIds.filter((id) => newFileIds.indexOf(id) === -1);
      staleIds.forEach((staleId) => {
        updatedProject.files.id(staleId).deleteOne();
      });
      const savedProject = await updatedProject.save();
      res.json(savedProject);
    } else {
      res.json(updatedProject);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
}

export async function getProject(req, res) {
  const { project_id: projectId, username } = req.params;
  const user = await User.findByUsername(username);
  if (!user) {
    return res
      .status(404)
      .send({ message: 'User with that username does not exist' });
  }
  const project = await Project.findOne({
    user: user._id,
    $or: [{ _id: projectId }, { slug: projectId }]
  }).populate('user', 'username');
  if (!project) {
    return res
      .status(404)
      .send({ message: 'Project with that id does not exist' });
  }
  return res.json(project);
}

export async function getProjectAsset(req, res) {
  const projectId = req.params.project_id;
  const project = await Project.findOne({
    $or: [{ _id: projectId }, { slug: projectId }]
  })
    .populate('user', 'username')
    .exec();
  if (!project) {
    return res
      .status(404)
      .send({ message: 'Project with that id does not exist' });
  }

  const filePath = req.params[0];
  const resolvedFile = resolvePathToFile(filePath, project.files);
  if (!resolvedFile) {
    return res.status(404).send({ message: 'Asset does not exist' });
  }
  const contentType =
    mime.getType(resolvedFile.name) || 'application/octet-stream';
  if (!resolvedFile.url) {
    res.set('Content-Type', contentType);
    return res.send(resolvedFile.content);
  }

  try {
    const { data } = await axios.get(resolvedFile.url, {
      responseType: 'arraybuffer'
    });
    res.set('Content-Type', contentType);
    return res.send(data);
  } catch (error) {
    return res.status(404).send({ message: 'Asset does not exist' });
  }
}

export async function getProjects(req, res) {
  if (req.user) {
    const projects = await Project.getProjectsForUserId(req.user._id);
    res.json(projects);
  } else {
    // could just move this to client side
    res.json([]);
  }
}

/**
 * @param {string} projectId
 * @return {Promise<boolean>}
 */
export async function projectExists(projectId) {
  const project = await Project.findById(projectId);
  return project != null;
}

/**
 * @param {string} username
 * @param {string} projectId
 * @return {Promise<boolean>}
 */
export async function projectForUserExists(username, projectId) {
  const user = await User.findByUsername(username);
  if (!user) return false;
  const project = await Project.findOne({
    user: user._id,
    $or: [{ _id: projectId }, { slug: projectId }]
  });
  return project != null;
}

/**
 * @param {string} username
 * @param {string} projectId - the database id or the slug or the project
 * @return {Promise<object>}
 */
export async function getProjectForUser(username, projectId) {
  const user = await User.findByUsername(username);
  if (!user) return { exists: false };
  const project = await Project.findOne({
    user: user._id,
    $or: [{ _id: projectId }, { slug: projectId }]
  });
  return project != null
    ? { exists: true, userProject: project }
    : { exists: false };
}

/**
 * @param {object} project
 */
function bundleExternalLibs(project) {
  const indexHtml = project.files.find((file) => file.name === 'index.html');
  if (!indexHtml || !indexHtml.content) {
    return;
  }

  const { window } = new JSDOM(indexHtml.content);
  const scriptTags = window.document.getElementsByTagName('script');

  Object.values(scriptTags).forEach(({ src }) => {
    if (!isUrl(src)) return;

    const path = src.split('/');
    const filename = path[path.length - 1];

    if (project.files.some((f) => f.name === filename && f.url === src)) {
      return;
    }

    project.files.push({
      name: filename,
      url: src
    });

    const libId = project.files.find((file) => file.name === filename).id;
    project.files.find((file) => file.name === 'root').children.push(libId);
  });
}

/**
 * @param {string} url - S3 URL
 * @return {Promise<Readable>}
 */
async function getStreamFromS3Url(url) {
  const urlObj = new URL(url);
  let bucket;
  let key;

  if (urlObj.hostname.includes('s3')) {
    if (urlObj.hostname.startsWith('s3')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      [bucket] = pathParts;
      key = pathParts.slice(1).join('/');
    } else {
      [bucket] = urlObj.hostname.split('.');
      key = urlObj.pathname.substring(1);
    }

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);
    return response.Body;
  }

  const response = await axios.get(url, {
    responseType: 'stream',
    timeout: 30000
  });
  return response.data;
}

/**
 * @param {object} file
 * @param {Array<object>} files
 * @param {JSZip} zip
 * @return {Promise<void>}
 */
async function addFileToZip(file, files, zip) {
  if (file.fileType === 'folder') {
    const folderZip = file.name === 'root' ? zip : zip.folder(file.name);
    await file.children.reduce(async (previousPromise, fileId) => {
      await previousPromise;
      const childFile = files.find((f) => f.id === fileId);
      return addFileToZip(childFile, files, folderZip);
    }, Promise.resolve());
  } else if (file.url) {
    try {
      if (file.url.includes('s3') && file.url.includes('amazonaws.com')) {
        const stream = await getStreamFromS3Url(file.url);
        zip.file(file.name, stream, { binary: true });
      } else {
        const response = await axios.get(file.url, {
          responseType: 'stream',
          timeout: 30000
        });
        zip.file(file.name, response.data, { binary: true });
      }
    } catch (e) {
      console.warn(`Failed to fetch file from ${file.url}:`, e.message);
      zip.file(file.name, Buffer.alloc(0));
    }
  } else {
    zip.file(file.name, file.content);
  }
}

async function buildZip(project, req, res) {
  let keepaliveInterval;

  try {
    const zip = new JSZip();
    const currentTime = format(new Date(), 'yyyy_MM_dd_HH_mm_ss');
    project.slug = slugify(project.name, '_');
    const zipFileName = `${generateFileSystemSafeName(
      project.slug
    )}_${currentTime}.zip`;
    const { files } = project;
    const root = files.find((file) => file.name === 'root');

    if (!root) {
      throw new Error('Project has no root folder');
    }

    bundleExternalLibs(project);

    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-disposition': `attachment; filename=${zipFileName}`,
      'Transfer-Encoding': 'chunked'
    });

    let keepaliveCounter = 0;
    keepaliveInterval = setInterval(() => {
      if (!res.writableEnded) {
        res.write(Buffer.alloc(0));
        keepaliveCounter++;
        if (keepaliveCounter % 10 === 0) {
          console.log(
            `Keepalive: Building ZIP file list (${keepaliveCounter}s elapsed)...`
          );
        }
      }
    }, 1000);

    await addFileToZip(root, files, zip);

    clearInterval(keepaliveInterval);
    keepaliveInterval = null;

    const zipStream = zip.generateNodeStream({
      type: 'nodebuffer',
      streamFiles: true,
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    zipStream.pipe(res);

    zipStream.on('error', (err) => {
      console.error('Error streaming zip file:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to generate zip file. Please try again.'
        });
      } else {
        res.end();
      }
    });

    await new Promise((resolve, reject) => {
      zipStream.on('end', resolve);
      zipStream.on('error', reject);
      res.on('error', reject);
      res.on('close', () => reject(new Error('Client disconnected')));
    });
  } catch (err) {
    console.error('Error building zip file:', err);

    if (keepaliveInterval) {
      clearInterval(keepaliveInterval);
    }

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate zip file. Please try again.'
      });
    } else {
      res.end();
    }
  }
}

export async function downloadProjectAsZip(req, res) {
  try {
    const project = await Project.findById(req.params.project_id).exec();
    if (!project) {
      res.status(404).send({ message: 'Project with that id does not exist' });
      return;
    }
    await buildZip(project, req, res);
  } catch (err) {
    console.error('Error in downloadProjectAsZip:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to download project. Please try again.'
      });
    }
  }
}

export async function changeProjectVisibility(req, res) {
  try {
    const { projectId, visibility: newVisibility } = req.body;

    const project = await Project.findOne({
      $or: [{ _id: projectId }, { slug: projectId }]
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: 'No project found.' });
    }

    if (!project.user.equals(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized action.' });
    }

    if (newVisibility !== 'Private' && newVisibility !== 'Public') {
      return res.status(400).json({ success: false, message: 'Invalid data.' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        visibility: newVisibility
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate('user', 'username')
      .exec();

    return res.status(200).json(updatedProject);
  } catch (error) {
    return res.status(500).json(error);
  }
}
