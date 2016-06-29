import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import shortid from 'shortid';

const defaultSketch = `setup() {
  createCanvas(400, 400);
}
draw() {
  background(220);
}`

const fileSchema = new Schema({
  name: { type: String, default: 'sketch.js' },
  content: { type: String, default: defaultSketch }
}, { timestamps: true });

const projectSchema = new Schema({
  name: { type: String, default: "Hello p5.js, it's the server" },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  file: { type: fileSchema },
  _id: { type: String, default: shortid.generate }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
