const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
		trim: true,
	},
	lastName: {
		type: String,
		required: true,
		trim: true,
	},
	username: {
		type: String,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
	},
	registeredDate: {
		type: Date,
		default: () => Date.now(),
		required: true,
		immutable: true,
	},
	birthday: {
		type: Date,
		required: true,
	},
	profilePictureUrl: {
		type: String,
		default: '/images/user.png',
	},
	userType: {
		type: String,
		default: 'reader',
	},
	Country: String,
	followers: {
		type: [mongoose.SchemaTypes.ObjectId],
		ref: 'users',
	},
	followings: {
		type: [mongoose.SchemaTypes.ObjectId],
		ref: 'users',
	},
	bookmarks: {
		type: [mongoose.SchemaTypes.ObjectId],
		ref: 'articles',
	},
});

module.exports = mongoose.model('users', userSchema);
