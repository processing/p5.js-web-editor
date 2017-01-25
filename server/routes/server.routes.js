import { Router } from 'express';
import { renderIndex } from '../views/index';
import { get404Sketch } from '../views/404Page';
import { userExists } from '../controllers/user.controller';

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

export default router;
