export default async (url, func = () => true) => {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const object = await fetch(url);
			let data = await object.json();
			func(data);
			resolve(data);
		} catch (error) {
			alert(error.message);
			console.log(error);
			func({ success: false, error: error });
			reject({ success: false, error: error });
		}
	});
	return promise;
};
