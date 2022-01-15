const errorHandler = (isApiResponse = true) => {
	return (err, req, res, next) => {
		if (isApiResponse) {
			if (err.code === 'EBADCSRFTOKEN') {
				res.status(403).json({
					success: false,
					status: 403,
					message:
						'Access denied. Missing/Invalid CSRF token OR Possible XSRF attack detected.',
				});
			} else if (err) {
				console.log(err);
				res.status(500).json({
					success: false,
					status: 500,
					isError: true,
					message: 'Internal server error occurred. Please try again later.',
				});
			}
		}
	};
};

module.exports = errorHandler;
