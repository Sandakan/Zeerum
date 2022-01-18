// jshint -W014
// ? PACKAGES //////////////////////////////////////////////////////////////////////////////////////////
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const expressIp = require('express-ip');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const csrf = require('csurf');
require('dotenv').config();
require('express-async-errors');
// const nodemailer = require('nodemailer');
// const path = require('path');
// const ejs = require('ejs');
// const fileUpload = require('express-fileupload');
// const fs = require('fs');
// const bcrypt = require('bcryptjs');
// const { check, validationResult } = require('express-validator');
// const passport = require('passport');
// const { MongoClient } = require('mongodb');
// const utils = require('util');
// const { readFile, writeFile } = require('fs');
//? DATA IMPORT //////////////////////////////////////////////////////////////////////////////////////////

// const data = require('./data/data');

// ? MIDDLEWARE & FUNCTION IMPORTS   /////////////////////////////////////////////////////////////////////
const authenticate = require('./middleware/authenticate');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound.js');
// const { createAccountLimiter } = require('./middleware/rate-limit');
const {
	connectToDB,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	createArticle,
} = require('./config/database');
connectToDB();
const csrfProtection = csrf({ cookie: true });
const validateFileExtensions = require('./middleware/validateFileExtensions');
// ? ROUTES /////////////////////////////////////////////////////////////////////////////////////////////////////
const articleRouter = require('./routes/articlesRouter.js');
const searchRouter = require('./routes/searchRouter.js');
const usersRouter = require('./routes/usersRouter.js');
const categoriesRouter = require('./routes/categoriesRouter.js');
const profileRouter = require('./routes/profileRouter.js');
const uploadRouter = require('./routes/uploadRouter.js');
const loginRouter = require('./routes/loginRouter.js');
const signupRouter = require('./routes/signupRouter.js');

// ? /////////////////////////////////////////////////////////////////////////////////////////////////////
const app = express();

// ? ///////////////////////////////// GLOBAL MIDDLEWARE ///////////////////////////////////////////////
// view engine
app.set('view engine', 'ejs');
// public files
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
			clientPromise: mongoose
				.connect(process.env.DATABASE_CONNECTION_STRING, {
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

app.get('/', csrfProtection, (req, res) => {
	res.render('index', {
		status: 'Development in progress.',
		csrfToken: req.csrfToken(),
		theme: req.session.theme,
	});
});

app.get('/discover', csrfProtection, (req, res) => {
	res.render('discover', { csrfToken: req.csrfToken(), theme: req.session.theme });
});

app.get('/write', csrfProtection, (req, res) => {
	res.render('write', { csrfToken: req.csrfToken(), theme: req.session.theme });
});
app.get('/about', csrfProtection, (req, res) => {
	res.render('about', { csrfToken: req.csrfToken(), theme: req.session.theme });
});

app.get('/profile', csrfProtection, authenticate, (req, res) => {
	res.render('profile', { csrfToken: req.csrfToken(), theme: req.session.theme });
});

app.get('/404', csrfProtection, (req, res) => {
	res.render('404', { csrfToken: req.csrfToken(), theme: req.session.theme });
});

app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) console.log(err);
		res.status(308).redirect('/');
	});
});

app.get('/change-theme', (req, res) => {
	const theme = req.query.theme;
	if (theme === 'dark') req.session.theme = 'dark-mode';
	else if (theme === 'light') req.session.theme = 'light-mode';
	else {
		if (!req.session.theme || req.session.theme === 'light-mode') req.session.theme = 'dark-mode';
		else req.session.theme = 'light-mode';
	}
	if (req.session.theme === 'dark-mode')
		res.json({
			success: true,
			status: 200,
			message: 'Theme changed from light to dark successfully.',
		});
	else
		res.json({
			success: true,
			status: 200,
			message: 'Theme changed from dark to light successfully.',
		});
});

app.use('/login', loginRouter);

app.use('/signup', signupRouter);

//? //////////////////////////////////////////////////////////////////
/*
.replace(/[^a-zA-Z0-9\s]/gm, '')
				.replace(/\s/gm, '-')
				.replace(/-$/gm, '')
				.toLowerCase()
*/
app.get('/articles/:article', csrfProtection, async (req, res, next) => {
	const articleId = isNaN(Number(req.params.article))
		? req.params.article
		: Number(req.params.article);
	const articleData = isNaN(articleId)
		? await requestData('articles', { urlSafeTitle: articleId })
		: await requestData('articles', { articleId: articleId });
	// console.log(articleId, articleData);
	if (articleData.success && articleData.data.length !== 0)
		res.render('article', { csrfToken: req.csrfToken(), theme: req.session.theme });
	else next();
});

app.get('/categories/:category', csrfProtection, async (req, res, next) => {
	const category = isNaN(Number(req.params.category))
		? req.params.category.toLowerCase()
		: Number(req.params.category);
	const categoryData = isNaN(category)
		? await requestData('categories', { name: { $regex: new RegExp(category, 'i') } })
		: await requestData('categories', { categoryId: category });
	if (categoryData.success && categoryData.data.length !== 0)
		res.render('categories', { csrfToken: req.csrfToken(), theme: req.session.theme });
	else next();
});

app.get('/search/:searchItem', csrfProtection, (req, res) => {
	res.render('categories', { csrfToken: req.csrfToken(), theme: req.session.theme });
});

app.get('/user/:user', csrfProtection, async (req, res, next) => {
	const userId = isNaN(Number(req.params.user)) ? req.params.user : Number(req.params.user);
	if (
		req.session.userId !== undefined &&
		(req.session.userId === userId || userId.toString().toLowerCase() === req.session.username)
	)
		res.redirect('/profile');
	else {
		const userData = isNaN(userId)
			? await checkUser({
					firstName: userId.split('-')[0].replace(/^\w/, (x) => x.toUpperCase()),
					lastName: userId.split('-')[1].replace(/^\w/, (x) => x.toUpperCase()),
			  })
			: await checkUser({ userId: userId });
		// console.log(userId, userData);
		if (userData.success && userData.isThereAUser)
			res.render('user', { csrfToken: req.csrfToken(), theme: req.session.theme });
		else next();
	}
});
// ? /////////////////////////  Data GET and POST requests  ////////////////////////////////////////

app.use('/data/search', searchRouter);

app.use('/data/articles/', articleRouter);

app.use('/data/users/', usersRouter);

app.use('/data/categories/', categoriesRouter);

app.use('/data/profile', profileRouter);

app.use('/data/upload', uploadRouter);

// ? ////////////////////////////// Handles unknown requests ////////////////////////////////

app.all('*', csrfProtection, notFound(false));

// ? ////////////////////////// ERROR HANDLER AND SERVER CALL /////////////////////////////////////////////////
app.use(errorHandler(false));

app.listen(process.env.PORT || 5000, () =>
	console.log(`user hit the server on ${process.env.PORT}`)
);
