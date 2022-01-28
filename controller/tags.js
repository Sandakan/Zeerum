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

const sendAllTagsData = async (req, res, next) => {
	const tags = await requestData('tags', {}).then(
		(res) => res,
		(err) => next(err)
	);
	res.json({
		success: true,
		status: 200,
		data: tags,
	});
};

const sendTagData = async (req, res, next) => {
	const tagData = isNaN(Number(req.params.tag))
		? await requestData('tags', { name: req.params.tag.toLowerCase() }).then(
				(res) => res,
				(err) => next(err)
		  )
		: await requestData('tags', { tagId: req.params.tag }).then(
				(res) => res,
				(err) => next(err)
		  );
	if (tagData.success && tagData.data.length > 0) {
		res.json({
			success: true,
			status: 200,
			data: tagData.data,
		});
	} else
		res.json({
			success: false,
			status: 404,
			message: `We couldn't find any tag with a name/id '${req.params.tag}'.`,
		});
};

module.exports = { sendAllTagsData, sendTagData };
