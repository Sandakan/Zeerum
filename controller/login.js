const { check, validationResult } = require('express-validator');
const {
	connectToDB,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	createArticle,
} = require('../config/database');
const bcrypt = require('bcryptjs');

const login = async (req, res, next) => {
	const validationErrors = validationResult(req);
	const { email, password } = req.body;
	let user = { isAvailable: false, userId: null, username: null, data: null };
	// console.log(req.body);
	if (validationErrors.isEmpty()) {
		const data = await checkUser({ email });
		// console.log(data);
		if (data.isThereAUser) {
			bcrypt.compare(password, data.userData[0].password, (err, result) => {
				if (err) throw err;
				if (result) {
					req.session.userId = data.userData[0].userId;
					req.session.username = `${data.userData[0].firstName.toLowerCase()}-${data.userData[0].lastName.toLowerCase()}`;
					req.session.user = data.userData[0];
					res.json({
						success: true,
						status: 200,
						message: 'Successfully logged in.',
					});
				} else
					res.json({
						success: false,
						status: 400,
						message: 'Error occurred when logging in.',
						errors: ['passwordMismatch'],
					});
			});
		} else
			res.json({
				success: false,
				status: 400,
				message: 'Error occurred when logging in.',
				errors: ['noAccountFound'],
			});
	} else {
		console.log(`Validation errors found.`);
		res.status(400).json({
			success: false,
			status: 400,
			isValidationError: true,
			message: 'Validation errors found.',
			errors: validationErrors,
		});
	}
};

const sendLoginHTML = (req, res) => {
	if (req.session.userId !== undefined || req.session.username)
		res.status(307).redirect('/profile');
	else res.render('login', { csrfToken: req.csrfToken() });
};

module.exports = { login, sendLoginHTML };