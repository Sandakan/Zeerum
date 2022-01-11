// jshint -W014
// ? PACKAGES //////////////////////////////////////////////////////////////////////////////////////////
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const ejs = require('ejs');
const express = require('express');
const expressIp = require('express-ip');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
const path = require('path');
const session = require('express-session');
const csrf = require('csurf');
require('dotenv').config();
require('express-async-errors');
// const passport = require('passport');
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
	// res.status(200).sendFile(path.resolve(__dirname, './public/index.html'));
	res.render('index', { status: 'Development in progress.', csrfToken: req.csrfToken() });
});

app.get('/discover', csrfProtection, (req, res) => {
	res.render('discover', { csrfToken: req.csrfToken() });
	// res.status(200).sendFile(path.resolve(__dirname, './public/discover.html'));
});

app.get('/write', csrfProtection, (req, res) => {
	res.render('write', { csrfToken: req.csrfToken() });
	// res.status(200).sendFile(path.resolve(__dirname, './public/write.html'));
});
app.get('/about', csrfProtection, (req, res) => {
	res.render('about', { csrfToken: req.csrfToken() });
	// res.status(200).sendFile(path.resolve(__dirname, './public/about.html'));
});

app.get('/login', csrfProtection, (req, res) => {
	if (req.session.userId !== undefined || req.session.username)
		res.status(307).redirect('/profile');
	else res.render('login', { csrfToken: req.csrfToken() });
	// res.status(200).sendFile(path.resolve(__dirname, './public/login.html'));
});

app.get('/signup', csrfProtection, (req, res) => {
	if (req.session.username || req.session.userId !== undefined)
		res.status(307).redirect('/profile');
	else res.render('signup', { csrfToken: req.csrfToken() });
	//  res.status(200).sendFile(path.resolve(__dirname, './public/signup.html'));
});

app.get('/profile', csrfProtection, authenticate, (req, res) => {
	res.render('profile', { csrfToken: req.csrfToken() });
	// res.status(200).sendFile(path.resolve(__dirname, './public/profile.html'));
});

app.get('/404', csrfProtection, (req, res) => {
	res.render('404', { csrfToken: req.csrfToken() });
	// res.status(200).sendFile(path.resolve(__dirname, './public/404.html'));
});

app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) console.log(err);
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
		res.render('article', { csrfToken: req.csrfToken() });
	// res.status(200).sendFile(path.resolve(__dirname, './public/article.html'));
	else next();
});

app.get('/tags/:tag', csrfProtection, async (req, res, next) => {
	const tag = isNaN(Number(req.params.tag))
		? req.params.tag.toLowerCase()
		: Number(req.params.tag);
	const tagData = isNaN(tag)
		? await requestData('tags', { name: { $regex: new RegExp(tag, 'i') } })
		: await requestData('tags', { tagId: tag });
	if (tagData.success && tagData.data.length !== 0)
		res.render('tag', { csrfToken: req.csrfToken() });
	// res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
	else next();
});

app.get('/search/:searchItem', csrfProtection, (req, res) => {
	res.render('tag', { csrfToken: req.csrfToken() });
	// res.status(200).sendFile(path.resolve(__dirname, './public/tag.html'));
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
			res.render('user', { csrfToken: req.csrfToken() });
		// res.status(200).sendFile(path.resolve(__dirname, './public/user.html'));
		else next();
	}
});
// ? /////////////////////////  Data GET and POST requests  ////////////////////////////////////////

