import mongoose from 'mongoose';
import shortid from 'shortid';

const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
  name: { type: String, default: 'sketch.js' },
  submissions: { type: [Schema.Types.ObjectId] },
}, { timestamps: true });

const classroomSchema = new Schema({
  name: { type: String, default: "New Classroom" },
  owners: { type: [Schema.Types.ObjectId] },
  members: { type: [Schema.Types.ObjectId] },
  isPrivate: { type: Boolean },
  assignments: { type: [assignmentSchema] },
  _id: { type: String, default: shortid.generate } 
}, { timestamps: true });

classroomSchema.virtual('id').get(function getClassroomId() {
  return this._id;
});

export default mongoose.model('Classroom', classroomSchema);
