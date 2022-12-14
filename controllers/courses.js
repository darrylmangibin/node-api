const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// @description Get courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access PUBLIC
exports.getCourses = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const courses = await Course.find({ bootcamp: req.params.bootcampId });

		return res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// @description Get single course
// @route GET /api/v1/courses/:id
// @access PUBLIC
exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id).populate({
		path: 'bootcamp',
		select: 'name description',
	});

	if (!course) {
		return next(
			new ErrorResponse(`Record not found with id of ${req.params.id}`, 404),
		);
	}

	res.status(200).json({ success: true, data: course });
});

// @description Get single course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access PRIVATE
exports.addCourse = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Record not found with id of ${req.params.bootcampId}`,
				404,
			),
		);
	}

	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to add a course`,
				401,
			),
		);
	}

	const course = await Course.create(req.body);

	res.status(200).json({ success: true, data: course });
});

// @description Update course
// @route PUT /api/v1/courses/:id
// @access PRIVATE
exports.updateCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(`Record not found with id of ${req.params.id}`, 404),
		);
	}

	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to update this course`,
				401,
			),
		);
	}

	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		runValidators: true,
		new: true,
	});

	res.status(200).json({ success: true, data: course });
});

// @description delete course
// @route DELETE /api/v1/courses/:id
// @access PRIVATE
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(`Record not found with id of ${req.params.id}`, 404),
		);
	}

	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to delete this course`,
				401,
			),
		);
	}

	course.remove();

	res.status(200).json({ success: true, data: course });
});
