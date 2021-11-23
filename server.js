// jshint -W014
// ? PACKAGES //////////////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { check, validationResult } = require('express-validator');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const expressIp = require('express-ip');
const fileUpload = require('express-fileupload');
const fs = require('fs');
require('dotenv').config();
require('express-async-errors');
// const passport = require('passport');
// const crypto = require('crypto');
// const { MongoClient } = require('mongodb');
// const utils = require('util');
// const { readFile, writeFile } = require('fs');
//? DATA IMPORT //////////////////////////////////////////////////////////////////////////////////////////

const data = require('./data/data');

// ? MIDDLEWARE & FUNCTION IMPORTS   /////////////////////////////////////////////////////////////////////
const authenticate = require('./middleware/authenticate');
const errorHandler = require('./middleware/errorHandler');
const { createAccountLimiter } = require('./middleware/rate-limit');
const {
	connectToDB,
	createUser,
	checkUser,
	requestData,
	updateUserData,
} = require('./config/database');
connectToDB();
// ? /////////////////////////////////////////////////////////////////////////////////////////////////////
const app = express();

// ? ///////////////////////////////// GLOBAL MIDDLEWARE ///////////////////////////////////////////////
// app.set('view engine', 'ejs');
app.use(express.static('./public'));
// parse form data
app.use(bodyParser.urlencoded({ extended: false }));
// parse json
app.use(bodyParser.json());
//handles cross-origin-resource-sharing
app.use(cors());
// handles cookies
app.use(cookieParser());
// sets ip-related information
app.use(expressIp().getIpInfoMiddleware);
// handles file uploads
// app.use(
// 	fileUpload({
// 		useTempFiles: true,
// 		tempFileDir: path.join(__dirname, './temp/'),
// 		createParentPath: true,
// 		preserveFilename: true,
// 		preserveExtension: true,
// 		debug: true,
// 	})
// );
// handles sessions required for user authentication and authorization
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		cookie: { maxAge: 1000 * 60 * 60 * 24 }, // Session cookie expires in one day(s)
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({
			clientPromise: mongoose
				.connect(process.env.LOCAL_DATABASE_CONNECTION_STRING, {
					useNewUrlParser: true,
					useUnifiedTopology: true,
				})
				.then((m) => m.connection.getClient()),
			dbName: 'Zeerum',
			collection: 'sessions',
			stringify: false,
			autoRemove: 'interval',
			autoRemoveInterval: 1,
		}),
	})
);

// ? /////////////////////////////////// MAIN ROUTES ///////////////////////////////////////////////

app.get('/', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/index.html'));
});

app.get('/discover', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/discover.html'));
});

app.get('/write', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/write.html'));
});
app.get('/about', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/about.html'));
});

app.get('/login', (req, res) => {
	if (req.session.userId || req.session.username) res.status(307).redirect('/profile');
	else res.status(200).sendFile(path.resolve(__dirname, './public/login.html'));
});

app.get('/signup', (req, res) => {
	if (req.session.username || req.session.userId) res.status(307).redirect('/profile');
	else res.status(200).sendFile(path.resolve(__dirname, './public/signup.html'));
});

app.get('/profile', authenticate, (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/profile.html'));
});

// app.get('/upload', (req, res, next) => {
// 	res.send(
// 		` <form ref='uploadForm' encType="multipart/form-data" class="" action="/data/upload" method="post">
//       <input type="file" name="file"><br>
//       <input type="submit" name="" value="upload">
//     </form>`
// 	);
// });

app.get('/404', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/404.html'));
});

app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		console.log(err);
		res.status(308).redirect('/');
	});
});
// app.get('/user', (req, res) => {
// 	res.status(200).sendFile(path.resolve(__dirname, './public/user.html'));
// });

// app.get('/articles', (req, res) => {
// 	res.status(200).sendFile(path.resolve(__dirname, './public/article.html'));
// });
// app.get('/tags', (req, res) => {
// 	res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
// });

