import each from 'async/each';
import mime from 'mime-types';
import isBefore from 'date-fns/isBefore';
import Project from '../models/project';
import { resolvePathToFile } from '../utils/filePath';
import { deleteObjectsFromS3, getObjectKey } from './aws.controller';

// Bug -> timestamps don't get created, but it seems like this will
// be fixed in mongoose soon
// https://github.com/Automattic/mongoose/issues/4049
export function createFile(req, res) {
  Project.findOneAndUpdate(
    {
      _id: req.params.project_id,
      user: req.user._id
    },
    {
      $push: {
        files: req.body
      }
    },
    {
      new: true
    },
    (err, updatedProject) => {
      if (err || !updatedProject) {
        console.log(err);
        res.status(403).send({
          success: false,
          message: 'Project does not exist, or user does not match owner.'
        });
        return;
      }
      const newFile = updatedProject.files[updatedProject.files.length - 1];
      updatedProject.files.id(req.body.parentId).children.push(newFile.id);
      updatedProject.save((innerErr, savedProject) => {
        if (innerErr) {
          console.log(innerErr);
          res.json({ success: false });
          return;
        }
        savedProject.populate(
          { path: 'user', select: 'username' },
          (_, populatedProject) => {
            res.json({
              updatedFile:
                updatedProject.files[updatedProject.files.length - 1],
              project: populatedProject
            });
          }
        );
      });
    }
  );
}

function getAllDescendantIds(files, nodeId) {
  const parentFile = files.find((file) => file.id === nodeId);
  if (!parentFile) return [];
  return parentFile.children.reduce(
    (acc, childId) => [...acc, childId, ...getAllDescendantIds(files, childId)],
    []
  );
}

function deleteMany(files, ids) {
  const objectKeys = [];

  each(
    ids,
    (id, cb) => {
      if (files.id(id).url) {
        if (
          !process.env.S3_DATE ||
          (process.env.S3_DATE &&
            isBefore(
              new Date(process.env.S3_DATE),
              new Date(files.id(id).createdAt)
            ))
        ) {
          const objectKey = getObjectKey(files.id(id).url);
          objectKeys.push(objectKey);
        }
      }
      files.id(id).remove();
      cb();
    },
    (err) => {
      deleteObjectsFromS3(objectKeys);
    }
  );
}

function deleteChild(files, parentId, id) {
  return files.map((file) => {
    if (file.id === parentId) {
      file.children = file.children.filter((child) => child !== id);
      return file;
    }
    return file;
  });
}

export function deleteFile(req, res) {
  Project.findById(req.params.project_id, (err, project) => {
    if (!project) {
      res
        .status(404)
        .send({ success: false, message: 'Project does not exist.' });
    }
    if (!project.user.equals(req.user._id)) {
      res.status(403).send({
        success: false,
        message: 'Session does not match owner of project.'
      });
      return;
    }

    // make sure file exists for project
    const fileToDelete = project.files.find(
      (file) => file.id === req.params.file_id
    );
    if (!fileToDelete) {
      res
        .status(404)
        .send({ success: false, message: 'File does not exist in project.' });
      return;
    }

    const idsToDelete = getAllDescendantIds(project.files, req.params.file_id);
    deleteMany(project.files, [req.params.file_id, ...idsToDelete]);
    project.files = deleteChild(
      project.files,
      req.query.parentId,
      req.params.file_id
    );
    project.save((innerErr, savedProject) => {
      res.json({ project: savedProject });
    });
  });
}

export function getFileContent(req, res) {
  Project.findById(req.params.project_id, (err, project) => {
    if (err || project === null) {
      res.status(404).send({
        success: false,
        message: 'Project with that id does not exist.'
      });
      return;
    }
    const filePath = req.params[0];
    const resolvedFile = resolvePathToFile(filePath, project.files);
    if (!resolvedFile) {
      res.status(404).send({
        success: false,
        message: 'File with that name and path does not exist.'
      });
      return;
    }
    const contentType =
      mime.lookup(resolvedFile.name) || 'application/octet-stream';
    res.set('Content-Type', contentType);
    res.send(resolvedFile.content);
  });
}
