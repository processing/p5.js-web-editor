import mongoose from 'mongoose';
import shortid from 'shortid';
import slugify from 'slugify';

// Register User model as it's referenced by Project
import './user';

const { Schema } = mongoose;

const fileSchema = new Schema(
  {
    name: { type: String, default: 'sketch.js' },
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
      type: String,
      default: "Hello p5.js, it's the server",
      maxlength: 128
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

  if (!project.slug) {
    project.slug = slugify(project.name, '_');
  }

  return next();
});

/**
 * Check if slug is unique for this user's projects
 */
projectSchema.methods.isSlugUnique = async function isSlugUnique(cb) {
  const project = this;
  const hasCallback = typeof cb === 'function';

  try {
    const docsWithSlug = await project
      .model('Project')
      .find({ user: project.user, slug: project.slug }, '_id')
      .exec();

    const result = {
      isUnique: docsWithSlug.length === 0,
      conflictingIds: docsWithSlug.map((d) => d._id) || []
    };

    if (hasCallback) {
      cb(null, result);
    }

    return result;
  } catch (err) {
    if (hasCallback) {
      cb(err, null);
    }

    throw err;
  }
};

export default mongoose.models.Project ||
  mongoose.model('Project', projectSchema);
