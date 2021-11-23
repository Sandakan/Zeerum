// jshint ignore:start
import fetchData from './fetchData.js';

//? Data fetches //////////////////////////////////////////////////////////
fetchData('/data/articles/', (res) => {
	const { success, data } = res;
	if (success) {
		data.map((x) => {
			document.querySelector(
				'.articles-container'
			).innerHTML += `<div class="article" onclick="window.location = '/articles/${
				x.urlSafeTitle
			}';"><img class="article-image" src="${x.coverImg}" alt="${
				x.coverImgAlt
			}" onclick="window.location = '/articles/${
				x.urlSafeTitle
			}';"/><div class="article-info-container"><h2 class="article-heading"><a href="/articles/${
				x.urlSafeTitle
			}">${x.title}</a></h2><p class="article-description">${
				x.description
			}<a class="more" href="/articles/${
				x.urlSafeTitle
			}">Read more.</a></p><div class="article-author-container">By <a href="/user/${x.author.name
				.replace(/[^a-zA-Z0-9\s]/gm, '')
				.replace(/\s/gm, '-')
				.replace(/-$/gm, '')
				.toLowerCase()}">${x.author.name}</a></div><div class="article-tags-container">${x.tags
				.map((y) => `<span class="tags"><a href="tags/${y}">${y}</a></span>`)
				.join('')}</div></div></div>`;
			document.querySelector(
				'.navigate-through-links ul'
			).innerHTML += `<li><a href="/articles/${x.urlSafeTitle}">${x.title}</a></li>`;
		});
	} else console.log('Error occurred when requesting article data.');
});

fetchData(`/data/tags/`, (res) => {
	const { success, data } = res;
	// console.log(res);
	if (success) {
		document.querySelector('.search-through-tags').innerHTML = data
			.map((x) => {
				return `<span class="tags"> <a href="/tags/${x.name.toLowerCase()}">${
					x.name
				}</a></span>`;
			})
			.join('');
	} else console.log(`Error occurred when requesting tag data.${res.message}`);
});
