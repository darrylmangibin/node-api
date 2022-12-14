const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			required: [true, 'Please add a title for review'],
			maxlenght: 100,
		},
		text: {
			type: String,
			required: [true, 'Please add some text'],
		},
		rating: {
			type: Number,
			min: 1,
			max: 10,
			required: [true, 'Please add a rating between 1 and 10'],
		},
		bootcamp: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Bootcamp',
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

ReviewSchema.index(
	{
		bootcamp: 1,
		user: 1,
	},
	{
		unique: true,
	},
);

ReviewSchema.statics.getAverageRating = async function (bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: '$bootcamp',
				averageRating: {
					$avg: '$rating',
				},
			},
		},
	]);

	try {
		await mongoose.model('Review').findByIdAndUpdate(bootcampId, {
			ReviewSchema: obj[0].averageRating,
		});
	} catch (error) {
		console.error(error);
	}
};

ReviewSchema.post('save', function () {
	this.constructor.getAverageRating(this.bootcamp);
});

ReviewSchema.pre('remove', function () {
	this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
