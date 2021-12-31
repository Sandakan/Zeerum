import fetchData from './fetchData.js';

// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

fetchData('/data/tags', ({ success, data }) => {
	if (success) {
		let temp = '';
		document
			.querySelector('.discover-categories-container')
			.classList.remove('discover-tags-loading');
		data.forEach((x) => {
			temp += `<div class="discover-category" onclick="window.location.href = 'tags/${x.name.toLowerCase()}'"><div class="img-container"><img src="${
				x.pictureUrl
			}" alt="" /></div><div class="heading-container"><a href="tags/${x.name.toLowerCase()}"># ${
				x.name
			}</a></div></div>`;
		});
		document.querySelector('.discover-categories-container').innerHTML = temp;
	} else console.log('Error occurred wheen requesting tag data.');
});
