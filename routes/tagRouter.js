const router = require('express').Router();

const { sendAllTagsData, sendTagData } = require('../controller/tags.js');

router.route('/').get(sendAllTagsData);
router.route('/:tag').get(sendTagData);

module.exports = router;
