import Project from '../../models/project';
import { toModel } from '../../domain-objects/Project';

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

  // TODO: Error handling to match spec
  function sendFailure() {
    res.json({ success: false });
  }

  try {
    const model = toModel(params);

    model
      .save()
      .then((newProject) => {
        res.json({ ok: true });
      })
      .catch(sendFailure);
  } catch (err) {
    // TODO: Catch custom err object and return correct status code
    res.status(422).json({ error: 'Validation error' });
  }
}
