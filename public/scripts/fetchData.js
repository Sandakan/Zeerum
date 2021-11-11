export default async (url, func) => {
	try {
		const object = await fetch(url);
		let data = await object.json();
		func(data);
	} catch (error) {
		alert(error.message);
		console.log(error);
	}
};
