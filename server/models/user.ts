import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserDocument,
  UserModel,
  CookieConsentOptions,
  EmailConfirmationStates,
  ApiKeyDocument
} from '../types';
import { apiKeySchema } from './apiKey';

const userSchema = new Schema<UserDocument, UserModel>(
  {
    name: { type: String, default: '' },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verified: { type: String },
    verifiedToken: String,
    verifiedTokenExpires: Date,
    github: { type: String },
    google: { type: String },
    email: { type: String, unique: true },
    tokens: Array,
    apiKeys: { type: [apiKeySchema] },
    preferences: {
      fontSize: { type: Number, default: 18 },
      lineNumbers: { type: Boolean, default: true },
      indentationAmount: { type: Number, default: 2 },
      isTabIndent: { type: Boolean, default: false },
      autosave: { type: Boolean, default: true },
      linewrap: { type: Boolean, default: true },
      lintWarning: { type: Boolean, default: false },
      textOutput: { type: Boolean, default: false },
      gridOutput: { type: Boolean, default: false },
      theme: { type: String, default: 'light' },
      autorefresh: { type: Boolean, default: false },
      language: { type: String, default: 'en-US' },
      autocloseBracketsQuotes: { type: Boolean, default: true },
      autocompleteHinter: { type: Boolean, default: false }
    },
    totalSize: { type: Number, default: 0 },
    cookieConsent: {
      type: String,
      enum: Object.values(CookieConsentOptions),
      default: CookieConsentOptions.NONE
    },
    banned: { type: Boolean, default: false },
    lastLoginTimestamp: { type: Date }
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre('save', function checkPassword(next) {
  const user = this;
  if (!user.isModified('password')) {
    next();
    return;
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      next(err);
      return;
    }
    if (!user.password) {
      next(new Error('Password is missing'));
      return;
    }
    bcrypt.hash(user.password, salt, (innerErr, hash) => {
      if (innerErr) {
        next(innerErr);
        return;
      }
      user.password = hash;
      next();
    });
  });
});

/**
 * API keys hash middleware
 */
userSchema.pre('save', function checkApiKey(next) {
  const user = this;
  if (!user.isModified('apiKeys')) {
    next();
    return;
  }

  let hasNew = false;
  let pendingTasks = 0;
  let nextCalled = false;

  const done = (err?: mongoose.CallbackError) => {
    if (nextCalled) return;
    if (err) {
      nextCalled = true;
      next(err);
      return;
    }
    pendingTasks -= 1;
    if (pendingTasks === 0) {
      nextCalled = true;
      next();
    }
  };

  user.apiKeys.forEach((k) => {
    if (k.isNew) {
      hasNew = true;
      pendingTasks += 1;
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          done(err);
        }
        bcrypt.hash(k.hashedKey, salt, (innerErr, hash) => {
          if (innerErr) {
            done(innerErr);
          }
          k.hashedKey = hash;
          done();
        });
      });
    }
  });

  if (!hasNew) {
    next();
  }
});

userSchema.virtual('id').get(function idToString() {
  return this._id.toHexString();
});

userSchema.set('toJSON', {
  virtuals: true
});

/**
 * Helper method for validating user's password.
 * @param {string} candidatePassword
 * @return {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }

  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison failed!', error);
    return false;
  }
};

/**
 * Helper method for validating a user's api key
 */
userSchema.methods.findMatchingKey = async function findMatchingKey(
  candidateKey: string
): Promise<{ isMatch: boolean; keyDocument: ApiKeyDocument | null }> {
  let keyObj = { isMatch: false, keyDocument: null };
  /* eslint-disable no-restricted-syntax */
  for (const k of this.apiKeys) {
    try {
      /* eslint-disable no-await-in-loop */
      const foundOne = await bcrypt.compareSync(candidateKey, k.hashedKey);

      if (foundOne) {
        keyObj = { isMatch: true, keyDocument: k };
        return keyObj;
      }
    } catch (error) {
      console.error('Matching API key not found !');
      return keyObj;
    }
  }

  return keyObj;
};

/**
 *
 * Queries User collection by email and returns one User document.
 *
 * @param {string|string[]} email - Email string or array of email strings
 * @callback [cb] - Optional error-first callback that passes User document
 * @return {Object} - Returns User Object fulfilled by User document
 */
