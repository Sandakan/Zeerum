const { MongoClient } = require('mongodb');
require('dotenv').config();

//? DATABASE CONNECTION ////////////////////////////////////
const client = new MongoClient(process.env.LOCAL_DATABASE_CONNECTION_STRING);

const connectToDB = async () => {
	try {
		await client.connect();
		console.log('Connected successfully to the database server');
		const database = client.db(process.env.DATABASE_NAME);
		const collection = database.collection('users');
		// Construct a document
		// let personDocument = {
		// 	name: { first: 'Alan', last: 'Turing' },
		// 	birth: new Date(1912, 5, 23), // June 23, 1912
		// 	death: new Date(1954, 5, 7), // June 7, 1954
		// 	contribs: ['Turing machine', 'Turing test', 'Turingery'],
		// 	views: 1250000,
		// };
		// // Insert a single document, wait for promise so we can read it back
		// const p = await col.insertOne(personDocument);
		// Find one document
		// const myDocument = await collection.findOne();
		// Print to the console
		// console.log(myDocument);
	} catch (err) {
		console.log(err.stack);
	} finally {
		await client.close();
	}
};

const createUser = async (userDataObj, func) => {
	const { firstName, lastName, birthday, email, password, confirmPassword, country } = userDataObj;
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	// const collection = database.collection('users');
	const count = await database
		.collection('users')
		.countDocuments()
		.then((res) => res);
	console.log(count + ' documents');
	database.collection('users').insertOne(
		{
			userId: count,
			firstName: firstName,
			lastName: lastName,
			birthday: birthday,
			email: email,
			password: password,
			userType: 'reader',
			profilePictureUrl: null,
			registeredDate: new Date(),
			country: country,
			followers: [],
			followings: [],
		},
		async (err, res) => {
			if (err) {
				console.log(err);
				throw err;
			} else {
				console.log(`User added successfully`, res);
				const data = await database
					.collection('users')
					.findOne({ userId: count }, { projection: { password: false } });
				// console.log({ success: true, userData });
				// const userData = new Promise((resolve, reject) => {
				// 	resolve({
				// 		success: true,
				// 		message: `Account created successfully`,
				// 		userData: data,
				// 	});
				// 	reject({
				// 		success: false,
				// 		message: `Account creation failed.`,
				// 	});
				// });
				func({
					success: true,
					message: `Account created successfully`,
					userData: data,
				});
				return userData;
			}
		}
	);
};

const checkUser = async (userDataObj, func) => {
	// console.log(userDataObj);
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	database
		.collection('users')
		.find(userDataObj, { projection: { password: false, birthday: false } })
		.toArray((error, result) => {
			if (error) throw error;
			// const userData = new Promise((resolve, reject) => {
			// 	if (result.length !== 0) resolve({ isThereAUser: true, userData: result });
			// 	else reject({ isThereAUser: false });
			// });
			if (result.length !== 0) func({ isThereAUser: true, userData: result });
			else func({ isThereAUser: false });
		});
	// return userData;
};

module.exports = { connectToDB, createUser, checkUser };
// run().catch(console.dir);
