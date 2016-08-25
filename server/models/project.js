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
  content: { type: String, default: '' },
  url: { type: String },
  children: { type: [ String ], default: [] },
  fileType: { type: String, default: 'file' },
  isSelected: { type: Boolean }
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
  files: { type: [ fileSchema ] },
  _id: { type: String, default: shortid.generate }
}, { timestamps: true });

projectSchema.virtual('id').get(function(){
    return this._id;
});

projectSchema.set('toJSON', {
    virtuals: true
});

// projectSchema.pre('save', function createSelectedFile(next) {
//   const project = this;
//   if (project.isNew && project.files.length === 0) {
//     let a = new ObjectId();
//     let b = new ObjectId();
//     let c = new ObjectId();
//     project.files = [{ name: 'sketch.js', content: defaultSketch, _id: a, isSelected: true },
//     { name: 'index.html', content: defaultHTML, _id: b },
//     { name: 'style.css', content: defaultCSS, _id: c },
//     { name: 'root', _id: new ObjectId(), children: [a, b, c] }];
//   }
//   return next();
// });

export default mongoose.model('Project', projectSchema);
