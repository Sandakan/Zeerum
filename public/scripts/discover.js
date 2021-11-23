import fetchData from './fetchData.js';

fetchData('/data/tags', ({ success, data }) => {
	if (success) {
		var result = '';
		data.forEach((x) => {
			result += `<div class="discover-categories" onclick="window.location.href = 'tags/${x.name.toLowerCase()}'"><div class="img-container"><img src="${
				x.pictureUrl
			}" alt="" /></div><div class="heading-container"><a href="tags/${x.name.toLowerCase()}"># ${
				x.name
			}</a></div></div>`;
		});
		document.querySelector('.discover-categories-container').innerHTML = result;
		// console.log(result);
	} else console.log('Error occurred wheen requesting tag data.');
});
