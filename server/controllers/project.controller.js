import Project from '../models/project';

export function createProject(req, res) {
  const projectValues = {
    user: req.user ? req.user._id : undefined, // eslint-disable-line no-underscore-dangle
    file: {}
  };

  Object.assign(projectValues, req.body);

  Project.create(projectValues, (err, newProject) => {
    if (err) { return res.json({ success: false }); }
    return res.json({
      id: newProject._id, // eslint-disable-line no-underscore-dangle
      name: newProject.name,
      file: {
        name: newProject.file.name,
        content: newProject.file.content
      }
    });
  });
}

export function updateProject(req, res) {
  Project.findByIdAndUpdate(req.params.project_id,
    {
      $set: req.body
    }, (err, updatedProject) => {
      if (err) { return res.json({ success: false }); }
      return res.json({
        id: updatedProject._id, // eslint-disable-line no-underscore-dangle
        name: updatedProject.name,
        file: {
          name: updatedProject.file.name,
          content: updatedProject.file.content
        }
      });
    });
}

export function getProject(req, res) {
  Project.findById(req.params.project_id, (err, project) => {
    if (err) {
      return res.status(404).send({ message: 'Project with that id does not exist' });
    }

    return res.json({
      id: project._id, // eslint-disable-line no-underscore-dangle
      name: project.name,
      file: {
        name: project.file.name,
        content: project.file.content
      }
    });
  });
}
