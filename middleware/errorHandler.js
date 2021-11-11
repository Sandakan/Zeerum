const errorHandler = (req, res, next) => {
	if (err) {
		console.log(err);
		res.status(500).json({
			success: false,
			status: 500,
			isError: true,
			message: 'Internal server error occurred. Please try again later.',
			error: err,
		});
	}
};

module.exports = errorHandler;
