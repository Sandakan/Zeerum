const router = require('express').Router();

const { sendCategoriesData, sendCategoryData } = require('../controller/categories.js');

const notFound = require('../middleware/notFound.js');

router.route('/').get(sendCategoriesData);
router.route('/:category').get(sendCategoryData);

router.route('*').all(notFound(true));

module.exports = router;
