const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// @description Get reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access PUBLIC
exports.getReviews = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const reviews = await Review.find({ bootcamp: req.params.bootcampId });

		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// @description Get single review
// @route GET /api/v1/reviews/:id
// @access PUBLIC
exports.getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id).populate({
		path: 'bootcamp',
		select: 'name description',
	});

	if (!review) {
		return next(
			new ErrorResponse(`Record not found with id of ${req.params.id}`, 404),
		);
	}

	res.status(200).json({
		success: true,
		data: review,
	});
});

// @description Create new review
// @route POST /api/v1/bootcamps/:bootcampId/reviews
// @access PRIVATE
exports.addReview = asyncHandler(async (req, res, next) => {
	console.log(req.params);
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	console.log(bootcamp);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Record not found with id of ${req.params.id}`, 404),
		);
	}

	const review = await Review.create(req.body);

	res.status(201).json({
		success: true,
		data: review,
	});
});
