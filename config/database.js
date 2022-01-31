const { MongoClient } = require('mongodb');
require('dotenv').config();

//? DATABASE CONNECTION ////////////////////////////////////
const client = new MongoClient(process.env.DATABASE_CONNECTION_STRING);

const testDatabaseConnection = async () => {
	client
		.connect()
		.then(
			() => console.log('Connected successfully to the database server'),
			(err) => console.log(err.stack)
		)
		.finally(async () => await client.close());
};

const countDocuments = async (collection) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		try {
			const noOfDocuments = await database
				.collection(collection)
				.countDocuments()
				.then((res) => res);
			resolve(noOfDocuments);
		} catch (err) {
			reject(err);
		}
	});
	return promise;
};

const createUser = async (userDataObj) => {
	const promise = new Promise(async (resolve, reject) => {
		const { firstName, lastName, birthday, email, password, country } = userDataObj;
		await client.connect();
		const database = client.db(process.env.DATABASE_NAME);
		const userId = await database
			.collection('users')
			.countDocuments()
			.then(
				(res) => res,
				(err) => reject(err)
			);
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
				if (err) return reject(err);
				else {
					console.log(`User added successfully`, res);
					const data = await database
						.collection('users')
						.findOne({ userId: userId }, { projection: { password: false } })
						.then(
							(res) => res,
							(err) => reject(err)
						);
					resolve({
						success: true,
						message: `Account created successfully`,
						userData: data,
					});
				}
			}
		);
	});
	return promise;
};

const checkUser = async (userDataObj, customProjection = {}) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		try {
			await database
				.collection('users')
				.find(userDataObj, {
					projection: customProjection,
				})
				.toArray((error, result) => {
					if (error) reject(error);
					if (result.length !== 0)
						resolve({ success: true, isThereAUser: true, userData: result });
					else resolve({ success: true, isThereAUser: false });
				});
		} catch (err) {
			reject(err);
		}
	});
	return promise;
};

const requestData = async (collection, query = {}, customProjection = {}, sort = {}, limit = 0) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		database
			.collection(collection)
			.find(query, {
				projection: customProjection,
			})
			.sort(sort)
			.limit(limit)
			.toArray((error, result) => {
				if (error) {
					return reject(error);
				}
				resolve({ success: true, data: result });
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
				return reject(err);
			}
			console.log('user data updated.');
			if (returnUpdatedData) {
				resolve({
					success: true,
					message: 'user data updated.',
					updatedData: await database
						.collection('users')
						.findOne(query, { projection: { password: false, birthday: false } }),
				});
			} else resolve({ success: true, message: 'user data updated.' });
		});
	});
	return promise;
};

const updateData = async (
	collection,
	query = {},
	newValues = {},
	options = {},
	returnUpdatedData = false
) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		database.collection(collection).updateMany(query, newValues, options, async (err, res) => {
			if (err) return reject(err);
			console.log(`${res.modifiedCount} documents updated.`);
			if (res.modifiedCount > 0) {
				if (returnUpdatedData) {
					await database
						.collection(collection)
						.find(query, { projection: { password: false, birthday: false } })
						.toArray((err, result) => {
							if (err) return reject(err);
							resolve({
								success: true,
								message: `${res.modifiedCount} document updated`,
								updatedData: result,
							});
						});
				} else resolve({ success: true, message: `${res.modifiedCount} documents updated` });
			} else reject('Data update failed.');
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
				return reject(err);
			} else resolve({ success: true, message: `${result.deletedCount} documents deleted.` });
		});
	});
	return promise;
};

const createArticle = async (articleData = {}, userData = {}) => {
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
				categories: articleData.categories.split(' ') || [],
				tags: articleData.tags.split('#') || [],
				urlSafeTitle: articleUrlSafeTitle,
				views: {
					allTime: 0,
				},
			},
			async (err, res) => {
				if (err) {
					console.log(err);
					return reject(err);
				} else {
					console.log('Article added successfully.', res);
					resolve({
						success: true,
						message: 'Article added successfully.',
						articleUrl: `/articles/${articleUrlSafeTitle}`,
					});
				}
			}
		);
	});
	return promise;
};

const createTags = async (tags = [], options = {}, articleId) => {
	await client.connect();
	const database = client.db(process.env.DATABASE_NAME);
	const promise = new Promise(async (resolve, reject) => {
		let tagId = await countDocuments('tags').then(
			(res) => res,
			(err) => reject(err)
		);
		tags.forEach(async (tag) => {
			await database
				.collection('tags')
				.updateOne(
					{ name: tag },
					{ $set: { tagId: tagId }, $push: { articles: articleId } },
					{ upsert: true }
				)
				.then(
					(res) => resolve({ success: true }),
					(err) => reject(err)
				);
		});
		resolve({ success: true });
	});
	return promise;
};

module.exports = {
	testDatabaseConnection,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	deleteData,
	createArticle,
	createTags,
};
