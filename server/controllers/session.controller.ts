/* global Express */
import passport from 'passport';
import { RequestHandler } from 'express';

import { userResponse } from './user.controller';

/**
 * - Id: `SessionController.createSession`
 *
 * Description:
 *   - Creates a new user session (Login) using Passport's local strategy.
 */
export const createSession: RequestHandler = (req, res, next) => {
  passport.authenticate('local', (err: Error, user: Express.User) => {
    if (err) {
      next(err);
      return;
    }
    if (!user) {
      res.status(401).json({ message: 'Invalid username or password.' });
      return;
    }

    req.logIn(user, (innerErr: Error) => {
      if (innerErr) {
        next(innerErr);
        return;
      }
      res.json(userResponse(req.user as Express.User));
    });
  })(req, res, next);
};

/**
 * - Id: `SessionController.getSession`
 *
 * Description:
 *   - Retrieves the current session user. Returns null if not authenticated.
 */
export const getSession: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(200).send({ user: null });
  }
  if (req.user.banned) {
    return res.status(403).send({ message: 'Forbidden: User is banned.' });
  }

  return res.json(userResponse(req.user));
};

/**
 * - Id: `SessionController.destroySession`
 *
 * Description:
 *   - Destroys the current session (Logout).
 */
export const destroySession: RequestHandler = (req, res, next) => {
  req.logout((err: Error) => {
    if (err) {
      next(err);
      return;
    }
    (req as any).session.destroy((error: Error) => {
      if (error) {
        next(error);
        return;
      }
      res.json({ success: true });
    });
  });
};
