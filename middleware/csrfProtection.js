const csrf = require('csurf');
const csrfProtect = csrf({ cookie: true });

const csrfProtection = (req, res, next) => {
	csrfProtect(req, res, next);
};

module.exports = { csrfProtection };
