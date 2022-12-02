const express = require('express');
const {
	createUser,
	deleteUser,
	getUser,
	getUsers,
	updateUser,
} = require('../controllers/users');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');
const { authorize, protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router
	.route('/')
	.get(advancedResults(User, 'bootcamps'), getUsers)
	.post(createUser);

router.route('/:id').put(updateUser).delete(deleteUser).get(getUser);

module.exports = router;
