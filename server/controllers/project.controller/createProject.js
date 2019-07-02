import Project from '../../models/project';
import { toModel, FileValidationError, ProjectValidationError } from '../../domain-objects/Project';

export default function createProject(req, res) {
  let projectValues = {
    user: req.user._id
  };

  projectValues = Object.assign(projectValues, req.body);

  function sendFailure() {
    res.json({ success: false });
  }

  function populateUserData(newProject) {
    return Project.populate(
      newProject,
      { path: 'user', select: 'username' },
      (err, newProjectWithUser) => {
        if (err) {
          sendFailure();
          return;
        }
        res.json(newProjectWithUser);
      }
    );
  }


  return Project.create(projectValues)
    .then(populateUserData)
    .catch(sendFailure);
}

// TODO: What happens if you don't supply any files?
export function apiCreateProject(req, res) {
  const params = Object.assign({ user: req.user._id }, req.body);

  function sendValidationErrors(err, type, code = 422) {
    res.status(code).json({
      message: `${type} Validation Failed`,
      detail: err.message,
      errors: err.files,
    });
  }

  // TODO: Error handling to match spec
  function sendFailure(err) {
    res.status(500).end();
  }

  function handleErrors(err) {
    if (err instanceof FileValidationError) {
      sendValidationErrors(err, 'File', err.code);
    } else if (err instanceof ProjectValidationError) {
      sendValidationErrors(err, 'Sketch', err.code);
    } else {
      sendFailure();
    }
  }

  try {
    const model = toModel(params);

    return model.isSlugUnique()
      .then(({ isUnique, conflictingIds }) => {
        if (isUnique) {
          return model.save()
            .then((newProject) => {
              res.status(201).json({ id: newProject.id });
            });
        }

        const error = new ProjectValidationError(`Slug "${model.slug}" is not unique. Check ${conflictingIds.join(', ')}`);
        error.code = 409;

        throw error;
      })
      .catch(handleErrors);
  } catch (err) {
    handleErrors(err);
    return Promise.reject(err);
  }
}
