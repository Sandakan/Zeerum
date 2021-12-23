// jshint ignore:start
import fetchData from './fetchData.js';

//? Data fetches //////////////////////////////////////////////////////////
fetchData('/data/articles/', (res) => {
	const { success, data } = res;
	if (success) {
		document.querySelector('.articles-container').classList.remove('articles-loading');
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
				.toLowerCase()}">${
				x.author.name
			}</a></div> <div class="article-stats-container"> <span class="stat"><i class="fas fa-eye"></i> ${
				x.views.allTime
			}</span><span class="stat"><i class="fas fa-heart"></i> ${
				x.reactions.likes.length
			}</span> <span class="stat"><i class="fas fa-bookmark"></i> ${
				x.reactions.bookmarks.length
			}</span><span class="stat"><i class="fas fa-share-alt"></i> ${
				x.reactions.shares
			}</span></div> <div class="article-tags-container">${x.tags
				.map((y) => `<span class="tags"><a href="tags/${y}">#${y}</a></span>`)
				.join('')}</div></div></div>`;
			document.querySelector('.navigate-through-links ul').classList.remove('links-loading');
			document.querySelector(
				'.navigate-through-links ul'
			).innerHTML += `<li><a href="/articles/${x.urlSafeTitle}">${x.title}</a></li>`;
		});
	} else {
		document.querySelector('.articles-container').innerHTML = `
			<div class="no-articles-container">
				<img src="/images/tags/no-articles.svg" alt="" />
				<span class="no-articles">
					Oops, seems like there's nothing to show at this moment.
				</span>
				<span class="no-search"></span>
			</div>`;
		console.log('Error occurred when requesting article data.', res.message);
	}
});

fetchData(`/data/tags/`, (res) => {
	const { success, data } = res;
	// console.log(res);
	if (success) {
		document.querySelector('.search-through-tags').classList.remove('tags-loading');
		document.querySelector('.search-through-tags').innerHTML = data
			.map((x) => {
				return `<span class="tags"> <a href="/tags/${x.name.toLowerCase()}">${
					x.name
				}</a></span>`;
			})
			.join('');
	} else console.log(`Error occurred when requesting tag data.${res.message}`);
});
