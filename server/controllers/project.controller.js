import JSZip from 'jszip';
import format from 'date-fns/format';
import isUrl from 'is-url';
import { JSDOM } from 'jsdom';
import mime from 'mime';
import isAfter from 'date-fns/isAfter';
import slugify from 'slugify';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import safeProjectFileFetch from '../utils/safeProjectFileFetch';
import {
  hasConfiguredS3Origin,
  isConfiguredS3HttpUrl,
  isS3Url,
  parseS3ProjectAssetUrl,
  readBoundedS3Object
} from '../utils/s3ProjectAssets';
import Project from '../models/project';
import { User } from '../models/user';
import { resolvePathToFile } from '../utils/filePath';
import { generateFileSystemSafeName } from '../utils/generateFileSystemSafeName';
import {
  commitPendingAssets,
  rewritePendingFileUrls
} from '../utils/pendingAssets';
import {
  FileValidationError,
  validateFileNames
} from '../domain-objects/Project';

function isPrivateProject(project, user) {
  return (
    project.visibility === 'Private' &&
    (!user || !project.user._id.equals(user._id))
  );
}

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

    if (updateData.files) {
      validateFileNames(updateData.files);
      await commitPendingAssets(req.user.id, updateData.files);
      updateData.files = rewritePendingFileUrls(updateData.files, req.user.id);
    }

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
    if (error instanceof FileValidationError) {
      res.status(400).json({
        success: false,
        message: 'File Validation Failed',
        detail: error.message,
        errors: error.files
      });
    } else {
      console.error(error);
      res.status(500).json({ success: false });
    }
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

  if (isPrivateProject(project, req.user)) {
    return res.status(403).send({ message: 'Project is private' });
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

  if (isPrivateProject(project, req.user)) {
    return res.status(403).send({ message: 'Project is private' });
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
    const data = await safeProjectFileFetch(resolvedFile.url);
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

async function getStreamFromS3Url(url, userId) {
  const asset = parseS3ProjectAssetUrl(url, userId);
  if (!asset) return null;

  return readBoundedS3Object(
    s3Client,
    new GetObjectCommand({ Bucket: asset.bucket, Key: asset.key })
  );
}

function sanitizeZipEntryName(name) {
  if (typeof name !== 'string') return 'unnamed';

  const safeName = generateFileSystemSafeName(name, '_');
  if (!safeName || safeName === '.' || safeName === '..') return '_';

  return safeName;
}

/**
 * @param {object} file
 * @param {Array<object>} files
 * @param {JSZip} zip
 * @return {Promise<void>}
 */
async function addFileToZip(file, files, zip, userId, isRoot = false) {
  const zipEntryName = sanitizeZipEntryName(file.name);
  if (file.fileType === 'folder') {
    const folderZip = isRoot ? zip : zip.folder(zipEntryName);
    await file.children.reduce(async (previousPromise, childId) => {
      await previousPromise;
      const childFile = files.find((f) => f.id === childId);
      return addFileToZip(childFile, files, folderZip, userId, false);
    }, Promise.resolve());
  } else if (file.url) {
    try {
      if (hasConfiguredS3Origin(file.url)) {
        const data = await getStreamFromS3Url(file.url, userId);
        if (data) {
          zip.file(zipEntryName, data, { binary: true });
        } else {
          const fallbackData = await safeProjectFileFetch(file.url);
          zip.file(zipEntryName, fallbackData, { binary: true });
        }
      } else {
        if (isS3Url(file.url) && !isConfiguredS3HttpUrl(file.url, userId)) {
          throw new Error('Unsupported project asset URL');
        }
        const data = await safeProjectFileFetch(file.url);
        zip.file(zipEntryName, data, { binary: true });
      }
    } catch (e) {
      console.warn('Failed to fetch project file');
      zip.file(zipEntryName, Buffer.alloc(0));
    }
  } else {
    zip.file(zipEntryName, file.content);
  }
}

async function buildZip(project, res) {
  try {
    const zip = new JSZip();
    const currentTime = format(new Date(), 'yyyy_MM_dd_HH_mm_ss');
    project.slug = slugify(project.name, '_');
    const zipFileName = `${generateFileSystemSafeName(
      project.name
    )}_${currentTime}.zip`;
    const { files } = project;
    const root = files.find(
      (file) => file.name === 'root' && file.fileType === 'folder'
    );

    if (!root) {
      throw new Error('Project has no root folder');
    }

    bundleExternalLibs(project);
    await addFileToZip(root, files, zip, project.user.toString(), true);
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-disposition': `attachment; filename=${zipFileName}`,
      'Transfer-Encoding': 'chunked'
    });

    const zipStream = zip.generateNodeStream({
      type: 'nodebuffer',
      streamFiles: true,
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    zipStream.pipe(res);

    zipStream.on('error', (err) => {
      console.error('Error streaming zip file');
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to generate zip file. Please try again.'
        });
      } else {
        res.end();
      }
    });

    const handleResponseClose = () => {
      if (!res.writableFinished)
        zipStream.destroy(new Error('Client disconnected'));
    };
    res.once('close', handleResponseClose);
    try {
      await new Promise((resolve, reject) => {
        zipStream.once('end', resolve);
        zipStream.once('error', reject);
        res.once('error', reject);
      });
    } finally {
      res.removeListener('close', handleResponseClose);
    }
  } catch (err) {
    console.error('Error building zip file');

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

    if (isPrivateProject(project, req.user)) {
      res.status(403).send({ message: 'Project is private' });
      return;
    }

    await buildZip(project, res);
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
    console.error('Error in changeProjectVisibility:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change project visibility.'
    });
  }
}
