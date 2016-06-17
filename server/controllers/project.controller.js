import Project from '../models/project'

export function createProject(req, res) {
	if (req.user) {
		Project.create({
			user: req.user._id,
			file: {}						
		}, function(err, newProject) {
			if (err) { return res.json({success: false}) }
			return res.json({
				name: newProject.name,
				file: {
					name: newProject.file.name,
					content: newProject.file.content
				}
			});
		});	
	} else {
		res.json({success: false});
	}
}