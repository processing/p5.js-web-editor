import each from 'async/each';
import moment from 'moment';

import Project from '../models/project';
import { resolvePathToFile } from '../utils/filePath';
import { deleteObjectsFromS3, getObjectKey } from './aws.controller';

// Bug -> timestamps don't get created, but it seems like this will
// be fixed in mongoose soon
// https://github.com/Automattic/mongoose/issues/4049
export function createFile(req, res) {
  Project.findByIdAndUpdate(req.params.project_id,
    {
      $push: {
        files: req.body
      }
    },
    {
      new: true
    }, (err, updatedProject) => {
      if (err) {
        console.log(err);
        res.json({ success: false });
        return;
      }
      const newFile = updatedProject.files[updatedProject.files.length - 1];
      updatedProject.files.id(req.body.parentId).children.push(newFile.id);
      updatedProject.save((innerErr) => {
        if (innerErr) {
          console.log(innerErr);
          res.json({ success: false });
          return;
        }
        res.json(updatedProject.files[updatedProject.files.length - 1]);
      });
    });
}

function getAllDescendantIds(files, nodeId) {
  return files.find(file => file.id === nodeId).children
  .reduce((acc, childId) => (
    [...acc, childId, ...getAllDescendantIds(files, childId)]
  ), []);
}

function deleteMany(files, ids) {
  const objectKeys = [];

  each(ids, (id, cb) => {
    if (files.id(id).url) {
      if (!process.env.S3_DATE || (process.env.S3_DATE && moment(process.env.S3_DATE) < moment(files.id(id).createdAt))) {
        const objectKey = getObjectKey(files.id(id).url);
        objectKeys.push(objectKey);
      }
    }
    files.id(id).remove();
    cb();
  }, (err) => {
    deleteObjectsFromS3(objectKeys);
  });
}

function deleteChild(files, parentId, id) {
  return files.map((file) => {
    if (file.id === parentId) {
      file.children = file.children.filter(child => child !== id);
      return file;
    }
    return file;
  });
}

export function deleteFile(req, res) {
  Project.findById(req.params.project_id, (err, project) => {
    const idsToDelete = getAllDescendantIds(project.files, req.params.file_id);
    deleteMany(project.files, [req.params.file_id, ...idsToDelete]);
    project.files = deleteChild(project.files, req.query.parentId, req.params.file_id);
    // project.files.id(req.params.file_id).remove();
    // const childrenArray = project.files.id(req.query.parentId).children;
    // project.files.id(req.query.parentId).children = childrenArray.filter(id => id !== req.params.file_id);
    project.save((innerErr) => {
      res.json(project.files);
    });
  });
}

export function getFileContent(req, res) {
  Project.findById(req.params.project_id, (err, project) => {
    if (err) {
      res.status(404).send({ success: false, message: 'Project with that id does not exist.' });
      return;
    }
    const filePath = req.params[0];
    const resolvedFile = resolvePathToFile(filePath, project.files);
    if (!resolvedFile) {
      res.status(404).send({ success: false, message: 'File with that name and path does not exist.' });
      return;
    }
    res.send(resolvedFile.content);
  });
}
