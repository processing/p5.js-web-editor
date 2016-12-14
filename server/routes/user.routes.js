import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
const router = new Router();

router.route('/signup').post(UserController.createUser);

router.route('/signup/duplicate_check').get(UserController.duplicateUserCheck);

router.route('/preferences').put(UserController.updatePreferences);

router.route('/reset-password').post(UserController.resetPasswordInitiate);

router.route('/reset-password/:token').get(UserController.validateResetPasswordToken);

router.route('/reset-password/:token').post(UserController.updatePassword);

router.route('/verify').get(UserController.verifyEmail);

export default router;
