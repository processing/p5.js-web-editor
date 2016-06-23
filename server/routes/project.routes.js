import { Router } from 'express';
import * as ProjectController from '../controllers/project.controller';

const router = new Router();

router.route('/projects').post(ProjectController.createProject);

router.route('/projects/:project_id').put(ProjectController.updateProject);

router.route('/projects/:project_id').get(ProjectController.getProject);

export default router;
