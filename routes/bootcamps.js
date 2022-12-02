const express = require('express');
const {
	createBootcamp,
	deleteBootcamp,
	getBootcamp,
	getBootcamps,
	updateBootcamp,
	getBootcampsInRadius,
	bootcampPhotoUpload,
} = require('../controllers/bootcamps');
const courseRouter = require('./courses');
const advancedResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
	.route('/:id/photo')
	.put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
	.route('/')
	.get(
		advancedResults(Bootcamp, [
			{
				path: 'courses',
			},
			{
				path: 'user',
			},
		]),
		getBootcamps,
	)
	.post(protect, authorize('publisher', 'admin'), createBootcamp);

router
	.route('/:id')
	.get(getBootcamp)
	.put(protect, authorize('publisher', 'admin'), updateBootcamp)
	.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
