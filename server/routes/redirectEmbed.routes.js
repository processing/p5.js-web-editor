import { Router } from 'express';

const router = new Router();

router.get('/:username/embed/:project_id', (req, res) => {
  const { username, project_id: projectId } = req.params;
  // CAT changing due to ongoing phishing issues
  // res.redirect(301, `${previewUrl}/${username}/embed/${projectId}`);
  res.redirect(301, `/${username}/full/${projectId}`);
});

router.get('/:username/present/:project_id', (req, res) => {
  const { username, project_id: projectId } = req.params;
  // CAT changing due to ongoing phishing issues
  // res.redirect(301, `${previewUrl}/${username}/present/${projectId}`);
  res.redirect(301, `/${username}/full/${projectId}`);
});

router.get('/embed/:project_id', (req, res) => {
  const { project_id: projectId } = req.params;
  // CAT changing due to ongoing phishing issues
  // res.redirect(301, `${previewUrl}/embed/${projectId}`);
  res.redirect(301, `/full/${projectId}`);
});

export default router;