userSchema.statics.findByEmail = async function findByEmail(
  email: string | string[]
): Promise<UserDocument | null> {
  const user = this;
  const query = Array.isArray(email) ? { email: { $in: email } } : { email };

  // Email addresses should be case-insensitive unique
  // In MongoDB, you must use collation in order to do a case-insensitive query
  const userFoundByEmail = await user
    .findOne(query)
    .collation({ locale: 'en', strength: 2 })
    .exec();
  return userFoundByEmail;
};

/**
 *
 * Queries User collection by emails and returns all Users that match.
 *
 * @param {string[]} emails - Array of email strings
 * @return {Promise<UserDocument[]>} - Returns Promise fulfilled by User document
 */
userSchema.statics.findAllByEmails = async function findAllByEmails(
  emails: string[]
): Promise<UserDocument[] | null> {
  const user = this;
  const query = {
    email: { $in: emails }
  };
  // Email addresses should be case-insensitive unique
  // In MongoDB, you must use collation in order to do a case-insensitive query
  const usersFoundByEmails = await user
    .find(query)
    .collation({ locale: 'en', strength: 2 })
    .exec();
  return usersFoundByEmails;
};

/**
 *
 * Queries User collection by username and returns one User document.
 *
 * @param {string} username - Username string
 * @param {Object} [options] - Optional options
 * @param {boolean} options.caseInsensitive - Does a caseInsensitive query, defaults to false
 * @return {UserDocument} - Returns User Object fulfilled by User document
 */
userSchema.statics.findByUsername = async function findByUsername(
  username: string,
  options?: { caseInsensitive?: boolean }
): Promise<UserDocument | null> {
  const user = this;
  const query = {
    username
  };

  if (options?.caseInsensitive) {
    const foundUser = await user
      .findOne(query)
      .collation({ locale: 'en', strength: 2 })
      .exec();
    return foundUser;
  }

  const userFoundByUsername = await user.findOne(query).exec();
  return userFoundByUsername;
};

/**
 *
 * Queries User collection using email or username with optional callback.
 * This function will determine automatically whether the data passed is
 * a username or email, unless you specify options.valueType
 *
 * @param {string} value - Email or username
 * @param {Object} [options] - Optional options
 * @param {boolean} options.caseInsensitive - Does a caseInsensitive query rather than
 *                                          default query for username or email, defaults
 *                                          to false
 * @param {("email"|"username")} options.valueType - Prevents automatic type inferrence
 * @return {UserDocument} - Returns User Object fulfilled by User document
 */
userSchema.statics.findByEmailOrUsername = async function findByEmailOrUsername(
  value: string,
  options?: { caseInsensitive?: boolean; valueType?: 'email' | 'username' }
): Promise<UserDocument | null> {
  const user = this;
  const isEmail = options?.valueType
    ? options.valueType === 'email'
    : value.indexOf('@') > -1;

  // do the case insensitive stuff
  if (
    arguments.length === 2 &&
    typeof options === 'object' &&
    options.caseInsensitive
  ) {
    const query = isEmail ? { email: value } : { username: value };
    const foundUser = await user
      .findOne(query)
      .collation({ locale: 'en', strength: 2 })
      .exec();

    return foundUser;
  }

  if (isEmail) {
    const userFoundByEmail = await user.findByEmail(value);
    return userFoundByEmail;
  }
  const userFoundByUsername = await user.findByUsername(value);
  return userFoundByUsername;
};

/**
 *
 * Queries User collection, performing a MongoDB logical or with the email
 * and username (i.e. if either one matches, will return the first document).
 *
 * @param {string} email
 * @param {string} username
 * @return {UserDocument} - Returns User Object fulfilled by User document
 */
userSchema.statics.findByEmailAndUsername = async function findByEmailAndUsername(
  email: string,
  username: string
): Promise<UserDocument | null> {
  const user = this;
  const query = {
    $or: [{ email }, { username }]
  };
  const foundUser = await user
    .findOne(query)
    .collation({ locale: 'en', strength: 2 })
    .exec();

  return foundUser;
};

userSchema.index({ username: 1 }, { collation: { locale: 'en', strength: 2 } });
userSchema.index({ email: 1 }, { collation: { locale: 'en', strength: 2 } });

userSchema.statics.EmailConfirmation = () => EmailConfirmationStates;

export const User =
  (mongoose.models.User as UserModel) ||
  mongoose.model<UserDocument, UserModel>('User', userSchema);
