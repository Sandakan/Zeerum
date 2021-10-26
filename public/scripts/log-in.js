document.getElementById('form').addEventListener('submit', async (e) => {
	const object = await fetch('/data/submit/log-in', {
		method: 'POST',
	});
	const data = await object.json();
	console.log(data);
	// alert(data.isError);
	if (data.isError) {
		// console.log('came here');
		// alert('came here');
		e.preventDefault();
	}
});
