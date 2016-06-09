import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: { type: String, default: '' },
	username: { type: String, required: true, unique: true},
	password: { type: String },
	github: { type: String },
	email: { type: String, unique: true },
	tokens: Array,
	admin: { type: Boolean, default: false }
}, {timestamps: true});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

export default mongoose.model('User', userSchema);