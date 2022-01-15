const express = require('express');
const router = express.Router();

const search = require('../controller/search.js');

router.route('/:searchPhrase').get(search);

module.exports = router;
