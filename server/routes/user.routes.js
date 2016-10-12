import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
const router = new Router();

router.route('/signup').post(UserController.createUser);

router.route('/signup/duplicate_check').get(UserController.duplicateUserCheck);

router.route('/preferences').put(UserController.updatePreferences);

router.route('/reset-password').post(UserController.resetPasswordInitiate);

export default router;
