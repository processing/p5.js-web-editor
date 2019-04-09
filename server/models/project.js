import mongoose from 'mongoose';
import shortid from 'shortid';
import slugify from 'slugify';

const { Schema } = mongoose;


const fileNameValidator = (file) => {
  const fileName = file.replace(/\.[^/.]+$/, ''); // Removes the extension from the fileName
  if (fileName.length === 0) {
    return false;
  }

  return true;
};

const fileSchema = new Schema(
  {
    name: {
      type: String,
      default: 'sketch.js',
      minlength: 1,
      maxlength: 256,
      validate: [fileNameValidator, 'File Name Validation Failed!']
    },
    content: { type: String, default: '' },
    url: { type: String },
    children: { type: [String], default: [] },
    fileType: { type: String, default: 'file' },
    isSelectedFile: { type: Boolean },
  },
  { timestamps: true, _id: true, usePushEach: true }
);

fileSchema.virtual('id').get(function getFileId() {
  return this._id.toHexString();
});

fileSchema.set('toJSON', {
  virtuals: true
});

const projectSchema = new Schema(
  {
    name: {
      type: String, default: "Hello p5.js, it's the server", minlength: 1, maxlength: 256
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    serveSecure: { type: Boolean, default: false },
    files: { type: [fileSchema] },
    _id: { type: String, default: shortid.generate },
    slug: { type: String }
  },
  { timestamps: true, usePushEach: true }
);

projectSchema.virtual('id').get(function getProjectId() {
  return this._id;
});

projectSchema.set('toJSON', {
  virtuals: true
});

projectSchema.pre('save', function generateSlug(next) {
  const project = this;
  const MAX_PROJECT_LENGTH = 256;

  project.slug = slugify(project.name, '_');
  project.name = project.name.substring(0, MAX_PROJECT_LENGTH);

  return next();
});

export default mongoose.model('Project', projectSchema);
