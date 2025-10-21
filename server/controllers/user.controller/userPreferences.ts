import { RequestHandler } from 'express';
import { User } from '../../models/user';
import {
  UpdatePreferencesRequestBody,
  UpdateCookieConsentRequestBody,
  UpdatePreferencesResponseBody,
  PublicUserOrError
} from '../../types';
import { saveUser } from './helpers';

/**
 * - Method: `PUT`
 * - Endpoint: `/preferences`
 * - Authenticated: `true`
 * - Id: `UserController.updatePreferences`
 *
 * Description:
 *   - Update user preferences, such as AppTheme
 */
export const updatePreferences: RequestHandler<
  {},
  UpdatePreferencesResponseBody,
  UpdatePreferencesRequestBody
> = async (req, res) => {
  try {
    const user = await User.findById(req.user!.id).exec();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Shallow merge the new preferences with the existing.
    user.preferences = { ...user.preferences, ...req.body.preferences };
    await user.save();
    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

/**
 * - Method: `PUT`
 * - Endpoint: `/cookie-consent`
 * - Authenticated: `true`
 * - Id: `UserController.updatePreferences`
 *
 * Description:
 *   - Update user cookie consent
 */
export const updateCookieConsent: RequestHandler<
  {},
  PublicUserOrError,
  UpdateCookieConsentRequestBody
> = async (req, res) => {
  try {
    const user = await User.findById(req.user!.id).exec();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { cookieConsent } = req.body;
    user.cookieConsent = cookieConsent;
    await saveUser(res, user);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
