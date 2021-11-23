import fetchData from './fetchData.js';

const togglePopup = (innerHTML, forceOpen = false) => {
	if (!document.querySelector('.popup-container').classList.contains('popup-container-active')) {
		document.querySelector('.popup-container').classList.add('popup-container-active');
		document.querySelector('body').style.overflowY = 'hidden';
		document.querySelector(
			'.popup'
		).innerHTML = `<span class="close-btn"><i class="far fa-times-circle"></i></span>${innerHTML}`;
	} else {
		document.querySelector('.popup-container').classList.remove('popup-container-active');
		document.querySelector('body').style.overflowY = 'visible';
	}
	document.querySelector('.popup > .close-btn').addEventListener('click', () => {
		document.querySelector('.popup-container').classList.remove('popup-container-active');
		document.querySelector('body').style.overflowY = 'visible';
	});
};

fetchData('/data/profile', (res) => {
	const { success, data } = res;
	if (success) {
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
		} else {
			console.log('Sorry! No Web Storage support..');
		}
		document.getElementById('get-started').style.display = 'none';
		document.getElementById('user-profile').style.display = 'block';
		document.getElementById('user-profile-dropdown').style.display = 'block';
		document.getElementById('user-profile').innerHTML = `<img class="user-profile-img" src="${
			data.profilePictureUrl || '/images/user.png'
		}">`;
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
			).innerHTML = `<div class="stats followers"><i class="fas fa-users"></i><div class="content"><span class="value"> ${data.followers.length} </span><span class="description">Followers</span></div></div><div class="stats followings"><i class="fas fa-user-plus"></i><div class="content"><span class="value"> ${data.followings.length} </span><span class="description">Followings</span></div></div><div class="stats weekly-views"><i class="fas fa-eye"></i><div class="content"><span class="value"> 2.3K </span><span class="description">Weekly Views</span></div></div><div class="stats weekly-likes"><i class="fas fa-heart"></i><div class="content"><span class="value"> 1.1K </span><span class="description">Weekly Likes</span></div></div>`;
			// ? Data for popup 'edit-profile-picture' goes here.
			document.querySelector('.edit-profile-picture').addEventListener('click', () => {
				const popUpData = ` <h1 class="heading">Edit your Profile Picture</h1><form action="/data/upload" encType="multipart/form-data" name="upload-profile-picture-form" id="upload-profile-picture-form" method="post"><label for="file"><img src="${sessionStorage.getItem(
					'userProfilePictureUrl'
				)}" alt="" /><i class="upload-icon fas fa-arrow-up"></i></label><input type="file" name="profilePicture" id="file" accept=".png,.jpeg,.jpg" /><p>Change your profile picture to stand out from other users. Supports PNG, JPG and JPEG images.<br /> Note that authors are mandatory to  upload a profile picture for better recognition and security.</p><input type="submit" id="submit-profile-picture" value="Save changes" disabled/></form>`;
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
			if (window.location.search.slice(1) === `popup=edit-profile-picture`)
				document.querySelector('.edit-profile-picture').click();
			if (
				window.location.search.slice(1) === `becomeAnAuthor=true` ||
				window.location.search.slice(1) === `popup=become-an-author`
			) {
				const popUpData = `<img src="/images/profile/becomeAnAuthor.png" alt="A pencil with a line drawn by it." /><form action="/data/profile?becomeAnAuthor=true" method="get"><h1 class="heading">Let\'s become an Author</h1></form>`;
				togglePopup(popUpData);
				document.querySelector('.popup').classList.add('become-an-author');
			}

			document.querySelector('.user-data-container').innerHTML = `<span class="name">${
				data.firstName
			} ${data.lastName}</span>
				<span class="user-type-and-id">${data.userType} <span class="id">#${data.userId}</span></span>
				<span class="country">${data.country || 'Country unknown'}</span>
				<span class="joined-date">Joined on ${new Date(data.registeredDate).toDateString()}.</span>
				<span class="articles-number">${data.articlesPublished} articles published</span>`;
		}
		document.getElementById('user-profile').addEventListener('click', () => {
			document
				.querySelector('.user-profile-dropdown')
				.classList.toggle('user-profile-dropdown-active');
		});
	} else {
		document.getElementById('get-started').style.display = 'block';
		console.log(`Error occurred when requesting profile data.`, res.message);
	}
});

//? User specific articles
if (window.location.pathname.split('/').pop() === 'profile') {
	fetch(`/data/articles?userId=${sessionStorage.getItem('userId')}`)
		.then((obj) => obj.json())
		.catch((err) => console.log(err))
		.then((res) => {
			const { success, data } = res;
			console.log(res);
			if (success && data.length > 0) {
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
					}">Read more.</a></p><div class="article-tags-container">${x.tags.map(
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
				console.log(`Error occurred when requesting user article data. ${res.message}`);
			}
		});
}

document.getElementById('popup-container').addEventListener('click', (e) => {
	document.querySelector('.popup-container').classList.remove('popup-container-active');
	document.querySelector('body').style.overflowY = 'visible';
});
document.querySelector('.popup').addEventListener('click', (e) => {
	e.stopPropagation();
});
