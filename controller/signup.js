const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

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

const validateSignupInputs = async (req, res, next) => {
	const validationErrors = validationResult(req);
	// console.log(req.body);
	if (validationErrors.isEmpty()) {
		let errObj = { isError: false, errors: [] };
		const { firstName, lastName, email } = req.body;
		const nameCheck = await checkUser({ firstName, lastName })
			.then((res) => res)
			.catch((err) => next(err));
		const emailCheck = await checkUser({ email })
			.then((res) => res)
			.catch((err) => next(err));
		if (nameCheck.isThereAUser) {
			errObj.isError = true;
			errObj.errors.push('nameExists');
		}
		if (emailCheck.isThereAUser) {
			errObj.isError = true;
			errObj.errors.push('emailExists');
		}
		if (errObj.isError)
			res.status(400).json({
				success: false,
				status: 400,
				message: 'Error occurred when signing up.',
				errors: errObj.errors,
			});
		else next();
	} else {
		return res.status(400).json({
			success: false,
			message: 'Server validation errors found. Please check your inputs.',
			validationErrors: validationErrors.errors,
		});
	}
};

const signup = (req, res, next) => {
	const errors = validationResult(req);
	const { firstName, lastName, birthday, password, email } = req.body;
	//hash the Passwords
	bcrypt.genSalt(10, (err, salt) => {
		if (err) return next(err);
		bcrypt.hash(password, salt, async (err, hashedPassword) => {
			if (err) return next(err);
			req.body.password = hashedPassword;
			await createUser({ ...req.body, country: req.ipInfo.country })
				.then((data) => {
					const { success, userData } = data;
					// console.log(data);
					if (success) {
						req.session.userId = userData.userId;
						req.session.username = `${userData.firstName.toLowerCase()}-${userData.lastName.toLowerCase()}`;
						req.session.user = userData;
						res.status(200).json({
							success: true,
							status: 200,
							message: 'Signed up successfully.',
						});
					} else
						res.status(500).json({
							success: false,
							status: 500,
							message:
								'A system error occurred when signing you up. Please try again later.',
						});
				})
				.catch((err) => next(err));
		});
	});
};

const sendSignupHTML = (req, res) => {
	if (req.session.username || req.session.userId !== undefined)
		res.status(307).redirect('/profile');
	else res.render('signup', { csrfToken: req.csrfToken(), theme: req.session.theme });
};

module.exports = { validateSignupInputs, signup, sendSignupHTML };
