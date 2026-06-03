import { Router } from 'express';
import { sendHtml, renderIndex, renderProjectIndex } from '../views/index';
import { userExists } from '../controllers/user.controller';
import {
  projectExists,
  projectForUserExists,
  getProjectForUser
} from '../controllers/project.controller';
import { collectionForUserExists } from '../controllers/collection.controller';

const router = Router();
// After the OP migration, all sketch / user / collection URLs serve the SPA
// shell unconditionally — the React app fetches data from OP using the
// per-user localStorage token (or anonymously for public data). The
// Mongo-backed `else` branches below are dead code, kept for a follow-up
// retirement pass.
const ApiTokenReady = true;

router.get('/', (req, res) => {
  res.send(renderIndex());
});

router.get('/signup', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.send(renderIndex());
});

router.get('/projects/:project_id', async (req, res) => {
  if (ApiTokenReady) {
    return res.send(renderIndex());
  }
  const exists = await projectExists(req.params.project_id);
  return sendHtml(req, res, exists);
});

router.get(
  '/:username/sketches/:project_id/add-to-collection',
  async (req, res) => {
    if (ApiTokenReady) {
      return res.send(renderIndex());
    }
    const exists = await projectForUserExists(
      req.params.username,
      req.params.project_id
    );
    return sendHtml(req, res, exists);
  }
);

router.get('/:username/sketches/:project_id', async (req, res) => {
  if (ApiTokenReady) {
    return res.send(renderIndex());
  }
  const project = await getProjectForUser(
    req.params.username,
    req.params.project_id
  );

  if (project.exists) {
    return res.send(
      renderProjectIndex(req.params.username, project.userProject.name)
    );
  }
  return sendHtml(req, res, project.exists);
});

router.get('/:username/sketches', async (req, res) => {
  if (ApiTokenReady) {
    return res.send(renderIndex());
  }
  const exists = await userExists(req.params.username);
  return sendHtml(req, res, exists);
});

router.get('/:username/full/:project_id', async (req, res) => {
  if (ApiTokenReady) {
    return res.send(renderIndex());
  }
  const exists = await projectForUserExists(
    req.params.username,
    req.params.project_id
  );
  return sendHtml(req, res, exists);
});

router.get('/full/:project_id', async (req, res) => {
  if (ApiTokenReady) {
    return res.send(renderIndex());
  }
  const exists = await projectExists(req.params.project_id);
  return sendHtml(req, res, exists);
});

router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  return res.send(renderIndex());
});

router.get('/reset-password', (req, res) => {
  if (req.user) {
    return res.redirect('/account');
  }
  return res.send(renderIndex());
});

router.get('/reset-password/:reset_password_token', (req, res) => {
  if (req.user) {
    return res.redirect('/account');
  }
  return res.send(renderIndex());
});

router.get('/verify', (req, res) => {
  res.send(renderIndex());
});

router.get('/sketches', (req, res) => {
  if (req.user) {
    const { username } = req.user;
    return res.redirect(`/${username}/sketches`);
  }
  return res.redirect('/login');
});

router.get('/assets', (req, res) => {
  if (req.user) {
    const { username } = req.user;
    return res.redirect(`/${username}/assets`);
  }
  return res.redirect('/login');
});

router.get('/:username/assets', async (req, res) => {
  if (ApiTokenReady) {
    return res.send(renderIndex());
  }
  const exists = await userExists(req.params.username);
  const isLoggedInUser = req.user && req.user.username === req.params.username;
  const canAccess = exists && isLoggedInUser;
  return sendHtml(req, res, canAccess);
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

router.get('/:username/collections/:id', async (req, res) => {
  if (ApiTokenReady) {
    return res.send(renderIndex());
  }
  const exists = await collectionForUserExists(
    req.params.username,
    req.params.id
  );
  return sendHtml(req, res, exists);
});

router.get('/:username/collections', async (req, res) => {
  if (ApiTokenReady) {
    return res.send(renderIndex());
  }
  const exists = await userExists(req.params.username);
  return sendHtml(req, res, exists);
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

// eslint-disable-next-line import/no-default-export
export default router;
