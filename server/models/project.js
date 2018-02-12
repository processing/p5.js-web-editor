import mongoose from 'mongoose';
import shortid from 'shortid';
import slugify from 'slugify';

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
  serveSecure: { type: Boolean, default: false },
  files: { type: [fileSchema] },
  _id: { type: String, default: shortid.generate },
  slug: { type: String }
}, { timestamps: true });

projectSchema.virtual('id').get(function getProjectId() {
  return this._id;
});

projectSchema.set('toJSON', {
  virtuals: true
});

projectSchema.pre('save', function generateSlug(next) {
  const project = this;
  project.slug = slugify(project.name, '_');
  return next();
});

export default mongoose.model('Project', projectSchema);
