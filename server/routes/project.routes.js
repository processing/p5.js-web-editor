import { Router } from 'express';
import * as ProjectController from '../controllers/project.controller';

const router = new Router();

router.route('/projects').post(ProjectController.createProject);

router.route('/projects/:project_id').put(ProjectController.updateProject);

router.route('/projects/:project_id').get(ProjectController.getProject);

router.route('/projects/:project_id').delete(ProjectController.deleteProject);

router.route('/projects').get(ProjectController.getProjects);

router.route('/:username/projects').get(ProjectController.getProjectsForUser);

router.route('/projects/:project_id/zip').get(ProjectController.downloadProjectAsZip);

export default router;
