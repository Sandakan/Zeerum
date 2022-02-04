// jshint ignore:start
import timeFromNow from './timeFromNow.js';

// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

const noArticlesContainer = document.querySelector('.no-articles-container');

if (window.location.pathname.split('/').at(1) === 'search') {
	const searchPhrase = decodeURIComponent(window.location.pathname.split('/').at(-1));
	console.log(searchPhrase);
	document.title = `ZEERUM \| You searched for ${searchPhrase}`;
	document.querySelector('.highlight-categories').innerHTML = `\"${searchPhrase}\"`;

	fetch(`/data/search/${searchPhrase}`)
		.then((res) => res.json())
		.then(async ({ success, results }) => {
			if (success && results) {
				const { articles, users, categories } = results;
				let htmlData = ``;

				articles.forEach((x) => {
					const searchedPhraseHighlightedText = x.title.replaceAll(
						new RegExp(searchPhrase, 'gi'),
						(match) => `<span class="searched-phrase-highlight">${match}</span>`
					);
					const data = `<div class="article" onclick=\"window.location = \'../articles/${
						x.urlSafeTitle
					}\'\"><img class="article-image" src="${x.coverImg}" alt="${
						x.coverImgAlt
					}" onclick="window.location = '../articles/${
						x.urlSafeTitle
					}'"><div class="article-info-container"> <h2 class="article-heading"><a href="../articles/${
						x.urlSafeTitle
					}">${searchedPhraseHighlightedText}</a></h2><p class="article-description">${
						x.description
					}<a class="more" href="../articles/${
						x.urlSafeTitle
					}">Read more.</a><div class="article-author-container">By <a href="/user/${x.author.name
						.replace(/[^a-zA-Z0-9\s]/gm, '')
						.replace(/\s/gm, '-')
						.replace(/-$/gm, '')
						.toLowerCase()}">${
						x.author.name
					}</a></div><div class="article-categories-container">${x.categories
						.map((i) => {
							return `<span class="categories"> <a href="${i}">${i}</a></span>`;
						})
						.join('')}
                  </div></p></div></div>`;
					htmlData += data;
				});
				users.forEach((x) => {
					const searchedPhraseHighlightedText = `${x.firstName} ${x.lastName}`.replaceAll(
						new RegExp(searchPhrase, 'gi'),
						(match) => `<span class="searched-phrase-highlight">${match}</span>`
					);
					const data = ` <div class="user" onclick="document.location.href='/user/${
						x.username
					}'"> <img src="${x.profilePictureUrl || '/images/user.webp'}" alt="${
						x.username
					}\'s profile picture" onclick="document.location.href='/user/${
						x.username
					}'" /> <div class="user-data"><span class="name"><a href="/user/${
						x.username
					}">${searchedPhraseHighlightedText}</a>
				</span><span class="user-type">${x.userType}</span><span class="stats">${
						x.followers.length
					} followers / ${x.followings.length} followings</span></div></div> `;
					htmlData += data;
				});
				categories.forEach((x) => {
					const searchedPhraseHighlightedText = x.name.replaceAll(
						new RegExp(searchPhrase, 'gi'),
						(match) => `<span class="searched-phrase-highlight">${match}</span>`
					);
					const data = `<div class="category"><img src="/images/category.webp" alt="Tag icon" /> <a class="name" href="/categories/${x.name.toLowerCase()}">${searchedPhraseHighlightedText}</a></div>`;
					htmlData += data;
				});

				// document.querySelector('.articles-container').classList.remove('articles-loading');
				// document.querySelector('.navigate-through-links ul').classList.remove('links-loading');
				// document.querySelector('.search-through-categories').classList.remove('categories-loading');
				document.querySelector('.articles-container').innerHTML = htmlData;
			} else {
				document.querySelector('.articles-container').classList.remove('articles-loading');
				document.querySelector('.no-articles-container').classList.add('visible');
				document.querySelector('.no-articles-container > img').src =
					'/images/categories/no-search.svg';
				document.querySelector('.no-articles').style.display = 'none';
				document.querySelector('.no-search').style.display = 'block';
				document.querySelector(
					'.no-search'
				).innerHTML = `We don\'t have anything with the name \" ${window.location.pathname
					.split('/')
					.pop()} \". Recheck the spelling and try seaching with different words.`;
			}
		})
		.catch((err) => console.log(err));
}

