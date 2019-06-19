import Project from '../../models/project';
import { toModel, FileValidationError } from '../../domain-objects/Project';

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

  function sendValidationErrors(err) {
    res.status(422).json({
      name: 'File Validation Failed',
      message: err.message,
      errors: err.files,
    });
  }

  // TODO: Error handling to match spec
  function sendFailure() {
    res.status(500).json({ success: false });
  }

  try {
    const model = toModel(params);

    return model
      .save()
      .then((newProject) => {
        res.status(201).json({ id: newProject.id });
      })
      .catch(sendFailure);
  } catch (err) {
    if (err instanceof FileValidationError) {
      sendValidationErrors(err);
    } else {
      sendFailure();
    }

    return Promise.reject();
  }
}
