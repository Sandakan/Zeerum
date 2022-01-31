const {
	testDatabaseConnection,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	createArticle,
} = require('../config/database');

const editArticle = async (req, res, next) => {
	if (req.params.article !== undefined) {
		const article = await requestData('articles', {
			articleId: Number(req.params.article),
			'author.userId': Number(req.session.userId),
		}).then(
			(result) => result,
			(err) => next(err)
		);
		if (article.success && article.data.length > 0) {
			res.json({
				success: true,
				status: 200,
				data: article.data,
			});
		} else
			res.json({
				success: false,
				status: 401,
				message: 'You are not the author of the article you are trying to edit.',
			});
	} else
		res.json({
			success: false,
			status: 400,
			message: 'Invalid request to /write/edit/',
		});
};

const sendWritePage = (req, res) => {
	res.render('write', { csrfToken: req.csrfToken(), theme: req.session.theme });
};

module.exports = { sendWritePage, editArticle };
