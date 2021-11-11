const authorize = (req, res, next) => {
	if (req.session.username || req.session.userId) {
		req.isUserAuthenticated = true;
		next();
	} else {
		req.isUserAuthenticated = false;
		res.status(401).json({
			success: false,
			status: 401,
			message: 'Access denied. Are you signed in?',
		});
	}
};

module.exports = authorize;
