const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const path = require('path');

const {
	testDatabaseConnection,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	createArticle,
} = require('../config/database');
const { sendMail } = require('../config/mail.js');

const login = async (req, res, next) => {
	const validationErrors = validationResult(req);
	const { email, password } = req.body;
	let user = { isAvailable: false, userId: null, username: null, data: null };
	if (validationErrors.isEmpty()) {
		const data = await checkUser({ email })
			.then((res) => res)
			.catch((err) => next(err));
		if (data.isThereAUser) {
			bcrypt.compare(password, data.userData[0].password, async (err, result) => {
				if (err) throw err;
				if (result) {
					await sendMail(
						path.join(__dirname, '../views/emails/new-login.ejs'),
						{
							userEmail: email,
							ipAddress: req.ipInfo.ip,
							country: req.ipInfo.country || 'Localhost login',
							timeZone: req.ipInfo.timezone || 'Localhost login',
							city: req.ipInfo.city || 'Localhost login',
							time: new Date(),
							platform:
								req.headers['sec-ch-ua-platform'] ||
								req.headers['user-agent'] ||
								'Unknown Platform',
						},
						{ to: email, subject: 'New Login Detected' }
					).catch((err) => next(err));
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
	else res.render('login', { csrfToken: req.csrfToken(), theme: req.session.theme });
};

module.exports = { login, sendLoginHTML };
