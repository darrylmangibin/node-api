// @description Get all bootcamps
// @route GET /api/v1/bootcamps
// @access PUBLIC
exports.getBootcamps = (req, res, next) => {
	res.status(200).json({ success: true, msg: 'Show all bootcamps' });
};

// @description Get single bootcamps
// @route GET /api/v1/bootcamps/:id
// @access PUBLIC
exports.getBootcamp = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, msg: `Show bootcamp ${req.params.id}` });
};

// @description Create new bootcamp
// @route POST /api/v1/bootcamps
// @access PRIVATE
exports.createBootcamp = (req, res, next) => {
	res.status(200).json({ success: true, msg: 'Create new bootcamp' });
};

// @description Update single bootcamps
// @route PUT /api/v1/bootcamps/:id
// @access PRIVATE
exports.updateBootcamp = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

// @description Delete single bootcamps
// @route DELETE /api/v1/bootcamps/:id
// @access PRIVATE
exports.deleteBootcamp = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};
