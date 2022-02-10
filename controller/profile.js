const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const {
	testDatabaseConnection,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	createArticle,
	deleteData,
} = require('../config/database');

// ? FOLLOW AND UNFOLLOW USERS
const followUser = async (req, res, next) => {
	if (req.query.followUser !== undefined && req.query.followingUserId) {
		// console.log(req.query.followUser, req.query.followingUserId);
		let userData = req.session.user;
		const followingUserId = Number(req.query.followingUserId);
		let followingUserData = await checkUser({ userId: followingUserId })
			.then((res) => res)
			.catch((err) => next(err));
		if (req.query.followUser === 'true') {
			// ? If use wants to follow
			if (followingUserData.success && followingUserData.isThereAUser && userData) {
				if (!userData.followings.includes(followingUserId)) {
					userData.followings.push(Number(followingUserId));
					followingUserData.userData[0].followers.push(Number(req.session.userId));
					// console.log(
					// 	userDatafollowings,
					// 	followingUserData.userData[0].followers
					// );
					await updateUserData(
						{ userId: req.session.userId },
						{ $set: { followings: userData.followings } }
					);
					await updateUserData(
						{ userId: followingUserId },
						{ $set: { followers: followingUserData.userData[0].followers } }
					);
					req.session.user = userData;
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
			if (followingUserData.success && followingUserData.isThereAUser && userData) {
				// ? if you haven't unfollowed the same user before
				if (userData.followings.includes(followingUserId)) {
					const positionUser = userData.followings.indexOf(followingUserId);
					const positionFollowing = followingUserData.userData[0].followers.indexOf(
						Number(req.session.userId)
					);
					// console.log(userData.userData[0]);
					userData.followings.splice(positionUser, 1);
					followingUserData.userData[0].followers.splice(positionFollowing, 1);

					await updateUserData(
						{ userId: req.session.userId },
						{ $set: { followings: userData.followings } }
					);
					await updateUserData(
						{ userId: followingUserId },
						{ $set: { followers: followingUserData.userData[0].followers } }
					);
					req.session.user = userData;
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
		birthday,
		username,
	} = req.session.user;
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
				birthday,
				username,
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
				birthday,
				username,
			},
		});
	}
};

const updateName = async (req, res, next) => {
	const validationErrors = validationResult(req);
	if (validationErrors.isEmpty()) {
		if (
			req.body.firstName !== req.session.user.firstName &&
			req.body.lastName !== req.session.user.lastName
		) {
			await countDocuments('users', {
				firstName: { $regex: req.body.firstName.trim(), $options: 'i' },
				lastName: { $regex: req.body.lastName.trim(), $options: 'i' },
			})
				.then(async (noOfUsers) => {
					if (noOfUsers === 0) {
						await updateData(
							'users',
							{ userId: req.session.userId },
							{ $set: { firstName: req.body.firstName, lastName: req.body.lastName } }
						).then(
							() => {
								req.session.user.firstName = req.body.firstName;
								req.session.user.lastName = req.body.lastName;
								res.status(200).json({
									success: true,
									status: 200,
									message: 'Name updated successfully.',
								});
							},
							(err) => next(err)
						);
					} else
						res.status(400).json({
							success: false,
							status: 400,
							message: `User with name "${req.body.firstName} ${req.body.lastName}" already exists.`,
							userExists: true,
						});
				})
				.catch((err) => next(err));
		} else
			res.status(400).json({
				success: false,
				status: 400,
				message: 'You cannot use your new name as the currently existing name.',
			});
	} else
		res.status(400).json({
			success: false,
			status: 400,
			message: 'Validation errors found.',
			errors: validationErrors.errors,
		});
};

const updateUsername = async (req, res, next) => {
	const validationErrors = validationResult(req);
	if (validationErrors.isEmpty()) {
		if (req.body.username.toLowerCase() !== req.session.user.username.toLowerCase()) {
			await countDocuments('users', {
				username: { $regex: req.body.username, $options: 'i' },
			}).then(
				async (noOfUsers) => {
					if (noOfUsers === 0) {
						await updateData(
							'users',
							{ userId: req.session.userId },
							{ $set: { username: req.body.username } }
						).then(
							() => {
								req.session.user.username = req.body.username;
								res.status(200).json({
									success: true,
									status: 200,
									message: 'Username updated successfully.',
								});
							},
							(err) => next(err)
						);
					} else
						res.status(400).json({
							success: false,
							status: 400,
							message: `Another user with a username "${req.body.username}" already exists.`,
						});
				},
				(err) => next(err)
			);
		} else
			res.status(400).json({
				success: false,
				status: 400,
				message: 'Your new username cannot be your previous username.',
			});
	} else
		res.status(400).json({
			success: false,
			status: 400,
			message: 'Validation errors found.',
			errors: validationErrors.errors,
		});
};

const updateEmail = async (req, res, next) => {
	const validationErrors = validationResult(req);
	if (validationErrors.isEmpty()) {
		if (req.session.user.email !== req.body.email) {
			await countDocuments('users', { email: req.body.email }).then(async (noOfUsers) => {
				if (noOfUsers === 0) {
					await updateData(
						'users',
						{ userId: req.session.userId },
						{ $set: { email: req.body.email } },
						{},
						true
					).then(
						(result) => {
							req.session.user = result.updatedData[0];
							res.status(200).json({
								success: result.success,
								status: 200,
								message: 'Email updated successfully.',
							});
						},
						(err) => next(err)
					);
				} else
					res.status(400).json({
						success: false,
						status: 400,
						message: `Another user with the email \'${req.body.email}\' already exists.`,
					});
			});
		} else
			res.status(400).json({
				success: false,
				status: 400,
				message: 'Updating email cannot be your previous email.',
			});
	} else
		res.status(400).json({
			success: false,
			status: 400,
			message: 'Validation errors found.',
			errors: validationErrors.errors,
		});
};

const updatePassword = async (req, res, next) => {
	const validationErrors = validationResult(req);
	if (validationErrors.isEmpty()) {
		const userPassword = await checkUser({ userId: req.session.userId }, { password: 1 }).then(
			(result) => result.userData[0].password,
			(err) => next(err)
		);
		bcrypt.compare(req.body.oldPassword, userPassword, async (err, result) => {
			if (err) return next(err);
			if (result) {
				bcrypt.genSalt(10, (err, salt) => {
					if (err) return next(err);
					bcrypt.hash(req.body.newPassword, salt, async (err, hashedPassword) => {
						if (err) return next(err);
						await updateData(
							'users',
							{ userId: req.session.userId },
							{ $set: { password: hashedPassword } },
							{},
							true
						).then((result) => {
							req.session.user = result.updatedData[0];
							res.status(200).json({
								success: true,
								status: 200,
								message: 'Password updated successfully.',
							});
						});
					});
				});
			} else
				res.status(400).json({
					success: false,
					status: 400,
					message: 'Your old password is incorrect.',
				});
		});
	} else
		res.status(400).json({
			success: false,
			status: 400,
			message: 'Validation errors found.',
			errors: validationErrors.errors,
		});
};

const updateBirthday = async (req, res, next) => {
	const validationErrors = validationResult(req);
	if (validationErrors.isEmpty()) {
		if (Date.parse(req.body.birthday) !== Date.parse(req.session.user.birthday)) {
			await updateData(
				'users',
				{ userId: req.session.userId },
				{
					$set: { birthday: new Date(req.body.birthday).toISOString() },
				}
			).then(
				() => {
					req.session.user.birthday = new Date(req.body.birthday).toISOString();
					res.status(200).json({
						success: true,
						status: 200,
						message: 'Birthday updated successfully.',
					});
				},
				(err) => next(err)
			);
		} else
			res.status(400).json({
				success: false,
				status: 400,
				message: 'Your new birthday cannot be your previous birthday.',
			});
	} else
		res.status(400).json({
			success: false,
			status: 400,
			message: 'Validation errors found.',
			errors: validationErrors.errors,
		});
};

const deleteUserAccount = async (req, res, next) => {
	const validationErrors = validationResult(req);
	if (validationErrors.isEmpty()) {
		if (req.body.username === req.session.username) {
			await deleteData('users', {
				userId: req.session.userId,
				username: req.body.username,
			}).then(
				() => {
					res.status(200).json({
						success: true,
						status: 200,
						message: `Account with username ${req.body.username} and userId ${req.session.userId} deleted successfully.`,
					});
					console.log(
						`Account with username ${req.body.username} and userId ${req.session.userId} deleted successfully.`
					);
					req.session.destroy();
				},
				(err) => next(err)
			);
		} else
			res.status(400).json({
				success: false,
				status: 400,
				message: "Your username doesn't match with the existing username.",
			});
	} else return next(new Error(validationErrors.errors));
};

module.exports = {
	changeUserType,
	followUser,
	sendProfileData,
	updateName,
	updateEmail,
	updatePassword,
	updateUsername,
	updateBirthday,
	deleteUserAccount,
};
