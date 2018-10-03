import { Router } from 'express';
import * as FullController from '../controllers/full.controller';
import * as EmbedController from '../controllers/embed.controller';

const router = new Router();

router.get('/:username/full/:project_id', FullController.serveProject);

router.get('/:username/embed/:project_id', EmbedController.serveProject);
router.get('/:username/presentation/:project_id', EmbedController.serveProject);
router.get('/:username/pres/:project_id', EmbedController.serveProject);

export default router;
