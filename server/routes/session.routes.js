import { Router } from 'express';
import * as SessionController from '../controllers/session.controller';

const router = new Router();

router.route('/login').post(SessionController.createSession);

router.route('/session').get(SessionController.getSession);

export default router;

// TODO add github authentication stuff
