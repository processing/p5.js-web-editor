import passport from 'passport';

import { userResponse } from './user.controller';

const useLdap = process.env.USE_LDAP === 'true';

export function createSession(req, res, next) {
  passport.authenticate(useLdap ? 'ldapauth' : 'local', (err, user) => {
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
  if (req.user && !req.user.banned) {
    return res.json(userResponse(req.user));
  }
  return res.status(404).send({ message: 'Session does not exist' });
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
