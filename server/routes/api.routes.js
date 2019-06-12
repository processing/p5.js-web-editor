import { Router } from 'express';
import passport from 'passport';
import * as ProjectController from '../controllers/project.controller';

const router = new Router();

router.get(
  '/:username/sketches',
  passport.authenticate('basic', { session: false }),
  ProjectController.apiGetProjectsForUser
);

// router.post(
//   '/:username/sketches',
//   passport.authenticate('basic', { session: false }),
//   ProjectController.apiCreateProject
// );

// router.delete(
//   '/:username/sketches/:id',
//   passport.authenticate('basic', { session: false }),
//   ProjectController.deleteProject
// );

export default router;
