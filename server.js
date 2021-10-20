const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const { MongoClient } = require('mongodb');
// const { readFile, writeFile } = require('fs');
// const { body, validationResult } = require('express-validator');
// const cors = require('cors');

const data = require('./data/data');
const app = express();

//? DATABASE CONNECTION ////////////////////////////////////
// const client = new MongoClient(
// 	'mongodb+srv://Admin:20030429@cluster0.vhjef.mongodb.net/Zeerum?retryWrites=true&w=majority'
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

app.get('/', (req, res) => {
	console.log(req.cookies);
	res.cookie('isLoggedIn', false, { expires: new Date(Date.now() + 900000) });
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

app.get('/signin', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/signin.html'));
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
// const sendArticle = (req, res) => {
// 	data.articleData.map((x) => {
// 		// console.log(req.params.articleName,x.title)
// 		if (
// 			x.title.replace(/\?/g, '') == req.params.articleName ||
// 			x.title.replace(/\?/g, '') == req.params.articleName.replace(/\-/g, ' ')
// 		) {
// 			status(200).sendFile(path.resolve(__dirname, './public/article.html'));
// 		} else
// 			json({
// 				request: {
// 					success: true,
// 					reason: 'Not Found',
// 					status: 404,
// 					File: req.params.articleName,
// 				},
// 			});
// 	});
// };
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
app.get(
	'/articles/:articleName',
	(req, res) => {
		console.log(req.cookies);
		res.cookie('isLoggedIn', false, { expires: new Date(Date.now() + 900000) });
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
			// console.log(req.params.articleName, x.title);
			if (
				x.title
					.replace(/[^a-zA-Z0-9\s]/gm, '')
					.replace(/\s/gm, '-')
					.replace(/-$/gm, '')
					.toLowerCase() === req.params.articleName
			) {
				res.status(200).sendFile(path.resolve(__dirname, './public/article.html'));
			}
		});
		// next();
	}
	// (req, res, next) => {
	// 	res.status(404).json({
	// 		request: { success: true, reason: 'Not Found', status: 404, File: req.params.articleName },
	// 	});
	// 	next();
	// }
);
app.get(
	'/tags/:tagName',
	(req, res, next) => {
		data.tags.forEach((x) => {
			// console.log(req.params.tagName, x.name.toLowerCase());
			if (x.name.toLowerCase() == req.params.tagName) {
				res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
			}
		});
		// next();
	}
	// (req, res, next) => {
	// 	res.status(404).json({
	// 		request: { success: true, reason: 'Not Found', status: 404, File: req.params.tagName },
	// 	});
	// }
);

app.get('/search/:searchItem', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
});
// app.get('/user/:id', (req, res) => {
// 	res.sendFile(path.resolve(__dirname, './public/user.html'));
// });

app.get('/user/:userId', (req, res) => {
	res.status(200).sendFile(path.resolve(__dirname, './public/user.html'));
});
// ? /////////////////////////  Data GET requests  ////////////////////////////////////////

app.get(
	'/data/articles',
	(req, res, next) => {
		// console.log(req.query, Object.entries(req.query).length);
		if (Object.entries(req.query).length === 0) {
			res.json(data.articleData);
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
			let userId = parseInt(req.query.userId);
			let articleDataContainer = [];
			data.articleData.map((x, id) => {
				if (x.author.id === userId) {
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
		}
	},
	(req, res, next) => {
		res.json({
			success: true,
			resourceAvailability: false,
		});
	}
);
app.get('/data/articles/:articleName', (req, res) => {
	data.articleData.map((x, id) => {
		// console.log(x.title, req.params.articleName);
		if (
			x.title
				.replace(/[^a-zA-Z0-9\s]/gm, '')
				.replace(/\s/gm, '-')
				.replace(/-$/gm, '')
				.toLowerCase() === req.params.articleName
		) {
			res.json([data.articleData[id], data.users[data.articleData[id].author.id]]);
		}
	});
	// console.log(`Request Article Name: ${req.params.articleName}`);
});

app.get('/data/users/:userId', (req, res) => {
	data.users.map((x, id) => {
		if (x.id == req.params.userId) {
			res.json(data.users[id]);
		}
	});
});

app.get('/data/authors/:authorId', (req, res) => {
	data.authors.map((x, id) => {
		if (x.id == req.params.authorId) {
			res.json(data.users.authors[id]);
		}
	});
});
app.get('/data/tags', (req, res) => {
	res.json(data.tags);
});
app.get('/data/tags/:tagName', (req, res) => {
	data.tags.map((x, id) => {
		if (x.name.toLowerCase() == req.params.tagName) {
			res.json(data.tags[id]);
		}
	});
});
//req.protocol + '://' + req.get('host') + req.originalUrl

// ? //////////////////////////////  Data POST requests  ////////////////////////////////////
app.post(
	'/data/submit/sign-in',
	(req, res, next) => {
		console.log(req.body);
		let errObj = { isError: false, errors: [] };
		data.users.forEach((x) => {
			if (
				x.firstName.toLowerCase() == req.body.firstName.toLowerCase() &&
				x.lastName.toLowerCase() == req.body.lastName.toLowerCase()
			) {
				errObj.isError = true;
				errObj.errors.push(`nameExists`);
			}
			if (x.email == req.body.email) {
				errObj.isError = true;
				errObj.errors.push('emailExists');
			}
			// if (x.email === req.body.email && x.password === req.body.password) {
			// 	res.json({
			// 		success: true,
			// 		message: 'Successfully created the account.',
			// 		user: { name: `${req.body.firstName} ${req.body.lastName}`, userType: x.userType },
			// 	});
			// }
		});

		// console.log(errObj.errors);
		//jshint ignore:start
		errObj.isError ? res.json({ success: true, isError: true, message: errObj }) : next();
		//jshint ignore:end
	},
	(req, res, next) => {
		res.json({ success: true, isError: false, message: 'Account created successfully' });
	}
);

app.post('/data/submit/log-in', (req, res, next) => {
	const { email, password } = req.body;
	data.users.forEach((x) => {
		if (x.email === email && x.password === password) {
			res.json({ success: true, isError: false, message: 'Successfully logged in.' });
		} else res.json({ success: true, isError: true, message: 'Email or password is incorrect.' });
	});
});

// ? ////////////////////////////// Handles unknown requests ////////////////////////////////

app.all('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, './public/404.html'));
	// res.json({ success: false });
	console.log(
		`Error : File not found. \n\t${req.protocol}\:\/\/${req.get('host') + req.originalUrl}`,
		req.url
	);
});

// ? ////////////////////////// Server call /////////////////////////////////////////////////

app.listen(5500, () => console.log('user hit the server'));
