const {
	connectToDB,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	createArticle,
} = require('../config/database');

// ? FOR ACCESSING ALL THE ARTICLES. ** CAN BE REMOVED IN THE FUTURE **
const sendAllArticles = async (req, res, next) => {
	if (req.query.allArticles && req.query.allArticles === 'true') {
		const limit = Number(req.query.limit) || 0;
		const articleData = await requestData(
			'articles',
			{},
			{ article: 0, comments: 0, footnotes: 0 },
			limit
		);
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
};

// ? FOR ACCESSING ARTICLES FILTERED BY THE AUTHOR ID
const sendArticlesByAuthorId = async (req, res, next) => {
	if (req.query.authorUserId) {
		const limit = Number(req.query.limit) | 0;
		const authorUserId = isNaN(Number(req.query.authorUserId))
			? req.query.authorUserId
			: Number(req.query.authorUserId);
		const articleData = isNaN(authorUserId)
			? await requestData(
					'articles',
					{
						'author.name': `${authorUserId
							.split('-')[0]
							.replace(/^\w/, (x) => x.toUpperCase())} ${authorUserId
							.split('-')[1]
							.replace(/^\w/, (x) => x.toUpperCase())}`,
					},
					{},
					limit
			  )
			: await requestData(
					'articles',
					{
						'author.userId': Number(authorUserId),
					},
					{},
					limit
			  );
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
};

// ? FOR REQUESTING ARTICLES BOOKMARKED BY THE USER
const sendArticlesByUserBookmarked = async (req, res, next) => {
	if (req.query.userBookmarked === 'true') {
		const limit = Number(req.query.limit) | 0;
		const articleData = await requestData(
			'articles',
			{
				'reactions.bookmarks': req.session.userId,
			},
			{},
			limit
		);
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
};

// ? ARTICLES FILTERED BY ITS' RESPECTIVE CATEGORY
const sendArticlesByCategory = async (req, res, next) => {
	if (req.query.categoryId) {
		const limit = Number(req.query.limit) | 0;
		const category = isNaN(Number(req.query.categoryId))
			? req.query.categoryId
			: await requestData(
					'categories',
					{ categoryId: Number(req.query.categoryId) },
					{ categoryId: false, pictureUrl: false },
					limit
			  ).then((x) => x.data[0].name);
		// console.log(category);
		const articleData = await requestData('articles', {
			categories: { $regex: RegExp(category, 'i') },
		});
		// console.log(category, articleData);
		if (articleData.success && articleData.length !== 0) {
			res.json({
				success: true,
				status: 200,
				message: `Request successful.`,
				category: category,
				data: articleData.data,
			});
		} else
			res.json({
				success: false,
				status: 404,
				message: `No articles with category/categoryId '${category}' found.`,
			});
	} else next();
};

// SHARE ARTICLE
const shareArticleCount = async (req, res, next) => {
	if (req.query.shareArticle === 'true') {
		await updateData(
			'articles',
			{ urlSafeTitle: req.params.article },
			{ $inc: { 'reactions.shares': 1 } }
		);
		res.json({ success: true, status: 200, message: `You shared ${req.params.article}` });
	} else if (req.query.shareArticle === 'false') {
		res.json({
			success: false,
			status: 400,
			message: `Invalid request to share articles ${req.params.article}`,
		});
	} else next();
};

// SEND ARTICLE DATA
const sendArticle = async (req, res) => {
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
			{ $inc: { 'views.allTime': 1 } },
			true
		);
		// ? FOR SORTING COMMENTS BY ITS CREATED DATE FROM LATEST TO OLDEST
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
};

// ?  LIKE ARTICLE
const likeArticle = async (req, res, next) => {
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
};

// 	//? BOOKMARK ARTICLE
const bookmarkArticle = async (req, res, next) => {
	if (req.query.bookmarkArticle) {
		// ? If you request to bookmark the article
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
};

// ? FOR COMMENTING ON THE ARTICLE
const commentOnArticle = async (req, res, next) => {
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
};

const likeCommentsOnArticles = async (req, res, next) => {
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
};

module.exports = {
	sendAllArticles,
	sendArticlesByAuthorId,
	sendArticlesByCategory,
	sendArticlesByUserBookmarked,
	sendArticle,
	shareArticleCount,
	likeArticle,
	bookmarkArticle,
	commentOnArticle,
	likeCommentsOnArticles,
};
