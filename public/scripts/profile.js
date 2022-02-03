import valueRounder from './valueRounder.js';
import togglePopup from './togglePopup.js';
import displayAlertPopup from './displayAlertPopup.js';

// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

fetch('/data/profile')
	.then((res) => res.json())
	.then((res) => {
		if (res && res.success) {
			const { success, data } = res;
			if (typeof Storage !== 'undefined') {
				sessionStorage.setItem(
					'userProfilePictureUrl',
					data.profilePictureUrl || `/images/user.webp`
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
			document.querySelector('body').classList.add('logged-in');
			if (document.body.contains(document.getElementById('logout')))
				document
					.getElementById('logout')
					.addEventListener('click', (e) => sessionStorage.clear());
			document.getElementById('user-profile').innerHTML = `
			<img class="user-profile-img" src="${data.profilePictureUrl || '/images/user.webp'}"
			alt="${data.firstName}\'s profile picture">`;
			document.getElementById('user-profile-dropdown').innerHTML = `
			<div class="user-data-container">
				<img src="${data.profilePictureUrl || '/images/user.webp'}" 
					alt="${data.firstName}\'s profile picture" 
				/>
				<a href="/profile" class="name">${data.firstName} ${data.lastName}</a>
			</div>
			<ul>
				<li><a href="/profile"><i class="fas fa-user"></i> Profile</a></li>
				${
					sessionStorage.getItem('userType') && sessionStorage.getItem('userType') === 'reader'
						? `<li>
								<a href="/profile?changeUserType=author">
									<i class="fas fa-user"></i> Become An Author
								</a>
							</li>`
						: `<li>
								<a href="/profile?changeUserType=reader">
									<i class="fas fa-user"></i> Become A Reader
								</a>
							</li>`
				}
				<li>
					<a href="/profile?popup=settings">
						<i class="fas fa-cog"></i> Settings
					</a>
				</li>
				<li id="change-theme">
					<a href="#">
						${
							document.body.classList.contains('dark-mode')
								? `<i class="fas fa-sun"></i> Light Mode`
								: `<i class="fas fa-moon"></i> Dark Mode`
						}
					</a>
				</li>
				<li id="logout">
					<a href="/logout">
						<i class="fas fa-sign-out-alt"></i> Log out
					</a>
				</li>
			</ul>`;
			document
				.querySelector('.user-profile-dropdown > .user-data-container > img')
				.addEventListener('click', () => (location.href = '/profile'));
			document.querySelector('#change-theme').addEventListener('click', () => changeTheme(''));
			document.getElementById('user-profile').addEventListener('click', (e) => {
				e.stopPropagation();
				e.target.classList.toggle('active');
				document
					.querySelector('.user-profile-dropdown')
					.classList.toggle('user-profile-dropdown-active');
			});
			document.body.addEventListener('click', (e) => {
				document.querySelector('.user-profile-img').classList.remove('active');
				e.stopPropagation();
				document
					.querySelector('.user-profile-dropdown')
					.classList.remove('user-profile-dropdown-active');
			});
			document
				.querySelector('.user-profile-dropdown')
				.addEventListener('click', (e) => e.stopPropagation());

			if (window.location.pathname.split('/').at(-1).includes('profile')) {
				document.title = `ZEERUM \- ${data.firstName}\'s Profile`;
				// ? User data goes here
				document.querySelector('.user-img-container').innerHTML = `
				<img src="${data.profilePictureUrl || '/images/user.webp'}" alt="" />
				<span class="edit-profile-picture"><i class="fas fa-pen"></i></span>`;
				// ? statistics data goes here
				document.querySelector(
					'.statistics-container'
				).innerHTML = `<div class="stats followers">
					<i class="fas fa-users"></i>
					<div class="content">
						<span class="value"> ${valueRounder(data.followers.length)} </span>
						<span class="description">Followers</span>
					</div>
				</div>
				<div class="stats followings">
					<i class="fas fa-user-plus"></i>
					<div class="content">
						<span class="value"> ${valueRounder(data.followings.length)} </span>
						<span class="description">Followings</span>
					</div>
				</div>
				${
					sessionStorage.getItem('userType') === 'author'
						? `<div class="stats weekly-views">
						<i class="fas fa-eye"></i>
						<div class="content">
							<span class="value"> ${valueRounder(data.allTimeViews)} </span>
							<span class="description">Total Views</span>
						</div>
					</div>
					<div class="stats weekly-likes">
						<i class="fas fa-heart"></i>
						<div class="content">
							<span class="value">${valueRounder(data.allTimeLikes)} </span>
							<span class="description">Total Likes</span>
						</div>
					</div>`
						: ''
				}
			<div class="stats bookmarks">
			<i class="fas fa-bookmark"></i>
				<div class="content">
					<span class="value"> ${valueRounder(data.bookmarks.length)} </span>
					<span class="description">Bookmarks</span>
				</div>
			</div>`;

				document
					.querySelector('.edit-profile-picture')
					.addEventListener('click', () => changeProfilePicture());
				const searchParams = new URLSearchParams(window.location.search);
				if (
					searchParams.get('popup') === `edit-profile-picture` ||
					searchParams.has('edit-profile-picture')
				)
					document.querySelector('.edit-profile-picture').click();
				if (
					searchParams.get('changeUserType') === `author` ||
					searchParams.get('popup') === `become-an-author` ||
					searchParams.get('changeUserType') === `reader` ||
					searchParams.get('popup') === `become-a-reader`
				) {
					changeUserType(data);
				}
				//settings pane
				if (searchParams.get('popup') === `settings`) {
					changeSettings();
				}

				document.querySelector('.user-container > .user-data-container').innerHTML = `
				<span class="name">${data.firstName} ${data.lastName}</span>
				<span class="user-type-and-id">${data.userType} <span class="id">#${data.userId}</span></span>
				<span class="country">${data.country || 'Country unknown'}</span>
				<span class="joined-date">Joined on ${new Date(data.registeredDate).toDateString()}.</span>
				<span class="articles-number">${data.articlesPublished} articles published</span>`;
			}
		} else {
			document.querySelector('body').classList.add('logged-out');
			console.log(`Error occurred when requesting profile data.`, res.message);
			sessionStorage.clear();
		}
		// UNSTABLE CODE FOR SWITCHING THEME ACCORDING TO SYSTEM THEME
		// if (
		// 	sessionStorage.getItem('systemTheme') === null &&
		// 	window.matchMedia('(prefers-color-scheme: dark)').matches
		// ) {
		// 	sessionStorage.setItem('systemTheme', 'dark');
		// 	changeTheme('dark');
		// }
		document
			.querySelector('.made-with-love .heart')
			.addEventListener('click', () => changeTheme(''));
	})
	.catch((err) => console.log(err));

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
						}</span></div><div class="article-categories-container">${x.categories.map(
							(y) => `<span class="category"><a href="categories/${y}">${y}</a></span>`
						)}</div></div></div>`;
					});
				} else {
					document.querySelector(
						'.articles-container'
					).innerHTML = `<div class="no-articles-container" style="display:flex;">
					<img src="/images/categories/no-articles.svg" alt="" />
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
						}</span></div> <div class="article-categories-container">${x.categories
							.map(
								(y) => `<span class="category"><a href="categories/${y}">#${y}</a></span>`
							)
							.join('')}</div></div></div>`;
					});
				} else {
					document.querySelector(
						'.articles-container'
					).innerHTML = `<div class="no-articles-container" style="display:flex;">
					<img src="/images/categories/no-articles.svg" alt="" />
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

