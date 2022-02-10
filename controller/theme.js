const {
	countDocuments,
	checkUser,
	requestData,
	updateUserData,
	updateData,
} = require('../config/database');

const changeTheme = (req, res, next) => {
	const theme = req.query.theme;
	if (theme === 'dark') req.session.theme = 'dark-mode';
	else if (theme === 'light') req.session.theme = 'light-mode';
	else {
		if (!req.session.theme || req.session.theme === 'light-mode')
			req.session.theme = 'dark-mode';
		else req.session.theme = 'light-mode';
	}
	if (req.session.theme === 'dark-mode')
		res.json({
			success: true,
			status: 200,
			message: 'Theme changed from light to dark successfully.',
		});
	else
		res.json({
			success: true,
			status: 200,
			message: 'Theme changed from dark to light successfully.',
		});
};

module.exports = changeTheme;
