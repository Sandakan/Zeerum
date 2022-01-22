const {
	connectToDB,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	createArticle,
} = require('../config/database');

// ? FOLLOW AND UNFOLLOW USERS
const followUser = async (req, res, next) => {
	if (req.query.followUser !== undefined && req.query.followingUserId) {
		// console.log(req.query.followUser, req.query.followingUserId);
		let userData = await checkUser({ userId: req.session.userId });
		const followingUserId = Number(req.query.followingUserId);
		let followingUserData = await checkUser({ userId: followingUserId });
		if (req.query.followUser === 'true') {
			// ? If use wants to follow
			if (followingUserData.success && followingUserData.isThereAUser && userData.success) {
				if (!userData.userData[0].followings.includes(followingUserId)) {
					userData.userData[0].followings.push(Number(followingUserId));
					followingUserData.userData[0].followers.push(Number(req.session.userId));
					// console.log(
					// 	userData.userData[0].followings,
					// 	followingUserData.userData[0].followers
					// );
					await updateUserData(
						{ userId: req.session.userId },
						{ $set: { followings: userData.userData[0].followings } }
					);
					await updateUserData(
						{ userId: followingUserId },
						{ $set: { followers: followingUserData.userData[0].followers } }
					);
					req.session.user = userData.userData[0];
					//? if you haven't followed the same user before
					// console.log(req.query.followUser, req.query.followingUserId);
					res.json({
						success: true,
						status: 200,
						message: `Followed ${followingUserData.userData[0].username} by ${req.session.username}`,
					});
				} else {
					// ? if you have followed the same user before
					res.status(400).json({
						success: false,
						status: 400,
						message: `You have already followed ${followingUserData.userData[0].username}`,
					});
				}
			} else {
				res.json({ success: false, message: 'Follow request failed' });
			}
		} else {
			//? If user wants to unfollow
			if (followingUserData.success && followingUserData.isThereAUser && userData.success) {
				// ? if you haven't unfollowed the same user before
				if (userData.userData[0].followings.includes(followingUserId)) {
					const positionUser = userData.userData[0].followings.indexOf(followingUserId);
					const positionFollowing = followingUserData.userData[0].followers.indexOf(
						Number(req.session.userId)
					);
					// console.log(userData.userData[0]);
					userData.userData[0].followings.splice(positionUser, 1);
					followingUserData.userData[0].followers.splice(positionFollowing, 1);

					await updateUserData(
						{ userId: req.session.userId },
						{ $set: { followings: userData.userData[0].followings } }
					);
					await updateUserData(
						{ userId: followingUserId },
						{ $set: { followers: followingUserData.userData[0].followers } }
					);
					req.session.user = userData.userData[0];
					res.json({
						success: true,
						status: 200,
						message: `Unfollowed ${followingUserData.userData[0].username} by ${req.session.username}`,
					});
				} else {
					// ? if you have unfollowed the same user before
					res.status(400).json({
						success: false,
						status: 400,
						message: `You have already unfollowed ${followingUserData.userData[0].username}`,
					});
				}
			} else res.json({ success: false, message: 'Unfollow request failed' });
		}
	} else next();
};

// ? CHANGE USER TYPE
const changeUserType = async (req, res, next) => {
	if (req.query.changeUserType) {
		const user = req.session.user;
		if (req.query.changeUserType === 'author' && user.userType === 'reader') {
			user.userType = 'author';
			const { updatedData } = await updateUserData(
				{ userId: req.session.userId },
				{
					$set: {
						userType: 'author',
						authorData: {
							allTimeViews: 0,
							allTimeLikes: 0,
						},
					},
				},
				true
			);
			// console.log(`updated data`, updatedData);
			req.session.user = user;
			res.json({
				success: true,
				status: 200,
				message: `Success on becoming a ${req.query.changeUserType}.`,
			});
		} else if (req.query.changeUserType === 'reader' && user.userType === 'author') {
			user.userType = 'reader';
			// console.log(user);
			const { updatedData } = await updateUserData(
				{ userId: req.session.userId },
				{
					$set: { userType: 'reader' },
					$unset: { authorData: 1 },
				},
				true
			);
			req.session.user = user;
			res.json({
				success: true,
				status: 200,
				message: `Success on becoming a ${req.query.changeUserType}.`,
			});
		} else
			res.status(400).json({
				success: false,
				message: `You are already a ${req.session.user.userType}`,
			});
	} else next();
};

// ? SEND PROFILE DATA
const sendProfileData = async (req, res) => {
	const {
		userId,
		firstName,
		lastName,
		profilePictureUrl,
		followers,
		followings,
		registeredDate,
		userType,
		country,
		bookmarks,
	} = req.session.user;

	// const articlesPublished = async (userId) => {
	// 	const articleData = await requestData('articles', { 'author.userId': userId });
	// 	if (articleData.success && articleData.data.length !== 0) return articleData.data.length;
	// 	else return 0;
	// };
	if (userType === 'author') {
		let allTimeViews = 0;
		let allTimeLikes = 0;
		const articleData = await requestData('articles', { 'author.userId': userId });
		const { data } = await articleData;
		data.forEach((article) => {
			allTimeLikes += article.reactions.likes.length;
			allTimeViews += article.views.allTime;
		});
		res.status(200).json({
			success: true,
			status: 200,
			message: `Request successful.`,
			data: {
				userId: userId,
				firstName: firstName,
				lastName: lastName,
				profilePictureUrl: profilePictureUrl,
				followers: followers,
				followings: followings,
				registeredDate: registeredDate,
				userType: userType,
				country: country,
				articlesPublished: data.length,
				bookmarks: bookmarks,
				allTimeViews: allTimeViews,
				allTimeLikes: allTimeLikes,
			},
		});
	} else {
		res.status(200).json({
			success: true,
			status: 200,
			message: `Request successful.`,
			data: {
				userId: userId,
				firstName: firstName,
				lastName: lastName,
				profilePictureUrl: profilePictureUrl,
				followers: followers,
				followings: followings,
				registeredDate: registeredDate,
				userType: userType,
				country: country,
				articlesPublished: 0,
				bookmarks: bookmarks,
			},
		});
	}
};

module.exports = { changeUserType, followUser, sendProfileData };
