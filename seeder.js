const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const Bootcamp = require('./models/Bootcamp');

dotenv.config({
	path: './config/config.env',
});

mongoose.connect(process.env.MONGO_URI, {
	dbName: process.env.MONGO_DB_NAME,
});

const bootcamps = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'),
);

const importData = async () => {
	try {
		await Bootcamp.create(bootcamps);

		console.log('Data imported...'.green.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

const deleteData = async () => {
	try {
		await Bootcamp.deleteMany();

		console.log('Data destroyed...'.red.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

if (process.argv[2] === '-i') {
	importData();
} else if (process.argv[2] === '-d') {
	deleteData();
}