app.get('/data/search/:searchPhrase', async (req, res, next) => {
	const searchPhrase = req.params.searchPhrase;
	// console.log(searchPhrase);
	const articleData = await requestData('articles', {
		title: { $regex: new RegExp(`${searchPhrase}`, 'i') },
	});
	const tagData = await requestData('tags', {
		name: { $regex: new RegExp(`${searchPhrase}`, 'i') },
	});
	const userData = await checkUser(
		{
			username: { $regex: new RegExp(`${searchPhrase}`, 'i') },
		},
		{ _id: false, password: false }
	);
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
	// ? FOR ACCESSING ALL THE ARTICLES. ** CAN BE REMOVED IN THE FUTURE **
	async (req, res, next) => {
		if (Object.entries(req.query).length === 0) {
			const articleData = await requestData('articles');
			// Sorts the data from latest to oldest
			articleData.data.sort(
				(a, b) => new Date(b.releasedDate).getTime() - new Date(a.releasedDate).getTime()
			);
			if (articleData.success && articleData.data.length !== 0)
				res.status(200).json({
					success: true,
					status: 200,
					message: `Request successful.`,
					data: articleData.data,
					ipInfo: req.ipInfo,
				});
			else
				res.status(404).json({
					success: false,
					status: 404,
					message: 'No articles found. Please try again later.',
				});
		} else next();
	},
	// ? FOR ACCESSING ARTICLES FILTERED BY THE AUTHOR ID
	async (req, res, next) => {
		if (req.query.authorUserId) {
			const authorUserId = isNaN(Number(req.query.authorUserId))
				? req.query.authorUserId
				: Number(req.query.authorUserId);
			const articleData = isNaN(authorUserId)
				? await requestData('articles', {
						'author.name': `${authorUserId
							.split('-')[0]
							.replace(/^\w/, (x) => x.toUpperCase())} ${authorUserId
							.split('-')[1]
							.replace(/^\w/, (x) => x.toUpperCase())}`,
				  })
				: await requestData('articles', {
						'author.userId': Number(authorUserId),
				  });
			if (articleData.success && articleData.data.length !== 0) {
				res.status(200).json({
					success: true,
					status: 200,
					message: `Request successful.`,
					data: articleData.data,
				});
			} else
				res.status(404).json({
					success: false,
					status: 404,
					message: 'No articles found. Please try again later.',
				});
		} else next();
	},
	// ? FOR REQUESTING ARTICLES BOOKMARKED BY THE USER
	async (req, res, next) => {
		if (req.query.userBookmarked === 'true') {
			const articleData = await requestData('articles', {
				'reactions.bookmarks': req.session.userId,
			});
			if (articleData.success && articleData.data.length > 0) {
				res.json({
					success: true,
					status: 200,
					message: 'Request successful.',
					data: articleData.data,
				});
			} else
				res.json({ success: false, status: 404, message: 'No user bookmarked articles found' });
		} else next();
	},
	// ? ARTICLES FILTERED BY ITS' RESPECTIVE TAG
	async (req, res, next) => {
		if (req.query.tagId) {
			const tag = isNaN(Number(req.query.tagId))
				? req.query.tagId
				: await requestData('tags', { tagId: 1 }, { tagId: false, pictureUrl: false }).then(
						(x) => x.data[0].name
				  );
			// console.log(tag);
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

// ? GET REQUEST TO REQUEST ARTICLE DATA, AND STORE LIKE, BOOKMARK, SHARE RESULTS.
app.get(
	'/data/articles/:article',
	// SHARE ARTICLE
	async (req, res, next) => {
		if (req.query.shareArticle === 'true') {
			const article = await requestData('articles', { urlSafeTitle: req.params.article })
				.then((res) => res.data[0])
				.catch((err) => next(err));
			await updateData(
				'articles',
				{ urlSafeTitle: req.params.article },
				{ $set: { 'reactions.shares': article.reactions.shares + 1 } }
			);
			res.json({ success: true, status: 200, message: `You shared ${req.params.article}` });
		} else if (req.query.shareArticle === 'false') {
			res.json({
				success: false,
				status: 400,
				message: `Invalid request to share articles ${req.params.article}`,
			});
		} else next();
	},
	// SEND ARTICLE DATA
	async (req, res) => {
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
			// const authorData = await requestData('users', {
			// 	userId: articleData.data[0].author.userId,
			// });
			const { updatedData: authorData } = await updateUserData(
				{ userId: articleData.data[0].author.userId },
				{
					$set: {
						authorData: {
							allTimeViews: articleData.data[0].views.allTime + 1,
							allTimeLikes: articleData.data[0].reactions.likes.length,
						},
					},
				},
				true
			);
			const { updatedData: updatedArticleData } = await updateData(
				'articles',
				{ urlSafeTitle: req.params.article },
				{ $set: { 'views.allTime': articleData.data[0].views.allTime + 1 } },
				true
			);
			// // ? FOR SORTING COMMENTS BY ITS CREATED DATE FROM LATEST TO OLDEST
			// const comments = articleData.data[0].comments.sort(
			// 	(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
			// );
			// updatedArticleData[0].comments = comments;

			if (req.session.user) {
				res.status(200).json({
					success: true,
					status: 200,
					data: {
						article: updatedArticleData[0],
						author: {
							userId: authorData.userId,
							firstName: authorData.firstName,
							lastName: authorData.lastName,
							fullName: `${authorData.firstName}-${authorData.lastName}`,
							profilePictureUrl: authorData.profilePictureUrl,
						},
						user: {
							followers: req.session.user.followers || null,
							followings: req.session.user.followings || null,
						},
					},
				});
			} else
				res.status(200).json({
					success: true,
					status: 200,
					data: {
						article: updatedArticleData[0],
						author: {
							userId: authorData.userId,
							firstName: authorData.firstName,
							lastName: authorData.lastName,
							fullName: `${authorData.firstName}-${authorData.lastName}`,
							profilePictureUrl: authorData.profilePictureUrl,
						},
						user: undefined,
					},
				});
		} else
			res.status(404).json({
				success: false,
				message: `There is no article/articleId named ${req.params.article}`,
			});
	}
);
// ? POST REQUEST TO /DATA/ARTICLES/:ARTICLE FOR LIKING ARTICLES, BOOKMARKING ARTICLES, ADDING COMMENTS, LIKING COMMENTS.
app.post(
	'/data/articles/:article',
	authenticate,
	// ?  LIKE ARTICLE
	async (req, res, next) => {
		if (req.query.likeArticle) {
			// ? IF YOU REQUEST TO LIKE THE ARTICLE
			const article = await requestData('articles', { urlSafeTitle: req.params.article }).then(
				(res) => res.data[0]
			);
			if (req.query.likeArticle === 'true' && req.session.userId !== undefined) {
				if (!article.reactions.likes.includes(Number(req.session.userId))) {
					// ? if you haven't liked the same article before
					article.reactions.likes.push(req.session.userId);
					await updateData(
						'articles',
						{ urlSafeTitle: req.params.article },
						{ $set: { 'reactions.likes': article.reactions.likes } }
					);
					res.json({ success: true, status: 200, message: `You liked ${req.params.article}` });
				} else {
					// ? if you have liked the same article before
					res.json({
						success: false,
						status: 400,
						message: `You have already liked ${req.params.article}`,
					});
				}
			} else if (req.query.likeArticle === 'false' && req.session.userId !== undefined) {
				if (article.reactions.likes.includes(Number(req.session.userId))) {
					// ? if you haven't liked the same article before
					const likedIdPosition = article.reactions.likes.indexOf(req.session.userId);
					article.reactions.likes.splice(likedIdPosition, 1);
					await updateData(
						'articles',
						{ urlSafeTitle: req.params.article },
						{ $set: { 'reactions.likes': article.reactions.likes } }
					);
					res.json({
						success: true,
						status: 200,
						message: `You disliked ${req.params.article}`,
					});
				} else {
					// ? if you have liked the same article before
					res.json({
						success: false,
						status: 400,
						message: `You have already disliked ${req.params.article}`,
					});
				}
			} else
				res.json({
					success: false,
					status: 400,
					message: `Invalid request to like ${req.params.article}`,
				});
		} else next();
	},
	//? BOOKMARK ARTICLE
	async (req, res, next) => {
		if (req.query.bookmarkArticle) {
			// ? If you request to share the article
			const user = req.session.user;
			const article = await requestData('articles', { urlSafeTitle: req.params.article }).then(
				(res) => res.data[0]
			);
			if (req.query.bookmarkArticle === 'true' && req.session.userId !== undefined) {
				if (!article.reactions.bookmarks.includes(Number(req.session.userId))) {
					// ? if you haven't bookmarked the same article before
					article.reactions.bookmarks.push(Number(req.session.userId));
					user.bookmarks.push(Number(article.articleId));
					await updateData(
						'articles',
						{ urlSafeTitle: req.params.article },
						{ $set: { 'reactions.bookmarks': article.reactions.bookmarks } }
					);
					await updateUserData(
						{ userId: req.session.userId },
						{ $set: { bookmarks: user.bookmarks } }
					);
					req.session.user.bookmarks = user.bookmarks;
					res.json({ success: true, status: 200, message: `You liked ${req.params.article}` });
				} else {
					// ? if you have bookmarked the same article before
					res.json({
						success: false,
						status: 400,
						message: `You have already bookmarked ${req.params.article}`,
					});
				}
			} else if (req.query.bookmarkArticle === 'false' && req.session.userId !== undefined) {
				if (article.reactions.bookmarks.includes(Number(req.session.userId))) {
					// ? if you haven't un-bookmarked the same article before
					const userBookmarkedIdPosition = user.bookmarks.indexOf(article.articleId);
					const bookmarkedIdPosition = article.reactions.bookmarks.indexOf(req.session.userId);
					article.reactions.bookmarks.splice(bookmarkedIdPosition, 1);
					user.bookmarks.splice(userBookmarkedIdPosition, 1);
					await updateData(
						'articles',
						{ urlSafeTitle: req.params.article },
						{ $set: { 'reactions.bookmarks': article.reactions.bookmarks } }
					);
					await updateUserData(
						{ userId: req.session.userId },
						{ $set: { bookmarks: user.bookmarks } }
					);
					req.session.user.bookmarks = user.bookmarks;
					res.json({
						success: true,
						status: 200,
						message: `You un-bookmarked ${req.params.article}`,
					});
				} else {
					// ? if you have un-bookmarked the same article before
					res.json({
						success: false,
						status: 400,
						message: `You have already un-bookmarked ${req.params.article}`,
					});
				}
			} else
				res.json({
					success: false,
					message: `Invalid request to bookmark on ${req.params.article}`,
				});
		} else next();
	},
	// ? FOR COMMENTING ON THE ARTICLE
	async (req, res, next) => {
		if (req.query.commentOnArticle && req.body.userId && req.body.commentContent) {
			const { userId, commentContent } = req.body;
			if (!isNaN(Number(userId)) && typeof commentContent === 'string') {
				const article = await requestData('articles', {
					urlSafeTitle: req.params.article,
				}).then((res) => res.data[0]);
				article.comments.push({
					userId: Number(userId),
					date: new Date(),
					isEdited: false,
					editedDate: null,
					comment: commentContent,
					likedUsers: [],
					replies: [],
				});
				await updateData(
					'articles',
					{ urlSafeTitle: req.params.article },
					{ $set: { comments: article.comments } }
				).then((result) => {
					if (result.success) {
						res.json({
							success: true,
							status: 200,
							commentId: article.comments.length - 1,
							message: `Commented on ${req.params.article}`,
						});
					}
				});
			} else
				res.json({
					success: false,
					status: 400,
					message: `Invalid request to comment to article ${req.paramas.article} without required parameters`,
				});
		} else next();
	},
	async (req, res, next) => {
		// to like and unlike comments
		if (req.query.likeComment) {
			const { commentId, userId, likeComment } = req.query;
			// console.log('commentId', commentId, 'userId', userId, 'likeComment', likeComment);
			if (!isNaN(Number(commentId)) && !isNaN(Number(userId)) && likeComment !== null) {
				const article = await requestData('articles', {
					urlSafeTitle: req.params.article,
				}).then((res) => res.data[0]);
				if (likeComment === 'true') {
					if (!article.comments[Number(commentId)].likedUsers.includes(Number(userId))) {
						// if you haven't liked the same comment before
						article.comments[Number(commentId)].likedUsers.push(Number(userId));
						await updateData(
							'articles',
							{ urlSafeTitle: req.params.article },
							{ $set: { comments: article.comments } }
						);
						res.json({
							success: true,
							status: 200,
							message: `Liked comment with id ${commentId} by user with id ${userId}`,
						});
					} else {
						// if you have liked the same comment before
						res.json({
							success: false,
							status: 400,
							message: `You have already liked the comment with id ${commentId} on ${req.params.article}.`,
						});
					}
				} else if (likeComment === 'false') {
					if (article.comments[Number(commentId)].likedUsers.includes(Number(userId))) {
						// if you haven't dis-liked this comment before
						const userIdPosition = article.comments[Number(commentId)].likedUsers.indexOf(
							Number(userId)
						);
						article.comments[Number(commentId)].likedUsers.splice(userIdPosition, 1);
						await updateData(
							'articles',
							{ urlSafeTitle: req.params.article },
							{ $set: { comments: article.comments } }
						);
						res.json({
							success: true,
							status: 200,
							message: `Disliked comment with id ${commentId} by user with id ${userId}`,
						});
					} else {
						res.json({
							success: false,
							status: 400,
							message: `You have already disliked this comment before.`,
						});
					}
				}
			} else
				res.json({
					success: false,
					status: 400,
					message: `Invalid request to /data//articles/${req.params.article}?likeComment without required parameters.`,
				});
		} else
			res.json({
				success: false,
				status: 400,
				message: `Invalid request to /data/articles/${req.params.article}`,
			});
	}
);

app.get('/data/users/:user', async (req, res, next) => {
	let user = isNaN(Number(req.params.user)) ? req.params.user : Number(req.params.user);
	const userData = isNaN(Number(req.params.user))
		? await checkUser(
				{
					firstName: user.split('-')[0].replace(/^\w/, (x) => x.toUpperCase()),
					lastName: user.split('-')[1].replace(/^\w/, (x) => x.toUpperCase()),
				},
				{ password: false }
		  )
		: await checkUser({ userId: user }, { email: false, password: false });

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
			// console.log(req.query.followUser, req.query.followingUserId);
			let userData = await checkUser({ userId: req.session.userId });
			const followingUserId = Number(req.query.followingUserId);
			let followingUserData = await checkUser({ userId: followingUserId });
			if (req.query.followUser === 'true') {
				// ? If use wants to follow
				if (followingUserData.success && followingUserData.isThereAUser && userData.success) {
					if (!userData.userData[0].followings.includes(followingUserId)) {
						userData.userData[0].followings.push(Number(followingUserId));
						followingUserData.userData[0].followers.push(Number(req.session.userId));
						// console.log(
						// 	userData.userData[0].followings,
						// 	followingUserData.userData[0].followers
						// );
						await updateUserData(
							{ userId: req.session.userId },
							{ $set: { followings: userData.userData[0].followings } }
						);
						await updateUserData(
							{ userId: followingUserId },
							{ $set: { followers: followingUserData.userData[0].followers } }
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
						// console.log(userData.userData[0]);
						userData.userData[0].followings.splice(positionUser, 1);
						followingUserData.userData[0].followers.splice(positionFollowing, 1);

						await updateUserData(
							{ userId: req.session.userId },
							{ $set: { followings: userData.userData[0].followings } }
						);
						await updateUserData(
							{ userId: followingUserId },
							{ $set: { followers: followingUserData.userData[0].followers } }
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
	// ? CHANGE USER TYPE
	async (req, res, next) => {
		if (req.query.changeUserType) {
			const user = req.session.user;
			if (req.query.changeUserType === 'author' && user.userType === 'reader') {
				user.userType = 'author';
				const { updatedData } = await updateUserData(
					{ userId: req.session.userId },
					{
						$set: {
							userType: 'author',
							authorData: {
								allTimeViews: 0,
								allTimeLikes: 0,
							},
						},
					},
					true
				);
				// console.log(`updated data`, updatedData);
				req.session.user = user;
				res.json({
					success: true,
					status: 200,
					message: `Success on becoming a ${req.query.changeUserType}.`,
				});
			} else if (req.query.changeUserType === 'reader' && user.userType === 'author') {
				user.userType = 'reader';
				// console.log(user);
				const { updatedData } = await updateUserData(
					{ userId: req.session.userId },
					{
						$set: { userType: 'reader' },
						$unset: { authorData: 1 },
					},
					true
				);
				req.session.user = user;
				res.json({
					success: true,
					status: 200,
					message: `Success on becoming a ${req.query.changeUserType}.`,
				});
			} else
				res.status(400).json({
					success: false,
					message: `You are already a ${req.session.user.userType}`,
				});
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
			bookmarks,
		} = req.session.user;

		// const articlesPublished = async (userId) => {
		// 	const articleData = await requestData('articles', { 'author.userId': userId });
		// 	if (articleData.success && articleData.data.length !== 0) return articleData.data.length;
		// 	else return 0;
		// };
		const articleData = await requestData('articles', { 'author.userId': userId });
		if (articleData.success && articleData.data.length !== 0) {
			const { data } = await articleData;
			let allTimeViews = 0;
			let allTimeLikes = 0;

			data.forEach((article) => {
				allTimeLikes += article.reactions.likes.length;
				allTimeViews += article.views.allTime;
			});
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
					articlesPublished: data.length,
					bookmarks: bookmarks,
					allTimeViews: allTimeViews,
					allTimeLikes: allTimeLikes,
				},
			});
		} else {
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
					articlesPublished: 0,
					bookmarks: bookmarks,
				},
			});
		}
	}
);

app.post(
	'/data/upload/write/add-new-article',
	authenticate,
	// For validating if the user is an author.
	(req, res, next) => {
		if (req.session.user.userType !== 'author') {
			res.json({
				success: false,
				status: 401,
				message: 'Unauthorized. You need to be an author to write articles.',
			});
		} else next();
	},
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, './temp/'),
		createParentPath: true,
		preserveFilename: true,
		preserveExtension: true,
		debug: true,
	}),
	// for validating if the uploaded files have accepted mimetypes/extensions.
	validateFileExtensions(['image/jpeg', 'image/png', 'image/webp']),
	async (req, res, next) => {
		if (
			req.body.articleTitle &&
			req.body.articleDescription &&
			req.body.articleFootnotes &&
			req.body.articleBody
		) {
			let { articleTitle, articleDescription, articleFootnotes, articleBody } = req.body;
			const articleId = await countDocuments('articles');
			if (req.files) {
				let imageLocations = {
					articleCoverImg: '',
					articleImages: [],
				};
				const location = `./public/images/articles/${articleId}`;
				fs.mkdir(location, (err) => {
					if (err) console.log(err);
				});
				if (req.files.articleCoverImg) {
					const articleCoverImg = req.files.articleCoverImg;
					articleCoverImg.mv(
						`${location}/articleCoverImg.${articleCoverImg.name.split('.').at(-1)}`,
						async (err) => {
							if (err) return next(err);
							imageLocations.articleCoverImg = `/images/articles/${articleId}/articleCoverImg.${articleCoverImg.name
								.split('.')
								.at(-1)}`;
						}
					);
				}
				if (req.files.articleImages) {
					const articleImages = req.files.articleImages;
					if (articleImages.constructor === Array) {
						for (const articleImg of articleImages) {
							articleImg.mv(`${location}/${articleImg.name}`, (err) => {
								if (err) return next(err);
							});
							articleBody = articleBody.replace(
								new RegExp(articleImg.name, 'm'),
								`/images/articles/${articleId}/${articleImg.name}`
							);
						}
					} else {
						articleImages.mv(`${location}/${articleImages.name}`, (err) => {
							if (err) return next(err);
						});
						articleBody = articleBody.replace(
							new RegExp(`src="${articleImages.name}"`, 'm'),
							`src="/images/articles/${articleId}/${articleImages.name}"`
						);
					}
				}

				createArticle(
					{
						articleId: articleId,
						title: articleTitle,
						description: articleDescription,
						body: articleBody,
						footnotes: articleFootnotes,
						coverImg: `/images/articles/${articleId}/articleCoverImg.${req.files.articleCoverImg.name
							.split('.')
							.at(-1)}`,
					},
					req.session.user
				).then((result) => {
					if (result.success) {
						res.json({
							success: true,
							status: 200,
							message: 'Successfully added your article.',
						});
					} else
						res.json({
							success: false,
							status: 500,
							message: 'Error occurred when adding your article.',
						});
				});
			} else {
				createArticle(
					{
						articleId: articleId,
						title: articleTitle,
						description: articleDescription,
						body: articleBody,
						footnotes: articleFootnotes,
					},
					req.session.user
				).then((result) => {
					if (result.success) {
						res.json({
							success: true,
							status: 200,
							message: 'Successfully added your article.',
						});
					} else
						res.json({
							success: false,
							status: 500,
							message: 'Error occurred when adding your article.',
						});
				});
			}
		} else
			res.json({
				success: false,
				status: 400,
				message: 'Error occurred when adding your article. Missing data in the request.',
			});
	}
);

