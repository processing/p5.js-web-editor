import mongoose from 'mongoose';
import shortid from 'shortid';
import slugify from 'slugify';

const { Schema } = mongoose;

const MessagesSchema = new Schema(
  {
    _id: { type: String, default: shortid.generate },
    msg: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    collection: { type: Schema.Types.ObjectId, ref: 'Collection' }
  },
  { timestamps: true, usePushEach: true }
);

MessagesSchema.virtual('id').get(function getId() {
  return this._id;
});

MessagesSchema.set('toJSON', {
  virtuals: true
});

MessagesSchema.pre('save', function generateSlug(next) {
  const message = this;
  message.slug = slugify(message.msg, '_'); // Fix: Use message.msg instead of collection.name
  return next();
});

export default mongoose.models.Messages ||
  mongoose.model('Messages', MessagesSchema);
