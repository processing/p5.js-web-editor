import crypto from 'crypto';
import async from 'async';

import User from '../models/user';
import mail from '../utils/mail';
import {
  renderEmailConfirmation,
  renderResetPassword,
} from '../views/mail';

export * from './user.controller/apiKey';

export function userResponse(user) {
  return {
    email: user.email,
    username: user.username,
    preferences: user.preferences,
    apiKeys: user.apiKeys,
    verified: user.verified,
    id: user._id,
    totalSize: user.totalSize,
    github: user.github,
    google: user.google
  };
}

const random = (done) => {
  crypto.randomBytes(20, (err, buf) => {
    const token = buf.toString('hex');
    done(err, token);
  });
};

export function findUserByUsername(username, cb) {
  User.findByUsername(username, (err, user) => {
    cb(user);
  });
}

export function createUser(req, res, next) {
  const { username, email } = req.body;
  const { password } = req.body;
  const emailLowerCase = email.toLowerCase();
  const EMAIL_VERIFY_TOKEN_EXPIRY_TIME = Date.now() + (3600000 * 24); // 24 hours
  random((tokenError, token) => {
    const user = new User({
      username,
      email: emailLowerCase,
      password,
      verified: User.EmailConfirmation.Sent,
      verifiedToken: token,
      verifiedTokenExpires: EMAIL_VERIFY_TOKEN_EXPIRY_TIME,
    });

    User.findByEmailAndUsername(email, username, (err, existingUser) => {
      if (err) {
        res.status(404).send({ error: err });
        return;
      }

      if (existingUser) {
        const fieldInUse = existingUser.email.toLowerCase() === emailLowerCase ? 'Email' : 'Username';
        res.status(422).send({ error: `${fieldInUse} is in use` });
        return;
      }
      user.save((saveErr) => {
        if (saveErr) {
          next(saveErr);
          return;
        }
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            next(loginErr);
            return;
          }

          const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
          const mailOptions = renderEmailConfirmation({
            body: {
              domain: `${protocol}://${req.headers.host}`,
              link: `${protocol}://${req.headers.host}/verify?t=${token}`
            },
            to: req.user.email,
          });

          mail.send(mailOptions, (mailErr, result) => { // eslint-disable-line no-unused-vars
            res.json(userResponse(req.user));
          });
        });
      });
    });
  });
}

export function duplicateUserCheck(req, res) {
  const checkType = req.query.check_type;
  const value = req.query[checkType];
  User.findByEmailOrUsername(value, true, (err, user) => {
    if (user) {
      return res.json({
        exists: true,
        message: `This ${checkType} is already taken.`,
        type: checkType
      });
    }
    return res.json({
      exists: false,
      type: checkType
    });
  });
}

export function updatePreferences(req, res) {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    if (!user) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const preferences = Object.assign({}, user.preferences, req.body.preferences);
    user.preferences = preferences;

    user.save((saveErr) => {
      if (saveErr) {
        res.status(500).json({ error: saveErr });
        return;
      }

      res.json(user.preferences);
    });
  });
}

export function resetPasswordInitiate(req, res) {
  async.waterfall([
    random,
    (token, done) => {
      User.findByEmail(req.body.email, (err, user) => {
        if (!user) {
          res.json({ success: true, message: 'If the email is registered with the editor, an email has been sent.' });
          return;
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save((saveErr) => {
          done(saveErr, token, user);
        });
      });
    },
    (token, user, done) => {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const mailOptions = renderResetPassword({
        body: {
          domain: `${protocol}://${req.headers.host}`,
          link: `${protocol}://${req.headers.host}/reset-password/${token}`,
        },
        to: user.email,
      });

      mail.send(mailOptions, done);
    }
  ], (err) => {
    if (err) {
      console.log(err);
      res.json({ success: false });
      return;
    }
    res.json({ success: true, message: 'If the email is registered with the editor, an email has been sent.' });
  });
}

export function validateResetPasswordToken(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (!user) {
      res.status(401).json({ success: false, message: 'Password reset token is invalid or has expired.' });
      return;
    }
    res.json({ success: true });
  });
}

