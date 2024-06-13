import isBefore from 'date-fns/isBefore';
import Project from '../../models/project';
import { deleteObjectsFromS3, getObjectKey } from '../aws.controller';
import createApplicationErrorClass from '../../utils/createApplicationErrorClass';

const ProjectDeletionError = createApplicationErrorClass(
  'ProjectDeletionError'
);

async function deleteFilesFromS3(files) {
  const filteredFiles = files
    .filter((file) => {
      const isValidFile =
        file.url &&
        (file.url.includes(process.env.S3_BUCKET_URL_BASE) ||
          file.url.includes(process.env.S3_BUCKET)) &&
        (!process.env.S3_DATE ||
          (process.env.S3_DATE &&
            isBefore(new Date(process.env.S3_DATE), new Date(file.createdAt))));

      return isValidFile;
    })
    .map((file) => getObjectKey(file.url));

  try {
    await deleteObjectsFromS3(filteredFiles);
  } catch (error) {
    console.error('Failed to delete files from S3: ', error);
  }
}

export default async function deleteProject(req, res) {
  const sendFailure = (error) => {
    res.status(error.code).json({ message: error.message });
  };

  function sendProjectNotFound() {
    sendFailure(
      new ProjectDeletionError('Project with that id does not exist', {
        code: 404
      })
    );
  }

  try {
    const project = await Project.findById(req.params.project_id);

    if (!project) {
      sendFailure(
        new ProjectDeletionError('Project with that id does not exist', {
          code: 404
        })
      );
      return;
    }

    if (!project.user.equals(req.user._id)) {
      sendFailure(
        new ProjectDeletionError(
          'Authenticated user does not match owner of project',
          { code: 403 }
        )
      );
      return;
    }

    await deleteFilesFromS3(project.files);
    await project.remove();
    res.status(200).end();
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      sendProjectNotFound();
    } else {
      sendFailure(error);
    }
  }
}
