import { Router } from 'express';
import { renderIndex } from '../views/index';

const router = Router();

// After the OpenProcessing migration the editor server no longer has its own
// database. Every route here serves the React SPA shell unconditionally; the
// app then fetches the data it needs (sketches, users, collections, auth) from
// OpenProcessing in the browser using the per-user access token. Existence
// checks and `req.user`-based redirects that used to run against Mongo are
// gone — the client router handles unknown URLs and the logged-out state.
const renderSpa = (req, res) => res.send(renderIndex());

router.get('/', renderSpa);
router.get('/signup', renderSpa);
router.get('/projects/:project_id', renderSpa);
router.get('/:username/sketches/:project_id/add-to-collection', renderSpa);
router.get('/:username/sketches/:project_id', renderSpa);
router.get('/:username/sketches', renderSpa);
router.get('/:username/full/:project_id', renderSpa);
router.get('/full/:project_id', renderSpa);
router.get('/login', renderSpa);
router.get('/sketches', renderSpa);
router.get('/assets', renderSpa);
router.get('/:username/assets', renderSpa);
router.get('/account', renderSpa);
router.get('/about', renderSpa);
router.get('/:username/collections/:id', renderSpa);
router.get('/:username/collections', renderSpa);
router.get('/privacy-policy', renderSpa);
router.get('/terms-of-use', renderSpa);
router.get('/code-of-conduct', renderSpa);

// eslint-disable-next-line import/no-default-export
export default router;
