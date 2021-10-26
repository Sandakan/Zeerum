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
			fetchData(`/data/articles?search=${searchInput.toLowerCase()}`, (data) => {
				// console.log(data);
				const { success, resourceAvailability, articleData } = data;
				if (resourceAvailability) {
					let temp = '';
					articleData.forEach((x) => {
						let searchedLettersHighlight = x.title
							.toLowerCase()
							.replaceAll(
								`${searchInput.toLowerCase()}`,
								`<span class="searched-letter-highlight">${searchInput}</span>`
							);
						// .split('')
						// .map((y) => {
						// 	if (searchInput.toLowerCase().includes(y.toLowerCase())) {
						// 		return `<span class="searched-letter-highlight">${y}</span>`;
						// 	} else return y;
						// })
						// .join('');
						temp += `<a href="/articles/${x.title}" class="search-result">${searchedLettersHighlight}</a>`;
					});
					console.log(temp);
					document.querySelector('.search-results-container').innerHTML = temp;
				} else {
					document.querySelector(
						'.search-results-container'
					).innerHTML = `<div class="no-search-results-container"><img src="/images/error.png">We don't have anything with the name \" ${searchInput} \". Try seaching with different words.</div>`;
				}
			});
		} else {
			document.querySelector(
				'.search-results-container'
			).innerHTML = `<div class="search-anything"><img src="/images/search.png" alt="A magnifying glass">Search for anything from here including articles, tags, authors, hot topics etc.</div>`;
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
