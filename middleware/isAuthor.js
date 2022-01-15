const isAuthor = (req, res, next) => {
	if (req.session.user.userType !== 'author') {
		res.json({
			success: false,
			status: 401,
			message: 'Unauthorized. You need to be an author to write articles.',
		});
	} else next();
};

module.exports = isAuthor;
