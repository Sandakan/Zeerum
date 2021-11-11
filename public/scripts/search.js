import fetchData from './fetchData.js';

// ? Event Listeners ///////////////////////////////////////////
document.querySelector('.search-bar, .search-btn').addEventListener('focusin', () => {
	document
		.querySelector('.search-results-container')
		.classList.add('search-results-container-focused');
	document.querySelector('.search-bar').classList.add('search-bar-focused');
});

document.querySelector('.search-bar, .search-btn').addEventListener('focusout', () => {
	document
		.querySelector('.search-results-container')
		.classList.remove('search-results-container-focused');
	document.querySelector('.search-bar').classList.remove('search-bar-focused');
});

document.querySelector('#search').addEventListener('input', () => {
	setTimeout(() => {
		let searchInput = document.querySelector('#search').value;
		if (searchInput !== '') {
			fetchData(`/data/search/${searchInput.toLowerCase()}`, (res) => {
				if (res.success) {
					const { articles, users, tags } = res.results;
					let temp = [];
					articles.forEach((x) => {
						let searchedLettersHighlight = x.title
							.toLowerCase()
							.replaceAll(
								`${searchInput.toLowerCase()}`,
								`<span class="searched-phrase-highlight">${searchInput.toLowerCase()}</span>`
							);
						if (temp.length < 3)
							temp.push(
								`<a href="${x.url}" class="search-result"><img src="/images/article.png" alt="" /> <span class="text">${searchedLettersHighlight}</span> </a>`
							);
					});
					users.forEach((x) => {
						let searchedLettersHighlight = x.fullname
							.toLowerCase()
							.replaceAll(
								`${searchInput.toLowerCase()}`,
								`<span class="searched-phrase-highlight">${searchInput.toLowerCase()}</span>`
							);
						if (temp.length < 3)
							temp.push(
								`<a href="${x.url}" class="search-result"><img src="/images/user.png" alt="" /> <span class="text">${searchedLettersHighlight}</span> </a>`
							);
					});
					tags.forEach((x) => {
						let searchedLettersHighlight = x.name
							.toLowerCase()
							.replaceAll(
								`${searchInput.toLowerCase()}`,
								`<span class="searched-phrase-highlight">${searchInput.toLowerCase()}</span>`
							);
						if (temp.length < 3)
							temp.push(
								`<a href="${x.url}" class="search-result"><img src="/images/tag.png" alt="" /> <span class="text">${searchedLettersHighlight}</span> </a>`
							);
					});
					document.querySelector('.search-results-container').innerHTML = temp.join('');
				} else {
					document.querySelector(
						'.search-results-container'
					).innerHTML = `<div class="no-search-results-container"><img src="/images/error.png">We don't have anything with the name \" ${searchInput} \". Try seaching with different words.</div>`;
				}
			});
		} else {
			document.querySelector(
				'.search-results-container'
			).innerHTML = `<div class="search-description"><img src="/images/search.png" alt="A magnifying glass">Search for anything from here including articles, tags, authors, hot topics etc.</div>`;
		}
	}, 300);
});

document.querySelector('#search').addEventListener('keypress', (event) => {
	if (event.keyCode === 13) {
		let searchInput = document.querySelector('#search').value;
		if (searchInput !== '') window.location = `search/${searchInput}`;
	}
});

document.querySelector('#search-btn').addEventListener('click', () => {
	let searchInput = document.querySelector('#search').value;
	if (searchInput !== '') window.location = `search/${searchInput}`;
});
//? /////////////////////////////////////////////////////////////////
