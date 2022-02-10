const router = require('express').Router();

const authenticate = require('../middleware/authenticate.js');
const notFound = require('../middleware/notFound.js');

const changeTheme = require('../controller/theme.js');

router.route('/').get(authenticate(false)).get(changeTheme);

router.route('*').all(notFound(true));

module.exports = router;
