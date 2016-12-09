import Project from '../models/project';
import User from '../models/user';
import archiver from 'archiver';
import request from 'request';
import each from 'async/each';
import { deleteObjectsFromS3 } from '../utils/s3Operations';


export function createProject(req, res) {
  let projectValues = {
    user: req.user ? req.user._id : undefined // eslint-disable-line no-underscore-dangle
  };

  projectValues = Object.assign(projectValues, req.body);

  Project.create(projectValues, (err, newProject) => {
    if (err) { return res.json({ success: false }); }
    Project.populate(newProject,
      { path: 'user', select: 'username' },
      (innerErr, newProjectWithUser) => {
        if (innerErr) { return res.json({ success: false }); }
        return res.json(newProjectWithUser);
      });
  });
}

export function updateProject(req, res) {
  Project.findByIdAndUpdate(req.params.project_id,
    {
      $set: req.body
    })
    .populate('user', 'username')
    .exec((err, updatedProject) => {
      if (err) {
        console.log(err);
        return res.json({ success: false });
      }
      if (updatedProject.files.length !== req.body.files.length) {
        const oldFileIds = updatedProject.files.map(file => file.id);
        const newFileIds = req.body.files.map(file => file.id);
        const staleIds = oldFileIds.filter(id => newFileIds.indexOf(id) === -1);
        staleIds.forEach(staleId => {
          updatedProject.files.id(staleId).remove();
        });
        updatedProject.save((innerErr) => {
          if (innerErr) {
            console.log(innerErr);
            return res.json({ success: false });
          }
          return res.json(updatedProject);
        });
      }
      return res.json(updatedProject);
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

function deleteFilesFromS3(files, fileCallback) {
  let s3ObjectUrlList = [];
  each(files, (file, callback) => {
    if (file.url !== undefined) {
      s3ObjectUrlList.push(file.url);
    }
    callback();
  }, (err) => {
    fileCallback();
    deleteObjectsFromS3(s3ObjectUrlList);
  });
}

export function deleteProject(req, res) {
  Project.findById(req.params.project_id, (err, project) => {
    deleteFilesFromS3(project.files, () => {
      Project.remove({ _id: req.params.project_id }, (err) => {
        if (err) {
          return res.status(404).send({ message: 'Project with that id does not exist' });
        }
        return res.json({ success: true });
      });
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
    return res.json([]);
  }
}

export function getProjectsForUser(req, res) {
  if (req.params.username) {
    User.findOne({ username: req.params.username }, (err, user) => {
      Project.find({ user: user._id }) // eslint-disable-line no-underscore-dangle
        .sort('-createdAt')
        .select('name files id createdAt updatedAt')
        .exec((err, projects) => {
          res.json(projects);
        });
    });
  } else {
    // could just move this to client side
    return res.json([]);
  }
}

function buildZip(project, req, res) {
  const zip = archiver('zip');
  const rootFile = project.files.find(file => file.name === 'root');
  const numFiles = project.files.filter(file => file.fileType !== 'folder').length;
  const files = project.files;
  const projectName = project.name;
  let numCompletedFiles = 0;

  zip.on('error', function (err) {
    res.status(500).send({ error: err.message });
  });

  res.attachment(`${project.name}.zip`);
  zip.pipe(res);

  function addFileToZip(file, path) {
    if (file.fileType === 'folder') {
      const newPath = file.name === 'root' ? path : `${path}${file.name}/`;
      file.children.forEach(fileId => {
        const childFile = files.find(f => f.id === fileId);
        (() => {
          addFileToZip(childFile, newPath);
        })();
      });
    } else {
      if (file.url) {
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
  }
  addFileToZip(rootFile, '/');
}

export function downloadProjectAsZip(req, res) {
  Project.findById(req.params.project_id, (err, project) => {
    // save project to some path
    buildZip(project, req, res);
  });
}

