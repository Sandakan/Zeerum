const { MongoClient } = require('mongodb');
require('dotenv').config();

//? DATABASE CONNECTION ////////////////////////////////////
const client = new MongoClient(process.env.DATABASE_CONNECTION_STRING);

const connectToDB = async () => {
	try {
		await client.connect();
		console.log('Connected successfully to the database server');
	} catch (err) {
		console.log(err.stack);
	} finally {
		await client.close();
	}
};

const createUser = async (userDataObj, func) => {
	const { firstName, lastName, birthday, email, password, country } = userDataObj;
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
			username: `${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
			birthday: birthday,
			email: email,
			password: password,
			userType: 'reader',
			profilePictureUrl: null,
			registeredDate: new Date(),
			country: country,
			followers: [],
			followings: [],
			bookmarks: [],
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
				func({
					success: true,
					message: `Account created successfully`,
					userData: data,
				});
			}
		}
	);
};

const checkUser = async (userDataObj, customProjection = {}, func = () => true) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise((resolve, reject) => {
		try {
			database
				.collection('users')
				.find(userDataObj, {
					projection: { birthday: false, ...customProjection },
				})
				.toArray((error, result) => {
					// console.log(result);
					if (error) {
						reject({ success: false });
						throw error;
					}
					if (result.length !== 0) {
						func({ success: true, isThereAUser: true, userData: result });
						resolve({ success: true, isThereAUser: true, userData: result });
					} else {
						func({ success: true, isThereAUser: false });
						resolve({ success: true, isThereAUser: false });
					}
				});
		} catch (err) {
			if (err) throw err;
			reject({ success: false, error: err });
		}
	});
	return promise;
};

const requestData = async (collection, query = {}, customProjection = {}, func = () => true) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		database
			.collection(collection)
			.find(query, {
				projection: { password: false, birthday: false, ...customProjection },
			})
			.toArray((error, result) => {
				if (error) {
					reject({ success: false });
					throw error;
				}
				func({ success: true, data: result });
				resolve({ success: true, data: result });
				return { success: true, data: result };
			});
	});
	return promise;
};

const updateUserData = async (query = {}, newValues = {}, returnUpdatedData = false) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		database.collection('users').updateOne(query, { $set: newValues }, async (err, res) => {
			if (err) {
				reject({ success: false });
				throw err;
			}
			console.log('1 document updated');
			if (returnUpdatedData) {
				resolve({
					success: true,
					message: '1 document updated',
					updatedData: await database
						.collection('users')
						.findOne(query, { projection: { password: false, birthday: false } }),
				});
			} else resolve({ success: true, message: '1 document updated' });
		});
	});
	return promise;
};

const updateData = async (collection, query = {}, newValues = {}, returnUpdatedData = false) => {
	// console.log(collection, query, newValues, returnUpdatedData);
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		database.collection(collection).updateMany(query, { $set: newValues }, async (err, res) => {
			if (err) {
				reject({ success: false, error: err });
				throw err;
			}
			console.log(`${res.modifiedCount} documents updated.`);
			if (returnUpdatedData) {
				await database
					.collection(collection)
					.find(query, { projection: { password: false, birthday: false } })
					.toArray((err, result) => {
						if (err) throw err;
						resolve({
							success: true,
							message: `${res.modifiedCount} document updated`,
							updatedData: result,
						});
					});
			} else resolve({ success: true, message: `${res.modifiedCount} documents updated` });
		});
	});
	return promise;
};

const deleteData = async (collection, query = {}) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		database.collection(collection).deleteMany(query, (err, result) => {
			if (err) {
				reject({ success: false, error: err });
				throw err;
			} else resolve({ success: true, message: `${result.deletedCount} documents deleted.` });
		});
	});
	return promise;
};

module.exports = {
	connectToDB,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	deleteData,
};
