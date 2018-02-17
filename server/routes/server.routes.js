import { Router } from 'express';
import { renderIndex } from '../views/index';
import { get404Sketch } from '../views/404Page';
import { userExists } from '../controllers/user.controller';
import { projectExists, projectForUserExists } from '../controllers/project.controller';

const router = new Router();

// this is intended to be a temporary file
// until i figure out isomorphic rendering

router.get('/', (req, res) => {
  res.send(renderIndex());
});

router.get('/signup', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.send(renderIndex());
});

router.get('/projects/:project_id', (req, res) => {
  projectExists(req.params.project_id, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.get('/:username/sketches/:project_id', (req, res) => {
  projectForUserExists(req.params.username, req.params.project_id, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});


// router.get('/full/:project_id', (req, res) => {
//   res.send(renderIndex());
// });

router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.send(renderIndex());
});

router.get('/reset-password', (req, res) => {
  res.send(renderIndex());
});

router.get('/reset-password/:reset_password_token', (req, res) => {
  res.send(renderIndex());
});

router.get('/verify', (req, res) => {
  res.send(renderIndex());
});

router.get('/sketches', (req, res) => {
  res.send(renderIndex());
});

router.get('/about', (req, res) => {
  res.send(renderIndex());
});

router.get('/feedback', (req, res) => {
  res.send(renderIndex());
});

router.get('/:username/sketches', (req, res) => {
  userExists(req.params.username, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.get('/:username/assets', (req, res) => {
  userExists(req.params.username, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

router.get('/:username/account', (req, res) => {
  userExists(req.params.username, exists => (
    exists ? res.send(renderIndex()) : get404Sketch(html => res.send(html))
  ));
});

export default router;