//? //////////////////////////////////////////////////////////////////
//? //////////////////////////////////////////////////////////////////
/*
.replace(/[^a-zA-Z0-9\s]/gm, '')
				.replace(/\s/gm, '-')
				.replace(/-$/gm, '')
				.toLowerCase()
*/
app.get('/articles/:article', async (req, res, next) => {
	const article = isNaN(Number(req.params.article))
		? req.params.article
		: Number(req.params.article);
	const articleData = isNaN(article)
		? await requestData('articles', { urlSafeTitle: article })
		: await requestData('articles', { articleData: article });
	if (articleData.success && articleData.data.length !== 0)
		res.status(200).sendFile(path.resolve(__dirname, './public/article.html'));
	else next();
});

app.get('/tags/:tag', async (req, res, next) => {
	const tag = isNaN(Number(req.params.tag))
		? req.params.tag.toLowerCase()
		: Number(req.params.tag);
	const tagData = isNaN(tag)
		? await requestData('tags', { name: { $regex: new RegExp(tag, 'i') } })
		: await requestData('tags', { tagId: tag });
	if (tagData.success && tagData.data.length !== 0)
		res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
	else next();
});

app.get('/search/:searchItem', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
});

app.get('/user/:user', async (req, res, next) => {
	const user = isNaN(Number(req.params.user)) ? req.params.user : Number(req.params.user);
	if (
		req.session.userId &&
		(req.session.userId === user || req.session.username === user.toString().toLowerCase())
	)
		res.redirect('/profile');
	else {
		const userData = isNaN(user)
			? await checkUser({
					firstName: user.split('-')[0].replace(/^\w/, (x) => x.toUpperCase()),
					lastName: user.split('-')[1].replace(/^\w/, (x) => x.toUpperCase()),
			  })
			: await checkUser({ userId: user });
		// console.log(user, userData);
		if (userData.success && userData.isThereAUser)
			res.status(200).sendFile(path.resolve(__dirname, './public/user.html'));
		else next();
	}
});
// ? /////////////////////////  Data GET requests  ////////////////////////////////////////

app.get('/data/search/:searchPhrase', async (req, res, next) => {
	const searchPhrase = req.params.searchPhrase;
	const articleData = await requestData('articles', {
		title: { $regex: new RegExp(`${searchPhrase}`, 'i') },
	});
	const tagData = await requestData('tags', {
		name: { $regex: new RegExp(`${searchPhrase}`, 'i') },
	});
	const userData = await checkUser({
		firstName: { $regex: new RegExp(`${searchPhrase}`, 'i') },
	});
	if (articleData.success || tagData.success || userData.success) {
		if (articleData.data.length !== 0 || tagData.data.length !== 0 || userData.isThereAUser) {
			const results = {
				articles: articleData.data || [],
				users: userData.userData || [],
				tags: tagData.data || [],
			};
			// console.log(searchPhrase, results);
			res.status(200).json({
				success: true,
				status: 200,
				message: 'Request successful.',
				results: results,
			});
		} else
			res.status(404).json({
				success: false,
				status: 404,
				message: 'Result cannot be found. Try searching using different keywords.',
			});
	} else
		res.status(500).json({ success: false, message: 'Error occurred. Please try again later.' });
});

