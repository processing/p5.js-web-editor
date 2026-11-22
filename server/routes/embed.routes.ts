import { Router } from 'express';
import { getEditorUrl } from '../utils/editorUrl';

const router = Router();

// CAT redirecting these temporarily to editor URLS to prevent phishing
// router.get('/:username/embed/:project_id', EmbedController.serveProject);
router.get('/:username/embed/:project_id', (req, res) => {
  const { username, project_id: projectId } = req.params;
  res.redirect(301, `${getEditorUrl()}/${username}/full/${projectId}`);
});
// router.get('/:username/present/:project_id', EmbedController.serveProject);
router.get('/:username/present/:project_id', (req, res) => {
  const { username, project_id: projectId } = req.params;
  res.redirect(301, `${getEditorUrl()}/${username}/full/${projectId}`);
});
// router.get('/embed/:project_id', EmbedController.serveProject);
router.get('/embed/:project_id', (req, res) => {
  const { project_id: projectId } = req.params;
  res.redirect(301, `${getEditorUrl()}/full/${projectId}`);
});

// eslint-disable-next-line import/no-default-export
export default router;
