import mongoose from 'mongoose';
import shortid from 'shortid';
import slugify from 'slugify';

const { Schema } = mongoose;

const MessagesSchema = new Schema(
  {
    _id: { type: String, default: shortid.generate },
    msg: { type: String },
    reqSender: { type: String },
    collectionOwner: { type: String },
    projectID: { type: String },
    collectionID: { type: String },
    slug: { type: String }
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
  message.slug = slugify(message.msg, '_');
  next();
});

export default mongoose.models.Messages ||
  mongoose.model('Messages', MessagesSchema);
