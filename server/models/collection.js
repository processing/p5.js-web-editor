import mongoose from 'mongoose';
import shortid from 'shortid';
import slugify from 'slugify';

const { Schema } = mongoose;

const collectedProjectSchema = new Schema(
  {
    project: { type: Schema.Types.String, ref: 'Project' }
  },
  { timestamps: true }
);

collectedProjectSchema.virtual('id').get(function getId() {
  return this._id.toHexString();
});

collectedProjectSchema.virtual('projectId').get(function projectId() {
  return this.populated('project');
});

collectedProjectSchema.virtual('isDeleted').get(function isDeleted() {
  return this.project == null;
});

collectedProjectSchema.set('toJSON', {
  virtuals: true
});

const collectionSchema = new Schema(
  {
    _id: { type: String, default: shortid.generate },
    name: { type: String, default: 'My collection' },
    description: { type: String },
    slug: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    items: { type: [collectedProjectSchema] }
  },
  { timestamps: true }
);

collectionSchema.virtual('id').get(function getId() {
  return this._id;
});

collectionSchema.set('toJSON', {
  virtuals: true
});

collectionSchema.pre('save', function generateSlug(next) {
  this.slug = slugify(this.name, '_');
  next();
});

export default mongoose.models.Collection ||
  mongoose.model('Collection', collectionSchema);
