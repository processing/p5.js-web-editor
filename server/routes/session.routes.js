import { Router } from 'express';
import * as SessionController from '../controllers/session.controller';
<<<<<<< HEAD
import passport from 'passport';

=======
>>>>>>> add framework for sessions
const router = new Router();

router.route('/login').get(SessionController.newSession);

<<<<<<< HEAD
router.route('/login').post(SessionController.createSession);

router.route('/logout').get(SessionController.destroySession);

//TODO add github authentication stuff
=======
router.route('/logout').get(SessionController.destroySession);
>>>>>>> add framework for sessions
