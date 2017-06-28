import mongoose from 'mongoose';
import shortid from 'shortid';

const Schema = mongoose.Schema;

const classroomSchema = new Schema({
  name: { type: String, default: "New Classroom" },
  owners: { type: [Schema.Types.ObjectId] },
  members: { type: [Schema.Types.ObjectId] },
  /* collections: { type: [Schema.Types.ObjectId] }, */
  isPrivate: { type: Boolean },
  _id: { type: String, default: shortid.generate }
}, { timestamps: true });

classroomSchema.virtual('id').get(function getCollectionId() {
  return this._id;
});

export default mongoose.model('Classroom', classroomSchema);
