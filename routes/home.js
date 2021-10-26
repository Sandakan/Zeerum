const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	console.log(req.cookies);
	console.log('this works');
	res.cookie('isLoggedIn', false, { expires: new Date(Date.now() + 900000) });
	res.status(200).sendFile(path.resolve(__dirname, './public/index.html'));
});

module.exports = router;
