import mongoose from 'mongoose';
import shortid from 'shortid';

const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  name: { type: String, default: "New Collection" },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  projects: { type: [Schema.Types.ObjectId] },
  _id: { type: String, default: shortid.generate }
}, { timestamps: true });

collectionSchema.virtual('id').get(function getCollectionId() {
  return this._id;
});

export default mongoose.model('Collection', collectionSchema);
