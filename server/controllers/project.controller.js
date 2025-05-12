import JSZip from 'jszip';
import format from 'date-fns/format';
import isUrl from 'is-url';
import { JSDOM } from 'jsdom';
import mime from 'mime';
import isAfter from 'date-fns/isAfter';
import axios from 'axios';
import slugify from 'slugify';
import Project from '../models/project';
import User from '../models/user';
import { resolvePathToFile } from '../utils/filePath';
import generateFileSystemSafeName from '../utils/generateFileSystemSafeName';

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
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.project_id,
      {
        $set: req.body
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
        updatedProject.files.id(staleId).remove();
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

export function getProjectsForUserId(userId) {
  return Project.find({ user: userId })
    .sort('-createdAt')
    .select('name files id createdAt updatedAt')
    .exec();
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
    const projects = await getProjectsForUserId(req.user._id);
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
 * @param {string} projectId - the database id or the slug or the project
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
 * Adds URLs referenced in <script> tags to the `files` array of the project
 * so that they can be downloaded along with other remote files from S3.
 * @param {object} project
 * @void - modifies the `project` parameter
 */
function bundleExternalLibs(project) {
  const indexHtml = project.files.find((file) => file.name === 'index.html');
  const { window } = new JSDOM(indexHtml.content);
  const scriptTags = window.document.getElementsByTagName('script');

  Object.values(scriptTags).forEach(({ src }) => {
    if (!isUrl(src)) return;

    const path = src.split('/');
    const filename = path[path.length - 1];

    project.files.push({
      name: filename,
      url: src
    });

    const libId = project.files.find((file) => file.name === filename).id;
    project.files.find((file) => file.name === 'root').children.push(libId);
  });
}

/**
 * Recursively adds a file and all of its children to the JSZip instance.
 * @param {object} file
 * @param {Array<object>} files
 * @param {JSZip} zip
 * @return {Promise<void>} - modifies the `zip` parameter
 */
async function addFileToZip(file, files, zip) {
  if (file.fileType === 'folder') {
    const folderZip = file.name === 'root' ? zip : zip.folder(file.name);
    await Promise.all(
      file.children.map((fileId) => {
        const childFile = files.find((f) => f.id === fileId);
        return addFileToZip(childFile, files, folderZip);
      })
    );
  } else if (file.url) {
    try {
      const res = await axios.get(file.url, {
        responseType: 'arraybuffer'
      });
      zip.file(file.name, res.data);
    } catch (e) {
      zip.file(file.name, new ArrayBuffer(0));
    }
  } else {
    zip.file(file.name, file.content);
  }
}

async function buildZip(project, req, res) {
  try {
    const zip = new JSZip();
    const currentTime = format(new Date(), 'yyyy_MM_dd_HH_mm_ss');
    project.slug = slugify(project.name, '_');
    const zipFileName = `${generateFileSystemSafeName(
      project.slug
    )}_${currentTime}.zip`;
    const { files } = project;
    const root = files.find((file) => file.name === 'root');

    bundleExternalLibs(project);
    await addFileToZip(root, files, zip);

    const base64 = await zip.generateAsync({ type: 'base64' });
    const buff = Buffer.from(base64, 'base64');
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-disposition': `attachment; filename=${zipFileName}`
    });
    res.end(buff);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
}

export async function downloadProjectAsZip(req, res) {
  const project = await Project.findById(req.params.project_id).exec();
  if (!project) {
    res.status(404).send({ message: 'Project with that id does not exist' });
    return;
  }
  // save project to some path
  buildZip(project, req, res);
}
