const authorize = (isApiRequest = true) => {
	return (req, res, next) => {
		if (req.session.username || req.session.userId) {
			req.isUserAuthenticated = true;
			next();
		} else {
			if (isApiRequest) {
				req.isUserAuthenticated = false;
				res.status(401).json({
					success: false,
					status: 401,
					message: 'Access denied. Are you signed in?',
				});
			} else res.status(307).redirect('/signup');
		}
	};
};

module.exports = authorize;
