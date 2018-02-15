import archiver from 'archiver';
import request from 'request';
import moment from 'moment';
import isUrl from 'is-url';
import slugify from 'slugify';
import jsdom, { serializeDocument } from 'jsdom';
import Project from '../models/project';
import User from '../models/user';
import { deleteObjectsFromS3, getObjectKey } from './aws.controller';

export function createProject(req, res) {
  let projectValues = {
    user: req.user._id
  };

  projectValues = Object.assign(projectValues, req.body);

  Project.create(projectValues, (err, newProject) => {
    if (err) {
      res.json({ success: false });
      return;
    }
    Project.populate(newProject,
      { path: 'user', select: 'username' },
      (innerErr, newProjectWithUser) => {
        if (innerErr) {
          res.json({ success: false });
          return;
        }
        res.json(newProjectWithUser);
      });
  });
}

export function updateProject(req, res) {
  Project.findById(req.params.project_id, (findProjectErr, project) => {
    if (!project.user.equals(req.user._id)) {
      res.status(403).send({ success: false, message: 'Session does not match owner of project.' });
      return;
    }
    // if (req.body.updatedAt && moment(req.body.updatedAt) < moment(project.updatedAt)) {
    //   res.status(409).send({ success: false, message: 'Attempted to save stale version of project.' });
    //   return;
    // }
    Project.findByIdAndUpdate(req.params.project_id,
      {
        $set: req.body
      },
      {
        new: true
      })
      .populate('user', 'username')
      .exec((updateProjectErr, updatedProject) => {
        if (updateProjectErr) {
          console.log(updateProjectErr);
          res.json({ success: false });
          return;
        }
        if (updatedProject.files.length !== req.body.files.length) {
          const oldFileIds = updatedProject.files.map(file => file.id);
          const newFileIds = req.body.files.map(file => file.id);
          const staleIds = oldFileIds.filter(id => newFileIds.indexOf(id) === -1);
          staleIds.forEach((staleId) => {
            updatedProject.files.id(staleId).remove();
          });
          updatedProject.save((innerErr, savedProject) => {
            if (innerErr) {
              console.log(innerErr);
              res.json({ success: false });
              return;
            }
            res.json(savedProject);
          });
        }
        res.json(updatedProject);
      });
  });
}

export function getProject(req, res) {
  const projectId = req.params.project_id;
  Project.findById(projectId)
    .populate('user', 'username')
    .exec((err, project) => { // eslint-disable-line
      if (err) {
        return res.status(404).send({ message: 'Project with that id does not exist' });
      } else if (!project) {
        Project.findOne({ slug: projectId })
        .populate('user', 'username')
        .exec((innerErr, projectBySlug) => {
          if (innerErr || !projectBySlug) {
            return res.status(404).send({ message: 'Project with that id does not exist' });
          }
          return res.json(projectBySlug);
        });
      } else {
        return res.json(project);
      }
    });
}

function deleteFilesFromS3(files) {
  deleteObjectsFromS3(
    files.filter((file) => {
      if (file.url) {
        if (!process.env.S3_DATE || (process.env.S3_DATE && moment(process.env.S3_DATE) < moment(file.createdAt))) {
          return true;
        }
      }
      return false;
    })
    .map(file => getObjectKey(file.url)));
}

