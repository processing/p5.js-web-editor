import passport from 'passport';
import { RequestHandler } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { userResponse } from './user.controller';
import type { UserDocument } from '../types';
import {
  CreateSessionRequestBody,
  CreateSessionResponseBody,
  GetSessionResponseBody,
  DestroySessionResponseBody
} from '../types';

/**
 * - Method: `POST`
 * - Endpoint: `/login`
 * - Authenticated: `false`
 * - Id: `SessionController.createSession`
 *
 * Description:
 *   - Authenticate a user with local strategy and create a session
 */
export const createSession: RequestHandler<
  {},
  CreateSessionResponseBody,
  CreateSessionRequestBody
> = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'local',
    (err: Error | null, user: UserDocument | false) => {
      if (err) {
        next(err);
        return;
      }
      if (!user) {
        res.status(401).json({ message: 'Invalid username or password.' });
        return;
      }

      req.logIn(user, (innerErr) => {
        if (innerErr) {
          next(innerErr);
          return;
        }
        res.json(userResponse(req.user!));
      });
    }
  )(req, res, next);
};

/**
 * - Method: `GET`
 * - Endpoint: `/session`
 * - Authenticated: `false`
 * - Id: `SessionController.getSession`
 *
 * Description:
 *   - Returns the current session user, or null if not logged in
 */
export const getSession: RequestHandler<{}, GetSessionResponseBody> = (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(200).send({ user: null });
  }
  if (req.user.banned) {
    return res.status(403).send({ message: 'Forbidden: User is banned.' });
  }

  return res.json(userResponse(req.user));
};

/**
 * - Method: `GET`
 * - Endpoint: `/logout`
 * - Authenticated: `false`
 * - Id: `SessionController.destroySession`
 *
 * Description:
 *   - Logs out the user and destroys the session
 */
export const destroySession: RequestHandler<{}, DestroySessionResponseBody> = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.logout((err: Error | null) => {
    if (err) {
      next(err);
      return;
    }
    req.session.destroy((error: Error | null) => {
      if (error) {
        next(error);
        return;
      }
      res.json({ success: true });
    });
  });
};
