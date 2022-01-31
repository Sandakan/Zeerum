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

const search = async (req, res, next) => {
	const searchPhrase = req.params.searchPhrase;
	// console.log(searchPhrase);
	const articleData = await requestData(
		'articles',
		{
			title: { $regex: new RegExp(`${searchPhrase}`, 'i') },
		},
		{ title: 1, urlSafeTitle: 1 }
	)
		.then((res) => res)
		.catch((err) => next(err));
	const categoryData = await requestData(
		'categories',
		{
			name: { $regex: new RegExp(`${searchPhrase}`, 'i') },
		},
		{ name: 1, categoryId: 1 }
	)
		.then((res) => res)
		.catch((err) => next(err));
	const userData = await checkUser(
		{
			username: { $regex: new RegExp(`${searchPhrase}`, 'i') },
		},
		{ firstName: 1, lastName: 1, username: 1, userId: 1, profilePictureUrl: 1 }
	)
		.then((res) => res)
		.catch((err) => next(err));
	const tagData = await requestData('tags', {
		name: { $regex: new RegExp(`${searchPhrase}`, 'i') },
	})
		.then((res) => res)
		.catch((err) => next(err));
	if (articleData.success || categoryData.success || userData.success || tagData.success) {
		if (
			articleData.data.length !== 0 ||
			categoryData.data.length !== 0 ||
			tagData.data.length !== 0 ||
			userData.isThereAUser
		) {
			const results = {
				articles: articleData.data || [],
				users: userData.userData || [],
				categories: categoryData.data || [],
				tags: tagData.data || [],
			};
			// console.log(searchPhrase, results);
			res.status(200).json({
				success: true,
				status: 200,
				message: 'Request successful.',
				results: results,
			});
		} else
			res.status(404).json({
				success: false,
				status: 404,
				message: 'Result cannot be found. Try searching using different keywords.',
			});
	} else
		res.status(500).json({ success: false, message: 'Error occurred. Please try again later.' });
};

module.exports = search;
