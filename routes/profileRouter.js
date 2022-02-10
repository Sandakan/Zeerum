const router = require('express').Router();

const { check } = require('express-validator');
const csrfProtection = require('csurf')({ cookie: true });

const {
	changeUserType,
	followUser,
	sendProfileData,
	updateEmail,
	updatePassword,
	updateName,
	updateUsername,
	updateBirthday,
	deleteUserAccount,
} = require('../controller/profile.js');
const authenticate = require('../middleware/authenticate.js');
const notFound = require('../middleware/notFound.js');

router.route('/').get(authenticate(true)).get(followUser).get(changeUserType).get(sendProfileData);

router
	.route('/update-email')
	.post(csrfProtection)
	.post(authenticate(true))
	.post([
		check('email')
			.exists()
			.withMessage('Email cannot be empty.')
			.isEmail()
			.withMessage('Email is not within standards.')
			.normalizeEmail(),
	])
	.post(updateEmail);

router
	.route('/update-password')
	.post(csrfProtection)
	.post(authenticate(true))
	.post([
		check(['oldPassword', 'newPassword'])
			.exists()
			.withMessage('password cannot be empty')
			.isLength({ min: 8 })
			.withMessage('Password should contain at least 8 characters'),
	])
	.post(updatePassword);

router
	.route('/update-name')
	.post(csrfProtection)
	.post(authenticate(true))
	.post([
		check(['firstName', 'lastName'])
			.exists()
			.withMessage('Name cannot be empty.')
			.isAlpha()
			.withMessage("Name should't contain any non-alphabetic characters.")
			.trim(),
	])
	.post(updateName);

router
	.route('/update-username')
	.post(csrfProtection)
	.post(authenticate(true))
	.post([
		check(['username'])
			.exists()
			.withMessage('Username cannot be empty.')
			.isAlphanumeric('en-US', { ignore: '-_' })
			.withMessage(
				'Username cannot contain non-alpha-numeric characters other than underscores and dashes.'
			)
			.trim(),
	])
	.post(updateUsername);

router
	.route('/update-birthday')
	.post(csrfProtection)
	.post(authenticate(true))
	.post([
		check(['birthday'])
			.exists()
			.withMessage('Birthday cannot be empty.')
			.isDate()
			.withMessage('Entered birthday is not a valid date.'),
		// .isAfter()
		// .withMessage('Birthday cannot be a future date.')
		// .toDate(),
	])
	.post(updateBirthday);

router
	.route('/delete-account')
	.post(csrfProtection)
	.post(authenticate(true))
	.post([
		check(['username'])
			.exists()
			.withMessage('Username cannot be empty.')
			.isAlphanumeric('en-US', { ignore: '-_' })
			.withMessage(
				'Username cannot contain non-alpha-numeric characters other than underscores and dashes.'
			)
			.trim(),
	])
	.post(deleteUserAccount);

router.route('*').all(notFound(true));

module.exports = router;
