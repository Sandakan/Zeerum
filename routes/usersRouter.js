const router = require('express').Router();

const { sendUserData, sendFollowedAuthorsData } = require('../controller/user.js');
const authenticate = require('../middleware/authenticate.js');
const notFound = require('../middleware/notFound.js');

router.route('/').get(authenticate(true)).get(sendFollowedAuthorsData);
router.route('/:user').get(sendUserData);

router.route('*').all(notFound(true));

module.exports = router;
