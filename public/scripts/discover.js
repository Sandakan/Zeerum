// jshint ignore:start
import fetchData from './fetchData.js';

fetchData('/data/tags', ({ resourceAvailability, data }) => {
	// console.log(resourceAvailability, data);
	if (resourceAvailability) {
		var result = '';
		data.forEach((x) => {
			result += `<div class="discover-items" onclick="window.location.href = 'tags/${x.name.toLowerCase()}'"><div class="img-container"><img src="${
				x.picture
			}" alt="" /></div><div class="heading-container"><a href="tags/${x.name.toLowerCase()}"># ${
				x.name
			}</a></div></div>`;
		});
		document.querySelector('.discover-items-container').innerHTML = result;
		// console.log(result);
	} else console.log('Error occurred wheen requesting tag data.');
});
