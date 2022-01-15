const router = require('express').Router();

const { sendUserData } = require('../controller/user.js');
const authenticate = require('../middleware/authenticate.js');

router.route('/:user').get(sendUserData);

module.exports = router;
