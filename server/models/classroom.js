import mongoose from 'mongoose';
import shortid from 'shortid';

const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  name: { type: String },
  id: { type: String },
  user: { type: String }
}, { timestamps: true });

const assignmentSchema = new Schema({
  name: { type: String, default: 'New Assignment' },
  submissions: { type: [submissionSchema], default: [] },
  description: { type: String, default: 'Add a description!' }
}, { timestamps: true });

const memberSchema = new Schema({
  name: { type: String },
  id: { type: Schema.Types.ObjectId },
}, { timestamps: false });

const classroomSchema = new Schema({
  name: { type: String, default: 'New Classroom' },
  owners: { type: [memberSchema], default: [] },
  members: { type: [memberSchema], default: [] },
  isPrivate: { type: Boolean },
  assignments: { type: [assignmentSchema] },
  id: { type: String, default: shortid.generate },
  description: { type: String, default: 'Add a description!' }
}, { timestamps: true });

export default mongoose.model('Classroom', classroomSchema);
