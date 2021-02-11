import { Router } from 'express';
import { renderIndex } from '../views/index';
import { get404Sketch } from '../views/404Page';
import { userExists } from '../controllers/user.controller';
import {
  projectExists,
  projectForUserExists
} from '../controllers/project.controller';
import { collectionForUserExists } from '../controllers/collection.controller';

const router = new Router();

const fallback404 = (res) => (exists) => // eslint-disable-line
  exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html));

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
  projectExists(req.params.project_id, (exists) =>
    exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html))
  );
});

router.get('/:username/sketches/:project_id/add-to-collection', (req, res) => {
  projectForUserExists(req.params.username, req.params.project_id, (exists) =>
    exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html))
  );
});

router.get('/:username/sketches/:project_id', (req, res) => {
  projectForUserExists(req.params.username, req.params.project_id, (exists) =>
    exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html))
  );
});

router.get('/:username/sketches', (req, res) => {
  userExists(req.params.username, (exists) =>
    exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html))
  );
});

router.get('/:username/full/:project_id', (req, res) => {
  projectForUserExists(req.params.username, req.params.project_id, (exists) =>
    exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html))
  );
});

router.get('/full/:project_id', (req, res) => {
  projectExists(req.params.project_id, (exists) =>
    exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html))
  );
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
    return canAccess
      ? res.send(renderIndex())
      : get404Sketch((html) => res.send(html));
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

router.get('/:username/collections/create', (req, res) => {
  userExists(req.params.username, (exists) => {
    const isLoggedInUser =
      req.user && req.user.username === req.params.username;
    const canAccess = exists && isLoggedInUser;
    return canAccess
      ? res.send(renderIndex())
      : get404Sketch((html) => res.send(html));
  });
});

router.get('/:username/collections/create', (req, res) => {
  userExists(req.params.username, (exists) =>
    exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html))
  );
});

router.get('/:username/collections/:id', (req, res) => {
  collectionForUserExists(req.params.username, req.params.id, (exists) =>
    exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html))
  );
});

router.get('/:username/collections', (req, res) => {
  userExists(req.params.username, (exists) =>
    exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html))
  );
});

export default router;
