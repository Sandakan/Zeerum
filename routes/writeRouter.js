const router = require('express').Router();

const csrfProtection = require('csurf')({ cookie: true });
const authenticate = require('../middleware/authenticate.js');
const notFound = require('../middleware/notFound.js');

const { editArticle } = require('../controller/write.js');

router.route('/edit/:article').get(csrfProtection).get(authenticate(true)).get(editArticle);

router.route('*').all(notFound(true));

module.exports = router;
