import User from '../models/user';

const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email/Username and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findByMailOrName(email.toLowerCase())
  .then((user) => { // eslint-disable-line consistent-return
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    user.comparePassword(password, (innerErr, isMatch) => {
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  })
  .catch(err => done(null, false, { msg: err }));
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
  User.findOne({ github: profile.id }, (err, existingUser) => {
    if (existingUser) {
      return done(null, existingUser);
    }
    User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
      if (existingEmailUser) {
        existingEmailUser.email = existingEmailUser.email || profile._json.email;
        existingEmailUser.github = profile.id;
        existingEmailUser.username = existingEmailUser.username || profile.username;
        existingEmailUser.tokens.push({ kind: 'github', accessToken });
        existingEmailUser.name = existingEmailUser.name || profile.displayName;
        existingEmailUser.save(err => done(null, existingEmailUser));
      } else {
        const user = new User();
        user.email = profile._json.email;
        user.github = profile.id;
        user.username = profile.username;
        user.tokens.push({ kind: 'github', accessToken });
        user.name = profile.displayName;
        user.save(err => done(null, user));
      }
    });
  });
}));
