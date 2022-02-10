const express = require('express');
const router = express.Router();

const search = require('../controller/search.js');

const notFound = require('../middleware/notFound.js');

router.route('/:searchPhrase').get(search);

router.route('*').all(notFound(true));

module.exports = router;
