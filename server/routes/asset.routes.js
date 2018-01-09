import { Router } from 'express';
import { getProjectAsset } from '../controllers/project.controller';
import { getFileContent } from '../controllers/file.controller';

const router = new Router();

router.get('/:username/sketches/:project_id/*', getProjectAsset);

router.get('/sketches/:project_id/assets/*?', getFileContent);

export default router;
