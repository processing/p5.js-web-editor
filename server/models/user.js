import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: { type: 'String' },
	username: { type: 'String', required: true, unique: true},
	password: { type: 'String' },
	admin: { type: Boolean, default: false }
});

export default mongoose.model('User', userSchema);