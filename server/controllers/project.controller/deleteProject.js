import Project from '../../models/project';
import createApplicationErrorClass from '../../utils/createApplicationErrorClass';

const ProjectDeletionError = createApplicationErrorClass(
  'ProjectDeletionError'
);

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

    await project.deleteOne();
    res.status(200).end();
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      sendProjectNotFound();
    } else {
      sendFailure(error);
    }
  }
}
