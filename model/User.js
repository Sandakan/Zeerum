const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		min: 3,
		max: 255,
		required: true,
	},
	lastName: {
		type: String,
		min: 3,
		max: 255,
		required: true,
	},
	email: {
		type: String,
		required: true,
		min: 5,
		max: 255,
	},
	password: {
		type: String,
		required: true,
		min: 8,
		max: 1024,
	},
	registeredDate: {
		type: Date,
		default: Date.now,
	},
	birthday: {
		type: Date,
	},
});

module.exports = { userSchema };
