import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const fileSchema = new Schema({
	name: {type: String, default: 'sketch.js'},
	project: {type: Schema.Types.ObjectId, ref: 'Project'},
	content: {type: String}
}, {timestamps: true});

export default mongoose.model('File', fileSchema);