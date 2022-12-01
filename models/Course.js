const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Please add a course title'],
	},
	description: {
		type: String,
		require: [true, 'Please add a description'],
	},
	weeks: {
		type: String,
		require: [true, 'Please add number of weeks'],
	},
	tuition: {
		type: Number,
		require: [true, 'Please add a tuition cost'],
	},
	minimunSkill: {
		type: String,
		require: [true, 'Please add a description'],
		enum: ['beginner', 'intermediate', 'advances'],
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	bootcamp: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Bootcamp',
		required: true,
	},
});

module.exports = mongoose.model('Course', CourseSchema);
