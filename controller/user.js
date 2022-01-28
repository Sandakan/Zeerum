const {
	testDatabaseConnection,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	createArticle,
} = require('../config/database');

const sendUserData = async (req, res, next) => {
	let user = isNaN(Number(req.params.user)) ? req.params.user : Number(req.params.user);
	const userData = isNaN(Number(req.params.user))
		? await checkUser(
				{
					firstName: user.split('-')[0].replace(/^\w/, (x) => x.toUpperCase()),
					lastName: user.split('-')[1].replace(/^\w/, (x) => x.toUpperCase()),
				},
				{ password: false }
		  )
				.then((res) => res)
				.catch((err) => next(err))
		: await checkUser({ userId: user }, { email: false, password: false })
				.then((res) => res)
				.catch((err) => next(err));

	if (userData.isThereAUser)
		res.status(200).json({
			success: true,
			status: 200,
			message: 'Request successful.',
			data: userData.userData[0],
		});
	else
		res.status(404).json({
			success: false,
			message: `There is no user with the name/id ${req.params.user}`,
		});
};

module.exports = { sendUserData };
