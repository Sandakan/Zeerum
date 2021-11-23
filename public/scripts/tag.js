// jshint ignore:start
import fetchData from '../scripts/fetchData.js';

const noArticlesContainer = document.querySelector('.no-articles-container');
let tag = isNaN(Number(window.location.pathname.split('/').pop()))
	? window.location.pathname.split('/').pop().toLowerCase()
	: Number(window.location.pathname.split('/').pop());

fetchData(`/data/tags/`, ({ success, data }) => {
	// console.log(success, data);
	if (success) {
		data.forEach((x) => {
			if (window.location.pathname.split('/')[1] === 'search') {
				document.title = `ZEERUM \| You searched for ${window.location.pathname
					.split('/')
					.pop()}`;
				document.querySelector('.highlight-tags').innerHTML = `${window.location.pathname
					.split('/')
					.pop()}`;
				document.querySelector('.no-articles-container > img').src =
					'/images/tags/no-search.svg';
				document.querySelector('.no-articles').style.display = 'none';
				document.querySelector('.no-search').style.display = 'block';
				document.querySelector(
					'.no-search'
				).innerHTML = `We don\'t have anything with the name \" ${window.location.pathname
					.split('/')
					.pop()} \". Recheck the spelling and try seaching with different words.`;
			} else if (
				x.name.toLowerCase() === window.location.pathname.split('/').pop().toLowerCase() ||
				x.tagId === Number(window.location.pathname.split('/').pop())
			) {
				document.title = `ZEERUM \| You searched for \#${x.name}`;
				document.querySelector('.highlight-tags').innerHTML = `#${x.name}`;
			}
			document.querySelector(
				'.search-through-tags'
			).innerHTML += `<span class="tags"> <a href="../tags/${x.name.toLowerCase()}">${
				x.name
			}</a></span>`;
		});
	} else console.log('Error occurred when requesting tags data.');
});

fetchData(`/data/articles/`, ({ success, data }) => {
	if (success) {
		data.forEach((x) => {
			console.log(x);
			document.querySelector(
				'.navigate-through-links > ul'
			).innerHTML += `<li><a href="../articles/${x.urlSafeTitle}">${x.title}</a></li>`;
			x.tags.forEach((y) => {
				if (window.location.pathname.split('/').pop().toLowerCase() === y.toLowerCase()) {
					document.querySelector('.articles-container').innerHTML =
						`<div class="article" onclick=\"window.location = \'../articles/${
							x.urlSafeTitle
						}\'\"><img class="article-image" src="${x.coverImg}" alt="${
							x.coverImgAlt
						}" onclick="window.location = '../articles/${
							x.urlSafeTitle
						}'"><div class="article-info-container"> <h2 class="article-heading"><a href="../articles/${
							x.urlSafeTitle
						}">${x.title}</a></h2><p class="article-description">${
							x.description
						}<a class="more" href="../articles/${
							x.urlSafeTitle
						}">Read more.</a><div class="article-author-container">By <a href="/user/${x.author.name
							.replace(/[^a-zA-Z0-9\s]/gm, '')
							.replace(/\s/gm, '-')
							.replace(/-$/gm, '')
							.toLowerCase()}">${
							x.author.name
						}</a></div><div class="article-tags-container">${x.tags
							.map((i) => {
								return `<span class="tags"> <a href="${i}">${i}</a></span>`;
							})
							.join('')}
                  </div></p></div></div>` + document.querySelector('.articles-container').innerHTML;

					document.querySelector('.no-articles-container').style.display = 'none';
					// console.log(x.tags, y, window.location.pathname.split('/').pop());
				} else {
					noArticlesContainer.style.display = 'flex';
				}
			});
			if (
				x.title.toLowerCase().includes(window.location.pathname.split('/').pop().toLowerCase())
			) {
				document.querySelector('.articles-container').innerHTML =
					`<div class="article" onclick=\"window.location = \'../articles/${
						x.urlSafeTitle
					}\'\"><img class="article-image" src="${x.coverImg}" alt="${
						x.coverImgAlt
					}" onclick="window.location = '../articles/${
						x.urlSafeTitle
					}'"><div class="article-info-container"> <h2 class="article-heading"><a href="../articles/${
						x.urlSafeTitle
					}">${x.title}</a></h2><p class="article-description">${
						x.description
					}<a class="more" href="../articles/${
						x.urlSafeTitle
					}">Read more.</a><div class="article-tags-container">${x.tags.map(
						(i) => `<span class="tags"> <a href="${i}">${i}</a></span>`
					)}
                  </div></p></div></div>` + document.querySelector('.articles-container').innerHTML;

				document.querySelector('.no-articles-container').style.display = 'none';
			}
		});
	} else console.log('Error occurred when requesting article data.');
});
