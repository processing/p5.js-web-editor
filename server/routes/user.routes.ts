import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = Router();

/**
 * ===============
 * SIGN UP
 * ===============
 */
// POST /signup
router.post('/signup', UserController.createUser);
// GET /signup/duplicate_check
router.get('/signup/duplicate_check', UserController.duplicateUserCheck);
// POST /verify/send
router.post('/verify/send', UserController.emailVerificationInitiate);
// GET /verify
router.get('/verify', UserController.verifyEmail);

/**
 * ===============
 * API KEYS
 * ===============
 */
// POST /account/api-keys
router.post('/account/api-keys', isAuthenticated, UserController.createApiKey);
// DELETE /account/api-keys/:keyId
router.delete(
  '/account/api-keys/:keyId',
  isAuthenticated,
  UserController.removeApiKey
);

/**
 * ===============
 * AUTH MANAGEMENT
 * ===============
 */
// POST /reset-password
router.post('/reset-password', UserController.resetPasswordInitiate);
// GET /reset-password/:token
router.get('/reset-password/:token', UserController.validateResetPasswordToken);
// POST /reset-password/:token
router.post('/reset-password/:token', UserController.updatePassword);
// PUT /account (updating username, email or password while logged in)
router.put('/account', isAuthenticated, UserController.updateSettings);
// DELETE /auth/github
router.delete('/auth/github', UserController.unlinkGithub);
// DELETE /auth/google
router.delete('/auth/google', UserController.unlinkGoogle);

/**
 * ===============
 * USER PREFERENCES
 * ===============
 */
// PUT /cookie-consent
router.put(
  '/cookie-consent',
  isAuthenticated,
  UserController.updateCookieConsent
);
// PUT /preferences
router.put('/preferences', isAuthenticated, UserController.updatePreferences);

// eslint-disable-next-line import/no-default-export
export default router;
