import { Router } from 'express';
const router = new Router();
import { renderIndex } from '../views/index';

// this is intended to be a temporary file
// until i figure out isomorphic rendering

// Wildcard route.
// 404s are handled by the client (react-router) and redirect to the index route.
router.route('*').get((req, res) => {
  res.send(renderIndex());
});

export default router;
