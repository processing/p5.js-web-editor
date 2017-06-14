import archiver from 'archiver';
import request from 'request';
import moment from 'moment';
import Project from '../models/project';
import User from '../models/user';
import { deleteObjectsFromS3, getObjectKey } from './aws.controller';

export function createProject(req, res) {
  if (!req.user) {
    res.status(403).send({ success: false, message: 'Session does not match owner of project.' });
    return;
  }

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
    if (!req.user || !project.user.equals(req.user._id)) {
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
  Project.findById(req.params.project_id)
    .populate('user', 'username')
    .exec((err, project) => {
      if (err) {
        return res.status(404).send({ message: 'Project with that id does not exist' });
      }
      return res.json(project);
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
    .map((file) => {
      return getObjectKey(file.url);
    })
  );
}

export function deleteProject(req, res) {
  Project.findById(req.params.project_id, (findProjectErr, project) => {
    if (!req.user || !project.user.equals(req.user._id)) {
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

export function getProjects(req, res) {
  if (req.user) {
    Project.find({ user: req.user._id }) // eslint-disable-line no-underscore-dangle
      .sort('-createdAt')
      .select('name files id createdAt updatedAt')
      .exec((err, projects) => {
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
      Project.find({ user: user._id }) // eslint-disable-line no-underscore-dangle
        .sort('-createdAt')
        .select('name files id createdAt updatedAt')
        .exec((innerErr, projects) => res.json(projects));
    });
  } else {
    // could just move this to client side
    res.json([]);
  }
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

  res.attachment(`${project.name}.zip`);
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
  addFileToZip(rootFile, '/');

  
}

export function downloadProjectAsZip(req, res) {
  Project.findById(req.params.project_id, (err, project) => {
    // save project to some path
    buildZip(project, req, res);
  });
}
