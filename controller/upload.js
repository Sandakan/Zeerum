const fs = require('fs');
const {
	testDatabaseConnection,
	countDocuments,
	createUser,
	checkUser,
	requestData,
	updateUserData,
	updateData,
	createArticle,
	createTags,
} = require('../config/database');

const uploadNewArticle = async (req, res, next) => {
	if (
		req.body.articleTitle &&
		req.body.articleDescription &&
		req.body.articleFootnotes &&
		req.body.articleBody &&
		req.body.articleCategory &&
		req.body.articleTags
	) {
		let {
			articleTitle,
			articleDescription,
			articleFootnotes = '',
			articleBody,
			articleCategory,
			articleTags,
		} = req.body;
		const articleId = await countDocuments('articles');
		await createTags(articleTags.split('#'), {}, articleId);
		if (req.files) {
			let imageLocations = {
				articleCoverImg: '',
				articleImages: [],
			};
			const location = `./public/images/articles/${articleId}`;
			fs.mkdir(location, (err) => {
				if (err) console.log(err);
			});
			if (req.files.articleCoverImg) {
				const articleCoverImg = req.files.articleCoverImg;
				articleCoverImg.mv(
					`${location}/articleCoverImg.${articleCoverImg.name.split('.').at(-1)}`,
					async (err) => {
						if (err) return next(err);
						imageLocations.articleCoverImg = `/images/articles/${articleId}/articleCoverImg.${articleCoverImg.name
							.split('.')
							.at(-1)}`;
					}
				);
			}
			if (req.files.articleImages) {
				const articleImages = req.files.articleImages;
				if (articleImages.constructor === Array) {
					for (const articleImg of articleImages) {
						articleImg.mv(`${location}/${articleImg.name}`, (err) => {
							if (err) return next(err);
						});
						articleBody = articleBody.replace(
							new RegExp(articleImg.name, 'm'),
							`/images/articles/${articleId}/${articleImg.name}`
						);
					}
				} else {
					articleImages.mv(`${location}/${articleImages.name}`, (err) => {
						if (err) return next(err);
					});
					articleBody = articleBody.replace(
						new RegExp(`src="${articleImages.name}"`, 'm'),
						`src="/images/articles/${articleId}/${articleImages.name}"`
					);
				}
			}

			createArticle(
				{
					articleId: articleId,
					title: articleTitle,
					description: articleDescription,
					body: articleBody,
					categories: articleCategory,
					tags: articleTags,
					footnotes: articleFootnotes,
					coverImg: `/images/articles/${articleId}/articleCoverImg.${req.files.articleCoverImg.name
						.split('.')
						.at(-1)}`,
				},
				req.session.user
			).then(
				(result) => {
					if (result.success) {
						res.json({
							success: true,
							status: 200,
							message: 'Successfully added your article.',
							articleUrl: result.articleUrl,
						});
					} else
						res.json({
							success: false,
							status: 500,
							message: 'Error occurred when adding your article.',
						});
				},
				(err) => next(err)
			);
		} else {
			createArticle(
				{
					articleId: articleId,
					title: articleTitle,
					description: articleDescription,
					body: articleBody,
					footnotes: articleFootnotes,
				},
				req.session.user
			).then((result) => {
				if (result.success) {
					res.json(
						{
							success: true,
							status: 200,
							message: 'Successfully added your article.',
						},
						(err) => next(err)
					);
				} else
					res.json({
						success: false,
						status: 500,
						message: 'Error occurred when adding your article.',
					});
			});
		}
	} else
		res.json({
			success: false,
			status: 400,
			message: 'Error occurred when adding your article. Missing data in the request.',
		});
};

const changeProfilePicture = (req, res, next) => {
	// for uploading profile pictures of the users.
	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).send('No files were uploaded.');
	} else {
		const profilePicture = req.files.profilePicture;
		const location = `./public/images/users/${req.session.user.userType}s/${req.session.userId}/`;
		fs.mkdir(location, (err) => {
			if (err) console.log(err);
		});
		profilePicture.mv(`${location}/profilePicture.webp`, (err) => {
			if (err) return next(err);
			updateUserData(
				{ userId: req.session.userId },
				{
					$set: {
						profilePictureUrl: `/images/users/${req.session.user.userType}s/${req.session.userId}/profilePicture.webp`,
					},
				}
			).then(async ({ success }) => {
				if (success) {
					console.log(req.files);
					const user = await checkUser({ userId: req.session.userId })
						.then((res) => res)
						.catch((err) => next(err));
					req.session.user = user.userData[0];
					res.json({
						success: true,
						status: 200,
						message: 'Profile picture changed successfully.',
					});
				} else
					res.json({
						success: false,
						message: 'Error occurred when saving your profile picture.',
					});
			});
		});
	}
};

module.exports = { uploadNewArticle, changeProfilePicture };
