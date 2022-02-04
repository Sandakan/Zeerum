const router = require('express').Router();

const { sendUserData, sendFollowedAuthorsData } = require('../controller/user.js');
const authenticate = require('../middleware/authenticate.js');

router.route('/').get(authenticate).get(sendFollowedAuthorsData);
router.route('/:user').get(sendUserData);

module.exports = router;
