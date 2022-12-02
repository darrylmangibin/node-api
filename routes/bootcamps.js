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

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(bootcampPhotoUpload);

router
	.route('/')
	.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
	.post(createBootcamp);

router
	.route('/:id')
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

module.exports = router;
