import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
const router = new Router();

router.route('/signup').post(UserController.createUser);

router.route('/preferences').put(UserController.updatePreferences);

export default router;
