import fetchData from './fetchData.js';
import togglePopup from './togglePopup.js';

fetchData('/data/profile', (res) => {
	const { success, data } = res;
	console.log(res);
	if (res && success) {
		if (typeof Storage !== 'undefined') {
			sessionStorage.setItem(
				'userProfilePictureUrl',
				data.profilePictureUrl || `/images/user.png`
			);
			sessionStorage.setItem('userId', data.userId);
			sessionStorage.setItem(
				'username',
				`${data.firstName.toLowerCase()}-${data.lastName.toLowerCase()}`
			);
			sessionStorage.setItem('userType', data.userType);
		} else {
			console.log('Sorry! No Web Storage support..');
		}
		document.getElementById('get-started').style.display = 'none';
		document.getElementById('user-profile').style.display = 'block';
		document.getElementById('logout').addEventListener('click', (e) => sessionStorage.clear());
		document.getElementById('user-profile').innerHTML = `<img class="user-profile-img" src="${
			data.profilePictureUrl || '/images/user.png'
		}" alt="${data.firstName}\'s profile picture">`;
		if (document.querySelector('.get-started-container')) {
			document.querySelector('.get-started-container').style.display = 'none';
		}

		if (window.location.pathname.split('/').at(-1).includes('profile')) {
			document.title = `ZEERUM \- ${data.firstName}\'s Profile`;
			// ? User data goes here
			document.querySelector('.user-img-container').innerHTML = `<img src="${
				data.profilePictureUrl || '/images/user.png'
			}" alt="" /><span class="edit-profile-picture"><i class="fas fa-pen"></i></span>`;
			// ? statistics data goes here
			document.querySelector(
				'.statistics-container'
			).innerHTML = `<div class="stats followers"><i class="fas fa-users"></i><div class="content"><span class="value"> ${
				data.followers.length
			} </span><span class="description">Followers</span></div></div><div class="stats followings"><i class="fas fa-user-plus"></i><div class="content"><span class="value"> ${
				data.followings.length
			} </span><span class="description">Followings</span></div></div>${
				sessionStorage.getItem('userType') === 'author'
					? '<div class="stats weekly-views"><i class="fas fa-eye"></i><div class="content"><span class="value"> 2.3K </span><span class="description">Weekly Views</span></div></div><div class="stats weekly-likes"><i class="fas fa-heart"></i><div class="content"><span class="value"> 1.1K </span><span class="description">Weekly Likes</span></div></div>'
					: ''
			}<div class="stats bookmarks"><i class="fas fa-bookmark"></i><div class="content"><span class="value"> ${
				data.bookmarks.length
			} </span><span class="description">Bookmarks</span></div></div>`;

			// ? Data for popup 'edit-profile-picture' goes here.
			document.querySelector('.edit-profile-picture').addEventListener('click', () => {
				const popUpData = ` <h1 class="heading">Edit your Profile Picture</h1><form action="/data/upload" encType="multipart/form-data" name="upload-profile-picture-form" id="upload-profile-picture-form" method="post"><label for="file"><img src="${sessionStorage.getItem(
					'userProfilePictureUrl'
				)}" alt="" /><i class="upload-icon fas fa-arrow-up"></i></label><input type="file" name="profilePicture" id="file" accept=".png,.jpeg,.jpg" /><p>Change your profile picture to stand out from other users. Supports PNG, JPG and JPEG images.<br /> Note that authors are mandatory to  upload a profile picture for better recognition and security. <br/><br/> Click on the above image to upload.</p><input type="submit" id="submit-profile-picture" value="Save changes" disabled/></form>`;
				togglePopup(popUpData);
				document.querySelector('.popup').classList.add('change-profile-picture');
				document
					.getElementById('upload-profile-picture-form')
					.addEventListener('submit', (e) => {
						if (document.querySelector('input[type="file"]').files.length <= 0) {
							e.preventDefault();
							alert("You didn't upload your profile picture.");
						}
					});
				document.getElementById('file').addEventListener('change', (e) => {
					document.getElementById('submit-profile-picture').disabled = false;
					document.querySelector('.upload-icon').classList.remove('fa-arrow-up');
					document.querySelector('.upload-icon').classList.add('fa-check');
					document.querySelector('.upload-icon').style.backgroundColor = '#2ecc71';
					document.querySelector('label[for="file"] img').style.borderColor = '#2ecc71';

					const img = document.querySelector('label[for="file"] img');
					const file = document.getElementById('file').files[0];
					img.file = file;

					const reader = new FileReader();
					reader.onload = (
						(aImg) => (e) =>
							(aImg.src = e.target.result)
					)(img);
					reader.readAsDataURL(file);
				});
			});
			if (
				window.location.search.slice(1) === `popup=edit-profile-picture` ||
				window.location.search.slice(1) === `edit-profile-picture=true`
			)
				document.querySelector('.edit-profile-picture').click();
			if (
				window.location.search.slice(1) === `changeUserType=author` ||
				window.location.search.slice(1) === `popup=become-an-author`
			) {
				if (data.userType !== 'author') {
					const popUpData = `<img src="/images/profile/becomeAnAuthor.png" alt="A pencil with a line drawn by it." /><h1 class="heading">Let\'s become an Author</h1> <p>Become an author to share your knowledge with others while gaining reputation from the community. </p><button id="submit-become-an-author">Become an Author</button>`;
					togglePopup(popUpData);
					document.querySelector('.popup').classList.add('change-user-type');
					document.getElementById('submit-become-an-author').addEventListener('click', (e) => {
						fetch('/data/profile?changeUserType=author')
							.then((res) => res.json())
							.then(({ success, message }) => {
								if (success) {
									alert(message);
									window.location.replace('/profile');
								} else alert(message);
							});
					});
				} else {
					const popUpData = `<img src="/images/profile/becomeAnAuthor.png" alt="A pencil with a line drawn by it." /><h1 class="heading">Change usertype from Author a Reader</h1> <p>Quis blanditiis pariatur officia corrupti qui velit quisquam quia. Reiciendis aut provident sit voluptatem quod qui odit ipsum. Et non fuga eum facilis rerum. Qui aut odit ullam assumenda nihil. Voluptatum earum voluptatem consequatur. Vitae veritatis ut eum.</p><button id="submit-become-a-reader">Become a Reader</button>`;
					togglePopup(popUpData);
					document.querySelector('.popup').classList.add('change-user-type');
					document.getElementById('submit-become-a-reader').addEventListener('click', (e) => {
						fetch('/data/profile?changeUserType=reader')
							.then((res) => res.json())
							.then(({ success, message }) => {
								if (success) {
									alert(message);
									window.location.replace('/profile');
								} else alert(message);
							});
					});
				}
			}

			document.querySelector('.user-data-container').innerHTML = `<span class="name">${
				data.firstName
			} ${data.lastName}</span>
				<span class="user-type-and-id">${data.userType} <span class="id">#${data.userId}</span></span>
				<span class="country">${data.country || 'Country unknown'}</span>
				<span class="joined-date">Joined on ${new Date(data.registeredDate).toDateString()}.</span>
				<span class="articles-number">${data.articlesPublished} articles published</span>`;
		}
		document.getElementById('user-profile').addEventListener('click', (e) => {
			e.stopPropagation();
			e.target.classList.toggle('active');
			document
				.querySelector('.user-profile-dropdown')
				.classList.toggle('user-profile-dropdown-active');
		});
		document.querySelector('body').addEventListener('click', (e) => {
			document.querySelector('.user-profile-img').classList.remove('active');
			e.stopPropagation();
			document
				.querySelector('.user-profile-dropdown')
				.classList.remove('user-profile-dropdown-active');
		});
		document
			.querySelector('.user-profile-dropdown')
			.addEventListener('click', (e) => e.stopPropagation());
	} else {
		document.getElementById('get-started').style.display = 'block';
		console.log(`Error occurred when requesting profile data.`, res.message);
	}
});