// ? ///////////////////////////////////  FUNCTIONS  ///////////////////////////////////////////////////
// ? Data for popup 'edit-profile-picture' goes here.
const changeProfilePicture = () => {
	const popUpData = ` <h1 class="heading">Edit your Profile Picture</h1><form action="/data/upload/profile/user-profile-picture" encType="multipart/form-data" name="uploadProfilePictureForm" id="upload-profile-picture-form" method="post"><label for="file"><img src="${sessionStorage.getItem(
		'userProfilePictureUrl'
	)}" alt="" /><i class="upload-icon fas fa-arrow-up"></i></label><input type="file" name="profilePicture" id="file" accept=".png,.jpeg,.jpg,.webp" /><p>Change your profile picture to stand out from other users. Supports PNG, JPG and JPEG images.<br /> Note that authors are mandatory to  upload a profile picture for better recognition and security. <br/><br/> Click on the above image or drag and drop an image here to upload.</p><input type="submit" id="submit-profile-picture" value="Save changes" disabled/></form>`;
	togglePopup(popUpData);
	document.querySelector('.popup').classList.add('change-profile-picture');
	document.body.addEventListener('dragover', (e) => {
		if (document.querySelector('.popup').classList.contains('change-profile-picture')) {
			document.querySelector('.popup').classList.add('on-drag-over');
		}
	});
	document.body.addEventListener('dragleave', (e) => {
		if (document.querySelector('.popup').classList.contains('change-profile-picture')) {
			document.querySelector('.popup').classList.remove('on-drag-over');
		}
	});
	document.querySelector('.change-profile-picture').addEventListener('dragover', (e) => {
		e.preventDefault();
		e.target.classList.add('on-drag-over');
	});
	document.querySelector('.change-profile-picture').addEventListener('dragenter', (e) => {
		e.preventDefault();
		e.target.classList.add('on-drag-over');
	});
	document.body.addEventListener('drop', (e) => e.preventDefault());
	document.querySelector('.popup-container').addEventListener('drop', (e) => e.preventDefault());
	document.querySelector('.change-profile-picture').addEventListener('drop', (e) => {
		document.querySelector('.popup').classList.add('on-drop');
		document.querySelector('input[type="submit"]').disabled = true;
		document.querySelector('input[type="submit"]').value = 'UPLOADING...';
		e.preventDefault();
		e.target.classList.remove('on-drag-over');
		console.log(e.dataTransfer.files);
		const formData = new FormData(document.uploadProfilePictureForm);
		formData.append('profilePicture', e.dataTransfer.files[0]);
		fetch('/data/upload/profile/user-profile-picture', {
			method: 'POST',
			redirect: 'follow',
			headers: {
				'CSRF-Token': token,
			},
			body: formData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					window.location.replace('/profile');
				} else displayAlertPopup('error', res.message);
			})
			.catch((err) => {
				document.querySelector('.popup').classList.remove('on-drop');
				document.querySelector('.popup').classList.add('on-drop-fail');
				console.log(err);
			});
	});
	document.getElementById('upload-profile-picture-form').addEventListener('submit', (e) => {
		e.preventDefault();
		if (document.querySelector('input[type="file"]').files.length <= 0) {
			displayAlertPopup('info', "You didn't upload your profile picture.");
		} else {
			document.querySelector('input[type="submit"]').disabled = true;
			document.querySelector('input[type="submit"]').value = 'UPLOADING...';
			fetch('/data/upload/profile/user-profile-picture', {
				method: 'POST',
				redirect: 'follow',
				headers: {
					'CSRF-Token': token,
				},
				body: new FormData(e.target),
			})
				.then(
					(res) => res.json(),
					(err) => console.log(err)
				)
				.then((res) => {
					if (res.success) {
						window.location.replace('/profile');
					} else displayAlertPopup('error', res.message);
				});
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
};

const changeUserType = (data) => {
	if (data.userType !== 'author') {
		const popUpData = `
						<img src="/images/profile/becomeAnAuthor.webp" alt="A pencil with a line drawn by it." />
						<h1 class="heading">Let\'s become an Author</h1> 
						<p>Become an author to share your knowledge with others while gaining reputation from the community. </p> 
						<div class="features-benifits-disadvantages">
							<p >Changing your usertype from reader to author will change some of your account settings including, 
								<ul>
									<li>Change your usertype from READER to AUTHOR.</li>
									<li>lorem</li>
									<li>epsum</li>
								</ul>
							</p>
							<p>Becoming an author lets you,</p>
							<ul>
								<li>Share your knowledge with others by writing articles.</li>
								<li>lorem</li>
								<li>epsum</li>
							</ul>

						</div>
						<button id="submit-become-an-author">Become an Author</button>`;
		togglePopup(popUpData);
		document.querySelector('.popup').classList.add('change-user-type');
		document.getElementById('submit-become-an-author').addEventListener('click', (e) => {
			fetch('/data/profile?changeUserType=author')
				.then((res) => res.json())
				.then(({ success, message }) => {
					if (success) {
						displayAlertPopup('success', message);
						window.location.replace('/profile');
					} else displayAlertPopup('error', message);
				});
		});
	} else {
		const popUpData = `<img src="/images/profile/becomeAnAuthor.webp" alt="A pencil with a line drawn by it." /><h1 class="heading">Change usertype from Author a Reader</h1> <p>Quis blanditiis pariatur officia corrupti qui velit quisquam quia. Reiciendis aut provident sit voluptatem quod qui odit ipsum. Et non fuga eum facilis rerum. Qui aut odit ullam assumenda nihil. Voluptatum earum voluptatem consequatur. Vitae veritatis ut eum.</p><button id="submit-become-a-reader">Become a Reader</button>`;
		togglePopup(popUpData);
		document.querySelector('.popup').classList.add('change-user-type');
		document.getElementById('submit-become-a-reader').addEventListener('click', (e) => {
			fetch('/data/profile?changeUserType=reader')
				.then((res) => res.json())
				.then(({ success, message }) => {
					if (success) {
						displayAlertPopup('success', message);
						window.location.replace('/profile');
					} else displayAlertPopup('error', message);
				});
		});
	}
};

const changeSettings = () => {
	const settingData = Object.entries({
		account: `<h2>Account</h2>
					<ul>
						<li>Non est maiores repellat id accusantium expedita expedita aut.</li>
						<li>Non incidunt qui soluta quod quasi sunt unde.</li>
						<li>Fuga distinctio eveniet doloremque voluptatem et.</li>
						<li>Illum beatae dolor maiores dolorum molestiae dolorum et.</li>
						<li>Aut et voluptas neque magni sapiente quas.</li>
					</ul>
					`,
		security: `<h2>Security</h2>
					<ul>
						<li>Eligendi quia qui vero ratione officia enim eum.</li>
						<li>Vel consectetur laudantium rem ab minus exercitationem sunt.</li>
						<li>Earum dolor quasi perferendis vel.</li>
						<li>Nam eaque rerum enim.</li>
						<li>Assumenda iure repellendus.</li>
					</ul>
					`,
		notifications: `<h2>Notifications</h2>
					<ul>
						<li>Omnis earum molestias deserunt.</li>
						<li>Incidunt doloribus sit minima quo.</li>
						<li>Impedit magni magni doloribus id ullam dolorum repudiandae alias ad.</li>
						<li>Facere sed quas iste facilis.</li>
						<li>Voluptates qui enim velit.</li>
					</ul>
					`,
		privacy: `<h2>Privacy</h2>
					<ul>
						<li>Culpa ab atque accusamus.</li>
						<li>Perferendis omnis delectus et est et nobis.</li>
						<li>Totam excepturi eos ut.</li>
						<li>Consequatur id aut ut provident dolores ullam qui saepe assumenda.</li>
						<li>Vero expedita esse.</li>
					</ul>
					`,
	});
	const popupData = `
				<h1>Settings</h1>
				<div class="settings-container">
					<div class="setting-types">
						<ul>
							<li class="focused" data-setting-type="account">Account</li>
							<li data-setting-type="security">Security</li>
							<li data-setting-type="notifications">Notifications</li>
							<li data-setting-type="privacy">Privacy</li>
						</ul>
					</div>
					<div class="settings-content"></div>
				</div>`;
	togglePopup(popupData);
	document.querySelector('.popup').classList.add('settings');
	const settingTypes = document.querySelectorAll('.setting-types ul li');
	settingTypes.forEach((x) => {
		x.addEventListener('click', (e) => {
			settingTypes.forEach((y) => y.classList.remove('focused'));
			e.target.classList.add('focused');
			for (const [settingType, settingContent] of settingData) {
				if (e.target.dataset.settingType === settingType)
					document.querySelector('.settings-content').innerHTML = settingContent;
			}
		});
	});
	document.querySelector('li[data-setting-type="account"]').click();
};

const changeTheme = (theme = '') => {
	if (theme === 'dark' && !document.body.classList.contains('dark-mode')) {
		document.body.classList.add('dark-mode');
		fetch('/change-theme?theme="dark"')
			.then((res) => res.json())
			.then((res) => console.log(res.message));
	} else if (theme === 'light' && document.body.classList.contains('dark-mode')) {
		document.body.classList.remove('dark-mode');
		fetch('/change-theme?theme="light"')
			.then((res) => res.json())
			.then((res) => console.log(res.message));
	} else if (theme === '') {
		document.body.classList.toggle('dark-mode');
		fetch('/change-theme?theme=""')
			.then((res) => res.json())
			.then((res) => console.log(res.message));
	}
	if (document.body.contains(document.querySelector('#change-theme'))) {
		if (document.body.classList.contains('dark-mode')) {
			document.querySelector(
				'#change-theme a'
			).innerHTML = `<i class="fas fa-sun"></i> Light Mode`;
		} else {
			document.querySelector(
				'#change-theme a'
			).innerHTML = `<i class="fas fa-moon"></i> Dark Mode`;
		}
	}
};
