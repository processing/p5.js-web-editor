import crypto from 'crypto';
import async from 'async';

import User from '../models/user';
import mail from '../utils/mail';
import auth from '../utils/auth';

export function createUser(req, res, next) {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email },
    (err, existingUser) => {
      if (err) {
        res.status(404).send({ error: err });
        return;
      }

      if (existingUser) {
        res.status(422).send({ error: 'Email is in use' });
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
          mail.send('email-verification', {
            body: {
              link: `http://${req.headers.host}/verify?t=${auth.createVerificationToken(req.body.email)}`
            },
            to: req.body.email,
            subject: 'Email Verification',
          }, (result) => { // eslint-disable-line no-unused-vars
            res.json({
              email: req.user.email,
              username: req.user.username,
              preferences: req.user.preferences,
              id: req.user._id
            });
          });
        });
      });
    });
}

export function duplicateUserCheck(req, res) {
  const checkType = req.query.check_type;
  const value = req.query[checkType];
  const query = {};
  query[checkType] = value;
  User.findOne(query, (err, user) => {
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
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({ email: req.body.email }, (err, user) => {
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
      mail.send('reset-password', {
        body: {
          link: `http://${req.headers.host}/reset-password/${token}`,
        },
        to: user.email,
        subject: 'p5.js Web Editor Password Reset',
      }, done);
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

export function verifyEmail(req, res) {
  const token = req.query.t;
  // verify the token
  auth.verifyEmailToken(token)
  .then((data) => {
    const email = data.email;
    // change the verified field for the user or throw if the user is not found
    User.findOne({ email })
    .then((user) => {
      // change the field for the user, and send the new cookie
      user.verified = 0; // eslint-disable-line
      user.save()
      .then((result) => { // eslint-disable-line
        res.json({ user });
      });
    });
  })
  .catch((err) => {
    res.json(err);
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
      req.logIn(user, loginErr => res.json({
        email: req.user.email,
        username: req.user.username,
        preferences: req.user.preferences,
        id: req.user._id
      }));
    });
  });

  // eventually send email that the password has been reset
}

export function userExists(username, callback) {
  User.findOne({ username }, (err, user) => (
    user ? callback(true) : callback(false)
  ));
}

export function saveUser(res, user) {
  user.save((saveErr) => {
    if (saveErr) {
      res.status(500).json({ error: saveErr });
      return;
    }

    res.json(user);
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

    user.email = req.body.email;
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
    } else {
      saveUser(res, user);
    }
  });
}
