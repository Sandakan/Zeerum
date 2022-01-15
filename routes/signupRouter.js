const router = require('express').Router();

const { check, validationResult } = require('express-validator');
const csrfProtection = require('csurf')({ cookie: true });

const createAccountLimiter = require('../middleware/rate-limit.js');

const { signup, validateSignupInputs, sendSignupHTML } = require('../controller/signup.js');

router.route('/').get(csrfProtection).get(sendSignupHTML);
router
	.route('/')
	.post(csrfProtection)
	.post(createAccountLimiter)
	.post([
		check('firstName').exists().withMessage('Name cannot be empty').trim().escape(),
		check('lastName').exists().withMessage('Name cannot be empty').trim().escape(),
		check('birthday').exists().withMessage('Birthday cannot be empty.').toDate(),
		check('email')
			.exists()
			.withMessage('Email cannot be empty')
			.isEmail()
			.withMessage('Email is not within the standards.')
			.normalizeEmail(),
		check('password')
			.exists()
			.withMessage('password cannot be empty')
			.isLength({ min: 8 })
			.withMessage('Password should contain at least 8 characters'),
		// .isStrongPassword({
		// 	minLength: 8,
		// 	minNumbers: 1,
		// })
		// .withMessage(
		// 	'Password should contain at least 8 characters including letters and numbers.'
		// ),
		check('confirmPassword', 'Passwords do not match').custom(
			(value, { req }) => value === req.body.password
		),
	])
	.post(validateSignupInputs)
	.post(signup);

module.exports = router;