if (window.location.pathname.split('/').at(1) === 'categories') {
	const category = decodeURIComponent(window.location.pathname.split('/').at(-1));
	document.title = `ZEERUM \| You searched for ${category}`;
	document.querySelector('.highlight-categories').innerHTML = `\"${category}\"`;
	fetch(`/data/articles?categoryId=${category}`)
		.then((res) => res.json())
		.then((res) => {
			if (res.success && res.data.length > 0) {
				document.querySelector('.articles-container').innerHTML = res.data
					.map((article) => {
						return `<div class="article" onclick=\"window.location = \'../articles/${
							article.urlSafeTitle
						}\'\"><img class="article-image" src="${article.coverImg}" alt="${
							article.coverImgAlt
						}" onclick="window.location = '../articles/${
							article.urlSafeTitle
						}'"><div class="article-info-container"> <h2 class="article-heading"><a href="../articles/${
							article.urlSafeTitle
						}">${article.title}</a></h2><p class="article-description">${
							article.description
						}<a class="more" href="../articles/${
							article.urlSafeTitle
						}">Read more.</a><div class="article-author-container">By <a href="/user/${article.author.name
							.replace(/[^a-zA-Z0-9\s]/gm, '')
							.replace(/\s/gm, '-')
							.replace(/-$/gm, '')
							.toLowerCase()}">${
							article.author.name
						}</a></div> <div class="article-stats-container"> <span class="stat"><i class="fas fa-eye"></i> ${
							article.views.allTime
						}</span><span class="stat"><i class="fas fa-heart"></i> ${
							article.reactions.likes.length
						}</span> <span class="stat"><i class="fas fa-bookmark"></i> ${
							article.reactions.bookmarks.length
						}</span><span class="stat"><i class="fas fa-share-alt"></i> ${
							article.reactions.shares
						}</span><span class="stat" title="${new Date(
							article.releasedDate
						).toString()}"><i class="fas fa-clock"></i> ${timeFromNow(
							article.releasedDate
						)}</span></div> <div class="article-categories-container">${article.categories
							.map((i) => {
								return `<span class="category"> <a href="${i}">${i}</a></span>`;
							})
							.join('')}
                  </div><div class="article-tags-container">${article.tags
							.map((tag) => `<span class="tag"><a href="/tags/${tag}">#${tag}</a></span>`)
							.join('')}</div></p></div></div>`;
					})
					.join('');
			} else {
				document.querySelector('.articles-container').classList.remove('articles-loading');
				document.querySelector('.no-articles-container').classList.add('visible');
			}
		})
		.catch((err) => console.log(err));
}

if (window.location.pathname.split('/').at(1) === 'tags') {
	const tag = decodeURIComponent(window.location.pathname.split('/').at(-1));
	document.title = `ZEERUM \| Articles related to #${tag}`;
	document.querySelector(
		'.page-heading-1'
	).innerHTML = `Articles related to <span class="highlight-categories">\"#${tag}\"</span>`;
	fetch(`/data/articles?tag=${tag}`)
		.then((res) => res.json())
		.then((res) => {
			if (res.success && res.data.length > 0) {
				document.querySelector('.articles-container').innerHTML = res.data
					.map((article) => {
						return `<div class="article" onclick=\"window.location = \'../articles/${
							article.urlSafeTitle
						}\'\"><img class="article-image" src="${article.coverImg}" alt="${
							article.coverImgAlt
						}" onclick="window.location = '../articles/${
							article.urlSafeTitle
						}'"><div class="article-info-container"> <h2 class="article-heading"><a href="../articles/${
							article.urlSafeTitle
						}">${article.title}</a></h2><p class="article-description">${
							article.description
						}<a class="more" href="../articles/${
							article.urlSafeTitle
						}">Read more.</a><div class="article-author-container">By <a href="/user/${article.author.name
							.replace(/[^a-zA-Z0-9\s]/gm, '')
							.replace(/\s/gm, '-')
							.replace(/-$/gm, '')
							.toLowerCase()}">${
							article.author.name
						}</a></div> <div class="article-stats-container"> <span class="stat"><i class="fas fa-eye"></i> ${
							article.views.allTime
						}</span><span class="stat"><i class="fas fa-heart"></i> ${
							article.reactions.likes.length
						}</span> <span class="stat"><i class="fas fa-bookmark"></i> ${
							article.reactions.bookmarks.length
						}</span><span class="stat"><i class="fas fa-share-alt"></i> ${
							article.reactions.shares
						}</span><span class="stat" title="${new Date(
							article.releasedDate
						).toString()}"><i class="fas fa-clock"></i> ${timeFromNow(
							article.releasedDate
						)}</span></div> <div class="article-categories-container">${article.categories
							.map((i) => {
								return `<span class="category"> <a href="${i}">${i}</a></span>`;
							})
							.join('')}
                  </div><div class="article-tags-container">${article.tags
							.map((tag) => `<span class="tag"><a href="/tags/${tag}">#${tag}</a></span>`)
							.join('')}</div></p></div></div>`;
					})
					.join('');
			} else {
				document.querySelector('.articles-container').classList.remove('articles-loading');
				document.querySelector('.no-articles-container').classList.add('visible');
			}
		})
		.catch((err) => console.log(err));
}

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

fetch('/data/articles?trendingArticles=true&limit=5')
	.then((res) => res.json())
	.then((res) => {
		document.querySelector('.navigate-through-links ul').classList.remove('links-loading');
		if (res.success && res.data.length > 0) {
			res.data.forEach((x) => {
				document.querySelector(
					'.navigate-through-links > ul'
				).innerHTML += `<li><a href="/articles/${x.urlSafeTitle}">${x.title}</a></li>`;
			});
		} else
			console.log(
				`Error occurred when requesting article data for navigate through links panel.`
			);
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
