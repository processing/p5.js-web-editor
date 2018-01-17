import { Router } from 'express';
import { getProjectAsset } from '../controllers/project.controller';
import { getFileContent } from '../controllers/file.controller';

const router = new Router();

router.route('/:username/sketches/:project_id/*').get(getProjectAsset);

router.route('/sketches/:project_id/assets/*?').get(getFileContent);

export default router;
