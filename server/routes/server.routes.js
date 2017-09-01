import { Router } from 'express';
import { renderIndex } from '../views/index';
import { get404Sketch } from '../views/404Page';
import { userExists } from '../controllers/user.controller';
import { getProjectAsset } from '../controllers/project.controller';
import { classroomExists, assignmentExists } from '../controllers/classroom.controller';

const router = new Router();

// this is intended to be a temporary file
// until i figure out isomorphic rendering

router.route('/').get((req, res) => {
  res.send(renderIndex());
});

router.route('/signup').get((req, res) => {
  res.send(renderIndex());
});

router.route('/projects/:project_id').get((req, res) => {
  res.send(renderIndex());
});

router.route('/:username/sketches/:project_id').get((req, res) => {
  res.send(renderIndex());
});

router.route('/:username/sketches/:project_id/*').get((req, res) => {
  getProjectAsset(req, res);
});

// router.route('/full/:project_id').get((req, res) => {
//   res.send(renderIndex());
// });

router.route('/login').get((req, res) => {
  res.send(renderIndex());
});

router.route('/reset-password').get((req, res) => {
  res.send(renderIndex());
});

router.route('/reset-password/:reset_password_token').get((req, res) => {
  res.send(renderIndex());
});

router.route('/verify').get((req, res) => {
  res.send(renderIndex());
});

router.route('/sketches').get((req, res) => {
  res.send(renderIndex());
});

router.route('/about').get((req, res) => {
  res.send(renderIndex());
});

router.route('/:username/sketches').get((req, res) => {
  userExists(req.params.username, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/:username/assets').get((req, res) => {
  userExists(req.params.username, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/:username/classrooms').get((req, res) => {
  userExists(req.params.username, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/:username/account').get((req, res) => {
  userExists(req.params.username, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/classrooms/:classroom_id/assignments/:assignment_id/submissions/new').get((req, res) => {
  classroomExists(req.params.classroom_id, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/classrooms/:classroom_id/assignments/:assignment_id/edit').get((req, res) => {
  classroomExists(req.params.classroom_id, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/classrooms/:classroom_id/assignments/new').get((req, res) => {
  classroomExists(req.params.classroom_id, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/classrooms/:classroom_id/edit').get((req, res) => {
  classroomExists(req.params.classroom_id, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/classrooms/:classroom_id').get((req, res) => {
  classroomExists(req.params.classroom_id, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/classrooms/new').get((req, res) => {
  res.send(renderIndex());
});

router.route('/classrooms').get((req, res) => {
  res.send(renderIndex());
});

export default router;
