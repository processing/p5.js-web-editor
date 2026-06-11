import { Router } from 'express';
import {
  getProjectAsset,
  getFileContent
} from '../controllers/asset.controller';

const router = Router();

router.get('/:username/sketches/:project_id/*', getProjectAsset);
router.get('/full/:project_id/*', getProjectAsset);
router.get('/:username/full/:project_id/*', getProjectAsset);
router.get('/present/:project_id/*', getProjectAsset);
router.get('/:username/present/:project_id/*', getProjectAsset);
router.get('/embed/:project_id/*', getProjectAsset);
router.get('/:username/embed/:project_id/*', getProjectAsset);

router.get('/sketches/:project_id/assets/*?', getFileContent);

// eslint-disable-next-line import/no-default-export
export default router;
