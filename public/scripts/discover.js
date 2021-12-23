import fetchData from './fetchData.js';

fetchData('/data/tags', ({ success, data }) => {
	if (success) {
		document
			.querySelector('.discover-categories-container')
			.classList.remove('discover-tags-loading');
		data.forEach((x) => {
			document.querySelector(
				'.discover-categories-container'
			).innerHTML += `<div class="discover-category" onclick="window.location.href = 'tags/${x.name.toLowerCase()}'"><div class="img-container"><img src="${
				x.pictureUrl
			}" alt="" /></div><div class="heading-container"><a href="tags/${x.name.toLowerCase()}"># ${
				x.name
			}</a></div></div>`;
		});
	} else console.log('Error occurred wheen requesting tag data.');
});
