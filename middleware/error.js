const { Error } = require('mongoose');
const { MongoServerError } = require('mongodb');
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
	let error = { ...err };

	error.message = err.message;

	// Log console for dev
	console.log(err);
	console.log(err.constructor.name);

	if (err instanceof Error.CastError) {
		const message = `Record not found with id of ${err.value}`;
		error = new ErrorResponse(message, 404);
	}

	if (err instanceof MongoServerError) {
		const message = `Duplicate field value entered`;
		error = new ErrorResponse(message, 422);
	}

	if (err instanceof Error.ValidationError) {
		const message = Object.values(err.errors).map((val) => val.message);
		error = new ErrorResponse(message, 422, error.errors);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Server error',
		errors: error.errors,
	});
};

module.exports = errorHandler;
