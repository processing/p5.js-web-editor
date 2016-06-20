import Project from '../models/project'

export function createProject(req, res) {
	if (req.user) {
		Project.create({
			user: req.user._id,
			name: req.body.name,
			file: {
				name: req.body.file.name,
				content: req.body.file.content
			}
		}, function(err, newProject) {
			if (err) { return res.json({success: false}) }
			return res.json({
				id: newProject._id,
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

export function updateProject(req, res) {
	Project.update({_id: req.params.project_id}, 
		{
			$set: req.body
		}, function(err, updatedProject) {
			if (err) { return res.json({success: false}) }
			return res.json({
				id: updatedProject._id,
				name: updatedProject.name,
				file: {
					name: updatedProject.file.name,
					content: updatedProject.file.content
				}
			});
	});
}

export function getProject(req, res) {
	Project.findById(req.params.project_id, function(err, project) {
		if (err) { 
			return res.status(404).send({message: 'Project with that id does not exist'}); 
		}

		return res.json({
			id: project._id,
			name: project.name,
			file: {
				name: project.file.name,
				content: project.file.conent
			}
		});
	})
}