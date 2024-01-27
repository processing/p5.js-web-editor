import { Router } from 'express';
import * as SessionController from '../controllers/session.controller';

const router = new Router();

router.post('/login', SessionController.createSession);

router.get('/session', SessionController.getSession);

router.get('/logout', SessionController.destroySession);

router.post('/currentLanguage', SessionController.getCurrentLanguage);

export default router;
