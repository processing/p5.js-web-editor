import mongoose from 'mongoose';

const { Schema } = mongoose;
const TokenSchema = Schema({
  value: {
    type: String,
    required: true
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Token', TokenSchema);
