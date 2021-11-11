let userId = window.location.pathname.split('/').at(-1);
// console.log(typeof userId, userId);
var articlesPublished = 0;

fetch(`/data/articles?userId=${userId}`)
	.then((obj) => obj.json())
	.catch((err) => console.log(err))
	.then(({ success, data }) => {
		console.log(data);
		if (success) {
			articlesPublished = data.length || 0;
			data.map((x) => {
				document.querySelector(
					'.articles-container'
				).innerHTML += `<div class="article" onclick="window.location = '/articles/${x.title
					.replace(/[^a-zA-Z0-9\s]/gm, '')
					.replace(/\s/gm, '-')
					.replace(/-$/gm, '')
					.toLowerCase()}';"><img class="article-image" src="${x.coverImg}" alt="${
					x.coverImgAlt
				}" onclick="window.location = '/articles/${x.title
					.replace(/[^a-zA-Z0-9\s]/gm, '')
					.replace(/\s/gm, '-')
					.replace(/-$/gm, '')
					.toLowerCase()}';"/><div class="article-info-container"><h2 class="article-heading"><a href="/articles/${x.title
					.replace(/[^a-zA-Z0-9\s]/gm, '')
					.replace(/\s/gm, '-')
					.replace(/-$/gm, '')
					.toLowerCase()}">${x.title}</a></h2><p class="article-description">${
					x.description
				}<a class="more" href="/articles/${x.title
					.replace(/[^a-zA-Z0-9\s]/gm, '')
					.replace(/\s/gm, '-')
					.replace(/-$/gm, '')
					.toLowerCase()}">Read more.</a></p><div class="article-tags-container">${x.tags.map(
					(y) => `<span class="tags"><a href="tags/${y}">${y}</a></span>`
				)}</div></div></div>`;
			});
		} else console.log('Error occurred in requesting user article data.');
	});

fetch(`/data/users/${userId}`)
	.then((obj) => obj.json())
	.catch((err) => console.log(err))
	.then((res) => {
		const { success, data } = res;
		console.log(res);
		if (success) {
			document.title = `ZEERUM \- ${data.firstName}\'s Profile`;
			document.querySelector(
				'.user-img-container'
			).innerHTML = `<img src="${data.profilePictureUrl}" alt="" />`;
			document.querySelector(
				'.user-data-container'
			).innerHTML = `<span class="name">${data.firstName} ${data.lastName}</span>
				<span class="user-type-and-id">${data.userType} <span class="id">#${data.userId}</span></span>
				<span class="country">${data.country}</span>
				<span class="joined-date">${data.registeredDate}</span>
				<span class="followers-and-followings">${data.followers.length} followers / ${data.followings.length} followings</span>
				<span class="articles-number">${articlesPublished} articles published</span>`;
		} else console.log(`Error occurred when requesting user data.`, res);
	});
