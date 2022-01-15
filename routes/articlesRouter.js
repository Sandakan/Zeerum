const express = require('express');
const router = express.Router();

const {
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
} = require('../controller/articles.js');
const authenticate = require('../middleware/authenticate.js');

router
	.route('/')
	.get(sendAllArticles)
	.get(sendArticlesByAuthorId)
	.get(sendArticlesByUserBookmarked)
	.get(sendArticlesByCategory);

router.route('/:article').get(shareArticleCount).get(sendArticle);

router
	.route('/:article')
	.post(authenticate)
	.post(likeArticle)
	.post(bookmarkArticle)
	.post(commentOnArticle)
	.post(likeCommentsOnArticles);

module.exports = router;
