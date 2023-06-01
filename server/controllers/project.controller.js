import JSZip from 'jszip';
import format from 'date-fns/format';
import isUrl from 'is-url';
import { JSDOM } from 'jsdom';
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

export function updateProject(req, res) {
  Project.findById(req.params.project_id, (findProjectErr, project) => {
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
    Project.findByIdAndUpdate(
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
      .exec((updateProjectErr, updatedProject) => {
        if (updateProjectErr) {
          console.log(updateProjectErr);
          res.status(400).json({ success: false });
          return;
        }
        if (
          req.body.files &&
          updatedProject.files.length !== req.body.files.length
        ) {
          const oldFileIds = updatedProject.files.map((file) => file.id);
          const newFileIds = req.body.files.map((file) => file.id);
          const staleIds = oldFileIds.filter(
            (id) => newFileIds.indexOf(id) === -1
          );
          staleIds.forEach((staleId) => {
            updatedProject.files.id(staleId).remove();
          });
          updatedProject.save((innerErr, savedProject) => {
            if (innerErr) {
              console.log(innerErr);
              res.status(400).json({ success: false });
              return;
            }
            res.json(savedProject);
          });
        } else {
          res.json(updatedProject);
        }
      });
  });
}

export function getProject(req, res) {
  const { project_id: projectId, username } = req.params;
  User.findByUsername(username, (err, user) => { // eslint-disable-line
    if (!user) {
      return res
        .status(404)
        .send({ message: 'Project with that username does not exist' });
    }
    Project.findOne({
      user: user._id,
      $or: [{ _id: projectId }, { slug: projectId }]
    })
      .populate('user', 'username')
      .exec((err, project) => { // eslint-disable-line
        if (err) {
          console.log(err);
          return res
            .status(404)
            .send({ message: 'Project with that id does not exist' });
        }
        return res.json(project);
      });
  });
}

export function getProjectsForUserId(userId) {
  return new Promise((resolve, reject) => {
    Project.find({ user: userId })
      .sort('-createdAt')
      .select('name files id createdAt updatedAt')
      .exec((err, projects) => {
        if (err) {
          console.log(err);
        }
        resolve(projects);
      });
  });
}

export function getProjectAsset(req, res) {
  const projectId = req.params.project_id;
  Project.findOne({ $or: [{ _id: projectId }, { slug: projectId }] })
    .populate('user', 'username')
    .exec(async (err, project) => { // eslint-disable-line
      if (err) {
        return res
          .status(404)
          .send({ message: 'Project with that id does not exist' });
      }
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
      if (!resolvedFile.url) {
        return res.send(resolvedFile.content);
      }

      try {
        const { data } = await axios.get(resolvedFile.url, {
          responseType: 'arraybuffer'
        });
        res.send(data);
      } catch (error) {
        res.status(404).send({ message: 'Asset does not exist' });
      }
    });
}

export function getProjects(req, res) {
  if (req.user) {
    getProjectsForUserId(req.user._id).then((projects) => {
      res.json(projects);
    });
  } else {
    // could just move this to client side
    res.json([]);
  }
}

export function projectExists(projectId, callback) {
  Project.findById(projectId, (err, project) =>
    project ? callback(true) : callback(false)
  );
}

export function projectForUserExists(username, projectId, callback) {
  User.findByUsername(username, (err, user) => {
    if (!user) {
      callback(false);
      return;
    }
    Project.findOne(
      { user: user._id, $or: [{ _id: projectId }, { slug: projectId }] },
      (innerErr, project) => {
        if (!project) {
          callback(false);
          return;
        }
        callback(true);
      }
    );
  });
}

function bundleExternalLibs(project) {
  const indexHtml = project.files.find((file) => file.name === 'index.html');
  const { window } = new JSDOM(indexHtml.content);
  const scriptTags = window.document.getElementsByTagName('script');

  Object.values(scriptTags).forEach(async ({ src }, i) => {
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

function addFileToZip(file, files, zip, path = '') {
  return new Promise((resolve, reject) => {
    if (file.fileType === 'folder') {
      const newPath = file.name === 'root' ? path : `${path}${file.name}/`;
      const numChildFiles = file.children.filter((f) => f.fileType !== 'folder')
        .length;
      let childrenAdded = 0;
      if (numChildFiles === 0) {
        zip.folder(file.name);
        resolve();
      }
      file.children.forEach(async (fileId) => {
        const childFile = files.find((f) => f.id === fileId);

        try {
          await addFileToZip(childFile, files, zip, newPath);
          childrenAdded += 1;

          if (childrenAdded === numChildFiles) {
            resolve();
          }
        } catch (err) {
          reject(err);
        }
      });
    } else if (file.url) {
      axios
        .get(file.url, {
          responseType: 'arraybuffer'
        })
        .then(({ data }) => {
          zip.file(`${path}${file.name}`, data);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      zip.file(`${path}${file.name}`, file.content);
      resolve();
    }
  });
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

export function downloadProjectAsZip(req, res) {
  Project.findById(req.params.project_id, (err, project) => {
    // save project to some path
    buildZip(project, req, res);
  });
}
