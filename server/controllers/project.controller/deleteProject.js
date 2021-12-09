import isBefore from 'date-fns/isBefore';
import Project from '../../models/project';
import { deleteObjectsFromS3, getObjectKey } from '../aws.controller';
import createApplicationErrorClass from '../../utils/createApplicationErrorClass';

const ProjectDeletionError = createApplicationErrorClass(
  'ProjectDeletionError'
);

function deleteFilesFromS3(files) {
  deleteObjectsFromS3(
    files
      .filter((file) => {
        if (
          file.url &&
          (file.url.includes(process.env.S3_BUCKET_URL_BASE) ||
            file.url.includes(process.env.S3_BUCKET))
        ) {
          if (
            !process.env.S3_DATE ||
            (process.env.S3_DATE &&
              isBefore(new Date(process.env.S3_DATE), new Date(file.createdAt)))
          ) {
            return true;
          }
        }
        return false;
      })
      .map((file) => getObjectKey(file.url))
  );
}

export default function deleteProject(req, res) {
  function sendFailure(error) {
    res.status(error.code).json({ message: error.message });
  }

  function sendProjectNotFound() {
    sendFailure(
      new ProjectDeletionError('Project with that id does not exist', {
        code: 404
      })
    );
  }

  function handleProjectDeletion(project) {
    if (project == null) {
      sendProjectNotFound();
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

    deleteFilesFromS3(project.files);

    project.remove((removeProjectError) => {
      if (removeProjectError) {
        sendProjectNotFound();
        return;
      }

      res.status(200).end();
    });
  }

  return Project.findById(req.params.project_id)
    .then(handleProjectDeletion)
    .catch(sendFailure);
}
