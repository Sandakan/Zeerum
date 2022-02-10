const notFound = (isApiResponse = false, customMessage = null) => {
	return (req, res) => {
		console.log(
			`Error : Resource not found. \n\tRequest method : ${req.method}\n\tRequested URL : ${
				req.protocol
			}\:\/\/${req.get('host') + req.originalUrl}`
		);
		if (isApiResponse) {
			res.json({
				success: false,
				status: 404,
				message: customMessage || `Resource not found.`,
				requestedMethod: req.method,
				requestedUrl: `${req.protocol}\:\/\/${req.get('host') + req.originalUrl}`,
				RequestedResource: `${req.get('host')}${req.originalUrl}`.split('/').at(-1),
			});
		} else {
			res.render('404', { csrfToken: req.csrfToken(), theme: req.session.theme });
		}
	};
};

module.exports = notFound;
