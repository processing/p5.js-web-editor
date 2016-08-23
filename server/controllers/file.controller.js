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
      const newFile = updatedProject.files[updatedProject.files.length - 1];
      Project.findByIdAndUpdate(
        {"_id": req.params.project_id, "files._id": req.params.parentId},
        {
          $push: {
            'files.$.children': newFile.id
          }
        },
        {
          new: true
        }, (errAgain, updatedProjectAgain) => {
          if (errAgain) { return res.json({ success: false }); }
          return res.json(updatedProject.files[updatedProject.files.length - 1]);
        });
    });
}