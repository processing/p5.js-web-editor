import mongoose from 'mongoose';
import shortid from 'shortid';
import slugify from 'slugify';

const { Schema } = mongoose;

// i am not sure about this schema at this moment, the another possibility we can remove msg and display the msg from client. Additionally, instead of storing inidividual IDs,
// we can store whole object ? but it may not be ideal as we won't be using all of their properties. I'm open to discussing and refining the message schema further.

const MessagesSchema = new Schema(
  {
    _id: { type: String, default: shortid.generate },
    msg: { type: String },
    reqReceiver: { type: Schema.Types.ObjectId, ref: 'User' },
    reqSenderID: { type: Schema.Types.ObjectId, ref: 'User' },
    reqSenderUsername: { type: String },
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
