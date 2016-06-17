import { Router } from 'express';
import * as ProjectController from '../controllers/project.controller';

const router = new Router();

router.route('/projects').post(ProjectController.createProject);

export default router;