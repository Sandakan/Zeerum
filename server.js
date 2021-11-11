// ? PACKAGES //////////////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { check, validationResult } = require('express-validator');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const crypto = require('crypto');
const cors = require('cors');
const expressIp = require('express-ip');
require('dotenv').config();
// const utils = require('util');
// const { MongoClient } = require('mongodb');
// const { readFile, writeFile } = require('fs');
//? DATA IMPORT //////////////////////////////////////////////////////////////////////////////////////////

const data = require('./data/data');

// ? MIDDLEWARE & FUNCTION IMPORTS   /////////////////////////////////////////////////////////////////////
const authenticate = require('./middleware/authenticate');
const errorHandler = require('./middleware/errorHandler');
const { connectToDB, createUser, checkUser } = require('./config/database');
connectToDB();
// ? /////////////////////////////////////////////////////////////////////////////////////////////////////
const app = express();

// ? //////////////////////////////////// MONGOOSE CONNECTION ///////////////////////////////////////////
const mongooseConnection = mongoose
	.connect(process.env.LOCAL_DATABASE_CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((m) => m.connection.getClient());

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
// handles sessions required for user authentication and authorization
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		cookie: { maxAge: 1000 * 60 * 60 * 24 }, // Session cookie expires in one day(s)
		resave: false,
		saveUninitialized: true,
		store: MongoStore.create({
			clientPromise: mongooseConnection,
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

app.get('/user', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/user.html'));
});

app.get('/profile', authenticate, (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/profile.html'));
});

app.get('/404', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/404.html'));
});

app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		console.log(err);
		res.status(308).redirect('/');
	});
});

// app.get('/articles', (req, res) => {
// 	res.status(200).sendFile(path.resolve(__dirname, './public/article.html'));
// });
// app.get('/tags', (req, res) => {
// 	res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
// });

//? //////////////////////////////////////////////////////////////////
//? //////////////////////////////////////////////////////////////////
app.get('/articles/:article', (req, res, next) => {
	let isResourceAvailable = false;
	data.articleData.forEach((x) => {
		if (
			x.title
				.replace(/[^a-zA-Z0-9\s]/gm, '')
				.replace(/\s/gm, '-')
				.replace(/-$/gm, '')
				.toLowerCase() === req.params.article ||
			x.id == Number(req.params.article)
		)
			isResourceAvailable = true;
	});
	if (isResourceAvailable)
		res.status(200).sendFile(path.resolve(__dirname, './public/article.html'));
	else next();
});

app.get('/tags/:tag', (req, res, next) => {
	let isResourceAvailable = false;
	data.tags.forEach((x) => {
		if (
			x.name.toLowerCase() === req.params.tag.toLowerCase() ||
			x.id === Number(req.params.tag)
		) {
			isResourceAvailable = true;
		}
	});
	if (isResourceAvailable) res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
	else next();
});

app.get('/search/:searchItem', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
});

app.get('/user/:userId', (req, res, next) => {
	let isResourceAvailable = false;
	data.users.map((x) => {
		if (
			x.userId == parseInt(req.params.userId) ||
			`${x.firstName} ${x.lastName}`.replace(/\s/gm, '-').replace(/-$/gm, '').toLowerCase() ==
				req.params.userId.toLowerCase() ||
			`${x.firstName}${x.lastName}`.toLowerCase() == req.params.userId.toLowerCase()
		) {
			isResourceAvailable = true;
		}
	});
	if (isResourceAvailable) res.status(200).sendFile(path.resolve(__dirname, './public/user.html'));
	else next();
});
// ? /////////////////////////  Data GET requests  ////////////////////////////////////////

