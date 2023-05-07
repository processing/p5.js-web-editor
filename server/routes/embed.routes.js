import { Router } from 'express';

const editorUrl = process.env.EDITOR_URL;

const router = new Router();

// CAT redirecting these temporarily to editor URLS to prevent phishing
// router.get('/:username/embed/:project_id', EmbedController.serveProject);
router.get('/:username/embed/:project_id', (req, res) => {
  const { username, project_id: projectId } = req.params;
  res.redirect(301, `${editorUrl}/${username}/full/${projectId}`);
});
// router.get('/:username/present/:project_id', EmbedController.serveProject);
router.get('/:username/present/:project_id', (req, res) => {
  const { username, project_id: projectId } = req.params;
  res.redirect(301, `${editorUrl}/${username}/full/${projectId}`);
});
// router.get('/embed/:project_id', EmbedController.serveProject);
router.get('/embed/:project_id', (req, res) => {
  const { project_id: projectId } = req.params;
  res.redirect(301, `${editorUrl}/full/${projectId}`);
});

export default router;
