import { Router } from 'express';
import * as EmbedController from '../controllers/embed.controller';

const router = new Router();

router.get('/embed/:project_id', EmbedController.serveProject);
router.get('/full/:project_id', EmbedController.serveProject);

export default router;
