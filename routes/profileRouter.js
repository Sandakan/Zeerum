const router = require('express').Router();

const { changeUserType, followUser, sendProfileData } = require('../controller/profile.js');
const authenticate = require('../middleware/authenticate.js');

router.route('/').get(authenticate).get(followUser).get(changeUserType).get(sendProfileData);

module.exports = router;
