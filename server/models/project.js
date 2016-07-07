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
`
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <script src="sketch.js"></script>
  </body>
</html>
`

const fileSchema = new Schema({
  name: { type: String, default: 'sketch.js' },
  content: { type: String, default: defaultSketch }
}, { timestamps: true, _id: true });

const projectSchema = new Schema({
  name: { type: String, default: "Hello p5.js, it's the server" },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  files: {type: [ fileSchema ], default: [{ name: 'sketch.js', content: defaultSketch, _id: new ObjectId() }, { name: 'index.html', content: defaultHTML, _id: new ObjectId() }]},
  _id: { type: String, default: shortid.generate }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
