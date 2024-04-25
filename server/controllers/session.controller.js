import passport from 'passport';

import { userResponse } from './user.controller';

export function createSession(req, res, next) {
  passport.authenticate('local', (err, user) => {
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
      res.json(userResponse(req.user));
    });
  })(req, res, next);
}

export function getSession(req, res) {
  if (!req.user) {
    return res.status(200).send({ user: null });
  }
  if (req.user.banned) {
    return res.status(403).send({ message: 'Forbidden: User is banned.' });
  }

  return res.json(userResponse(req.user));
}

export function destroySession(req, res, next) {
  req.logout((err) => {
    if (err) {
      next(err);
      return;
    }
    req.session.destroy((error) => {
      if (error) {
        next(error);
        return;
      }
      res.json({ success: true });
    });
  });
}
