const router = require('express').Router();

const { sendAllTagsData, sendTagData } = require('../controller/tags.js');

const notFound = require('../middleware/notFound.js');

router.route('/').get(sendAllTagsData);
router.route('/:tag').get(sendTagData);

router.route('*').all(notFound(true));

module.exports = router;
