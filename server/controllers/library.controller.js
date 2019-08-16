import Project from '../models/project';

export function addLibrary(req, res) {
  const { project_id } = req.params;
  // { name, url }
  const { name, url } = req.body;
  // we are accessing the database
  Project.findByIdAndUpdate(
    project_id,
    {
      $push: {
        libraries: {
          name,
          url
        }
      }
    },
    {
      new: true
    }
  ).then((project) => {
    const { libraries } = project;
    res.json({
      libraries
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({ success: false });
  });
}

export function removeLibrary(req, res) {

}

export function setLibraries(req, res) {

}