export function emailVerificationInitiate(req, res) {
  async.waterfall([
    random,
    (token, done) => {
      User.findById(req.user.id, (err, user) => {
        if (err) {
          res.status(500).json({ error: err });
          return;
        }
        if (!user) {
          res.status(404).json({ error: 'Document not found' });
          return;
        }

        if (user.verified === User.EmailConfirmation.Verified) {
          res.status(409).json({ error: 'Email already verified' });
          return;
        }

        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const mailOptions = renderEmailConfirmation({
          body: {
            domain: `${protocol}://${req.headers.host}`,
            link: `${protocol}://${req.headers.host}/verify?t=${token}`
          },
          to: user.email,
        });

        mail.send(mailOptions, (mailErr, result) => { // eslint-disable-line no-unused-vars
          if (mailErr != null) {
            res.status(500).send({ error: 'Error sending mail' });
          } else {
            const EMAIL_VERIFY_TOKEN_EXPIRY_TIME = Date.now() + (3600000 * 24); // 24 hours
            user.verified = User.EmailConfirmation.Resent;
            user.verifiedToken = token;
            user.verifiedTokenExpires = EMAIL_VERIFY_TOKEN_EXPIRY_TIME; // 24 hours
            user.save();

            res.json(userResponse(req.user));
          }
        });
      });
    },
  ]);
}

export function verifyEmail(req, res) {
  const token = req.query.t;

  User.findOne({ verifiedToken: token, verifiedTokenExpires: { $gt: new Date() } }, (err, user) => {
    if (!user) {
      res.status(401).json({ success: false, message: 'Token is invalid or has expired.' });
      return;
    }

    user.verified = User.EmailConfirmation.Verified;
    user.verifiedToken = null;
    user.verifiedTokenExpires = null;
    user.save()
      .then((result) => { // eslint-disable-line
        res.json({ success: true });
      });
  });
}

export function updatePassword(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (!user) {
      res.status(401).json({ success: false, message: 'Password reset token is invalid or has expired.' });
      return;
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.save((saveErr) => {
      req.logIn(user, loginErr => res.json(userResponse(req.user)));
    });
  });

  // eventually send email that the password has been reset
}

export function userExists(username, callback) {
  User.findByUsername(username, (err, user) => (
    user ? callback(true) : callback(false)
  ));
}

export function saveUser(res, user) {
  user.save((saveErr) => {
    if (saveErr) {
      res.status(500).json({ error: saveErr });
      return;
    }

    res.json(userResponse(user));
  });
}

export function updateSettings(req, res) {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    if (!user) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    user.username = req.body.username;

    if (req.body.currentPassword) {
      user.comparePassword(req.body.currentPassword, (passwordErr, isMatch) => {
        if (passwordErr) throw passwordErr;
        if (!isMatch) {
          res.status(401).json({ error: 'Current password is invalid.' });
          return;
        }
        user.password = req.body.newPassword;
        saveUser(res, user);
      });
    } else if (user.email !== req.body.email) {
      const EMAIL_VERIFY_TOKEN_EXPIRY_TIME = Date.now() + (3600000 * 24); // 24 hours
      user.verified = User.EmailConfirmation.Sent;

      user.email = req.body.email;

      random((error, token) => {
        user.verifiedToken = token;
        user.verifiedTokenExpires = EMAIL_VERIFY_TOKEN_EXPIRY_TIME;

        saveUser(res, user);

        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const mailOptions = renderEmailConfirmation({
          body: {
            domain: `${protocol}://${req.headers.host}`,
            link: `${protocol}://${req.headers.host}/verify?t=${token}`
          },
          to: user.email,
        });

        mail.send(mailOptions);
      });
    } else {
      saveUser(res, user);
    }
  });
}

