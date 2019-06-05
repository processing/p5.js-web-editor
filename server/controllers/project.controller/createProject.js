import Project from '../../models/project';

export default function createProject(req, res) {
  let projectValues = {
    user: req.user._id
  };

  projectValues = Object.assign(projectValues, req.body);

  Project.create(projectValues, (err, newProject) => {
    if (err) {
      res.json({ success: false });
      return;
    }
    Project.populate(
      newProject,
      { path: 'user', select: 'username' },
      (innerErr, newProjectWithUser) => {
        if (innerErr) {
          res.json({ success: false });
          return;
        }
        res.json(newProjectWithUser);
      }
    );
  });
}
