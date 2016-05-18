import { Router } from 'express';
import * as SessionController from '../controllers/session.controller';
import passport from 'passport';
<<<<<<< HEAD

=======
>>>>>>> add react router
const router = new Router();

router.route('/login').get(SessionController.newSession);

router.route('/login').post(SessionController.createSession);

router.route('/logout').get(SessionController.destroySession);

<<<<<<< HEAD
//TODO add github authentication stuff
=======
//TODO add github authentication stuff
>>>>>>> add react router
