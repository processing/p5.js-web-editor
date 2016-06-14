import { Router } from 'express';
import * as SessionController from '../controllers/session.controller';
import passport from 'passport';

const router = new Router();

router.route('/login').get(SessionController.newSession);

router.route('/login').post(SessionController.createSession);

router.route('/logout').get(SessionController.destroySession);

export default router;

//TODO add github authentication stuff
