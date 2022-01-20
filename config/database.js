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

const countDocuments = async (collection, func = () => true) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		try {
			const noOfDocuments = await database
				.collection(collection)
				.countDocuments()
				.then((res) => res);
			func(noOfDocuments);
			resolve(noOfDocuments);
		} catch (err) {
			reject(err);
			throw err;
		}
	});
	return promise;
};

const createUser = async (userDataObj, func = () => true) => {
	const { firstName, lastName, birthday, email, password, country } = userDataObj;
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const userId = await database
		.collection('users')
		.countDocuments()
		.then((res) => res);
	console.log('user id for recently created user is', userId);

	database.collection('users').insertOne(
		{
			userId: userId,
			firstName: firstName,
			lastName: lastName,
			username: `${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
			birthday: birthday,
			email: email,
			password: password,
			userType: 'reader',
			profilePictureUrl: '/images/user.webp',
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
					.findOne({ userId: userId }, { projection: { password: false } });
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

const requestData = async (
	collection,
	query = {},
	customProjection = {},
	limit = 0,
	func = () => true
) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		database
			.collection(collection)
			.find(query, {
				projection: { password: false, birthday: false, ...customProjection },
			})
			.limit(limit)
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
		database.collection('users').updateOne(query, newValues, async (err, res) => {
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
		database.collection(collection).updateMany(query, newValues, async (err, res) => {
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

const createArticle = async (articleData = {}, userData = {}, func = () => true) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);

	const tempRandomArticleName = () => {
		const alphabet = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',');
		let tempName = '';
		for (let x = 0; x < 20; x++) {
			const val = Math.floor(Math.random() * (alphabet.length - 1) + 0);
			tempName += alphabet[val];
		}
		return tempName;
	};
	const tempArticleName = tempRandomArticleName();

	const promise = new Promise(async (resolve, reject) => {
		const articleUrlSafeTitle =
			articleData.title
				.replace(/[^a-zA-Z0-9\s]/gm, '')
				.replace(/\s/gm, '-')
				.replace(/-$/gm, '')
				.toLowerCase() || tempArticleName;
		database.collection('articles').insertOne(
			{
				articleId: articleData.articleId,
				title: articleData.title || tempArticleName,
				coverImg: articleData.coverImg || null,
				coverImgUlt: articleData.coverImgUlt || null,
				releasedDate: new Date(),
				description: articleData.description || null,
				author: {
					userId: userData.userId,
					name: `${userData.firstName} ${userData.lastName}`,
				},
				reactions: {
					likes: [],
					shares: 0,
					bookmarks: [],
				},
				comments: [],
				article: articleData.body || null,
				footnotes: articleData.footnotes || null,
				categories: articleData.categories || [],
				urlSafeTitle: articleUrlSafeTitle,
				views: {
					allTime: 0,
				},
			},
			async (err, res) => {
				if (err) {
					console.log(err);
					reject(err);
					throw err;
				} else {
					console.log('Article added successfully.', res);
					resolve({
						success: true,
						message: 'Article added successfully.',
						articleUrl: `/articles/${articleUrlSafeTitle}`,
					});
					func({
						success: true,
						message: 'Article added successfully.',
					});
				}
			}
		);
	});
	return promise;
};

module.exports = {
	connectToDB,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	deleteData,
	createArticle,
};
