module.exports = (acceptedMIMETypes = []) => {
	return (req, res, next) => {
		if (req.files) {
			const files = Object.values(req.files);
			let isAccepted = false;
			for (let file of files) {
				if (file.constructor === Array) {
					for (let x of file) {
						for (let mimeType of acceptedMIMETypes) {
							if (x.mimetype === mimeType) {
								isAccepted = true;
							}
						}
					}
				} else {
					for (let mimeType of acceptedMIMETypes) {
						if (file.mimetype === mimeType) {
							isAccepted = true;
						}
					}
				}
			}
			if (!isAccepted)
				res.status(415).json({
					success: false,
					status: 415, // Unsupported media type
					message: `Unsupported media type. Please check whether your uploaded file/s have accepted MIME types. Accepted MIME types are ${acceptedMIMETypes}`,
				});
			else return next();
		} else return next();
	};
};
