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

const sendFollowedAuthorsData = async (req, res, next) => {
	if (req.query.followedAuthors === 'true') {
		const followings = await requestData(
			'users',
			{ userId: Number(req.session.userId) },
			{ followings: 1 }
		).then(
			(result) => result.data[0].followings,
			(err) => next(err)
		);
		const authorsData = await requestData(
			'users',
			{
				userId: { $in: followings },
				userType: 'author',
				followers: Number(req.session.userId),
			},
			{ firstName: 1, lastName: 1, username: 1, profilePictureUrl: 1 },
			{},
			Number(req.query.limit) || 0
		);
		if (authorsData.success && authorsData.data.length > 0) {
			res.json({ success: true, status: 200, data: authorsData.data });
		} else
			res.json({
				success: false,
				status: 404,
				message: `We couldn't find any author that you've followed.`,
			});
	} else next();
};

module.exports = { sendUserData, sendFollowedAuthorsData };
