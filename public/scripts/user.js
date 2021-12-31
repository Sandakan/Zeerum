// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

let userId = window.location.pathname.split('/').at(-1) || sessionStorage.getItem('userId');
var articlesPublished = 0;

fetch(`/data/articles?authorUserId=${userId}`)
	.then((obj) => obj.json())
	.catch((err) => console.log(err))
	.then((res) => {
		const { success, data } = res;
		// console.log(data);
		if (success && data.length > 0) {
			articlesPublished = data.length || 0;
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
				}">Read more.</a></p><div class="article-stats-container"> <span class="stat"><i class="fas fa-eye"></i> ${
					x.views.allTime
				}</span><span class="stat"><i class="fas fa-heart"></i> ${
					x.reactions.likes.length
				}</span> <span class="stat"><i class="fas fa-bookmark"></i> ${
					x.reactions.bookmarks.length
				}</span><span class="stat"><i class="fas fa-share-alt"></i> ${
					x.reactions.shares
				}</span></div><div class="article-tags-container">${x.tags.map(
					(y) => `<span class="tags"><a href="tags/${y}">${y}</a></span>`
				)}</div></div></div>`;
			});
		} else {
			document.querySelector(
				'.articles-container'
			).innerHTML = `<div class="no-articles-container" style="display:flex;">
					<img src="/images/tags/no-articles.svg" alt="" />
					<span class="no-articles">
						Oops, seems like there's nothing to show at this moment.
					</span>
					<span class="no-search"></span>
				</div>`;
			console.log(`Error occurred when requesting user article data. ${res.message}`, res);
		}
	});

fetch(`/data/users/${userId}`)
	.then((obj) => obj.json())
	.catch((err) => console.log(err))
	.then((res) => {
		const { success, data } = res;
		console.log(res);
		if (success) {
			document.title = `ZEERUM \- ${data.firstName}\'s Profile`;
			document.querySelector('.user-img-container').innerHTML = `<img src="${
				data.profilePictureUrl || '/images/user.png'
			}" alt="" />`;
			document.querySelector('.user-data-container').innerHTML = `<span class="name">${
				data.firstName
			} ${data.lastName}</span>
				<span class="user-type-and-id">${data.userType} <span class="id">#${data.userId}</span></span>
				<span class="country">${data.country || 'Country unknown'}</span>
				<span class="joined-date">Joined on ${new Date(data.registeredDate).toDateString()}</span>
				<span class="followers-and-followings">${data.followers.length} followers / ${
				data.followings.length
			} followings</span>
				<span class="articles-number">${articlesPublished} articles published</span>
				${
					data.followers.includes(Number(sessionStorage.getItem('userId')))
						? '<button class="follow-btn followed"> <i class="fas fa-check"></i> Followed</button>'
						: '<button class="follow-btn"> <i class="fas fa-add"></i> Follow</button>'
				}`;
			document.querySelector('.follow-btn').addEventListener('click', async () => {
				if (document.querySelector('.follow-btn').classList.contains('followed')) {
					fetch(`/data/profile?followUser=false&followingUserId=${data.userId}`)
						.then((x) => x.json())
						.then((x) => {
							console.log(x);
							if (x.success) {
								document.querySelector('.follow-btn').classList.remove('followed');
								document.querySelector(
									'.follow-btn'
								).innerHTML = ` <i class="fas fa-add"></i> Follow`;
								document.querySelector('.followers-and-followings').innerHTML = `${
									data.followers.length - 1
								} followers / ${data.followings.length} followings`;
							} else alert(x.message);
						});
				} else {
					fetch(`/data/profile?followUser=true&followingUserId=${data.userId}`)
						.then((x) => x.json())
						.then((x) => {
							console.log(x);
							if (x.success) {
								document.querySelector('.follow-btn').classList.add('followed');
								document.querySelector(
									'.follow-btn'
								).innerHTML = `<i class="fas fa-check"></i> followed`;
								document.querySelector(
									'.followers-and-followings'
								).innerHTML = `${data.followers.length} followers / ${data.followings.length} followings`;
							} else alert(x.message);
						});
				}
			});
		} else console.log(`Error occurred when requesting user data.`, res);
	});
