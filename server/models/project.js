import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const projectSchema = new Schema({
	name: {type: String, default: 'Hello p5.js'},
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	file: {type: Schema.Types.ObjectId, ref: 'File'}
}, {timestamps: true});

export default mongoose.model('Project', projectSchema);