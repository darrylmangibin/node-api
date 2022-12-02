const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @description Register User
// @route POST /api/v1/auth/register
// @access PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	const token = user.getSignedJwtToken();

	res.status(201).json({
		success: true,
		token,
	});
});