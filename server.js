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
// const fs = require('fs');
// const passport = require('passport');
// const utils = require('util');
// const { readFile, writeFile } = require('fs');

// ? MIDDLEWARE & FUNCTION IMPORTS   /////////////////////////////////////////////////////////////////////
const authenticate = require('./middleware/authenticate');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound.js');
const {
	testDatabaseConnection,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	createArticle,
} = require('./config/database');
testDatabaseConnection();
const csrfProtection = csrf({ cookie: true });
const { sendMail } = require('./config/mail.js');
// const validateFileExtensions = require('./middleware/validateFileExtensions');
// ? ROUTES /////////////////////////////////////////////////////////////////////////////////////////////////////
const articleRouter = require('./routes/articlesRouter.js');
const searchRouter = require('./routes/searchRouter.js');
const usersRouter = require('./routes/usersRouter.js');
const categoriesRouter = require('./routes/categoriesRouter.js');
const profileRouter = require('./routes/profileRouter.js');
const uploadRouter = require('./routes/uploadRouter.js');
const loginRouter = require('./routes/loginRouter.js');
const signupRouter = require('./routes/signupRouter.js');
const tagRouter = require('./routes/tagRouter.js');
const writeRouter = require('./routes/writeRouter.js');
const themeRouter = require('./routes/themeRouter.js');
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
app.use(
	cors({
		origin: true,
		optionsSuccessStatus: 200,
	})
);
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

app.get('/profile', csrfProtection, authenticate(false), (req, res) => {
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

app.use('/change-theme', themeRouter);

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
	const articleData = isNaN(Number(req.params.article))
		? await requestData('articles', { urlSafeTitle: req.params.article })
		: await requestData('articles', { articleId: Number(req.params.article) });
	if (articleData.success && articleData.data.length !== 0)
		res.render('article', { csrfToken: req.csrfToken(), theme: req.session.theme });
	else next();
});

app.get('/categories/:category', csrfProtection, async (req, res, next) => {
	const categoryData = isNaN(Number(req.params.category))
		? await requestData('categories', { name: { $regex: new RegExp(req.params.category, 'i') } })
		: await requestData('categories', { categoryId: Number(req.params.category) });
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
			  }).then(
					(res) => res,
					(err) => next(err)
			  )
			: await checkUser({ userId: userId }).then(
					(res) => res,
					(err) => next(err)
			  );
		// console.log(userId, userData);
		if (userData.success && userData.isThereAUser)
			res.render('user', { csrfToken: req.csrfToken(), theme: req.session.theme });
		else next();
	}
});

app.get('/tags/:tag', csrfProtection, (req, res, next) => {
	res.render('categories', { csrfToken: req.csrfToken(), theme: req.session.theme });
});
// ? /////////////////////////  Data GET and POST requests  ////////////////////////////////////////

app.use('/data/search', searchRouter);

app.use('/data/articles/', articleRouter);

app.use('/data/write', writeRouter);

app.use('/data/tags/', tagRouter);

app.use('/data/users/', usersRouter);

app.use('/data/categories/', categoriesRouter);

app.use('/data/profile', profileRouter);

app.use('/data/upload', uploadRouter);

// ? ////////////////////////////// Handles unknown requests ////////////////////////////////

app.all('*', csrfProtection, notFound(false));

// ? ////////////////////////// ERROR HANDLER AND SERVER CALL /////////////////////////////////////////////////
app.use(errorHandler(true));

app.listen(process.env.PORT || 5000, () =>
	console.log(`Server started on port ${process.env.PORT}`)
);
