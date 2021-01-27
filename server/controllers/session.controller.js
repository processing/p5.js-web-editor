import passport from 'passport';

import { userResponse } from './user.controller';

export function createSession(req, res, next) {
  passport.authenticate('local', (err, user) => {
    // eslint-disable-line consistent-return
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    req.logIn(user, (innerErr) => {
      if (innerErr) {
        return next(innerErr);
      }
      return res.json(userResponse(req.user));
    });
  })(req, res, next);
}

export function getSession(req, res) {
  if (req.user) {
    return res.json(userResponse(req.user));
  }
  return res.status(404).send({ message: 'Session does not exist' });
}

export function destroySession(req, res) {
  req.logout();
  res.json({ success: true });
}
