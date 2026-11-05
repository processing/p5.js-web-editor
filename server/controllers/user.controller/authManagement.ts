import { Request, RequestHandler } from 'express';
import { User } from '../../models/user';
import { saveUser, generateToken, userResponse } from './helpers';
import {
  GenericResponseBody,
  PublicUserOrErrorOrGeneric,
  UnlinkThirdPartyResponseBody,
  PublicUserOrError,
  ResetPasswordInitiateRequestBody,
  ResetOrUpdatePasswordRequestParams,
  UpdatePasswordRequestBody,
  UpdateSettingsRequestBody,
  UserDocument
} from '../../types';
import { mailerService } from '../../utils/mail';
import {
  renderResetPassword,
  renderEmailConfirmation,
  renderEmailChangedNotice
} from '../../views/mail';
import { hasRecentStepUp } from '../../middleware/requireStepUp';

/**
 * Re-serializes the current session after a sessionVersion bump so that the
 * request's own session survives while every other session is logged out.
 */
const reLogin = (req: Request, user: UserDocument) =>
  new Promise<void>((resolve, reject) => {
    req.logIn(user, (err: unknown) => (err ? reject(err) : resolve()));
  });

/**
 * - Method: `POST`
 * - Endpoint: `/reset-password`
 * - Authenticated: `false`
 * - Id: `UserController.resetPasswordInitiate`
 *
 * Description:
 *   - Send an Reset-Password email to the registered email account
 */
export const resetPasswordInitiate: RequestHandler<
  {},
  GenericResponseBody,
  ResetPasswordInitiateRequestBody
> = async (req, res) => {
  try {
    const token = await generateToken();
    const user = await User.findByEmail(req.body.email);
    // Only send reset links to verified addresses. An unverified address may
    // not belong to the account owner (e.g. set by someone with a stolen
    // session). Respond identically to avoid user enumeration.
    if (!user || user.verified !== User.EmailConfirmation().Verified) {
      res.json({
        success: true,
        message:
          'If the email is registered with the editor, an email has been sent.'
      });
      return;
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const mailOptions = renderResetPassword({
      body: {
        domain: `${protocol}://${req.headers.host}`,
        link: `${protocol}://${req.headers.host}/reset-password/${token}`
      },
      to: user.email
    });

    await mailerService.send(mailOptions);
    res.json({
      success: true,
      message:
        'If the email is registered with the editor, an email has been sent.'
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      // don't log in test env
      console.log(err);
    }
    res.json({ success: false });
  }
};

/**
 * - Method: `GET`
 * - Endpoint: `/reset-password/:token`
 * - Authenticated: `false`
 * - Id: `UserController.validateResetPasswordToken`
 *
 * Description:
 *   - The link in the Reset Password email, which contains a reset token that is valid for 1h
 *   - If valid, the user will see a form to reset their password
 *   - Else they will see a message that their token has expired
 */
export const validateResetPasswordToken: RequestHandler<
  ResetOrUpdatePasswordRequestParams,
  GenericResponseBody
> = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }).exec();
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Password reset token is invalid or has expired.'
    });
    return;
  }
  res.json({ success: true });
};

/**
 * - Method: `POST`
 * - Endpoint: `/reset-password/:token`
 * - Authenticated: `false`
 * - Id: `UserController.updatePassword`
 *
 * Description:
 *   - Used by the new password form to update a user's password with the valid token
 *   - Returns a Generic 401 - 'Password reset token is invalid or has expired.' if the token timed out
 *   - Returns a PublicUser if successfully saved
 *   - Returns an Error if network error on save attempt
 */
export const updatePassword: RequestHandler<
  ResetOrUpdatePasswordRequestParams,
  PublicUserOrErrorOrGeneric,
  UpdatePasswordRequestBody
> = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }).exec();
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Password reset token is invalid or has expired.'
    });
    return;
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // Log out every other session; the req.logIn below re-serializes this one
  // with the new version.
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;

  await user.save();
  req.logIn(user, (loginErr) => res.json(userResponse(req.user!)));
  // eventually send email that the password has been reset
};

/**
 * - Method: `PUT`
 * - Endpoint: `/account`
 * - Authenticated: `true`
 * - Id: `UserController.updateSettings`
 *
 * Description:
 *   - Used to update the user's username, email, or password on the `/account` page while authenticated
 *   - Username changes only need a session. Email and password changes are
 *     sensitive: they require a recent step-up (POST /account/step-up) or,
 *     for accounts with a password, a valid `currentPassword` in the same
 *     request
 *   - Email and password changes bump `sessionVersion`, logging out every
 *     other session; the current session is re-serialized and survives
 */
