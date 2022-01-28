const notFound = (isApiResponse = false, customMessage = '') => {
	return (req, res) => {
		console.log(
			`Error : Resource not found. \n\tRequest method: ${req.method}\n\t${req.protocol}\:\/\/${
				req.get('host') + req.originalUrl
			}`,
			req.url
		);
		if (isApiResponse) {
			res.json({
				success: false,
				status: 404,
				message: `Resource not found. ${customMessage}`,
				requestedUrl: req.originalUrl,
			});
		} else {
			res.render('404', { csrfToken: req.csrfToken(), theme: req.session.theme });
		}
	};
};

module.exports = notFound;
