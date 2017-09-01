import mongoose from 'mongoose';
import shortid from 'shortid';

const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  sketch_name: { type: String },
  author_username: { type: String },
  sketch_id: { type: String },
}, { timestamps: true });

const assignmentSchema = new Schema({
  name: { type: String, default: 'New Assignment' },
  submissions: { type: [submissionSchema], default: [] },
  description: { type: String, default: 'Add a description!' }
}, { timestamps: true });

assignmentSchema.virtual('id').get(function idToString() {
  return this._id.toHexString();
});

assignmentSchema.set('toJSON', {
  virtuals: true
});

const memberSchema = new Schema({
  username: { type: String },
  user_id: { type: String },
}, { timestamps: false });

const classroomSchema = new Schema({
  name: { type: String, default: 'New Classroom' },
  instructors: { type: [memberSchema], default: [] },
  students: { type: [memberSchema], default: [] },
  isPrivate: { type: Boolean },
  assignments: { type: [assignmentSchema] },
  description: { type: String, default: 'Add a description!' }
}, { timestamps: true });

classroomSchema.virtual('id').get(function idToString() {
  return this._id.toHexString();
});

classroomSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model('Classroom', classroomSchema);
