// jshint ignore:start
import timeFromNow from './timeFromNow.js';
import displayAlertPopup from './displayAlertPopup.js';

// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content') + 'foo';

//? Data fetches //////////////////////////////////////////////////////////
const renderArticles = (articlesData) => {
	articlesData.map((x) => {
		document.querySelector(
			'.articles-container'
		).innerHTML += `<article class="article" onclick="window.location = '/articles/${
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
		}</span><span class="stat" title="${new Date(
			x.releasedDate
		).toString()}"><i class="fas fa-clock"></i> ${timeFromNow(
			x.releasedDate
		)}</span></div> <div class="article-categories-container">${x.categories
			.map(
				(category) =>
					`<span class="category"><a href="categories/${category}">${category}</a></span>`
			)
			.join('')}</div> <div class="article-tags-container">${x.tags
			.map((tag) => `<span class="tag"><a href="/tags/${tag}">#${tag}</a></span>`)
			.join('')}</div></div></article>`;
	});
};

await fetch('/data/articles?page=1&limit=5', {
	credentials: 'same-origin', // <-- includes cookies in the request
	headers: {
		'CSRF-Token': token, // <-- is the csrf token as a header
	},
})
	.then((res) => res.json())
	.then((res) => {
		const { success, data, pages, currentPage, hasNextPage } = res;
		if (success) {
			document.querySelector('.articles-container').classList.remove('articles-loading');
			hasNextPage
				? document.querySelector('.load-more.articles').classList.remove('hidden')
				: document.querySelector('.load-more.articles').classList.add('hidden');
			renderArticles(data);
		} else {
			document.querySelector('.articles-container').classList.remove('articles-loading');
			document.querySelector('.navigate-through-links').style.display = 'none';
			document.querySelector('.articles-container').innerHTML = `
			<div class="no-articles-container">
				<img src="/images/categories/no-articles.svg" alt="" />
				<span class="no-articles">
					Oops, seems like there's nothing to show at this moment.
				</span>
				<span class="no-search"></span>
			</div>`;
			document.querySelector('.no-articles-container').classList.add('visible');
			console.log('Error occurred when requesting article data.', res.message);
		}
	})
	.catch((err) => console.log(err));

fetch('/data/articles?trendingArticles=true&limit=5')
	.then((res) => res.json())
	.then((res) => {
		document.querySelector('.navigate-through-links ul').classList.remove('links-loading');
		if (res.success && res.data.length > 0) {
			res.data.forEach((x) => {
				document.querySelector(
					'.navigate-through-links ul'
				).innerHTML += `<li><a href="/articles/${x.urlSafeTitle}">${x.title}</a></li>`;
			});
		} else console.log(res.message);
	})
	.catch((err) => console.log(err));

fetch(`/data/categories/`)
	.then((res) => res.json())
	.then((res) => {
		const { success, data } = res;
		// console.log(res);
		if (success) {
			document
				.querySelector('.search-through-categories')
				.classList.remove('categories-loading');
			document.querySelector('.search-through-categories').innerHTML = data
				.map((x) => {
					return `<span class="category"> <a href="/categories/${x.name.toLowerCase()}">${
						x.name
					}</a></span>`;
				})
				.join('');
		} else {
			document
				.querySelector('.search-through-categories')
				.classList.remove('categories-loading');
			console.log(`Error occurred when requesting category data.${res.message}`);
		}
	})
	.catch((err) => console.log(err));

fetch('/data/users?followedAuthors=true&limit=10')
	.then((res) => res.json())
	.then(
		(res) => {
			console.log(res);
			if (res.success && res.data.length > 0) {
				res.data.map((author) => {
					document.querySelector(
						'.followed-authors-container .followed-authors'
					).innerHTML += `<a class="author" href="/user/${author.username}">
							<div class="author-img"><img src="${author.profilePictureUrl || '/images/user.webp'}" 
								alt="${author.firstName} ${author.lastName}'s Profile Picture"/>
							</div>
							<span class="author-name">${author.firstName} ${author.lastName}</span>
						</a>`;
				});
			}
		},
		(err) => displayAlertPopup('error', err.message)
	);

document.querySelector('.load-more.articles').addEventListener('click', (e) => {
	fetch('/data/articles?page=2&limit=5')
		.then((res) => res.json())
		.then(
			(result) => {
				const { success, data, pages, currentPage, hasNextPage } = result;
				hasNextPage
					? document.querySelector('.load-more.articles').classList.remove('hidden')
					: document.querySelector('.load-more.articles').classList.add('hidden');
				renderArticles(data);
			},
			(err) => console.log(err)
		);
});
