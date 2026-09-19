import { Router } from 'express';
import * as SessionController from '../controllers/session.controller';
import { authRateLimiter } from '../middleware/authRateLimiter';

const router = Router();

router.post('/login', authRateLimiter, SessionController.createSession);

router.get('/session', SessionController.getSession);

router.get('/logout', SessionController.destroySession);

// eslint-disable-next-line import/no-default-export
export default router;
