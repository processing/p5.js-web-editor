import Project from '../../models/project';
import {
  toModel,
  FileValidationError,
  ProjectValidationError
} from '../../domain-objects/Project';

export default function createProject(req, res) {
  let projectValues = {
    user: req.user._id
  };

  projectValues = Object.assign(projectValues, req.body);

  function sendFailure(err) {
    res.status(400).json({ success: false });
  }

  function populateUserData(newProject) {
    return Project.populate(newProject, {
      path: 'user',
      select: 'username'
    }).then((newProjectWithUser) => {
      res.json(newProjectWithUser);
    });
  }

  return Project.create(projectValues)
    .then(populateUserData)
    .catch(sendFailure);
}

// TODO: What happens if you don't supply any files?
export async function apiCreateProject(req, res) {
  const params = Object.assign({ user: req.user._id }, req.body);

  const sendValidationErrors = (err, type, code = 422) => {
    res.status(code).json({
      message: `${type} Validation Failed`,
      detail: err.message,
      errors: err.files
    });
  };

  // TODO: Error handling to match spec
  const sendFailure = (err) => {
    res.status(500).end();
  };

  const handleErrors = (err) => {
    if (err instanceof FileValidationError) {
      sendValidationErrors(err, 'File', err.code);
    } else if (err instanceof ProjectValidationError) {
      sendValidationErrors(err, 'Sketch', err.code);
    } else {
      sendFailure();
    }
  };

  const checkUserHasPermission = () => {
    if (req.user.username !== req.params.username) {
      console.warn('no permission');
      const error = new ProjectValidationError(
        `'${req.user.username}' does not have permission to create for '${req.params.username}'`
      );
      error.code = 401;

      throw error;
    }
  };

  try {
    checkUserHasPermission();

    if (!params.files || typeof params.files !== 'object') {
      const error = new FileValidationError("'files' must be an object");
      throw error;
    }

    const model = toModel(params);

    const { isUnique, conflictingIds } = await model.isSlugUnique();

    if (!isUnique) {
      const error = new ProjectValidationError(
        `Slug "${model.slug}" is not unique. Check ${conflictingIds.join(', ')}`
      );
      error.code = 409;

      throw error;
    }

    const newProject = await model.save();
    res.status(201).json({ id: newProject.id });
  } catch (err) {
    handleErrors(err);
  }
}
