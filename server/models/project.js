import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectIdSchema = Schema.ObjectId;
const ObjectId = mongoose.Types.ObjectId;
import shortid from 'shortid';

const defaultSketch = `function setup() {
  createCanvas(400, 400);
}
function draw() {
  background(220);
}`

const defaultHTML =
`<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.2/p5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.2/addons/p5.dom.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.2/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
  </head>
  <body>
    <script src="sketch.js"></script>
  </body>
</html>
`
const defaultCSS =
`html, body {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
`;

const fileSchema = new Schema({
  name: { type: String, default: 'sketch.js' },
  content: { type: String },
  url: { type: String },
  children: { type: [Schema.Types.ObjectId], default: [] },
  fileType: { type: String }
}, { timestamps: true, _id: true });

fileSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

fileSchema.set('toJSON', {
    virtuals: true
});

const projectSchema = new Schema({
  name: { type: String, default: "Hello p5.js, it's the server" },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  files: { type: [ fileSchema ], default: [{ name: 'sketch.js', content: defaultSketch, _id: new ObjectId() },
    { name: 'index.html', content: defaultHTML, _id: new ObjectId() },
    { name: 'style.css', content: defaultCSS, _id: new ObjectId() },
    { name: 'root', _id: '0'}]},
  _id: { type: String, default: shortid.generate },
  selectedFile: Schema.Types.ObjectId
}, { timestamps: true });

projectSchema.virtual('id').get(function(){
    return this._id;
});

projectSchema.set('toJSON', {
    virtuals: true
});

projectSchema.pre('save', function createSelectedFile(next) {
  const project = this;
  if (!project.selectedFile) {
    project.selectedFile = project.files[0]._id; // eslint-disable-line no-underscore-dangle
    return next();
  }
});

export default mongoose.model('Project', projectSchema);