app.get('/data/search/:searchPhrase', (req, res, next) => {
	let resourceAvailability = false;
	let results = { articles: [], users: [], tags: [] };
	data.articleData.forEach((x) => {
		if (x.title.toLowerCase().includes(req.params.searchPhrase.toLowerCase())) {
			results.articles.push({
				title: x.title,
				url: `/articles/${x.title
					.replace(/[^a-zA-Z0-9\s]/gm, '')
					.replace(/\s/gm, '-')
					.replace(/-$/gm, '')
					.toLowerCase()}`,
			});
			resourceAvailability = true;
		}
	});

	data.users.forEach((x) => {
		if (
			`${x.firstName} ${x.lastName}`
				.toLowerCase()
				.includes(req.params.searchPhrase.toLowerCase())
		) {
			results.users.push({
				fullname: `${x.firstName} ${x.lastName}`,
				url: `/user/${x.firstName.toLowerCase()}-${x.lastName.toLowerCase()}`,
			});
			resourceAvailability = true;
		}
	});

	data.tags.forEach((x) => {
		if (x.name.toLowerCase().includes(req.params.searchPhrase.toLowerCase())) {
			results.tags.push({ name: x.name, url: `/tags/${x.name.toLowerCase()}` });
			resourceAvailability = true;
		}
	});

	if (resourceAvailability) {
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
});

app.get(
	'/data/articles',
	(req, res, next) => {
		if (Object.entries(req.query).length === 0) {
			res.status(200).json({
				success: true,
				status: 200,
				message: `Request successful.`,
				data: data.articleData,
			});
		} else next();
	},
	(req, res, next) => {
		if (req.query.userId) {
			let userId = req.query.userId;
			let articleDataContainer = [];
			data.articleData.map((x, id) => {
				if (
					x.author.userId === parseInt(userId) ||
					x.author.name.replace(/\s/gim, '-').toLowerCase() === userId ||
					x.author.name.replace(/\s/gim, '').toLowerCase() === userId
				) {
					articleDataContainer.push(data.articleData[id]);
				}
			});
			if (articleDataContainer.length !== 0) {
				res.status(200).json({
					success: true,
					status: 200,
					message: `Request successful.`,
					data: articleDataContainer,
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
app.get('/data/articles/:article', (req, res) => {
	let article = { isAvailable: false, data: null, author: null };
	data.articleData.map((x, id) => {
		// console.log(x.title, req.params.article);
		if (
			x.title
				.replace(/[^a-zA-Z0-9\s]/gm, '')
				.replace(/\s/gm, '-')
				.replace(/-$/gm, '')
				.toLowerCase() === req.params.article ||
			x[id] === parseInt(req.params.article)
		) {
			article.isAvailable = true;
			article.data = x;
			article.author = data.users[x.author.userId];
		}
	});
	if (article.isAvailable)
		res.status(200).json({
			success: true,
			status: 200,
			data: [
				article.data,
				{
					userId: article.author.userId,
					firstName: article.author.firstName,
					lastName: article.author.lastName,
					fullName: `${article.author.firstName}-${article.author.lastName}`,
					profilePictureUrl: article.author.profilePictureUrl,
				},
			],
		});
	else
		res.status(404).json({
			success: false,
			message: `There is no article named ${req.params.article}`,
		});
});

app.get('/data/users/:user', (req, res, next) => {
	let user = { isAvailable: false, data: null, userId: null, username: null };

	data.users.map((x, id) => {
		if (
			x.userId == Number(req.params.user) ||
			`${x.firstName} ${x.lastName}`.replace(/\s/gm, '-').replace(/-$/gm, '').toLowerCase() ==
				req.params.user.toLowerCase() ||
			`${x.firstName}${x.lastName}`.toLowerCase() == req.params.user.toLowerCase()
		) {
			user.isAvailable = true;
			user.data = {
				userId: x.userId,
				firstName: x.firstName,
				lastName: x.lastName,
				profilePictureUrl: x.profilePictureUrl,
				followers: x.followers,
				followings: x.followings,
				country: x.country,
				userType: x.userType,
				registeredDate: x.registeredDate,
			};
		}
	});
	if (user.isAvailable)
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Request successful.',
			data: user.data,
		});
	else
		res.status(404).json({
			success: false,
			message: `There is no user with the name/id ${req.params.user}`,
		});
});

app.get('/data/tags', (req, res) => {
	res.status(200).json({
		success: true,
		status: 200,
		message: `Request successful.`,
		data: data.tags,
	});
});

app.get('/data/tags/:tag', (req, res) => {
	let tag = { resourceAvailability: false, data: null };
	data.tags.map((x, id) => {
		if (
			x.name.toLowerCase() == req.params.tag.toLowerCase() ||
			x[id] == parseInt(req.params.tag)
		) {
			tag.resourceAvailability = true;
			tag.data = x;
		}
	});
	if (tag.resourceAvailability) res.status(200).json(tag.data);
	else
		res.status(404).json({
			success: false,
			message: `There is no tag named ${req.params.tag}`,
		});
});

app.get('/data/profile', authenticate, (req, res) => {
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

	const articlesPublished = (userId) => {
		let count = 0;
		data.articleData.forEach((x) => {
			if (x.author.userId === userId) count++;
		});
		return count;
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
			articlesPublished: articlesPublished(),
		},
	});
});

// ? //////////////////////////////  Data POST requests  ////////////////////////////////////
app.post(
	'/signup',
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
		let errObj = { isError: false, errors: [] };
		if (validationErrors.isEmpty()) {
			const { firstName, lastName, email } = req.body;
			await checkUser({ firstName, lastName }, (data) => {
				// This checks whether there are any existing users in the database with the entered input.
				console.log(data);
				const { isThereAUser } = data;
				if (isThereAUser) {
					errObj.isError = true;
					errObj.errors.push('nameExists=true');
				}
			});
			await checkUser({ email }, (data) => {
				// This checks whether there are any existing users in the database with the entered input.
				console.log(data);
				const { isThereAUser } = data;
				if (isThereAUser) {
					errObj.isError = true;
					errObj.errors.push('emailExists=true');
				}
			});
		} else {
			console.log(`Validation errors found ${validationErrors.errors}`);
			return res.status(400).json({
				success: false,
				message: 'Server validation errors found. Please check your inputs.',
			});
		}
		if (errObj.isError) res.status(307).redirect(`/signup?${errObj.errors.join('&')}`);
		else next();
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
				res.status(500).send(`<h1>Error occurredwhen signing up. Please try again later.</h1>`);
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
	(req, res, next) => {
		const validationErrors = validationResult(req);
		const { email, password } = req.body;
		let user = { isAvailable: false, userId: null, username: null, data: null };
		// console.log(req.body);
		if (validationErrors.isEmpty()) {
			checkUser({ email, password }, (data) => {
				const { isThereAUser } = data;
				if (isThereAUser) {
					const userData = data.userData[0];
					console.log(data, userData);
					// user.isAvailable = true;
					req.session.userId = userData.userId;
					req.session.username = `${userData.firstName.toLowerCase()}-${userData.lastName.toLowerCase()}`;
					req.session.user = userData;
					res.status(307).redirect(`/profile`);
				} else res.status(307).redirect('/login?emailOrPasswordMismatch=true');
			});
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
