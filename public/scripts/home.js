// jshint ignore:start
import fetchData from './fetchData.js';
var articles;

document.cookie = 'location=Home';

//? Data fetches //////////////////////////////////////////////////////////

fetchData('/data/articles/', (data) => {
	data.map((x) => {
		document.querySelector(
			'.articles-container'
		).innerHTML += `<div class="article" onclick="window.location = 'articles/${x.title
			.replace(/[^a-zA-Z0-9\s]/gm, '')
			.replace(/\s/gm, '-')
			.replace(/-$/gm, '')
			.toLowerCase()}';"><img class="article-image" src="${x.coverImg}" alt="${
			x.coverImgAlt
		}" onclick="window.location = 'articles/${x.title
			.replace(/[^a-zA-Z0-9\s]/gm, '')
			.replace(/\s/gm, '-')
			.replace(/-$/gm, '')
			.toLowerCase()}';"/><div class="article-info-container"><h2 class="article-heading"><a href="articles/${x.title
			.replace(/[^a-zA-Z0-9\s]/gm, '')
			.replace(/\s/gm, '-')
			.replace(/-$/gm, '')
			.toLowerCase()}">${x.title}</a></h2><p class="article-description">${
			x.description
		}<a class="more" href="articles/${x.title
			.replace(/[^a-zA-Z0-9\s]/gm, '')
			.replace(/\s/gm, '-')
			.replace(/-$/gm, '')
			.toLowerCase()}">Read more.</a></p><div class="article-tags-container">${x.tags
			.map((y) => `<span class="tags"><a href="tags/${y}">${y}</a></span>`)
			.join('')}</div></div></div>`;
		document.querySelector(
			'.navigate-through-links ul'
		).innerHTML += `<li><a href="articles/${x.title
			.replace(/[^a-zA-Z0-9\s]/gm, '')
			.replace(/\s/gm, '-')
			.replace(/-$/gm, '')
			.toLowerCase()}">${x.title}</a></li>`;
	});
});

fetchData(`/data/tags/`, (data) => {
	let result = '';
	data.forEach((x) => {
		result += `<span class="tags"> <a href="/tags/${x.name.toLowerCase()}">${x.name}</a></span>`;
	});
	document.querySelector('.search-through-tags').innerHTML = result;
});
