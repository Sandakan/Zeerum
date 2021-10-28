const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { check, validationResult } = require('express-validator');
require('dotenv').config();
// const exprssSession = require('express-session');
// const { MongoClient } = require('mongodb');
// const { readFile, writeFile } = require('fs');
// const cors = require('cors');

const data = require('./data/data');
// const home = require('./routes/home.js');
const app = express();

//? DATABASE CONNECTION ////////////////////////////////////
// const client = new MongoClient(
// 	`mongodb+srv:\/\/${process.env.DATABASE_USER_NAME}:${process.env.DATABASE_PASSWORD}@cluster0.vhjef.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`
// );

// async function run() {
// 	try {
// 		await client.connect();
// 		console.log('Connected correctly to the database server');
// 		const database = client.db('Zeerum');
// 		const collection = database.collection('users');
// 		// Construct a document
// 		// let personDocument = {
// 		// 	name: { first: 'Alan', last: 'Turing' },
// 		// 	birth: new Date(1912, 5, 23), // June 23, 1912
// 		// 	death: new Date(1954, 5, 7), // June 7, 1954
// 		// 	contribs: ['Turing machine', 'Turing test', 'Turingery'],
// 		// 	views: 1250000,
// 		// };
// 		// // Insert a single document, wait for promise so we can read it back
// 		// const p = await col.insertOne(personDocument);
// 		// Find one document
// 		const myDocument = await collection.findOne();
// 		// Print to the console
// 		console.log(myDocument);
// 	} catch (err) {
// 		console.log(err.stack);
// 	} finally {
// 		await client.close();
// 	}
// }
// run().catch(console.dir);

// ? //////////////////////////////////

// parse form data
app.use(bodyParser.urlencoded({ extended: false }));
// parse json
app.use(bodyParser.json());
//handles cross-origin-resource-sharing
// app.use(cors());
// handles cookies
app.use(cookieParser());

// const resSender = () => {};

app.use(express.static('./public'));

// app.use('/', home);

app.get('/', (req, res) => {
	console.log(req.cookies);
	// res.cookie('isLoggedIn', false, { expires: new Date(Date.now() + 900000) });
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
	res.status(200).sendFile(path.resolve(__dirname, './public/login.html'));
});

app.get('/signup', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/signup.html'));
});

app.get('/user', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/user.html'));
});

app.get('/404', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/404.html'));
});

// app.get('/articles', (req, res) => {
// 	res.status(200).sendFile(path.resolve(__dirname, './public/article.html'));
// });
// app.get('/tags', (req, res) => {
// 	res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
// });

//? //////////////////////////////////////////////////////////////////
//? //////////////////////////////////////////////////////////////////
// app.get(
// 	'/articles/:articleName',
// 	(req, res) => {
// 		data.articleData.map((x) => {
// 			// console.log(req.params.articleName,x.title)
// 			if (
// 				x.title.replace(/\?/g, '') == req.params.articleName ||
// 				x.title.replace(/\?/g, '') == req.params.articleName.replace(/\-/g, ' ')
// 			) {
// 				return void res.status(200).sendFile(path.resolve(__dirname, './public/article.html'));
// 			}
// 		});
// 		return void res.status(404).sendFile(path.resolve(__dirname, './public/index.html'));
// 		// next();
// 	}
// 	// (req, res, next) => {
// 	// 	res.status(404).json({
// 	// 		request: { success: true, reason: 'Not Found', status: 404, File: req.params.articleName },
// 	// 	});
// 	// }
// );
app.get('/articles/:articleName', (req, res, next) => {
	// console.log(req.cookies);
	// res.cookie('isLoggedIn', false, { expires: new Date(Date.now() + 900000) });
	let isResourceAvailable = false;
	data.articleData.forEach((x) => {
		// console.log(
		// 	x.title
		// 		.replace(/[^a-zA-Z0-9\s]/gm, '')
		// 		.replace(/\s/gm, '-')
		// 		.replace(/-$/gm, ''),
		// 	req.params.articleName
		// 		.replace(/[^a-zA-Z0-9\s]/gm, '')
		// 		.replace(/\s/gm, '-')
		// 		.replace(/-$/gm, ''),
		// 	x.title
		// 		.replace(/[^a-zA-Z0-9\s]/gm, '')
		// 		.replace(/\s/gm, '-')
		// 		.replace(/-$/gm, '') === req.params.articleName
		// );
		if (
			x.title
				.replace(/[^a-zA-Z0-9\s]/gm, '')
				.replace(/\s/gm, '-')
				.replace(/-$/gm, '')
				.toLowerCase() === req.params.articleName ||
			x.id == Number(req.params.articleName)
		)
			isResourceAvailable = true;
	});
	if (isResourceAvailable)
		res.status(200).sendFile(path.resolve(__dirname, './public/article.html'));
	else next();
});

