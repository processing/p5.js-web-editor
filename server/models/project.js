import mongoose from 'mongoose';
import shortid from 'shortid';

const Schema = mongoose.Schema;

const fileSchema = new Schema({
  name: { type: String, default: 'sketch.js' },
  content: { type: String, default: '' },
  url: { type: String },
  children: { type: [String], default: [] },
  fileType: { type: String, default: 'file' },
  isSelectedFile: { type: Boolean }
}, { timestamps: true, _id: true });

fileSchema.virtual('id').get(function getFileId() {
  return this._id.toHexString();
});

fileSchema.set('toJSON', {
  virtuals: true
});

const projectSchema = new Schema({
  name: { type: String, default: "Hello p5.js, it's the server" },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  files: { type: [fileSchema] },
  _id: { type: String, default: shortid.generate }
}, { timestamps: true });

projectSchema.virtual('id').get(function getProjectId() {
  return this._id;
});

projectSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model('Project', projectSchema);
