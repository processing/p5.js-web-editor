import mongoose from 'mongoose';
import shortid from 'shortid';

const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  name: { type: String, default: "New Collection" },
  owners: { type: [Schema.Types.ObjectId] },
  members: { type: [Schema.Types.ObjectId] },
  projects: { type: [Schema.Types.ObjectId] },
  isPrivate: { type: Boolean },
  _id: { type: String, default: shortid.generate }
}, { timestamps: true });

collectionSchema.virtual('id').get(function getCollectionId() {
  return this._id;
});

// export default mongoose.model('Collection', collectionSchema);
