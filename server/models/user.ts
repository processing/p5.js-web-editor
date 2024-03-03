import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface ApiKey extends Document {
  label: string;
  lastUsedAt: Date;
  hashedKey: string;
  createdAt: Date;
}

const EmailConfirmationStates = {
  Verified: 'verified',
  Sent: 'sent',
  Resent: 'resent'
};

const apiKeySchema = new Schema<ApiKey>(
  {
    label: { type: String, default: 'API Key' },
    lastUsedAt: { type: Date },
    hashedKey: { type: String, required: true }
  },
  { timestamps: true, _id: true }
);

apiKeySchema.virtual('id').get(function getApiKeyId(this: ApiKey) {
  return this._id!.toHexString();
});

/**
 * When serialising an APIKey instance, the `hashedKey` field
 * should never be exposed to the client. So we only return
 * a safe list of fields when toObject and toJSON are called.
 */
function apiKeyMetadata(doc: ApiKey) {
  return {
    id: doc.id,
    label: doc.label,
    lastUsedAt: doc.lastUsedAt,
    createdAt: doc.createdAt
  };
}

apiKeySchema.set('toObject', {
  transform: apiKeyMetadata
});

apiKeySchema.set('toJSON', {
  virtuals: true,
  transform: apiKeyMetadata
});

interface Preferences {
  fontSize: number;
  lineNumbers: boolean;
  indentationAmount: number;
  isTabIndent: boolean;
  autosave: boolean;
  linewrap: boolean;
  lintWarning: boolean;
  textOutput: boolean;
  gridOutput: boolean;
  theme: string;
  autorefresh: boolean;
  language: string;
  autocloseBracketsQuotes: boolean;
  autocompleteHinter: boolean;
}

interface User extends Document {
  name: string;
  username: string;
  password?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verified?: string;
  verifiedToken?: string;
  verifiedTokenExpires?: Date;
  github?: string;
  google?: string;
  email: string;
  tokens: unknown[];
  apiKeys: ApiKey[];
  preferences: Preferences;
  totalSize: number;
  cookieConsent: 'none' | 'essential' | 'all';
  banned: boolean;
  comparePassword: (
    candidatePassword: string,
    cb: (err: Error | null, isMatch: boolean) => void
  ) => void;
  findMatchingKey: (
    candidateKey: string,
    cb: (err: Error | null, isMatch: boolean, key?: ApiKey) => void
  ) => void;
}

type FindUserCallback = (err: Error | null, doc?: User) => void;

interface UserStatics {
  findByEmail: (
    email: string | string[],
    cb?: FindUserCallback
  ) => Promise<User>;
  findByUsername: (
    username: string,
    options?: { caseInsensitive?: boolean },
    cb?: FindUserCallback
  ) => Promise<User>;
  findByEmailOrUsername: (
    value: string,
    options?: { caseInsensitive?: boolean; valueType?: 'email' | 'username' },
    cb?: FindUserCallback
  ) => Promise<User>;
  findByEmailAndUsername: (
    email: string,
    username: string,
    cb?: FindUserCallback
  ) => Promise<User>;
  EmailConfirmation: typeof EmailConfirmationStates;
}

export interface UserModel extends Model<User>, UserStatics {
  statics: UserStatics;
}

