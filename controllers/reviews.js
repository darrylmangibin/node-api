const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// @description Get reviews
// @route GET /api/v1/review
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