export const updateSettings: RequestHandler<
  {},
  PublicUserOrError,
  UpdateSettingsRequestBody
> = async (req, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const previousEmail = user.email;
    const changingEmail = req.body.email !== user.email;
    const changingPassword = Boolean(req.body.newPassword);

    // All checks run before anything is modified or saved.
    if (changingEmail || changingPassword) {
      let steppedUp = hasRecentStepUp(req);
      if (!steppedUp && user.password && req.body.currentPassword) {
        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
          res.status(401).json({ error: 'Current password is invalid.' });
          return;
        }
        steppedUp = true;
      }
      if (!steppedUp) {
        res.status(403).json({ error: 'step_up_required' });
        return;
      }
    }

    user.username = req.body.username;

    if (!changingEmail && !changingPassword) {
      await saveUser(res, user);
      return;
    }

    if (changingPassword) {
      user.password = req.body.newPassword!;
    }

    let verificationMail = null;
    if (changingEmail) {
      user.verified = User.EmailConfirmation().Sent;
      user.email = req.body.email;

      // Any outstanding reset token was issued for the previous address;
      // a reset link sent there must not stay usable after the change.
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      const token = await generateToken();
      user.verifiedToken = token;
      user.verifiedTokenExpires = Date.now() + 3600000 * 24; // 24 hours

      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const requestOrigin = `${protocol}://${req.headers.host}`;
      verificationMail = renderEmailConfirmation({
        body: {
          // Logo must be loaded by email clients from a public origin.
          domain: process.env.EDITOR_URL || requestOrigin,
          link: `${requestOrigin}/verify?t=${token}`
        },
        to: user.email
      });
    }

    // Log out every other session; the reLogin below keeps this one valid.
    user.sessionVersion = (user.sessionVersion ?? 0) + 1;
    await user.save();
    await reLogin(req, user);

    if (verificationMail) {
      await mailerService.send(verificationMail);
      // Tell the old address, with no links that act on the account.
      const noticeMail = renderEmailChangedNotice({
        body: {
          domain: process.env.EDITOR_URL!,
          newEmail: user.email
        },
        to: previousEmail
      });
      await mailerService.send(noticeMail);
    }

    res.json(userResponse(user));
  } catch (err) {
    console.error('Could not save settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * - Method: `DELETE`
 * - Endpoint: `/auth/github`
 * - Authenticated: `false` -- TODO: update to true?
 * - Id: `UserController.unlinkGithub`
 *
 * Description:
 *   - Unlink github account
 */
export const unlinkGithub: RequestHandler<
  {},
  UnlinkThirdPartyResponseBody
> = async (req, res) => {
  if (req.user) {
    try {
      req.user.github = undefined;
      req.user.tokens = req.user.tokens.filter(
        (token) => token.kind !== 'github'
      );
      // Log out every other session; re-serialize this one so it survives.
      req.user.sessionVersion = (req.user.sessionVersion ?? 0) + 1;
      await reLogin(req, req.user);
      await saveUser(res, req.user);
    } catch (err) {
      console.error('Could not unlink GitHub account:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }
  res.status(404).json({
    success: false,
    message: 'You must be logged in to complete this action.'
  });
};

/**
 * - Method: `DELETE`
 * - Endpoint: `/auth/google`
 * - Authenticated: `false` -- TODO: update to true?
 * - Id: `UserController.unlinkGoogle`
 *
 * Description:
 *   - Unlink google account
 */
export const unlinkGoogle: RequestHandler<
  {},
  UnlinkThirdPartyResponseBody
> = async (req, res) => {
  if (req.user) {
    try {
      req.user.google = undefined;
      req.user.tokens = req.user.tokens.filter(
        (token) => token.kind !== 'google'
      );
      // Log out every other session; re-serialize this one so it survives.
      req.user.sessionVersion = (req.user.sessionVersion ?? 0) + 1;
      await reLogin(req, req.user);
      await saveUser(res, req.user);
    } catch (err) {
      console.error('Could not unlink Google account:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }
  res.status(404).json({
    success: false,
    message: 'You must be logged in to complete this action.'
  });
};
