import { Router } from 'express';
import sendHtml, { renderIndex, renderProjectIndex } from '../views/index';
import { userExists } from '../controllers/user.controller';
import {
  projectExists,
  projectForUserExists,
  getProjectForUser
} from '../controllers/project.controller';
import { collectionForUserExists } from '../controllers/collection.controller';

const router = new Router();

// const fallback404 = (res) => (exists) =>
//   exists ? res.send(renderIndex()) : get404Sketch((html) => res.send(html));

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

router.get('/projects/:project_id', async (req, res) => {
  const exists = await projectExists(req.params.project_id);
  await sendHtml(req, res, exists);
});

router.get(
  '/:username/sketches/:project_id/add-to-collection',
  async (req, res) => {
    const exists = await projectForUserExists(
      req.params.username,
      req.params.project_id
    );
    await sendHtml(req, res, exists);
  }
);

router.get('/:username/sketches/:project_id', async (req, res) => {
  const project = await getProjectForUser(
    req.params.username,
    req.params.project_id
  );

  if (project.exists) {
    res.send(renderProjectIndex(req.params.username, project.userProject.name));
  } else {
    await sendHtml(req, res, project.exists);
  }
});

router.get('/:username/sketches', async (req, res) => {
  const exists = await userExists(req.params.username);
  await sendHtml(req, res, exists);
});

router.get('/:username/full/:project_id', async (req, res) => {
  const exists = await projectForUserExists(
    req.params.username,
    req.params.project_id
  );
  await sendHtml(req, res, exists);
});

router.get('/full/:project_id', async (req, res) => {
  const exists = await projectExists(req.params.project_id);
  await sendHtml(req, res, exists);
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
  const exists = await userExists(req.params.username);
  const isLoggedInUser = req.user && req.user.username === req.params.username;
  const canAccess = exists && isLoggedInUser;
  await sendHtml(req, res, canAccess);
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
  const exists = await collectionForUserExists(
    req.params.username,
    req.params.id
  );
  await sendHtml(req, res, exists);
});

router.get('/:username/collections', async (req, res) => {
  const exists = await userExists(req.params.username);
  await sendHtml(req, res, exists);
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
