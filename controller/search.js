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

const search = async (req, res, next) => {
	const searchPhrase = req.params.searchPhrase;
	// console.log(searchPhrase);
	const articleData = await requestData('articles', {
		title: { $regex: new RegExp(`${searchPhrase}`, 'i') },
	});
	const categoryData = await requestData('categories', {
		name: { $regex: new RegExp(`${searchPhrase}`, 'i') },
	});
	const userData = await checkUser(
		{
			username: { $regex: new RegExp(`${searchPhrase}`, 'i') },
		},
		{ _id: false, password: false }
	);
	if (articleData.success || categoryData.success || userData.success) {
		if (
			articleData.data.length !== 0 ||
			categoryData.data.length !== 0 ||
			userData.isThereAUser
		) {
			const results = {
				articles: articleData.data || [],
				users: userData.userData || [],
				categories: categoryData.data || [],
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