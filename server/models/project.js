import mongoose from 'mongoose';
import shortid from 'shortid';
import slugify from 'slugify';

const { Schema } = mongoose;

const MAX_PROJECT_NAME_LENGTH = 256;
const MAX_FILE_NAME_LENGTH = 256;

const fileNameValidator = (file) => {
  const fileNameWithoutExtension = file.replace(/\.[^/.]+$/, ''); // Removes the extension from the fileName
  if (fileNameWithoutExtension.length === 0) {
    return false;
  }

  return true;
};

const fileSchema = new Schema(
  {
    name: {
      type: String,
      default: 'sketch.js',
      validate: [fileNameValidator, 'File Name Validation Failed!']
    },
    content: { type: String, default: '' },
    url: { type: String },
    children: { type: [String], default: [] },
    fileType: { type: String, default: 'file' },
    isSelectedFile: { type: Boolean }
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
      type: String, default: "Hello p5.js, it's the server"
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
  project.name = project.name.substring(0, MAX_PROJECT_NAME_LENGTH); // Truncates project name
  project.slug = slugify(project.name, '_');

  return next();
});

function projectPreUpdate(next) {
  const project = this._update.$set;
  project.name = project.name.substring(0, MAX_PROJECT_NAME_LENGTH); // Truncates project name

  // Truncate file names
  project.files.forEach((ele) => {
    const fullFileName = ele.name;
    const fileName = fullFileName.replace(/\.[^/.]+$/, '');
    const extension = fullFileName.substring(fileName.length);
    ele.name = fileName.substring(0, MAX_FILE_NAME_LENGTH) + extension;
  });

  return next();
}

projectSchema.pre('findOneAndUpdate', projectPreUpdate);

fileSchema.pre('save', function truncateFileName(next) {
  const file = this;
  const fullFileName = file.name;
  const fileName = fullFileName.replace(/\.[^/.]+$/, '');
  const extension = fullFileName.substring(fileName.length);
  file.name = fileName.substring(0, MAX_FILE_NAME_LENGTH) + extension;

  return next();
});

export default mongoose.model('Project', projectSchema);
