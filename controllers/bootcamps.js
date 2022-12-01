const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @description Get all bootcamps
// @route GET /api/v1/bootcamps
// @access PUBLIC
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let query;

	const reqQuery = { ...req.query };

	const removeFields = ['select', 'sort', 'page', 'limit'];

	removeFields.forEach((param) => {
		delete reqQuery;
	});

	let queryStr = JSON.stringify(reqQuery);

	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`,
	);

	query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ');

		query = query.select(fields);
	}

	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');

		query = query.sort(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await Bootcamp.countDocuments();

	query = query.skip(startIndex).limit(limit);

	const bootcamps = await query;

	const pagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	console.log(pagination);

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		pagination,
		data: bootcamps,
	});
});

// @description Get single bootcamps
// @route GET /api/v1/bootcamps/:id
// @access PUBLIC
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id).populate('courses');

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Record not found with id of ${req.params.id}`, 404),
		);
	}

	res.status(200).json({ success: true, data: bootcamp });
});

// @description Create new bootcamp
// @route POST /api/v1/bootcamps
// @access PRIVATE
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);

	res.status(201).json({
		success: true,
		data: bootcamp,
	});
});

// @description Update single bootcamps
// @route PUT /api/v1/bootcamps/:id
// @access PRIVATE
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Record not found with id of ${req.params.id}`, 404),
		);
	}

	res.status(200).json({ success: true, data: bootcamp });
});

// @description Delete single bootcamps
// @route DELETE /api/v1/bootcamps/:id
// @access PRIVATE
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Record not found with id of ${req.params.id}`, 404),
		);
	}

	bootcamp.remove();

	res.status(200).json({ success: true, data: bootcamp });
});

// @description Get bootcamps within a radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access PRIVATE
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	const radius = distance / 3963;

	const bootcamps = await Bootcamp.find({
		location: {
			$geoWithin: { $centerSphere: [[lng, lat], radius] },
		},
	});

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});
});
