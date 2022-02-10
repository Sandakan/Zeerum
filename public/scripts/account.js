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
					sessionStorage.getItem('userType') &&
					sessionStorage.getItem('userType') === 'reader'
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
			document
				.querySelector('#change-theme')
				.addEventListener('click', () => changeTheme(''));
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
