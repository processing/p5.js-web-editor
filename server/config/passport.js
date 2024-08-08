import slugify from 'slugify';
import friendlyWords from 'friendly-words';
import lodash from 'lodash';

import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import LocalStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import { BasicStrategy } from 'passport-http';

import User from '../models/user';

const accountSuspensionMessage =
  'Account has been suspended. Please contact privacy@p5js.org if you believe this is an error.';

function generateUniqueUsername(username) {
  const adj =
    friendlyWords.predicates[
      Math.floor(Math.random() * friendlyWords.predicates.length)
    ];
  return slugify(`${username} ${adj}`);
}

passport.serializeUser((user, done) => {
  if (user) {
    done(null, user.id);
  } else {
    done(new Error('User is not available for serialization.'));
  }
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email/Username and Password.
 */
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findByEmailOrUsername(email);

        if (!user) {
          return done(null, false, { msg: `Email ${email} not found.` });
        } else if (user.banned) {
          return done(null, false, { msg: 'Your account has been suspended.' });
        }

        const isMatch = await user.comparePassword(password);

        if (isMatch) {
          return done(null, user);
        } else { // eslint-disable-line
          return done(null, false, { msg: 'Invalid email or password' });
        }
      } catch (err) {
        console.error(err);
        return done(null, false, { msg: err });
      }
    }
  )
);

/**
 * Authentificate using Basic Auth (Username + Api Key)
 */
passport.use(
  new BasicStrategy(async (userid, key, done) => {
    try {
      const user = await User.findByUsername(userid);

      if (!user) {
        return done(null, false);
      }

      if (user.banned) {
        return done(null, false, { msg: accountSuspensionMessage });
      }

      const { isMatch, keyDocument } = await user.findMatchingKey(key);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid API key' });
      }

      keyDocument.lastUsedAt = Date.now();
      await user.save();
      return done(null, user);
    } catch (err) {
      console.error(err);
      return done(null, false, { msg: err });
    }
  })
);

/*
  Input:
  [
    { value: 'email@example.com', primary: false, verified: true },
    { value: 'unverified@example.com', primary: false, verified: false }
  ]

  Output:
    ['email@example.com']
*/
const getVerifiedEmails = (githubEmails) =>
  (githubEmails || [])
    .filter((item) => item.verified === true)
    .map((item) => item.value);

const getPrimaryEmail = (githubEmails) =>
  (lodash.find(githubEmails, { primary: true }) || {}).value;

/**
 * Sign in with GitHub.
 */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: '/auth/github/callback',
      passReqToCallback: true,
      scope: ['user:email'],
      allRawEmails: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ github: profile.id }).exec();

        if (existingUser) {
          if (req.user && req.user.email !== existingUser.email) {
            return done(null, false, {
              msg: 'GitHub account is already linked to another account.'
            });
          } else if (existingUser.banned) {
            return done(null, false, { msg: accountSuspensionMessage });
          }
          return done(null, existingUser);
        }

        const emails = getVerifiedEmails(profile.emails);
        const primaryEmail = getPrimaryEmail(profile.emails);

        if (req.user) {
          if (!req.user.github) {
            req.user.github = profile.id;
            req.user.tokens.push({ kind: 'github', accessToken });
            req.user.verified = User.EmailConfirmation.Verified;
          }
          req.user.save();
          return done(null, req.user);
        }

        const existingEmailUsers = await User.findAllByEmails(emails);

        if (existingEmailUsers.length) {
          let existingEmailUser;

          // Handle case where user has made multiple p5.js Editor accounts,
          // with emails that are connected to the same GitHub account
          if (existingEmailUsers.length > 1) {
            existingEmailUser = existingEmailUsers.find(
              (u) => (u.email = primaryEmail)
            );
          } else {
            [existingEmailUser] = existingEmailUsers;
          }

          if (existingEmailUser.banned) {
            return done(null, false, { msg: accountSuspensionMessage });
          }
          existingEmailUser.email = existingEmailUser.email || primaryEmail;
          existingEmailUser.github = profile.id;
          existingEmailUser.username =
            existingEmailUser.username || profile.username;
          existingEmailUser.tokens.push({ kind: 'github', accessToken });
          existingEmailUser.name =
            existingEmailUser.name || profile.displayName;
          existingEmailUser.verified = User.EmailConfirmation.Verified;
          existingEmailUser.save();
          return done(null, existingEmailUser);
        }

        let { username } = profile;

        const existingUsernameUser = await User.findByUsername(username, {
          caseInsensitive: true
        });

        if (existingUsernameUser) {
          username = generateUniqueUsername(username);
        }
        const user = new User();
        user.email = primaryEmail;
        user.github = profile.id;
        user.username = profile.username;
        user.tokens.push({ kind: 'github', accessToken });
        user.name = profile.displayName;
        user.verified = User.EmailConfirmation.Verified;
        await user.save();

        return done(null, user);
      } catch (err) {
        console.error(err);
        return done(null, false, { msg: err });
      }
    }
  )
);

/**
 * Sign in with Google.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'https://editor.p5js.org/auth/google/callback',
      passReqToCallback: true,
      scope: ['openid email']
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({
          google: profile._json.emails[0].value
        }).exec();

        if (existingUser) {
          if (req.user && req.user.email !== existingUser.email) {
            return done(null, false, {
              msg: 'Google account is already linked to another account.'
            });
          } else if (existingUser.banned) {
            return done(null, false, { msg: accountSuspensionMessage });
          }
          return done(null, existingUser);
        }

        const primaryEmail = profile._json.emails[0].value;

        if (req.user) {
          if (!req.user.google) {
            req.user.google = profile._json.emails[0].value;
            req.user.tokens.push({ kind: 'google', accessToken });
            req.user.verified = User.EmailConfirmation.Verified;
          }
          req.user.save();
          return done(null, req.user);
        }
        let username = profile._json.emails[0].value.split('@')[0];
        const existingEmailUser = await User.findByEmail(primaryEmail);
        const existingUsernameUser = await User.findByUsername(username, {
          caseInsensitive: true
        });

        if (existingUsernameUser) {
          username = generateUniqueUsername(username);
        }
        // what if a username is already taken from the display name too?
        // then, append a random friendly word?
        if (existingEmailUser) {
          if (existingEmailUser.banned) {
            return done(null, false, { msg: accountSuspensionMessage });
          }
          existingEmailUser.email = existingEmailUser.email || primaryEmail;
          existingEmailUser.google = profile._json.emails[0].value;
          existingEmailUser.username = existingEmailUser.username || username;
          existingEmailUser.tokens.push({
            kind: 'google',
            accessToken
          });
          existingEmailUser.name =
            existingEmailUser.name || profile._json.displayName;
          existingEmailUser.verified = User.EmailConfirmation.Verified;

          await existingEmailUser.save();
          return done(null, existingEmailUser);
        }

        const user = new User();
        user.email = primaryEmail;
        user.google = profile._json.emails[0].value;
        user.username = username;
        user.tokens.push({ kind: 'google', accessToken });
        user.name = profile._json.displayName;
        user.verified = User.EmailConfirmation.Verified;

        await user.save();
        return done(null, user);
      } catch (err) {
        console.error(err);
        return done(null, false, { msg: err });
      }
    }
  )
);
