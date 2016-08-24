import Project from '../models/project';

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
      if (err) {
        console.log(err);
        return res.json({ success: false });
      }
      const newFile = updatedProject.files[updatedProject.files.length - 1];
      updatedProject.files.id(req.body.parentId).children.push(newFile.id);
      updatedProject.save(innerErr => {
        if (innerErr) {
          console.log(innerErr);
          return res.json({ success: false });
        }
        return res.json(updatedProject.files[updatedProject.files.length - 1]);
      });
      // console.log(updatedProject.files);
      // console.log(req.body.parentId);
      // Project.findByIdAndUpdate(
      //   {"_id":  req.params.project_id, "files._id": ObjectId(req.body.parentId)},
      //   {
      //     $push: {
      //       'files.$.children': newFile._id
      //     }
      //   },
      //   {
      //     new: true
      //   }, (errAgain, updatedProjectAgain) => {
      //     if (errAgain) {
      //       console.log(errAgain);
      //       return res.json({ success: false });
      //     }
      //     return res.json(updatedProject.files[updatedProject.files.length - 1]);
      //   });
    });
}