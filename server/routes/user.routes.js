import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import isAuthenticated from '../utils/isAuthenticated';

const router = new Router();

router.post('/signup', UserController.createUser);

router.get('/signup/duplicate_check', UserController.duplicateUserCheck);

router.put('/preferences', isAuthenticated, UserController.updatePreferences);

router.post('/reset-password', UserController.resetPasswordInitiate);

router.get('/reset-password/:token', UserController.validateResetPasswordToken);

router.post('/reset-password/:token', UserController.updatePassword);

router.put('/account', isAuthenticated, UserController.updateSettings);

router.put(
  '/cookie-consent',
  isAuthenticated,
  UserController.updateCookieConsent
);

router.post('/account/api-keys', isAuthenticated, UserController.createApiKey);

router.delete(
  '/account/api-keys/:keyId',
  isAuthenticated,
  UserController.removeApiKey
);

router.post('/verify/send', UserController.emailVerificationInitiate);

router.get('/verify', UserController.verifyEmail);

router.delete('/auth/github', UserController.unlinkGithub);
router.delete('/auth/google', UserController.unlinkGoogle);

export default router;
