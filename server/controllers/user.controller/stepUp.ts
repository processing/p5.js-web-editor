import crypto from 'crypto';
import { RequestHandler } from 'express';
import { User } from '../../models/user';
import {
  StepUpRequestBody,
  StepUpResponseBody,
  StepUpCodeResponseBody
} from '../../types';
import { STEP_UP_WINDOW_MS } from '../../middleware/requireStepUp';
import { mailerService } from '../../utils/mail';
import { renderStepUpCode } from '../../views/mail';

/** How long an emailed step-up code stays valid */
const CODE_TTL_MS = 10 * 60 * 1000;
/** Minimum time between two step-up code emails */
const CODE_RESEND_INTERVAL_MS = 60 * 1000;
/** Failed verification attempts before the code is invalidated */
const MAX_CODE_ATTEMPTS = 5;

const hashCode = (code: string): string =>
  crypto.createHash('sha256').update(code).digest('hex');

/**
 * - Method: `POST`
 * - Endpoint: `/account/step-up/code`
 * - Authenticated: `true`
 * - Id: `UserController.initiateStepUpCode`
 *
 * Description:
 *   - Emails a 6-digit step-up code to the account's current email address.
 *   - Only for accounts without a password; accounts with a password step up
 *     with the password instead (`POST /account/step-up`).
 *   - Only a sha256 hash of the code is kept, in the server-side session.
 */
export const initiateStepUpCode: RequestHandler<
  {},
  StepUpCodeResponseBody
> = async (req, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (user.password) {
      res.status(400).json({
        error: 'Accounts with a password must confirm with the password.'
      });
      return;
    }

    const existingCode = req.session.stepUpCode;
    if (
      existingCode &&
      Date.now() - existingCode.sentAt < CODE_RESEND_INTERVAL_MS
    ) {
      res.status(429).json({
        error:
          'A verification code was sent recently. Please wait before requesting another one.'
      });
      return;
    }

    const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    req.session.stepUpCode = {
      hash: hashCode(code),
      expiresAt: Date.now() + CODE_TTL_MS,
      attempts: 0,
      sentAt: Date.now()
    };

    const mailOptions = renderStepUpCode({
      body: {
        domain: process.env.EDITOR_URL!,
        code
      },
      to: user.email
    });
    await mailerService.send(mailOptions);

    res.json({
      success: true,
      message: 'A verification code has been sent to your email address.'
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Could not send step-up code:', err);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * - Method: `POST`
 * - Endpoint: `/account/step-up`
 * - Authenticated: `true`
 * - Id: `UserController.verifyStepUp`
 *
 * Description:
 *   - Proves the requester is the account owner, not just a session holder:
 *     accounts with a password send `{ password }`, accounts without one send
 *     the emailed `{ code }`.
 *   - On success, marks the session as stepped-up for STEP_UP_WINDOW_MS so
 *     sensitive actions (credential changes, OAuth linking/unlinking, API key
 *     creation) are allowed.
 */
export const verifyStepUp: RequestHandler<
  {},
  StepUpResponseBody,
  StepUpRequestBody
> = async (req, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let verified = false;
    if (user.password) {
      verified =
        typeof req.body.password === 'string' &&
        (await user.comparePassword(req.body.password));
    } else {
      const { stepUpCode } = req.session;
      const { code } = req.body;
      if (
        stepUpCode &&
        typeof code === 'string' &&
        Date.now() < stepUpCode.expiresAt &&
        stepUpCode.attempts < MAX_CODE_ATTEMPTS
      ) {
        const candidate = Buffer.from(hashCode(code));
        const expected = Buffer.from(stepUpCode.hash);
        if (crypto.timingSafeEqual(candidate, expected)) {
          verified = true;
          delete req.session.stepUpCode;
        } else {
          stepUpCode.attempts += 1;
          if (stepUpCode.attempts >= MAX_CODE_ATTEMPTS) {
            delete req.session.stepUpCode;
          }
        }
      }
    }

    if (!verified) {
      res.status(401).json({ error: 'Step-up failed' });
      return;
    }

    req.session.stepUpAt = Date.now();
    res.json({
      success: true,
      expiresAt: req.session.stepUpAt + STEP_UP_WINDOW_MS
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Could not verify step-up:', err);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
