import User from '../models/user';
import crypto from 'crypto';
import async from 'async';
import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';

export function createUser(req, res, next) {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email },
    (err, existingUser) => { // eslint-disable-line consistent-return
      if (err) { res.status(404).send({ error: err }); }

      if (existingUser) {
        return res.status(422).send({ error: 'Email is in use' });
      }
      user.save((saveErr) => { // eslint-disable-line consistent-return
        if (saveErr) { return next(saveErr); }
        req.logIn(user, (loginErr) => { // eslint-disable-line consistent-return
          if (loginErr) {
            return next(loginErr);
          }
          res.json({
            email: req.user.email,
            username: req.user.username,
            preferences: req.user.preferences,
            id: req.user._id
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
      return res.status(500).json({ error: err });
    }
    if (!user) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const preferences = Object.assign({}, user.preferences, req.body.preferences);
    user.preferences = preferences;

    user.save((err) => {
      if (err) {
        return res.status(500).json({ error: err });
      }

      return res.json(user.preferences);
    });
  });
}

export function resetPasswordInitiate(req, res) {
  async.waterfall([
    (done) => {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          return res.json({ success: true, message: 'If the email is registered with the editor, an email has been sent.' });
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    (token, user, done) => {
      const auth = {
        auth: {
          api_key: process.env.MAILGUN_KEY,
          domain: process.env.MAILGUN_DOMAIN
        }
      };

      const transporter = nodemailer.createTransport(mg(auth));
      const message = {
        to: user.email,
        from: 'p5.js Web Editor <noreply@mg.p5js.org>',
        subject: 'p5.js Web Editor Password Reset',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.
        \n\nPlease click on the following link, or paste this into your browser to complete the process:
        \n\nhttp://${req.headers.host}/reset-password/${token}
        \n\nIf you did not request this, please ignore this email and your password will remain unchanged.
        \n\nThanks for using the p5.js Web Editor!\n`
      };
      transporter.sendMail(message, (error, info) => {
        done(error);
      });
    }
  ], (err) => {
    if (err) {
      console.log(err);
      return res.json({ success: false });
    }
    // send email here
    return res.json({ success: true, message: 'If the email is registered with the editor, an email has been sent.' });
  });
}

export function validateResetPasswordToken(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (!user) {
      return res.status(401).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }
    res.json({ success: true });
  });
}

export function updatePassword(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      return res.status(401).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.save(function (err) {
      req.logIn(user, function (err) {
        return res.json({
          email: req.user.email,
          username: req.user.username,
          preferences: req.user.preferences,
          id: req.user._id
        });
      });
    });
  });

  // eventually send email that the password has been reset
}
