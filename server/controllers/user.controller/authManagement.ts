import { RequestHandler } from 'express';
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
  UpdateSettingsRequestBody
} from '../../types';
import { mailerService } from '../../utils/mail';
import { renderResetPassword, renderEmailConfirmation } from '../../views/mail';

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
    if (!user) {
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
 *   - Currently the client only shows the `currentPassword` and `newPassword` fields if no social logins (github & google) are enabled
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
    user.username = req.body.username;

    if (req.body.newPassword) {
      if (user.password === undefined) {
        user.password = req.body.newPassword;
        saveUser(res, user);
      }
      if (!req.body.currentPassword) {
        res.status(401).json({ error: 'Current password is not provided.' });
        return;
      }
    }
    if (req.body.currentPassword) {
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        res.status(401).json({ error: 'Current password is invalid.' });
        return;
      }
      user.password = req.body.newPassword!;
      await saveUser(res, user);
    } else if (user.email !== req.body.email) {
      const EMAIL_VERIFY_TOKEN_EXPIRY_TIME = Date.now() + 3600000 * 24; // 24 hours
      user.verified = User.EmailConfirmation().Sent;

      user.email = req.body.email;

      const token = await generateToken();
      user.verifiedToken = token;
      user.verifiedTokenExpires = EMAIL_VERIFY_TOKEN_EXPIRY_TIME;

      await saveUser(res, user);

      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const mailOptions = renderEmailConfirmation({
        body: {
          domain: `${protocol}://${req.headers.host}`,
          link: `${protocol}://${req.headers.host}/verify?t=${token}`
        },
        to: user.email
      });

      await mailerService.send(mailOptions);
    } else {
      await saveUser(res, user);
    }
  } catch (err) {
    res.status(500).json({ error: err });
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
    req.user.github = undefined;
    req.user.tokens = req.user.tokens.filter(
      (token) => token.kind !== 'github'
    );
    await saveUser(res, req.user);
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
    req.user.google = undefined;
    req.user.tokens = req.user.tokens.filter(
      (token) => token.kind !== 'google'
    );
    await saveUser(res, req.user);
    return;
  }
  res.status(404).json({
    success: false,
    message: 'You must be logged in to complete this action.'
  });
};