app.post(
	'/data/upload/profile/user-profile-picture',
	authenticate,
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, './temp/'),
		createParentPath: true,
		preserveFilename: true,
		preserveExtension: true,
		debug: true,
	}),
	// for validating if the uploaded files have accepted mimetypes/extensions.
	validateFileExtensions(['image/jpeg', 'image/png']),
	(req, res, next) => {
		// for uploading profile pictures of the users.
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
						$set: {
							profilePictureUrl: `/images/users/${req.session.user.userType}s/${req.session.userId}/profilePicture.jpg`,
						},
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

// ? //////////////////////////////  Data POST FORM requests  ////////////////////////////////////
app.post(
	'/signup',
	csrfProtection,
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
		// console.log(req.body);
		if (validationErrors.isEmpty()) {
			let errObj = { isError: false, errors: [] };
			const { firstName, lastName, email } = req.body;
			const nameCheck = await checkUser({ firstName, lastName });
			const emailCheck = await checkUser({ email });
			if (nameCheck.isThereAUser) {
				errObj.isError = true;
				errObj.errors.push('nameExists');
			}
			if (emailCheck.isThereAUser) {
				errObj.isError = true;
				errObj.errors.push('emailExists');
			}
			if (errObj.isError)
				res.status(400).json({
					success: false,
					status: 400,
					message: 'Error occurred when signing up.',
					errors: errObj.errors,
				});
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
		const { firstName, lastName, birthday, password, email } = req.body;

		//hash the Passwords
		bcrypt.genSalt(10, (err, salt) => {
			if (err) throw err;
			bcrypt.hash(password, salt, (err, hashedPassword) => {
				if (err) throw err;
				req.body.password = hashedPassword;
				createUser({ ...req.body, country: req.ipInfo.country }, (data) => {
					const { success, userData } = data;
					// console.log(data);
					if (success) {
						req.session.userId = userData.userId;
						req.session.username = `${userData.firstName.toLowerCase()}-${userData.lastName.toLowerCase()}`;
						req.session.user = userData;
						res.status(200).json({
							success: true,
							status: 200,
							message: 'Signed up successfully.',
						});
					} else
						res.status(500).send(
							`<h1>Error occurred when signing up. Please try again later.</h1>`
						);
				});
			});
		});
	}
);

app.post(
	'/log-in',
	csrfProtection,
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
			const data = await checkUser({ email });
			// console.log(data);
			if (data.isThereAUser) {
				bcrypt.compare(password, data.userData[0].password, (err, result) => {
					if (err) throw err;
					if (result) {
						req.session.userId = data.userData[0].userId;
						req.session.username = `${data.userData[0].firstName.toLowerCase()}-${data.userData[0].lastName.toLowerCase()}`;
						req.session.user = data.userData[0];
						// res.status(307).redirect(`/profile`);
						res.json({
							success: true,
							status: 200,
							message: 'Successfully logged in.',
						});
					} else
						res.json({
							success: false,
							status: 400,
							message: 'Error occurred when logging in.',
							errors: ['passwordMismatch'],
						});
				});
			} else
				res.json({
					success: false,
					status: 400,
					message: 'Error occurred when logging in.',
					errors: ['noAccountFound'],
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

app.all('*', csrfProtection, (req, res) => {
	res.render('404', { csrfToken: req.csrfToken() });
	console.log(
		`Error : File not found. \n\tRequest method: ${req.method}\n\t${req.protocol}\:\/\/${
			req.get('host') + req.originalUrl
		}`,
		req.url
	);
});

// ? ////////////////////////// ERROR HANDLER AND SERVER CALL /////////////////////////////////////////////////
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () =>
	console.log(`user hit the server on ${process.env.PORT}`)
);
