const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const LocalStrategy = require('passport-local').Strategy;

import User from '../models/user';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user) => { // eslint-disable-line consistent-return
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    user.comparePassword(password, (innerErr, isMatch) => {
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));

/**
 * Sign in with GitHub.
 */
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: '/auth/github/callback',
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    // the user should actually never get here.
    User.findOne({ github: profile.id }, (err, existingUser) => {
      if (existingUser) {
        return res.json({'errors', { msg: 'There is already a GitHub account that belongs to you. Sign in with that account or delete it, then link it with your current account.' }});
      } else {
        User.findById(req.user.id, (err, user) => {
          user.email = user.email || profile._json.email;
          user.github = profile.id;
          user.username = user.username || profile.username;
          user.tokens.push({ kind: 'github', accessToken });
          user.name = user.name || profile.displayName;
          user.save((err) => {
            return res.json({'info', { msg: 'GitHub account has been linked.' }});
          });
        });
      }
    });
  } else {
    User.findOne({ github: profile.id }, (err, existingUser) => {
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
        if (existingEmailUser) {
          return res.json('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with GitHub manually from Account Settings.' });
        } else {
          const user = new User();
          user.email = profile._json.email;
          user.github = profile.id;
          user.username = profile.username;
          user.tokens.push({ kind: 'github', accessToken });
          user.name = profile.displayName;
          user.save((err) => {
            return res.json({'info', { msg: 'Account has been created with GitHub credentials.' }});
          });
        }
      });
    });
  }
}));
