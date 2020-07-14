import slugify from 'slugify';
import friendlyWords from 'friendly-words';
import lodash from 'lodash';

import passport from 'passport';
import GitHubStrategy from 'passport-github';
import LocalStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import { BasicStrategy } from 'passport-http';

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
 * Sign in using Email/Username and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findByMailOrName(email)
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
 * Authentificate using Basic Auth (Username + Api Key)
 */
passport.use(new BasicStrategy((userid, key, done) => {
  User.findOne({ username: userid }).collation({ locale: 'en', strength: 2 }).exec((err, user) => { // eslint-disable-line consistent-return
    if (err) { return done(err); }
    if (!user) { return done(null, false); }
    user.findMatchingKey(key, (innerErr, isMatch, keyDocument) => {
      if (isMatch) {
        keyDocument.lastUsedAt = Date.now();
        user.save();
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid username or API key' });
    });
  });
}));

/*
  Input:
  [
    { value: 'email@example.com', primary: false, verified: true },
    { value: 'unverified@example.com', primary: false, verified: false }
  ]

  Output:
    ['email@example.com']
*/
const getVerifiedEmails = githubEmails => (
  (githubEmails || [])
    .filter(item => item.verified === true)
    .map(item => item.value)
);

const getPrimaryEmail = githubEmails => (
  (
    lodash.find(githubEmails, { primary: true }) || {}
  ).value
);

/**
 * Sign in with GitHub.
 */
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: '/auth/github/callback',
  passReqToCallback: true,
  scope: ['user:email'],
}, (req, accessToken, refreshToken, profile, done) => {
  User.findOne({ github: profile.id }, (findByGithubErr, existingUser) => {
    if (existingUser) {
      done(null, existingUser);
      return;
    }

    const emails = getVerifiedEmails(profile.emails);
    const primaryEmail = getPrimaryEmail(profile.emails);

    User.findOne({
      email: { $in: emails },
    }).collation({ locale: 'en', strength: 2 }).exec((findByEmailErr, existingEmailUser) => {
      if (existingEmailUser) {
        existingEmailUser.email = existingEmailUser.email || primaryEmail;
        existingEmailUser.github = profile.id;
        existingEmailUser.username = existingEmailUser.username || profile.username;
        existingEmailUser.tokens.push({ kind: 'github', accessToken });
        existingEmailUser.name = existingEmailUser.name || profile.displayName;
        existingEmailUser.verified = User.EmailConfirmation.Verified;
        existingEmailUser.save(saveErr => done(null, existingEmailUser));
      } else {
        const user = new User();
        user.email = primaryEmail;
        user.github = profile.id;
        user.username = profile.username;
        user.tokens.push({ kind: 'github', accessToken });
        user.name = profile.displayName;
        user.verified = User.EmailConfirmation.Verified;
        user.save(saveErr => done(null, user));
      }
    });
  });
}));

/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true,
  scope: ['openid email'],
}, (req, accessToken, refreshToken, profile, done) => {
  User.findOne({ google: profile._json.emails[0].value }, (findByGoogleErr, existingUser) => {
    if (existingUser) {
      done(null, existingUser);
      return;
    }

    const primaryEmail = profile._json.emails[0].value;

    User.findOne({
      email: primaryEmail,
    }).collation({ locale: 'en', strength: 2 }).exec((findByEmailErr, existingEmailUser) => {
      let username = profile._json.emails[0].value.split('@')[0];
      User.findOne({ username }).collation({ locale: 'en', strength: 2 })
        .exec((findByUsernameErr, existingUsernameUser) => {
          if (existingUsernameUser) {
            const adj = friendlyWords.predicates[Math.floor(Math.random() * friendlyWords.predicates.length)];
            username = slugify(`${username} ${adj}`);
          }
          // what if a username is already taken from the display name too?
          // then, append a random friendly word?
          if (existingEmailUser) {
            existingEmailUser.email = existingEmailUser.email || primaryEmail;
            existingEmailUser.google = profile._json.emails[0].value;
            existingEmailUser.username = existingEmailUser.username || username;
            existingEmailUser.tokens.push({ kind: 'google', accessToken });
            existingEmailUser.name = existingEmailUser.name || profile._json.displayName;
            existingEmailUser.verified = User.EmailConfirmation.Verified;
            existingEmailUser.save((saveErr) => {
              if (saveErr) {
                console.log(saveErr);
              }
              done(null, existingEmailUser);
            });
          } else {
            const user = new User();
            user.email = primaryEmail;
            user.google = profile._json.emails[0].value;
            user.username = username;
            user.tokens.push({ kind: 'google', accessToken });
            user.name = profile._json.displayName;
            user.verified = User.EmailConfirmation.Verified;
            user.save((saveErr) => {
              if (saveErr) {
                console.log(saveErr);
              }
              done(null, user);
            });
          }
        });
    });
  });
}));
