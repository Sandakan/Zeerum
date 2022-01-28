import fetchData from './fetchData.js';

// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// ? Event Listeners ///////////////////////////////////////////
document.querySelector('.search-bar').addEventListener('focusin', (e) => {
	e.stopPropagation();
	document
		.querySelector('.search-results-container')
		.classList.add('search-results-container-focused');
	document.querySelector('.search-bar').classList.add('search-bar-focused');
});
document.querySelector('.search-bar').addEventListener('click', (e) => e.stopPropagation());

document.querySelector('body').addEventListener('click', () => {
	document
		.querySelector('.search-results-container')
		.classList.remove('search-results-container-focused');
	document.querySelector('.search-bar').classList.remove('search-bar-focused');
});

document.querySelector('#search').addEventListener('input', () => {
	document.querySelector('.search-results-container').classList.add('results-loading');
	setTimeout(() => {
		let searchPhrase = document.querySelector('#search').value;
		if (searchPhrase !== '') {
			fetchData(`/data/search/${encodeURIComponent(searchPhrase.toLowerCase())}`, (res) => {
				console.log(res);
				if (res.success) {
					const { articles, users, categories, tags } = res.results;
					let temp = [];
					articles.forEach((x) => {
						if (articles.length !== 0) {
							const searchedPhraseHighlightedText = x.title.replaceAll(
								new RegExp(searchPhrase, 'gi'),
								(match) => `<span class="searched-phrase-highlight">${match}</span>`
							);
							if (temp.length < 3)
								temp.push(
									`<a href="/articles/${x.urlSafeTitle}" class="search-result"><img src="/images/article.webp" alt="" /> <span class="text">${searchedPhraseHighlightedText}</span> </a>`
								);
						}
					});
					users.forEach((x) => {
						if (users.length !== 0) {
							const searchedPhraseHighlightedText =
								`${x.firstName} ${x.lastName}`.replaceAll(
									new RegExp(searchPhrase, 'gi'),
									(match) => `<span class="searched-phrase-highlight">${match}</span>`
								);
							if (temp.length < 3)
								temp.push(
									`<a href="/user/${x.username}" class="search-result"><img src="${
										x.profilePictureUrl || '/images/user.webp'
									}" alt="" /> <span class="text">${searchedPhraseHighlightedText}</span> </a>`
								);
						}
					});
					categories.forEach((x) => {
						if (categories.length !== 0) {
							const searchedPhraseHighlightedText = x.name.replaceAll(
								new RegExp(searchPhrase, 'gi'),
								(match) => `<span class="searched-phrase-highlight">${match}</span>`
							);
							if (temp.length < 3)
								temp.push(
									`<a href="/categories/${x.name.toLowerCase()}" class="search-result"><img src="/images/category.webp" alt="" /> <span class="text">${searchedPhraseHighlightedText}</span> </a>`
								);
						}
					});
					tags.forEach((x) => {
						if (tags.length > 0) {
							const searchedPhraseHighlightedText = x.name.replaceAll(
								new RegExp(searchPhrase, 'gi'),
								(match) => `<span class="searched-phrase-highlight">${match}</span>`
							);
							if (temp.length < 3)
								temp.push(
									`<a href="/tags/${x.name.toLowerCase()}" class="search-result"><img src="/images/tag.webp" alt="" /> <span class="text">${searchedPhraseHighlightedText}</span> </a>`
								);
						}
					});
					document
						.querySelector('.search-results-container')
						.classList.remove('results-loading');
					document.querySelector('.search-results-container').innerHTML = temp.join('');
				} else {
					document
						.querySelector('.search-results-container')
						.classList.remove('results-loading');
					document.querySelector(
						'.search-results-container'
					).innerHTML = `<div class="no-search-results-container"><img src="/images/error.webp">We don't have anything with the name \" ${searchPhrase} \". Try seaching with different words.</div>`;
				}
			});
		} else {
			document.querySelector('.search-results-container').classList.remove('results-loading');
			document.querySelector(
				'.search-results-container'
			).innerHTML = `<div class="search-description"><img src="/images/search.webp" alt="A magnifying glass">Search for anything from here including articles, categories, authors, hot topics etc.</div>`;
		}
	}, 500);
});

document.querySelector('#search').addEventListener('keypress', (e) => {
	e.stopPropagation();
	if (e.keyCode === 13) {
		let searchPhrase = document.querySelector('#search').value;
		if (searchPhrase !== '') window.location = `search/${encodeURIComponent(searchPhrase)}`;
	}
});

document.querySelector('.search-btn').addEventListener('click', (e) => {
	e.stopPropagation();
	let searchPhrase = document.querySelector('#search').value;
	if (searchPhrase !== '') {
		window.location = `/search/${searchPhrase}`;
	} else alert('Type something in the search bar !!!');
});

document
	.querySelector('.search-results-container')
	.addEventListener('click', (e) => e.stopPropagation());
//? /////////////////////////////////////////////////////////////////