export function deleteProject(req, res) {
  Project.findById(req.params.project_id, (findProjectErr, project) => {
    if (!project.user.equals(req.user._id)) {
      res.status(403).json({ success: false, message: 'Session does not match owner of project.' });
      return;
    }
    deleteFilesFromS3(project.files);
    Project.remove({ _id: req.params.project_id }, (removeProjectError) => {
      if (removeProjectError) {
        res.status(404).send({ message: 'Project with that id does not exist' });
        return;
      }
      res.json({ success: true });
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
  Project.findById(req.params.project_id)
    .populate('user', 'username')
    .exec((err, project) => { // eslint-disable-line
      if (err) {
        return res.status(404).send({ message: 'Project with that id does not exist' });
      }
      if (!project) {
        return res.status(404).send({ message: 'Project with that id does not exist' });
      }

      let assetURL = null;
      const seekPath = req.params[0]; // req.params.asset_path;
      const seekPathSplit = seekPath.split('/');
      const seekFilename = seekPathSplit[seekPathSplit.length - 1];
      project.files.forEach((file) => {
        if (file.name === seekFilename) {
          assetURL = file.url;
        }
      });

      if (!assetURL) {
        return res.status(404).send({ message: 'Asset does not exist' });
      }
      request({ method: 'GET', url: assetURL, encoding: null }, (innerErr, response, body) => {
        if (innerErr) {
          return res.status(404).send({ message: 'Asset does not exist' });
        }
        return res.send(body);
      });
    });
}

export function getProjectsForUserName(username) {

}

export function getProjects(req, res) {
  if (req.user) {
    getProjectsForUserId(req.user._id)
      .then((projects) => {
        res.json(projects);
      });
  } else {
    // could just move this to client side
    res.json([]);
  }
}

export function getProjectsForUser(req, res) {
  if (req.params.username) {
    User.findOne({ username: req.params.username }, (err, user) => {
      if (!user) {
        res.status(404).json({ message: 'User with that username does not exist.' });
        return;
      }
      Project.find({ user: user._id })
        .sort('-createdAt')
        .select('name files id createdAt updatedAt')
        .exec((innerErr, projects) => res.json(projects));
    });
  } else {
    // could just move this to client side
    res.json([]);
  }
}

function bundleExternalLibs(project, zip, callback) {
  const indexHtml = project.files.find(file => file.name === 'index.html');
  let numScriptsResolved = 0;
  let numScriptTags = 0;

  function resolveScriptTagSrc(scriptTag, document) {
    const path = scriptTag.src.split('/');
    const filename = path[path.length - 1];
    const src = scriptTag.src;

    if (!isUrl(src)) {
      numScriptsResolved += 1;
      return;
    }

    request({ method: 'GET', url: src, encoding: null }, (err, response, body) => {
      if (err) {
        console.log(err);
      } else {
        zip.append(body, { name: filename });
        scriptTag.src = filename;
      }

      numScriptsResolved += 1;
      if (numScriptsResolved === numScriptTags) {
        indexHtml.content = serializeDocument(document);
        callback();
      }
    });
  }

  jsdom.env(indexHtml.content, (innerErr, window) => {
    const indexHtmlDoc = window.document;
    const scriptTags = indexHtmlDoc.getElementsByTagName('script');
    numScriptTags = scriptTags.length;
    for (let i = 0; i < numScriptTags; i += 1) {
      resolveScriptTagSrc(scriptTags[i], indexHtmlDoc);
    }
  });
}

function buildZip(project, req, res) {
  const zip = archiver('zip');
  const rootFile = project.files.find(file => file.name === 'root');
  const numFiles = project.files.filter(file => file.fileType !== 'folder').length;
  const files = project.files;
  let numCompletedFiles = 0;

  zip.on('error', (err) => {
    res.status(500).send({ error: err.message });
  });

  const currentTime = moment().format('YYYY_MM_DD_HH_mm_ss');
  project.slug = slugify(project.name, '_');
  res.attachment(`${project.slug}_${currentTime}.zip`);
  zip.pipe(res);

  function addFileToZip(file, path) {
    if (file.fileType === 'folder') {
      const newPath = file.name === 'root' ? path : `${path}${file.name}/`;
      file.children.forEach((fileId) => {
        const childFile = files.find(f => f.id === fileId);
        (() => {
          addFileToZip(childFile, newPath);
        })();
      });
    } else if (file.url) {
      request({ method: 'GET', url: file.url, encoding: null }, (err, response, body) => {
        zip.append(body, { name: `${path}${file.name}` });
        numCompletedFiles += 1;
        if (numCompletedFiles === numFiles) {
          zip.finalize();
        }
      });
    } else {
      zip.append(file.content, { name: `${path}${file.name}` });
      numCompletedFiles += 1;
      if (numCompletedFiles === numFiles) {
        zip.finalize();
      }
    }
  }

  bundleExternalLibs(project, zip, () => {
    addFileToZip(rootFile, '/');
  });
}

export function downloadProjectAsZip(req, res) {
  Project.findById(req.params.project_id, (err, project) => {
    // save project to some path
    buildZip(project, req, res);
  });
}
