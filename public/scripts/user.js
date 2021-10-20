// console.log(`/data${window.location.pathname.split('/')}`);
var userId = parseInt(window.location.pathname.split('/').pop());
var articlesPublished = 0;

fetch(`/data/articles?userId=${userId}`)
	.then((obj) => obj.json())
	.then((data) => {
		articlesPublished = data.articleData.length || 0;
		data.articleData.map((x) => {
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
				.toLowerCase()}">Read more.</a></p><div class="article-tags-container">${x.tags.map(
				(y) => `<span class="tags"><a href="tags/${y}">${y}</a></span>`
			)}</div></div></div>`;
		});
	});

fetch(`/data/users/${userId}`)
	.then((obj) => obj.json())
	.then((data) => {
		console.log(data);
		document.querySelector(
			'.user-img-container'
		).innerHTML = `<img src="${data.profilePicture}" alt="" /><span class="edit-profile-picture"><i class="fas fa-pen"></i></span>`;
		document.querySelector(
			'.user-data-container'
		).innerHTML = `<span class="name">${data.firstName} ${data.lastName}</span>
				<span class="user-type-and-id">${data.userType} <span class="id">#${data.id}</span></span>
				<span class="country">${data.country}</span>
				<span class="joined-date">${data.registeredDate}</span>
				<span class="followers-and-followings">0 followers / 0 followings</span>
				<span class="articles-number">${articlesPublished} articles published</span>`;
	});
