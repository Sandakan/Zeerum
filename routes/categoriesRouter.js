const router = require('express').Router();

const { sendCategoriesData, sendCategoryData } = require('../controller/categories.js');

router.route('/').get(sendCategoriesData);
router.route('/:category').get(sendCategoryData);

module.exports = router;
