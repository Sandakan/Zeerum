export default async (url, func = () => true, fetchOptions = {}) => {
	const promise = new Promise(async (resolve, reject) => {
		try {
			const object = await fetch(url, fetchOptions);
			let data = await object.json();
			func(data);
			resolve(data);
		} catch (error) {
			alert(error);
			console.log(error);
			func({ success: false, error: error });
			resolve({ success: false, error: error });
			throw error;
		}
	});
	return promise;
};
