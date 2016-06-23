import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
  name: { type: String, default: '' },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  github: { type: String },
  email: { type: String, unique: true },
  tokens: Array,
  admin: { type: Boolean, default: false }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', (next) => { // eslint-disable-line consistent-return
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => { // eslint-disable-line consistent-return
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (innerErr, hash) => {
      if (innerErr) { return next(innerErr); }
      user.password = hash;
      return next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = (candidatePassword, cb) => {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

export default mongoose.model('User', userSchema);