//? User specific articles
if (window.location.pathname.split('/').pop() === 'profile') {
	if (sessionStorage.getItem('userType') === 'author') {
		fetch(`/data/articles?authorUserId=${sessionStorage.getItem('userId')}`)
			.then((obj) => obj.json())
			.catch((err) => console.log(err))
			.then((res) => {
				console.log(res);
				if (res && res.success && res.data.length > 0) {
					const { success, data } = res;
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
						Seems like there's nothing to show at this moment.
					</span>
					<span class="no-search"></span>
				</div>`;
					console.log(`Error occurred when requesting user article data. ${res.message}`);
				}
			});
	} else {
		fetch('/data/articles?userBookmarked=true')
			.then((res) => res.json())
			.then((res) => {
				const { success, data } = res;
				if (success && data.length > 0) {
					const { success, data } = res;
					data.map((x) => {
						document.querySelector('.page-heading-1').innerHTML = 'Your Bookmarked Articles';
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
						Seems like there's nothing to show at this moment.
					</span>
					<span class="no-search"></span>
				</div>`;
					console.log(`Error occurred when requesting user article data. ${res.message}`);
				}
			});
	}
}

if (document.body.contains(document.getElementById('popup-container'))) {
	document.getElementById('popup-container').addEventListener('click', (e) => {
		e.stopPropagation();
		document.querySelector('.popup-container').classList.remove('popup-container-active');
		document.querySelector('body').style.overflowY = 'visible';
	});
	document.querySelector('.popup').addEventListener('click', (e) => {
		e.stopPropagation();
	});
}
