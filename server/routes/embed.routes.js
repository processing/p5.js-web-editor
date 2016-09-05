import { Router } from 'express';
import * as EmbedController from '../controllers/embed.controller';

const router = new Router();

router.route('/embed/:project_id').get(EmbedController.serveProject);

export default router;
