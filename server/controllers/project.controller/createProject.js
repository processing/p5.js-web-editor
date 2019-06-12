import Project from '../../models/project';

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
