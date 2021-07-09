import { Router } from 'express';

const router = new Router();
const previewUrl = process.env.PREVIEW_URL;

router.get('/:username/embed/:project_id', (req, res) => {
  const { username, project_id: projectId } = req.params;
  res.redirect(301, `${previewUrl}/${username}/embed/${projectId}`);
});

router.get('/:username/present/:project_id', (req, res) => {
  const { username, project_id: projectId } = req.params;
  res.redirect(301, `${previewUrl}/${username}/present/${projectId}`);
});

router.get('/embed/:project_id', (req, res) => {
  const { project_id: projectId } = req.params;
  res.redirect(301, `${previewUrl}/embed/${projectId}`);
});

export default router;
