// jshint ignore:start
import fetchData from './fetchData.js';

fetchData('/data/tags', (data) => {
	var result = '';
	data.forEach((x) => {
		result += `<div class="discover-items" onclick="window.location.href = 'tags/${x.name.toLowerCase()}'"><div class="img-container"><img src="${
			x.picture
		}" alt="" /></div><div class="heading-container"># ${x.name}</div></div>`;
	});
	document.querySelector('.discover-items-container').innerHTML = result;
	// console.log(result);
});
