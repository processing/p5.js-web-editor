import { Router } from 'express';
import sendHtml, { renderIndex } from '../views/index';
import { userExists } from '../controllers/user.controller';
import {
  projectExists,
  projectForUserExists
} from '../controllers/project.controller';
import { collectionForUserExists } from '../controllers/collection.controller';

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
  projectExists(req.params.project_id, (exists) => sendHtml(req, res, exists));
});

router.get('/:username/sketches/:project_id/add-to-collection', (req, res) => {
  projectForUserExists(req.params.username, req.params.project_id, (exists) =>
    sendHtml(req, res, exists)
  );
});

router.get('/:username/sketches/:project_id', (req, res) => {
  projectForUserExists(req.params.username, req.params.project_id, (exists) =>
    sendHtml(req, res, exists)
  );
});

router.get('/:username/sketches', (req, res) => {
  userExists(req.params.username, (exists) => sendHtml(req, res, exists));
});

router.get('/:username/full/:project_id', (req, res) => {
  projectForUserExists(req.params.username, req.params.project_id, (exists) =>
    sendHtml(req, res, exists)
  );
});

router.get('/full/:project_id', (req, res) => {
  projectExists(req.params.project_id, (exists) => sendHtml(req, res, exists));
});

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
  if (req.user) {
    res.send(renderIndex());
  } else {
    res.redirect('/login');
  }
});

router.get('/assets', (req, res) => {
  if (req.user) {
    res.send(renderIndex());
  } else {
    res.redirect('/login');
  }
});

router.get('/:username/assets', (req, res) => {
  userExists(req.params.username, (exists) => {
    const isLoggedInUser =
      req.user && req.user.username === req.params.username;
    const canAccess = exists && isLoggedInUser;
    return sendHtml(req, res, canAccess);
  });
});

router.get('/account', (req, res) => {
  if (req.user) {
    res.send(renderIndex());
  } else {
    res.redirect('/login');
  }
});

router.get('/about', (req, res) => {
  res.send(renderIndex());
});

router.get('/:username/collections/:id', (req, res) => {
  collectionForUserExists(req.params.username, req.params.id, (exists) =>
    sendHtml(req, res, exists)
  );
});

router.get('/:username/collections', (req, res) => {
  userExists(req.params.username, (exists) => sendHtml(req, res, exists));
});

router.get('/privacy-policy', (req, res) => {
  res.send(renderIndex());
});

router.get('/terms-of-use', (req, res) => {
  res.send(renderIndex());
});

router.get('/code-of-conduct', (req, res) => {
  res.send(renderIndex());
});

export default router;