const userSchema = new Schema<User, UserModel>(
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
      enum: ['none', 'essential', 'all'],
      default: 'none'
    },
    banned: { type: Boolean, default: false }
  },
  { timestamps: true, usePushEach: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre<User>('save', function checkPassword(next) {
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
    bcrypt.hash(user.password!, salt, (innerErr, hash) => {
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
userSchema.pre<User>('save', function checkApiKey(next) {
  const user = this;
  if (!user.isModified('apiKeys')) {
    next();
    return;
  }
  let hasNew = false;
  user.apiKeys.forEach((k) => {
    if (k.isNew) {
      hasNew = true;
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          next(err);
          return;
        }
        bcrypt.hash(k.hashedKey, salt, (innerErr, hash) => {
          if (innerErr) {
            next(innerErr);
            return;
          }
          k.hashedKey = hash;
          next();
        });
      });
    }
  });
  if (!hasNew) next();
});

userSchema.virtual('id').get(function idToString(this: User) {
  return this._id!.toHexString();
});

userSchema.set('toJSON', {
  virtuals: true
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(
  this: User,
  candidatePassword: string,
  cb: (err: Error | null, isMatch: boolean) => void
) {
  bcrypt.compare(candidatePassword, this.password!, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for validating a user's api key
 */
userSchema.methods.findMatchingKey = function findMatchingKey(
  this: User,
  candidateKey: string,
  cb: (err: Error | null, isMatch: boolean, key?: ApiKey) => void
) {
  let foundOne = false;
  this.apiKeys.forEach((k) => {
    if (bcrypt.compareSync(candidateKey, k.hashedKey)) {
      foundOne = true;
      cb(null, true, k);
    }
  });
  if (!foundOne) cb(new Error('Matching API key not found !'), false);
};

/**
 *
 * Queries User collection by email and returns one User document.
 *
 * @param email - Email string or array of email strings
 * @param [cb] - Optional error-first callback that passes User document
 * @return - Returns Promise fulfilled by User document
 */
userSchema.statics.findByEmail = function findByEmail(
  this: UserModel,
  email: string | string[],
  cb?: (err: Error | null, doc?: User) => void
) {
  let query;
  if (Array.isArray(email)) {
    query = {
      email: { $in: email }
    };
  } else {
    query = {
      email
    };
  }
  // Email addresses should be case-insensitive unique
  // In MongoDB, you must use collation in order to do a case-insensitive query
  return this.findOne(query).collation({ locale: 'en', strength: 2 }).exec(cb);
};

/**
 *
 * Queries User collection by emails and returns all Users that match.
 *
 * @param emails - Array of email strings
 * @param [cb] - Optional error-first callback that passes User document
 * @return - Returns Promise fulfilled by User document
 */
userSchema.statics.findAllByEmails = function findAllByEmails(
  this: UserModel,
  emails: string[],
  cb?: (err: Error | null, doc?: User[]) => void
) {
  const query = {
    email: { $in: emails }
  };
  // Email addresses should be case-insensitive unique
  // In MongoDB, you must use collation in order to do a case-insensitive query
  return this.find(query).collation({ locale: 'en', strength: 2 }).exec(cb);
};

/**
 *
 * Queries User collection by username and returns one User document.
 *
 * @param username - Username string
 * @param [options] - Optional options
 * @param [options.caseInsensitive] - Does a caseInsensitive query, defaults to false
 * @param [cb] - Optional error-first callback that passes User document
 * @return - Returns Promise fulfilled by User document
 */
userSchema.statics.findByUsername = function findByUsername(
  this: UserModel,
  username: string,
  options?: { caseInsensitive?: boolean },
  cb?: (err: Error | null, doc?: User) => void
) {
  const query = {
    username
  };
  if (
    (arguments.length === 3 && options?.caseInsensitive) ||
    (arguments.length === 2 &&
      typeof options === 'object' &&
      options.caseInsensitive)
  ) {
    return this.findOne(query)
      .collation({ locale: 'en', strength: 2 })
      .exec(cb);
  }
  const callback = typeof options === 'function' ? options : cb;
  return this.findOne(query, callback);
};

/**
 *
 * Queries User collection using email or username with optional callback.
 * This function will determine automatically whether the data passed is
 * a username or email, unless you specify options.valueType
 *
 * @param value - Email or username
 * @param [options] - Optional options
 * @param [options.caseInsensitive] - Does a caseInsensitive query rather than
 *                                          default query for username or email, defaults
 *                                          to false
 * @param [options.valueType] - Prevents automatic type inference
 * @param [cb] - Optional error-first callback that passes User document
 * @return {Promise<Object>} - Returns Promise fulfilled by User document
 */
userSchema.statics.findByEmailOrUsername = function findByEmailOrUsername(
  this: UserModel,
  value: string,
  options?: { caseInsensitive?: boolean; valueType?: 'email' | 'username' },
  cb?: (err: Error | null, doc?: User) => void
) {
  let isEmail;
  if (options && options.valueType) {
    isEmail = options.valueType === 'email';
  } else {
    isEmail = value.indexOf('@') > -1;
  }
  // do the case insensitive stuff
  if (
    (arguments.length === 3 && options?.caseInsensitive) ||
    (arguments.length === 2 &&
      typeof options === 'object' &&
      options.caseInsensitive)
  ) {
    const query = isEmail ? { email: value } : { username: value };
    return this.findOne(query)
      .collation({ locale: 'en', strength: 2 })
      .exec(cb);
  }
  const callback = typeof options === 'function' ? options : cb;
  if (isEmail) {
    return this.findByEmail(value, callback);
  }
  return this.findByUsername(value, callback);
};

/**
 *
 * Queries User collection, performing a MongoDB logical or with the email
 * and username (i.e. if either one matches, will return the first document).
 *
 * @param email
 * @param username
 * @param [cb] - Optional error-first callback that passes User document
 * @return - Returns Promise fulfilled by User document
 */
userSchema.statics.findByEmailAndUsername = function findByEmailAndUsername(
  this: UserModel,
  email: string,
  username: string,
  cb?: (err: Error | null, doc?: User) => void
) {
  const query = {
    $or: [{ email }, { username }]
  };
  return this.findOne(query).collation({ locale: 'en', strength: 2 }).exec(cb);
};

userSchema.statics.EmailConfirmation = EmailConfirmationStates;

userSchema.index({ username: 1 }, { collation: { locale: 'en', strength: 2 } });
userSchema.index({ email: 1 }, { collation: { locale: 'en', strength: 2 } });

export default (mongoose.models.User ||
  mongoose.model<User>('User', userSchema)) as UserModel;
