const router = require('express').Router();

const { check, validationResult } = require('express-validator');

const csrfProtection = require('csurf')({ cookie: true });

const { login, sendLoginHTML } = require('../controller/login.js');

router.route('/').get(csrfProtection).get(sendLoginHTML);

router
	.route('/')
	.post(csrfProtection)
	.post([
		check('email')
			.exists()
			.withMessage('Email cannot be empty')
			.isEmail()
			.withMessage('Email is not within the standards.')
			.normalizeEmail(),
		check('password').exists().withMessage('Password cannot be empty'),
	])
	.post(login);

module.exports = router;
