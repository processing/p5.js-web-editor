import Project from '../models/project';

export function addLibrary(req, res) {
  const { project_id } = req.params;
  // { name, url }
  const { name, url, indexFile } = req.body;
  console.log(indexFile);
  Project.findById(project_id).then((project) => {
    project.libraries.push({ name, url });
    project.files.id(indexFile.id).content = indexFile.content;
    return project.save({ new: true });
  }).then((project) => {
    const { libraries, files } = project;
    res.json({
      libraries,
      files
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
