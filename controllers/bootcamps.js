const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

// @description Get all bootcamps
// @route GET /api/v1/bootcamps
// @access PUBLIC
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
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

// @description Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access PRIVATE
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Record not found with id of ${req.params.id}`, 404),
		);
	}

	if (!req.files?.file) {
		return next(new ErrorResponse('Please upload a file', 400));
	}

	const file = req.files.file;

	if (!file.mimetype.startsWith('image')) {
		return next(new ErrorResponse('Please upload an image file', 400));
	}

	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(
				`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
				400,
			),
		);
	}

	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.error(err);
			return next(new ErrorResponse(`Problem with file upload`, 500));
		}

		await Bootcamp.findByIdAndUpdate(req.params.id, {
			photo: file.name,
		});
	});

	res.status(200).json({
		success: true,
		data: file.name,
	});
});
