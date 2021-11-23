const rateLimit = require('express-rate-limit');

const createAccountLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 hour
	max: 5,
	message: 'Too many accounts created from this IP. Please try again later.',
});

module.exports = { createAccountLimiter };
