import passport from 'passport';

import { userResponse } from './user.controller';
import generateToken from '../utils/generateToken';
import Token from '../models/token';

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
    // eslint-disable-line consistent-return
    req.logIn(user, async (innerErr) => {
      if (!req.body.remember) {
        if (innerErr) {
          return next(innerErr);
        }
        return res.json(userResponse(req.user));
      }
      const value = generateToken(64);
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      const token = {
        value,
        user: user._id
      };
      await Token.create(token, (error, doc) => {
        if (err) {
          return next(error);
        }
        res.cookie('remember_me', value, { path: '/', maxAge });
        if (innerErr) {
          return next(innerErr);
        }
        return res.json(userResponse(req.user));
      });
      return null;
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
  res.clearCookie('remember_me');
  req.logout();
  res.json({ success: true });
}
