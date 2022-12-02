const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

// Load env vars
dotenv.config({
	path: './config/config.env',
});

connectDB();

const app = express();

app.use(express.json());

app.use(express.static('public'));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
			.bold,
	),
);

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.red);
	// Close
	server.close(() => process.exit(1));
});
