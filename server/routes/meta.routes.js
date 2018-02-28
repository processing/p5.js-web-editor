import { Router } from 'express';
import { getP5Version } from '../controllers/meta.controller';

const router = new Router();

router.get('/p5version', getP5Version);

export default router;