app.get(
	'/data/articles',
	async (req, res, next) => {
		if (Object.entries(req.query).length === 0) {
			const { success, data } = await requestData('articles');
			if (success)
				res.status(200).json({
					success: true,
					status: 200,
					message: `Request successful.`,
					data: data,
				});
			else
				res.status(404).json({
					success: false,
					status: 404,
					message: 'No articles found. Please try again later.',
				});
		} else next();
	},
	async (req, res, next) => {
		if (req.query.userId) {
			const userId = isNaN(Number(req.query.userId))
				? req.query.userId
				: Number(req.query.userId);
			const { success, data } = isNaN(userId)
				? await requestData('articles', {
						'author.name': `${userId
							.split('-')[0]
							.replace(/^\w/, (x) => x.toUpperCase())} ${userId
							.split('-')[1]
							.replace(/^\w/, (x) => x.toUpperCase())}`,
				  })
				: await requestData('articles', {
						'author.userId': Number(userId),
				  });
			if (success && data.length !== 0) {
				res.status(200).json({
					success: true,
					status: 200,
					message: `Request successful.`,
					data: data,
				});
			} else
				res.status(404).json({
					success: false,
					status: 404,
					message: 'No articles found. Please try again later.',
				});
		} else next();
	},
	async (req, res, next) => {
		if (req.query.tagId) {
			const tag = isNaN(Number(req.query.tagId))
				? req.query.tagId
				: await requestData('tags', { tagId: 1 }, { tagId: false, pictureUrl: false }).then(
						(x) => x.data[0].name
				  );
			console.log(tag);
			const articleData = await requestData('articles', {
				tags: { $regex: RegExp(tag, 'i') },
			});
			// console.log(tag, articleData);
			if (articleData.success && articleData.data.length !== 0) {
				res.json({
					success: true,
					status: 200,
					message: `Request successful.`,
					tag: tag,
					data: articleData,
				});
			} else next();
		}
	},
	(req, res, next) => {
		res.status(404).json({
			success: false,
			status: 404,
			message: `We couldn't find find what you were looking for`,
		});
	}
);
app.get('/data/articles/:article', async (req, res) => {
	const article = isNaN(Number(req.params.article))
		? req.params.article
		: Number(req.params.article);
	const articleData = isNaN(article)
		? await requestData('articles', { urlSafeTitle: article })
		: await requestData('articles', { articleId: article });
	if (
		articleData.success &&
		articleData.data.length !== 0 &&
		(articleData.data[0].title
			.replace(/[^a-zA-Z0-9\s]/gm, '')
			.replace(/\s/gm, '-')
			.replace(/-$/gm, '')
			.toLowerCase() === article ||
			articleData.data[0].articleId === article)
	) {
		const authorData = await requestData('users', { userId: articleData.data[0].author.userId });
		res.status(200).json({
			success: true,
			status: 200,
			data: {
				article: articleData.data[0],
				author: {
					userId: authorData.data[0].userId,
					firstName: authorData.data[0].firstName,
					lastName: authorData.data[0].lastName,
					fullName: `${authorData.data[0].firstName}-${authorData.data[0].lastName}`,
					profilePictureUrl: authorData.data[0].profilePictureUrl,
				},
			},
		});
	} else
		res.status(404).json({
			success: false,
			message: `There is no article/articleId named ${req.params.article}`,
		});
});

app.get('/data/users/:user', async (req, res, next) => {
	let user = isNaN(Number(req.params.user)) ? req.params.user : Number(req.params.user);
	const userData = isNaN(Number(req.params.user))
		? await checkUser({
				firstName: user.split('-')[0].replace(/^\w/, (x) => x.toUpperCase()),
				lastName: user.split('-')[1].replace(/^\w/, (x) => x.toUpperCase()),
		  })
		: await checkUser({ userId: user });

	if (userData.isThereAUser)
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Request successful.',
			data: userData.userData[0],
		});
	else
		res.status(404).json({
			success: false,
			message: `There is no user with the name/id ${req.params.user}`,
		});
});

app.get('/data/tags', async (req, res) => {
	const tagData = await requestData('tags');
	if (tagData.success)
		res.status(200).json({
			success: true,
			status: 200,
			message: `Request successful.`,
			data: tagData.data,
		});
	else
		res.json({ success: false, status: 404, message: 'No tags found. Please try again later.' });
});

app.get('/data/tags/:tag', async (req, res) => {
	const tag = isNaN(Number(req.params.tag)) ? req.params.tag : Number(req.params.tag);
	const tagData = isNaN(tag)
		? await requestData('tags', { name: tag.replace(/^\w/, (x) => x.toUpperCase()) })
		: await requestData('tags', { tagId: tag });
	if (tagData.success && tagData.data.length !== 0)
		res.status(200).json({ success: true, status: 200, data: tagData.data });
	else
		res.status(404).json({
			success: false,
			status: 404,
			message: `There is no tag/tagId named ${req.params.tag}`,
		});
});

