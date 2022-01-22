const router = require('express').Router();

const fileUpload = require('express-fileupload');
const path = require('path');

const validateFileExtensions = require('../middleware/validateFileExtensions');
const authenticate = require('../middleware/authenticate.js');
const isAuthor = require('../middleware/isAuthor.js');

const { uploadNewArticle, changeProfilePicture } = require('../controller/upload.js');

router
	.route('/write/add-new-article')
	.post(authenticate)
	.post(isAuthor)
	.post(
		fileUpload({
			useTempFiles: true,
			tempFileDir: path.join(path.dirname(__dirname), './temp/'),
			createParentPath: true,
			preserveFilename: true,
			preserveExtension: true,
			debug: true,
		})
	)
	.post(validateFileExtensions(['image/jpeg', 'image/png', 'image/webp']))
	.post(uploadNewArticle);

router
	.route('/profile/user-profile-picture')
	.post(authenticate)
	.post(
		fileUpload({
			useTempFiles: true,
			tempFileDir: path.join(path.dirname(__dirname), './temp/'),
			createParentPath: true,
			preserveFilename: true,
			preserveExtension: true,
			debug: true,
		})
	)
	.post(validateFileExtensions(['image/jpeg', 'image/png', 'image/webp']))
	.post(changeProfilePicture);

module.exports = router;
