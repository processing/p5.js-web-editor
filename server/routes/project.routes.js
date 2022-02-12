import { Router } from 'express';
import * as ProjectController from '../controllers/project.controller';
import isAuthenticated from '../utils/isAuthenticated';

const router = new Router();

router.post('/projects', isAuthenticated, ProjectController.createProject);

router.put(
  '/projects/:project_id',
  isAuthenticated,
  ProjectController.updateProject
);

router.get('/:username/projects/:project_id', ProjectController.getProject);

router.delete(
  '/projects/:project_id',
  isAuthenticated,
  ProjectController.deleteProject
);

router.get('/projects', ProjectController.getProjects);

router.get('/:username/projects', ProjectController.getProjectsForUser);

router.get('/projects/:project_id/zip', ProjectController.downloadProjectAsZip);

router.get(
  '/:user_id/projects/all/zip',
  ProjectController.downloadAllProjectsAsZip
);

export default router;