app.get(
	'/data/profile',
	authenticate,
	async (req, res, next) => {
		if (req.query.followUser !== undefined && req.query.followingUserId) {
			console.log(req.query.followUser, req.query.followingUserId);
			let userData = await checkUser({ userId: req.session.userId });
			const followingUserId = Number(req.query.followingUserId);
			let followingUserData = await checkUser({ userId: followingUserId });
			if (req.query.followUser === 'true') {
				// ? If use wants to follow
				if (followingUserData.success && followingUserData.isThereAUser && userData.success) {
					if (!userData.userData[0].followings.includes(followingUserId)) {
						userData.userData[0].followings.push(followingUserId);
						followingUserData.userData[0].followers.push(Number(req.session.userId));
						console.log(
							userData.userData[0].followings,
							followingUserData.userData[0].followers
						);
						await updateUserData(
							{ userId: req.session.userId },
							{ followings: userData.userData[0].followings }
						);
						await updateUserData(
							{ userId: followingUserId },
							{ followers: followingUserData.userData[0].followers }
						);
						req.session.user = userData.userData[0];
						//? if you haven't followed the same user before
						// console.log(req.query.followUser, req.query.followingUserId);
						res.json({
							success: true,
							status: 200,
							message: `Followed ${followingUserData.userData[0].username} by ${req.session.username}`,
						});
					} else {
						// ? if you have followed the same user before
						res.status(400).json({
							success: false,
							status: 400,
							message: `You have already followed ${followingUserData.userData[0].username}`,
						});
					}
				} else {
					res.json({ success: false, message: 'Follow request failed' });
				}
			} else {
				//? If user wants to unfollow
				if (followingUserData.success && followingUserData.isThereAUser && userData.success) {
					// ? if you haven't unfollowed the same user before
					if (userData.userData[0].followings.includes(followingUserId)) {
						const positionUser = userData.userData[0].followings.indexOf(followingUserId);
						const positionFollowing = followingUserData.userData[0].followers.indexOf(
							Number(req.session.userId)
						);
						userData.userData[0].followings.splice(positionUser, 1);
						followingUserData.userData[0].followers.splice(positionFollowing, 1);

						await updateUserData(
							{ userId: req.session.userId },
							{ followings: userData.userData[0].followings }
						);
						await updateUserData(
							{ userId: followingUserId },
							{ followers: followingUserData.userData[0].followers }
						);
						req.session.user = userData.userData[0];
						res.json({
							success: true,
							status: 200,
							message: `Unfollowed ${followingUserData.userData[0].username} by ${req.session.username}`,
						});
					} else {
						// ? if you have unfollowed the same user before
						res.status(400).json({
							success: false,
							status: 400,
							message: `You have already unfollowed ${followingUserData.userData[0].username}`,
						});
					}
				} else res.json({ success: false, message: 'Unfollow request failed' });
			}
		} else next();
	},
	async (req, res, next) => {
		if (req.params.becomeAnAuthor) {
			res.json({ success: true, status: 200, message: 'Success on route become an author.' });
		} else next();
	},
	async (req, res) => {
		const {
			userId,
			firstName,
			lastName,
			profilePictureUrl,
			followers,
			followings,
			registeredDate,
			userType,
			country,
		} = req.session.user;

		const articlesPublished = async (userId) => {
			const articleData = await requestData('articles', { 'author.userId': userId });
			if (articleData.success && articleData.data.length !== 0) return articleData.data.length;
			else return 0;
		};

		res.status(200).json({
			success: true,
			status: 200,
			message: `Request successful.`,
			data: {
				userId: userId,
				firstName: firstName,
				lastName: lastName,
				profilePictureUrl: profilePictureUrl,
				followers: followers,
				followings: followings,
				registeredDate: registeredDate,
				userType: userType,
				country: country,
				articlesPublished: await articlesPublished(userId),
			},
		});
	}
);

app.post(
	'/data/upload',
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, './temp/'),
		createParentPath: true,
		preserveFilename: true,
		preserveExtension: true,
		debug: true,
	}),
	(req, res, next) => {
		if (!req.files || Object.keys(req.files).length === 0) {
			return res.status(400).send('No files were uploaded.');
		} else {
			const profilePicture = req.files.profilePicture;
			const location = `./public/images/users/${req.session.user.userType}s/${req.session.userId}/`;
			fs.mkdir(location, (err) => {
				if (err) console.log(err);
			});
			profilePicture.mv(`${location}/profilePicture.jpg`, (err) => {
				if (err) return next(err);
				updateUserData(
					{ userId: req.session.userId },
					{
						profilePictureUrl: `/images/users/${req.session.user.userType}s/${req.session.userId}/profilePicture.jpg`,
					}
				).then(async ({ success }) => {
					if (success) {
						console.log(req.files);
						const user = await checkUser({ userId: req.session.userId });
						req.session.user = user.userData[0];
						res.redirect('/profile');
					} else res.json({ success: false });
				});
			});
		}
	}
);

