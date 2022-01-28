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

const sendCategoriesData = async (req, res) => {
	const categoryData = await requestData('categories');
	if (categoryData.success)
		res.status(200).json({
			success: true,
			status: 200,
			message: `Request successful.`,
			data: categoryData.data,
		});
	else
		res.json({
			success: false,
			status: 404,
			message: 'No categories found. Please try again later.',
		});
};

const sendCategoryData = async (req, res) => {
	const category = isNaN(Number(req.params.category))
		? req.params.category
		: Number(req.params.category);
	const categoryData = isNaN(category)
		? await requestData('categories', { name: category.replace(/^\w/, (x) => x.toUpperCase()) })
		: await requestData('categories', { categoryId: category });
	if (categoryData.success && categoryData.data.length !== 0)
		res.status(200).json({ success: true, status: 200, data: categoryData.data });
	else
		res.status(404).json({
			success: false,
			status: 404,
			message: `There is no category/categoryId named ${req.params.category}`,
		});
};

module.exports = { sendCategoriesData, sendCategoryData };
