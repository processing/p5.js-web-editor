import each from 'async/each';
import mime from 'mime';
import isBefore from 'date-fns/isBefore';
import Project from '../models/project';
import { resolvePathToFile } from '../utils/filePath';
import { deleteObjectsFromS3, getObjectKey } from './aws.controller';

// Bug -> timestamps don't get created, but it seems like this will
// be fixed in mongoose soon
// https://github.com/Automattic/mongoose/issues/4049
export async function createFile(req, res) {
  try {
    const updatedProject = await Project.findOneAndUpdate(
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
      }
    ).exec();

    if (!updatedProject) {
      return res.status(403).send({
        success: false,
        message: 'Project does not exist, or user does not match owner.'
      });
    }

    const newFile = updatedProject.files[updatedProject.files.length - 1];
    updatedProject.files.id(req.body.parentId).children.push(newFile.id);

    const savedProject = await updatedProject.save();
    const populatedProject = await savedProject.populate({
      path: 'user',
      select: 'username'
    });

    return res.json({
      updatedFile: newFile,
      project: populatedProject
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
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
      files.id(id).deleteOne();
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
  Project.findById(req.params.project_id)
    .then((project) => {
      if (!project) {
        return res.status(404).send({
          success: false,
          message: 'Project does not exist.'
        });
      }

      if (!project.user.equals(req.user._id)) {
        return res.status(403).send({
          success: false,
          message: 'Session does not match owner of project.'
        });
      }

      const fileToDelete = project.files.find(
        (file) => file.id === req.params.file_id
      );

      if (!fileToDelete) {
        return res.status(404).send({
          success: false,
          message: 'File does not exist in project.'
        });
      }

      const idsToDelete = getAllDescendantIds(
        project.files,
        req.params.file_id
      );
      deleteMany(project.files, [req.params.file_id, ...idsToDelete]);

      project.files = deleteChild(
        project.files,
        req.query.parentId,
        req.params.file_id
      );

      return project.save().then((savedProject) => {
        res.json({ project: savedProject });
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Failed to process deletion' });
    });
}

export function getFileContent(req, res) {
  const projectId = req.params.project_id;

  Project.findOne({ $or: [{ _id: projectId }, { slug: projectId }] })
    .then((project) => {
      if (!project) {
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
        mime.getType(resolvedFile.name) || 'application/octet-stream';
      res.set('Content-Type', contentType);
      res.send(resolvedFile.content);
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .send({ success: false, message: 'Internal server error' });
    });
}
