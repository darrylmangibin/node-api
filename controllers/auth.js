const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

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

	sendTokenResponse(user, 200, res);
});

// @description Login User
// @route POST /api/v1/auth/login
// @access PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new ErrorResponse('Please provide an email and password', 400));
	}

	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}

	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}

	sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		token,
	});
};

// @description Get current login user
// @route GET /api/v1/auth/me
// @access PRIVATE
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @description Forgot password
// @route POST /api/v1/auth/forgotpassword
// @access PUBLIC
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorResponse('There is no user with that email', 404));
	}

	const resetToken = user.getResetPasswordToken();

	await user.save({
		validateBeforeSave: false,
	});

	const resetUrl = `${req.protocol}://${req.get(
		'host',
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `You are receiving this email because you (or some else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password reset token',
			message,
		});

		return res.status(200).json({
			success: true,
			data: 'Email sent',
		});
	} catch (err) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({
			validateBeforeSave: false,
		});

		return next(new ErrorResponse('Email could not be sent', 500));
	}
});

// @description Reset password
// @route put /api/v1/auth/resetpassword/:resettoken
// @access PRIVATE
exports.resetPassword = asyncHandler(async (req, res, next) => {
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resettoken)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorResponse('Invalid token'), 400);
	}

	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	user.save();

	sendTokenResponse(user, 200, res);
});