app.get('/tags/:tagName', (req, res, next) => {
	let isResourceAvailable = false;
	data.tags.forEach((x) => {
		// console.log(req.params.tagName, x.name.toLowerCase());
		if (
			x.name.toLowerCase() === req.params.tagName.toLowerCase() ||
			x.id === Number(req.params.tagName)
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
	data.users.map((x, id) => {
		if (
			x.id == parseInt(req.params.userId) ||
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

app.get(
	'/data/articles',
	(req, res, next) => {
		// console.log(req.query, Object.entries(req.query).length);
		if (Object.entries(req.query).length === 0) {
			res.json({
				success: true,
				isError: false,
				resourceAvailability: true,
				data: data.articleData,
			});
		} else next();
	},
	(req, res, next) => {
		if (req.query.search) {
			let articleDataContainer = [];
			data.articleData.map((x, id) => {
				// console.log(x.title.includes(req.query.search));
				if (x.title.toLowerCase().includes(req.query.search)) {
					articleDataContainer.push(data.articleData[id]);
				}
			});
			if (articleDataContainer.length !== 0) {
				res.json({
					success: true,
					resourceAvailability: true,
					articleData: articleDataContainer,
				});
			} else next();
		} else if (req.query.userId) {
			let userId = req.query.userId;
			let articleDataContainer = [];
			data.articleData.map((x, id) => {
				if (
					x.author.id === parseInt(userId) ||
					x.author.name.replace(/\s/gim, '-').toLowerCase() === userId ||
					x.author.name.replace(/\s/gim, '').toLowerCase() === userId
				) {
					articleDataContainer.push(data.articleData[id]);
				}
			});
			if (articleDataContainer.length !== 0) {
				res.json({
					success: true,
					isError: false,
					resourceAvailability: true,
					articleData: articleDataContainer,
				});
			} else next();
		}
	},
	(req, res, next) => {
		res.json({
			success: true,
			isError: true,
			resourceAvailability: false,
		});
	}
);
app.get('/data/articles/:articleName', (req, res) => {
	let article = { isAvailable: false, data: null };
	data.articleData.map((x, id) => {
		// console.log(x.title, req.params.articleName);
		if (
			x.title
				.replace(/[^a-zA-Z0-9\s]/gm, '')
				.replace(/\s/gm, '-')
				.replace(/-$/gm, '')
				.toLowerCase() === req.params.articleName ||
			x.id === parseInt(req.params.articleName)
		) {
			article.isAvailable = true;
			article.data = x;
		}
	});
	if (article.isAvailable)
		res.status(200).json([article.data, data.users[article.data.author.id]]);
	else
		res.status(404).json({
			success: true,
			isError: true,
			resourceAvailability: false,
			message: `There is no article named ${req.params.articleName}`,
		});
});

app.get('/data/users/:userId', (req, res, next) => {
	let user = { isAvailable: false, data: null, userId: null, username: null };

	data.users.map((x, id) => {
		if (
			x.id == Number(req.params.userId) ||
			`${x.firstName} ${x.lastName}`.replace(/\s/gm, '-').replace(/-$/gm, '').toLowerCase() ==
				req.params.userId.toLowerCase() ||
			`${x.firstName}${x.lastName}`.toLowerCase() == req.params.userId.toLowerCase()
		) {
			user.isAvailable = true;
			user.data = x;
		}
	});
	if (user.isAvailable) res.status(200).json({ success: true, isError: false, data: user.data });
	else
		res.status(404).json({
			success: true,
			isError: true,
			resourceAvailability: false,
			message: `There is no user with id ${req.params.userId}`,
		});
});

app.get('/data/tags', (req, res) => {
	res.json({ success: true, isError: false, resourceAvailability: true, data: data.tags });
});
app.get('/data/tags/:tag', (req, res) => {
	let tag = { isAvailable: false, data: null };
	data.tags.map((x, id) => {
		if (
			x.name.toLowerCase() == req.params.tag.toLowerCase() ||
			x.id == parseInt(req.params.tag)
		) {
			tag.isAvailable = true;
			tag.data = x;
		}
	});
	if (tag.isAvailable) res.status(200).json(tag.data);
	else
		res.status(404).json({
			success: true,
			isError: true,
			resourceAvailability: false,
			message: `There is no tag named ${req.params.tag}`,
		});
});
//req.protocol + '://' + req.get('host') + req.originalUrl

// ? //////////////////////////////  Data POST requests  ////////////////////////////////////
app.post(
	'/data/submit/signup',
	[
		check('firstName').exists().withMessage('Name cannot be empty').trim().escape(),
		check('lastName').exists().withMessage('Name cannot be empty').trim().escape(),
		check('birthday').exists().withMessage('Birthday cannot be empty.'),
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
			.withMessage('Password should contain at least 15 characters')
			.isStrongPassword({
				minLength: 8,
				minNumbers: 1,
			})
			.withMessage(
				'Password should contain at least 8 characters including letters and numbers.'
			),
		check('confirmPassword', 'Passwords do not match').custom(
			(value, { req }) => value === req.body.password
		),
	],
	(req, res, next) => {
		const validationErrors = validationResult(req);
		console.log(req.body);
		let errObj = { isError: false, errors: [] };
		if (validationErrors.isEmpty()) {
			data.users.forEach((x) => {
				if (
					x.firstName.toLowerCase() == req.body.firstName.toLowerCase() &&
					x.lastName.toLowerCase() == req.body.lastName.toLowerCase()
				) {
					errObj.isError = true;
					errObj.errors.push(`nameExists=true`);
				}
				if (x.email == req.body.email) {
					errObj.isError = true;
					errObj.errors.push('emailExists=true');
				}
			});
		} else console.log(`Validation errors found ${validationErrors.errors}`);

		if (errObj.isError || !validationErrors.isEmpty())
			res.json({
				success: true,
				isError: true,
				message: errObj,
				validationErrors: validationErrors,
			});
		else next();
	},
	(req, res, next) => {
		const errors = validationResult(req);
		res.json({
			success: true,
			isError: false,
			validationErrors: errors,
			message: 'Account created successfully',
		});
	}
);

app.post(
	'/data/submit/log-in',
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
		console.log(req.body);
		const { email, password } = req.body;
		let user = { isAvailable: false, userId: null, username: null };
		if (validationErrors.isEmpty()) {
			data.users.forEach((x) => {
				if (x.email === email && x.password === password) {
					user.userId = x.id;
					user.username = `${x.firstName.toLowerCase()}-${x.lastName.toLowerCase()}`;
					user.isAvailable = true;
				}
			});
		} else console.log(`Validation errors found. ${validationErrors.errors}`);
		if (user.isAvailable) res.redirect(`/user/${user.username}`);
		else res.redirect('/login?emailOrPasswordMismatch=true');
	}
);

// ? ////////////////////////////// Handles unknown requests ////////////////////////////////

app.all('*', (req, res) => {
	res.status(404).sendFile(path.resolve(__dirname, './public/404.html'));
	// res.json({ success: false });
	console.log(
		`Error : File not found. \n\t${req.protocol}\:\/\/${req.get('host') + req.originalUrl}`,
		req.url
	);
});

// ? ////////////////////////// Server call /////////////////////////////////////////////////

app.listen(process.env.PORT, () => console.log(`user hit the server on ${process.env.PORT}`));