// ? //////////////////////////////  Data POST requests  ////////////////////////////////////
app.post(
	'/signup',
	createAccountLimiter,
	[
		check('firstName').exists().withMessage('Name cannot be empty').trim().escape(),
		check('lastName').exists().withMessage('Name cannot be empty').trim().escape(),
		check('birthday').exists().withMessage('Birthday cannot be empty.').toDate(),
		check('email')
			.exists()
			.withMessage('Email cannot be empty')
			.isEmail()
			.withMessage('Email is not within the standards.')
			.normalizeEmail(),
		check('password')
			.exists()
			.withMessage('password cannot be empty')
			.isLength({ min: 8 })
			.withMessage('Password should contain at least 8 characters'),
		// .isStrongPassword({
		// 	minLength: 8,
		// 	minNumbers: 1,
		// })
		// .withMessage(
		// 	'Password should contain at least 8 characters including letters and numbers.'
		// ),
		check('confirmPassword', 'Passwords do not match').custom(
			(value, { req }) => value === req.body.password
		),
	],
	async (req, res, next) => {
		const validationErrors = validationResult(req);
		console.log(req.body);
		if (validationErrors.isEmpty()) {
			let errObj = { isError: false, errors: [] };
			const { firstName, lastName, email } = req.body;
			const nameCheck = await checkUser({ firstName, lastName });
			const emailCheck = await checkUser({ email });
			if (nameCheck.isThereAUser) {
				errObj.isError = true;
				errObj.errors.push('nameExists=true');
			}
			if (emailCheck.isThereAUser) {
				errObj.isError = true;
				errObj.errors.push('emailExists=true');
			}
			if (errObj.isError) res.status(307).redirect(`/signup?${errObj.errors.join('&')}`);
			else next();
		} else {
			console.log(`Validation errors found ${validationErrors.errors}`);
			return res.status(400).json({
				success: false,
				message: 'Server validation errors found. Please check your inputs.',
			});
		}
	},
	(req, res, next) => {
		const errors = validationResult(req);
		createUser({ ...req.body, country: req.ipInfo.country }, (data) => {
			const { success, userData } = data;
			console.log(data);
			if (success) {
				req.session.userId = userData.userId;
				req.session.username = `${userData.firstName.toLowerCase()}-${userData.lastName.toLowerCase()}`;
				req.session.user = userData;
				res.status(307).redirect('/profile');
			} else
				res.status(500).send(
					`<h1>Error occurred when signing up. Please try again later.</h1>`
				);
		});
	}
);

app.post(
	'/log-in',
	[
		check('email')
			.exists()
			.withMessage('Email cannot be empty')
			.isEmail()
			.withMessage('Email is not within the standards.')
			.normalizeEmail(),
		check('password').exists().withMessage('Password cannot be empty'),
	],
	async (req, res, next) => {
		const validationErrors = validationResult(req);
		const { email, password } = req.body;
		let user = { isAvailable: false, userId: null, username: null, data: null };
		// console.log(req.body);
		if (validationErrors.isEmpty()) {
			const data = await checkUser({ email, password });
			console.log(data);
			if (data.isThereAUser) {
				req.session.userId = data.userData[0].userId;
				req.session.username = `${data.userData[0].firstName.toLowerCase()}-${data.userData[0].lastName.toLowerCase()}`;
				req.session.user = data.userData[0];
				res.status(307).redirect(`/profile`);
			} else res.status(307).redirect('/login?emailOrPasswordMismatch=true');
		} else {
			console.log(`Validation errors found.`);
			res.status(400).json({
				success: false,
				status: 400,
				isValidationError: true,
				message: 'Validation errors found.',
				errors: validationErrors,
			});
		}
	}
);

// ? ////////////////////////////// Handles unknown requests ////////////////////////////////

app.all('*', (req, res) => {
	res.status(404).sendFile(path.resolve(__dirname, './public/404.html'));
	console.log(
		`Error : File not found. \n\tRequest method: ${req.method}\n\t${req.protocol}\:\/\/${
			req.get('host') + req.originalUrl
		}`,
		req.url
	);
});

// ? ////////////////////////// ERROR HANDLER AND SERVER CALL /////////////////////////////////////////////////
app.use(errorHandler);

app.listen(process.env.PORT, () => console.log(`user hit the server on ${process.env.PORT}`));
