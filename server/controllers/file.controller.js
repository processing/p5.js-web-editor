import Project from '../models/project'

// Bug -> timestamps don't get created, but it seems like this will
// be fixed in mongoose soon
// https://github.com/Automattic/mongoose/issues/4049
export function createFile(req, res) {
  Project.findByIdAndUpdate(req.params.project_id,
    {
      $push: {
        'files': req.body
      }
    },
    {
      new: true
    }, (err, updatedProject) => {
      if (err) { return res.json({ success: false }); }
      return res.json(updatedProject.files[updatedProject.files.length - 1]);
    });
}