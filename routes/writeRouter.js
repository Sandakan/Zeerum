const router = require('express').Router();

const csrfProtection = require('csurf')({ cookie: true });
const authenticate = require('../middleware/authenticate.js');

const { editArticle } = require('../controller/write.js');

router.route('/edit/:article').get(csrfProtection).get(authenticate).get(editArticle);

module.exports = router;
