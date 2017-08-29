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

router.route('/myclassrooms').get((req, res) => {
  res.send(renderIndex());
});

router.route('/assignment').get((req, res) => {
  res.send(renderIndex());
});

router.route('/createclassroom').get((req, res) => {
  res.send(renderIndex());
});

router.route('/createassignment').get((req, res) => {
  res.send(renderIndex());
});

router.route('/submitsketch').get((req, res) => {
  res.send(renderIndex());
});

router.route('/classroom/:classroom_id').get((req, res) => {
  classroomExists(req.params.classroom_id, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/classroomsettings/:classroom_id').get((req, res) => {
  classroomExists(req.params.classroom_id, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.route('/assignment/:classroom_id/:assignment_id').get((req, res) => {
  assignmentExists(req.params.classroom_id, req.params.assignment_id, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

export default router;
