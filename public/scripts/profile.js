import valueRounder from './valueRounder.js';
import togglePopup from './togglePopup.js';
import displayAlertPopup from './displayAlertPopup.js';

// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// ? ///////////////////////////////////  FUNCTIONS  ///////////////////////////////////////////////////
// ? Data for popup 'edit-profile-picture' goes here.
const changeProfilePicture = () => {
	const popUpData = ` <h1 class="heading">Edit your Profile Picture</h1><form action="/data/upload/profile/user-profile-picture" encType="multipart/form-data" name="uploadProfilePictureForm" id="upload-profile-picture-form" method="post"><label for="file"><img src="${sessionStorage.getItem(
		'userProfilePictureUrl'
	)}" alt="" /><i class="upload-icon fas fa-arrow-up"></i></label><input type="file" name="profilePicture" id="file" accept=".png,.jpeg,.jpg,.webp" /><p>Change your profile picture to stand out from other users. Supports PNG, JPG and JPEG images.<br /> Note that authors are mandatory to  upload a profile picture for better recognition and security. <br/><br/> Click on the above image or drag and drop an image here to upload.</p><input type="submit" id="submit-profile-picture" value="Save changes" title="Upload an image first." disabled/></form>`;
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
		document.getElementById('submit-profile-picture').title = 'Save Changes';
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
						<h1 class="heading">Let\'s become an Author</h1> 
						<img src="/images/profile/becomeAnAuthor.webp" alt="A pencil with a line drawn by it." />
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

const changeSettings = async (userData) => {
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
					<div class="settings-content">
						<div class="account-settings-container account"><h2>Account</h2>
					<ul>
						<li>
							<h3>Name</h3>
							<form action="/data/profile/update-name" id="update-name-form" class="container" name="updateNameForm" method="post">
								<div class="description">Your name appears on your profile page, and in your responses. This is a required field.</div>
								<div class="description">Your name should only contain <span class="highlight">alphabetic characters.</span></div>
								<input type="text" id="update-name-form-first-name-input" name="firstName" placeholder="First Name : ${
									userData.firstName
								}" value="" required/>
								<input type="text" id="update-name-form-last-name-input" name="lastName" placeholder="Last Name : ${
									userData.lastName
								}" value="" required/>
								<input type="submit" id="update-name-form-submit" class="disabled" value="Update Name" />
							</form>
						</li>
						<li>
							<h3>Username</h3>
							<form action="/data/profile/update-username" class="container" name="updateUsername" method="post" id="update-username-form">
								<div class="description">Your username is like a unique key in Zeerum community other than your userId.</div>
								<div class="description">Your username should contain at least <span class="highlight">3 characters.</span></div>
								<div class="description">Your username can only contain <span class="highlight">alphanumeric characters, underscores (_), dashes (-)</span> and should <span class="highlight">unique</span>.</div>
								<div class="description">Username cannot start with <span class="highlight">underscores (_), dashes (-)</span> or <span class="highlight">numbers</span> and cannot end with <span class="highlight">underscores (_), dashes (-).</span></div>
								<input type="text" id="update-username-form-input" placeholder="Username : ${
									userData.username
								}" value="" required/>
								<input type="submit" id="update-username-form-submit" class="disabled" value="Update Username" />
							</form>
						</li>
						<li>
							<h3>Profile Picture</h3>
							<div class="container">
								<div class="description">Change your profile picture to stand out from other Zeerum users and gain attention.</div>
								<div class="img-and-link-container">
									<a href="/profile?popup=edit-profile-picture">
										<img src="${userData.profilePictureUrl || '/images/user.webp'}" alt="${
		userData.firstName
	}'s Profile Picture" />
									</a>
									<a href="/profile?popup=edit-profile-picture" class="btn-link">Change Profile Picture <i class="fas fa-external-link-alt"></i></a>
								</div>
							</div> 
						</li>
						<li>
							<h3>Birthday</h3>
							<form name="updateUsername" action="/data/profile/update-birthday" method="POST" class="container" id="update-birthday-form">
								<div class="description">Changing your birthday currently doesn't affect your experience in Zeerum.</div>
								<input type="text" name="birthday" id="update-birthday-form-input" onfocusin="(this.type='date')" onfocusout="(this.type='text')" 
									placeholder="Birthday : ${new Date(userData.birthday).toDateString()}" value="" required/>
								<input type="submit" id="update-birthday-form-submit" class="disabled" value="Update Birthday" />
							</form>
						</li>
						<li>
							<h3>User type</h3>
							<div class="container">
								<div class="description">This literally means whether you are an author or just a normal user who uses Zeerum to read articles.</div>
								<div class="description">Currently, you are a <span class="highlight">${sessionStorage
									.getItem('userType')
									.toUpperCase()}.</span></div>
								<a href="/profile?popup=become-an-author" class="btn-link">Change User Type <i class="fas fa-external-link-alt"></i></a>
							</div>
						</li>
							<li class="danger-zone disable-account">
								<h3>Disable Account</h3>
								<div class="container">
									<div class="description">Disabling your account will disable it temporarily but can be re-enabled again.</div>
									<div class="description">Currently your can't disable your account.</div>
									<input type="submit" class="danger" value="Disable Account" disabled/>
								</div>
							</li>
							<li class="danger-zone delete-account">
								<h3>Delete Account</h3>
								<div class="container">
									<div class="description">Delete your account will delete all of your data including your personal data, articles permanently.</div>
									<div class="description">This is <span class="highlight danger">PERMENANT</span> and <span class="highlight danger">IRREVERSIBLE</span>.</div>
									<input type="button" id="delete-account-btn" class="danger" data-confirm="" value="Delete Account" />
								</div>
							</li>
					</ul>
					</div>
					<div class="security-settings-container security">
						<h2>Security</h2>
						<ul>
							<li>
								<h3>Update Email</h3>
								<form action="/data/profile/update-email" id="update-email-form" class="container" name="updateEmailForm" method="post">
								<div class="description">Updating your email requires you to validate your new email. We should check whether its really you too.</div>
									<input type="email" name="email" id="update-email-form-input" placeholder="New Email" required/>
									<input type="submit" class="disabled" value="Update Email" id="update-email-form-submit"/>
								</form>
							</li>
							<li>
								<h3>Update Password</h3>
								<form action="/data/profile/update-password" class="container" name="updatePasswordForm" id="update-password-form" method="post">
								<div class="description">Update your password with a new, more secure password to keep you secure at all times. Your new password should have <span class="highlight">at least 8 characters</span> including at least <span class="highlight">one letter</span> and a <span class="highlight">number</span>.</div>
									<input type="password" name="oldPassword" id="update-password-form-old-password-input" placeholder="Old Password" required/>
									<input type="password" name="newPassword" id="update-password-form-new-password-input" placeholder="New Password" required/>
									<input type="password" name="retypeNewPassword" id="update-password-form-confirm-new-password-input" placeholder="Confirm New Password" required/>
									<input type="submit" value="Update Password" id="update-password-form-submit" disabled/>
								</form>
							</li>
						</ul>
					</div>
					<div class="notifications-settings-container notifications">
							<h2>Notifications</h2>
							<ul>
								<li>
									<h3>Email Notifications</h3>
									<form name="updateEmailNotifications" action="/data/profile/update-email-notifications" method="post" class="container">
										<div class="description">Change your settings about how you want us to notify you about important things using email.</div>
										<div class="description">Currently, email notifications customization is disabled.</div>
										<label for="promotionsEmailCheckbox">
										<input type="checkbox" name="promotionsEmailCheckbox" id="promotionsEmailCheckbox" />
											<span class="custom-checkbox"></span>
											Promotions
										</label>
										<label for="trendingArticlesEmailCheckbox">
											<input type="checkbox" name="trendingArticlesEmailCheckbox" id="trendingArticlesEmailCheckbox" />
											<span class="custom-checkbox"></span>
											Trending Articles
										</label>
										<label for="recommendedArticlesEmailCheckbox">
											<input type="checkbox" name="recommendedArticlesEmailCheckbox" id="recommendedArticlesEmailCheckbox" />
											<span class="custom-checkbox"></span>
											Recommended Articles
										</label>
										<div class="description">These settings are enabled by default to keep you and your data safe.</div>
										<label for="newLoginEmailCheckbox">
											<input type="checkbox" name="newLoginEmailCheckbox" id="newLoginEmailCheckbox" checked />
											<span class="custom-checkbox"></span>
											New Login Alert
										</label>
										<label for="settingsChangeEmailCheckbox">
											<input type="checkbox" name="settingsChangeEmailCheckbox" id="settingsChangeEmailCheckbox" checked />
											<span class="custom-checkbox"></span>
											Settings Change Alert
										</label>
										<input type="submit" class="disabled" value="Update Email Notifications" id="submitUpdateEmailNotifications" disabled/>
										</form>
								</li>
								<li>
									<h3>Popup Notifications</h3>
									<form name="updatePopupNotifications" action="/data/profile/update-popup-notifications" method="post" class="container">
										<div class="description">Change your settings about how you want us to notify you about important things using device popups.</div>
										<div class="description">Currently, popup notifications customization is disabled.</div>
										<label for="promotionsPopupCheckbox">
										<input type="checkbox" name="promotionsPopupCheckbox" id="promotionsPopupCheckbox" />
											<span class="custom-checkbox"></span>
											Promotions
										</label>
										<label for="trendingArticlesPopupCheckbox">
											<input type="checkbox" name="trendingArticlesPopupCheckbox" id="trendingArticlesPopupCheckbox" />
											<span class="custom-checkbox"></span>
											Trending Articles
										</label>
										<label for="recommendedArticlesPopupCheckbox">
											<input type="checkbox" name="recommendedArticlesPopupCheckbox" id="recommendedArticlesPopupCheckbox" />
											<span class="custom-checkbox"></span>
											Recommended Articles
										</label>
										<div class="description">These settings are enabled by default to keep you and your data safe.</div>
										<label for="newLoginPopupCheckbox">
											<input type="checkbox" name="newLoginPopupCheckbox" id="newLoginPopupCheckbox" checked />
											<span class="custom-checkbox"></span>
											New Login Alert
										</label>
										<label for="settingsChangePopupCheckbox">
											<input type="checkbox" name="settingsChangePopupCheckbox" id="settingsChangePopupCheckbox" checked />
											<span class="custom-checkbox"></span>
											Settings Change Alert
										</label>
										<input type="submit" class="disabled" value="Update Popup Notifications" id="submitUpdatePopupNotifications" disabled/>
										</form>
								</li>
							</ul>
						</div>
						<div class="privacy-settings-container privacy">
							<h2>Privacy</h2>
							<ul>
								<li>
									<h3>Cookies</h3>
									<div class="container">
										<div class="description">Edit settings about how you want us to use cookies in your devices.</div>
										<div class="description">Note that cookies are essential for the stability of the site and cannot be entirely disabled.</div>
										<label for="noPrivateDataOnCookiesCheckBox">
												<input type="checkbox" name="noPrivateDataOnCookiesCheckBox" id="noPrivateDataOnCookiesCheckBox" checked />
												<span class="custom-checkbox"></span>
												Don't store user data on cookies (Higher stress on the network)
										</label>
										<input type="submit" class="disabled" value="Update Cookie Settings" id="submitCookieSettings" disabled/>
									</div>
								</li>
							</ul>
						</div>

					</div>
				</div>`;
	togglePopup(popupData);
	document.querySelector('.popup').classList.add('settings');
	const settingTypes = document.querySelectorAll('.setting-types ul li');
	const settingsContentContainers = document.querySelectorAll('.settings-content > div');
	settingTypes.forEach((x) => {
		x.addEventListener('click', (e) => {
			settingTypes.forEach((y) => y.classList.remove('focused'));
			e.target.classList.add('focused');
			settingsContentContainers.forEach((z) => {
				z.classList.remove('focused');
				if (z.classList.contains(e.target.dataset.settingType)) z.classList.add('focused');
			});
		});
	});
	document.querySelector('li[data-setting-type="account"]').click();
	// FORM VALIDATION FOR SETTINGS
	if (
		document
			.querySelector('.settings-content')
			.contains(document.getElementById('update-name-form'))
	) {
		document
			.getElementById('update-name-form-first-name-input')
			.addEventListener('input', (e) => {
				if (e.target.value.trim() === '')
					document.getElementById('update-name-form-submit').classList.add('disabled');
				else
					document.getElementById('update-name-form-submit').classList.remove('disabled');
				if (/^[a-zA-Z]{1,30}$/gim.test(e.target.value) || e.target.value.trim() === '') {
					document.getElementById('update-name-form-submit').disabled = false;
					e.target.classList.remove('error');
					if (
						document.body.contains(
							document.querySelector('.description.first-name-error')
						)
					)
						document.querySelector('.description.first-name-error').remove();
				} else {
					document.getElementById('update-name-form-submit').disabled = true;
					e.target.classList.add('error');
					if (
						!document.body.contains(
							document.querySelector('.description.first-name-error')
						)
					)
						e.target.insertAdjacentHTML(
							'afterend',
							'<div class="description danger first-name-error">You cannot add non-alphabetic characters.</div>'
						);
				}
			});
		document
			.getElementById('update-name-form-last-name-input')
			.addEventListener('input', (e) => {
				if (e.target.value.trim() === '')
					document.getElementById('update-name-form-submit').classList.add('disabled');
				else
					document.getElementById('update-name-form-submit').classList.remove('disabled');
				if (/^[a-zA-Z]{1,30}$/gim.test(e.target.value) || e.target.value.trim() === '') {
					document.getElementById('update-name-form-submit').disabled = false;
					e.target.classList.remove('error');
					if (
						document.body.contains(
							document.querySelector('.description.last-name-error')
						)
					)
						document.querySelector('.description.last-name-error').remove();
				} else {
					document.getElementById('update-name-form-submit').disabled = true;
					e.target.classList.add('error');
					if (
						!document.body.contains(
							document.querySelector('.description.last-name-error')
						)
					)
						e.target.insertAdjacentHTML(
							'afterend',
							'<div class="description danger last-name-error">You cannot add non-alphabetic characters.</div>'
						);
				}
			});
		document.updateNameForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			document.getElementById('update-name-form-submit').disabled = true;
			document.getElementById('update-name-form-submit').value = 'UPDATING...';
			await fetch('/data/profile/update-name', {
				method: 'POST',
				headers: {
					'CSRF-token': token,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					firstName: document.getElementById('update-name-form-first-name-input').value,
					lastName: document.getElementById('update-name-form-last-name-input').value,
				}),
			})
				.then((res) => res.json())
				.then(async (res) => {
					if (res.success) {
						document
							.getElementById('update-name-form-submit')
							.insertAdjacentHTML(
								'beforebegin',
								'<div class="description success">Name updated successfully.</div>'
							);
						document.getElementById('update-name-form-submit').remove();
						await displayAlertPopup('success', res.message, 2500).then(
							() => window.location.replace('/profile?popup=settings'),
							(err) => console.log(err)
						);
					} else {
						document.getElementById('update-name-form-submit').disabled = false;
						document.getElementById('update-name-form-submit').value = 'Update name';
						displayAlertPopup('error', res.message, 5000);
					}
				})
				.catch((err) => {
					console.error(err);
					document.getElementById('update-name-form-submit').disabled = false;
					document.getElementById('update-name-form-submit').value = 'Update name';
				});
		});
	} else console.log('no form found.');
	if (
		document
			.querySelector('.settings-content')
			.contains(document.getElementById('update-username-form'))
	) {
		document.getElementById('update-username-form-input').addEventListener('input', (e) => {
			if (e.target.value.trim() !== '') {
				document.getElementById('update-username-form-submit').classList.remove('disabled');
			} else document.getElementById('update-username-form-submit').classList.add('disabled');
			if (
				/^[^_\W\d][\w-]{1,40}[^_\W]$/gim.test(e.target.value) ||
				e.target.value.trim() === ''
			) {
				e.target.classList.remove('error');
				if (document.body.contains(document.querySelector('.description.username-error')))
					document.querySelector('.description.username-error').remove();
				document.getElementById('update-username-form-submit').disabled = false;
			} else {
				e.target.classList.add('error');
				if (
					!document.body.contains(document.querySelector('.description.username-error'))
				) {
					document.getElementById('update-username-form-submit').disabled = true;
					e.target.insertAdjacentHTML(
						'afterend',
						'<div class="description danger username-error"></div>'
					);
					if (/^[_\W\d]/.test(e.target.value))
						document.querySelector('.username-error').innerText =
							'Username cannot start with non-alphabetic characters.';
					if (/[^\w-]{1,40}/.test(e.target.value))
						document.querySelector('.username-error').innerText =
							'Username can only contain letters, numbers, underscores and dashes.';
					if (/.[_\W]$/.test(e.target.value))
						document.querySelector('.username-error').innerText =
							'Username can only end with alpha-numberic characters.';
					if (/^.{1,3}$/.test(e.target.value))
						document.querySelector('.username-error').innerText =
							'Username should contain at least 3 characters.';
				}
			}
		});
		document.getElementById('update-username-form').addEventListener('submit', async (e) => {
			e.preventDefault();
			document.getElementById('update-username-form-submit').disabled = true;
			document.getElementById('update-username-form-submit').value = 'UPDATING...';
			await fetch('/data/profile/update-username', {
				method: 'POST',
				headers: {
					'CSRF-token': token,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: document.getElementById('update-username-form-input').value,
				}),
			})
				.then((res) => res.json())
				.then(async (res) => {
					if (res.success) {
						document
							.getElementById('update-username-form-submit')
							.insertAdjacentHTML(
								'beforebegin',
								'<div class="description success">Name updated successfully.</div>'
							);
						document.getElementById('update-username-form-submit').remove();
						await displayAlertPopup('success', res.message, 2500).then(
							() => window.location.replace('/profile?popup=settings'),
							(err) => console.log(err)
						);
					} else {
						document.getElementById('update-username-form-submit').disabled = false;
						document.getElementById('update-username-form-submit').value =
							'Update Username';
						displayAlertPopup('error', res.message, 5000);
					}
				})
				.catch((err) => {
					console.error(err);
					document.getElementById('update-username-form-submit').disabled = false;
					document.getElementById('update-username-form-submit').value =
						'Update Username';
				});
		});
	} else console.log('form not found.');
	if (
		document
			.querySelector('.settings-content')
			.contains(document.getElementById('update-birthday-form'))
	) {
		document.getElementById('update-birthday-form-input').addEventListener('input', (e) => {
			if (e.target.value.trim() !== '') {
				document.getElementById('update-birthday-form-submit').classList.remove('disabled');
			} else document.getElementById('update-birthday-form-submit').classList.add('disabled');
			if (!isNaN(Date.parse(e.target.value))) {
				document.getElementById('update-birthday-form-submit').classList.remove('disabled');
				document.getElementById('update-birthday-form-submit').disabled = false;
			} else document.getElementById('update-birthday-form-submit').disabled = true;
		});
		document.getElementById('update-birthday-form').addEventListener('submit', async (e) => {
			e.preventDefault();
			document.getElementById('update-birthday-form-submit').disabled = true;
			document.getElementById('update-birthday-form-submit').value = 'UPDATING...';
			await fetch('/data/profile/update-birthday', {
				method: 'POST',
				headers: {
					'CSRF-token': token,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					birthday: document.getElementById('update-birthday-form-input').value,
				}),
			})
				.then((res) => res.json())
				.then(async (res) => {
					if (res.success) {
						document
							.getElementById('update-birthday-form-submit')
							.insertAdjacentHTML(
								'beforebegin',
								`<div class="description success">${res.message}</div>`
							);
						document.getElementById('update-birthday-form-submit').remove();
						await displayAlertPopup('success', res.message, 2500).then(
							() => window.location.replace('/profile?popup=settings'),
							(err) => console.log(err)
						);
					} else {
						document.getElementById('update-birthday-form-submit').disabled = false;
						document.getElementById('update-birthday-form-submit').value =
							'Update Birthday';
						displayAlertPopup('error', res.message, 5000);
					}
				})
				.catch((err) => {
					console.error(err);
					document.getElementById('update-birthday-form-submit').disabled = false;
					document.getElementById('update-birthday-form-submit').value =
						'Update Birthday';
				});
		});
	} else console.log('form not found');
	if (
		document
			.querySelector('.settings-content')
			.contains(document.querySelector('li.delete-account'))
	) {
		document.getElementById('delete-account-btn').addEventListener('click', async (e) => {
			if (e.target.dataset.confirm !== 'true') {
				e.target.insertAdjacentHTML(
					'beforebegin',
					`<div class="description">Type your username \'<span class="highlight danger">${userData.username}</span>\' to confirm deleting your account.</div><div class="description  danger">THIS PROCESS IS IRREVERSIBLE.</div> <input type="text" id="validate-delete-account" placeholder="Type your username to confirm.">`
				);
				e.target.value = 'Confirm Delete Account';
				e.target.disabled = true;
				document
					.getElementById('validate-delete-account')
					.addEventListener('input', (f) => {
						if (f.target.value === userData.username) {
							e.target.disabled = false;
							e.target.dataset.confirm = 'true';
						} else {
							e.target.disabled = true;
							e.target.dataset.confirm = 'false';
						}
					});
			} else {
				document.getElementById('delete-account-btn').disabled = true;
				document.getElementById('delete-account-btn').value = 'DELETING...';
				await fetch('/data/profile/delete-account', {
					method: 'POST',
					headers: {
						'CSRF-token': token,
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						username: document.getElementById('validate-delete-account').value,
					}),
				})
					.then((res) => res.json())
					.then(
						(result) => {
							if (result.success) {
								document.getElementById('delete-account-btn').remove();
								displayAlertPopup('success', result.message, 2500).then(() =>
									window.location.replace('/')
								);
							} else {
								document.getElementById('delete-account-btn').value =
									'Delete Account';
								document.getElementById('delete-account-btn').disabled = false;
								displayAlertPopup('error', result.message, 2500);
							}
						},
						(err) => {
							document.getElementById('delete-account-btn').disabled = false;
							document.getElementById('delete-account-btn').value = 'Delete Account';
							console.log(err);
						}
					);
			}
		});
	}
	if (
		document
			.querySelector('.settings-content')
			.contains(document.getElementById('update-email-form'))
	) {
		document.getElementById('update-email-form-input').addEventListener('input', (e) => {
			if (e.target.value.trim() !== '') {
				document.getElementById('update-email-form-submit').classList.remove('disabled');
			} else document.getElementById('update-email-form-submit').classList.add('disabled');
			if (/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(e.target.value.trim())) {
				document.getElementById('update-email-form-submit').disabled = false;
				document.querySelector('.description.email-error').remove();
				document.getElementById('update-email-form-input').classList.remove('error');
			} else {
				document.getElementById('update-email-form-submit').disabled = true;
				document.getElementById('update-email-form-input').classList.add('error');
				if (!document.body.contains(document.querySelector('.description.email-error'))) {
					document
						.getElementById('update-email-form-submit')
						.insertAdjacentHTML(
							'beforebegin',
							`<div class="description danger email-error">Your input is not a valid email address.</div>`
						);
				}
			}
		});
		document.getElementById('update-email-form').addEventListener('submit', async (e) => {
			e.preventDefault();
			document.getElementById('update-email-form-submit').disabled = true;
			document.getElementById('update-email-form-submit').value = 'UPLOADING...';
			e.preventDefault();
			await fetch('/data/profile/update-email', {
				method: 'POST',
				headers: {
					'CSRF-token': token,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: document.getElementById('update-email-form-input').value,
				}),
			})
				.then((res) => res.json())
				.then(async (res) => {
					if (res.success) {
						document
							.getElementById('update-email-form-submit')
							.insertAdjacentHTML(
								'beforebegin',
								'<div class="description success">Email updated successfully.</div>'
							);
						document.getElementById('update-email-form-submit').remove();
						await displayAlertPopup('success', res.message, 2500).then(
							() => window.location.replace('/profile?popup=settings'),
							(err) => console.log(err)
						);
					} else {
						document.getElementById('update-email-form-submit').disabled = false;
						document.getElementById('update-email-form-submit').value = 'Update Email';
						displayAlertPopup('error', res.message, 5000);
					}
				});
		});
	}
	if (
		document
			.querySelector('.settings-content')
			.contains(document.getElementById('update-password-form'))
	) {
		document
			.getElementById('update-password-form-new-password-input')
			.addEventListener('input', (e) => {
				if (e.target.value.trim() === '') {
					document
						.getElementById('update-password-form-submit')
						.classList.add('disabled');
				} else
					document
						.getElementById('update-password-form-submit')
						.classList.add('disabled');
				if (
					/^(?=.*[0-9])(?=.*[a-z])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/gim.test(
						e.target.value.trim()
					) ||
					e.target.value.trim() === ''
				) {
					document.getElementById('update-password-form-submit').disabled = false;
					e.target.classList.remove('error');
					if (document.body.contains(document.querySelector('.new-password-error')))
						document.querySelector('.new-password-error').remove();
				} else {
					document.getElementById('update-password-form-submit').disabled = true;
					e.target.classList.add('error');
					if (
						!document
							.querySelector('.settings-content')
							.contains(document.querySelector('.new-password-error'))
					) {
						e.target.insertAdjacentHTML(
							'afterend',
							`<div class="description danger new-password-error"></div>`
						);
						if (/^(.*[^0-9])$/.test(e.target.value.trim())) {
							document.querySelector('.new-password-error').innerText =
								'Password should contain at least one number.';
						}
						if (/^(.*[^a-zA-Z])$/.test(e.target.value.trim())) {
							document.querySelector('.new-password-error').innerText =
								'Password should contain at least one letter.';
						}
						if (/^.{8,}$/.test(e.target.value.trim())) {
							document.querySelector('.new-password-error').innerText =
								'Password should contain at least 8 characters.';
						}
					}
				}
			});
		document
			.getElementById('update-password-form-confirm-new-password-input')
			.addEventListener('input', (e) => {
				if (e.target.value.trim() === '') {
					e.target.classList.remove('error');
				}
				if (
					e.target.value ===
					document.getElementById('update-password-form-new-password-input').value
				) {
					document.getElementById('update-password-form-submit').disabled = false;
					document
						.getElementById('update-password-form-submit')
						.classList.remove('disabled');
					e.target.classList.remove('error');
					document.querySelector('.confirm-password-error').remove();
				} else {
					document.getElementById('update-password-form-submit').disabled = true;
					if (
						!document
							.querySelector('.settings-content')
							.contains(document.querySelector('.confirm-password-error'))
					) {
						e.target.insertAdjacentHTML(
							'afterend',
							`<div class="description danger confirm-password-error">New password doesn't match with the confirm password.</div>`
						);
					}
					e.target.classList.add('error');
				}
			});
		document.getElementById('update-password-form').addEventListener('submit', async (e) => {
			e.preventDefault();
			document.getElementById('update-password-form-submit').disabled = true;
			document.getElementById('update-password-form-submit').value = 'UPDATING...';
			await fetch('/data/profile/update-password', {
				method: 'POST',
				headers: {
					'CSRF-token': token,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					oldPassword: document.getElementById('update-password-form-old-password-input')
						.value,
					newPassword: document.getElementById('update-password-form-new-password-input')
						.value,
				}),
			})
				.then((res) => res.json())
				.then(async (res) => {
					if (res.success) {
						document
							.getElementById('update-password-form-submit')
							.insertAdjacentHTML(
								'beforebegin',
								`<div class="description success">Password updated successfully.</div>`
							);
						document.getElementById('update-password-form-submit').remove();
						await displayAlertPopup('success', res.message).then(() =>
							window.location.replace('/profile?popup=settings')
						);
					} else {
						document.getElementById('update-password-form-submit').disabled = true;
						document.getElementById('update-password-form-submit').value =
							'Update Password';
						displayAlertPopup('error', res.message);
					}
				});
		});
	}
};

fetch('/data/profile')
	.then((res) => res.json())
	.then((res) => {
		if (res.success) {
			const { data } = res;
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
				changeSettings(data);
			}

			document.querySelector('.user-container > .user-data-container').innerHTML = `
				<span class="name">${data.firstName} ${data.lastName}</span>
				<span class="user-type-and-id">${data.userType} <span class="id">#${data.userId}</span></span>
				<span class="country">${data.country || 'Country unknown'}</span>
				<span class="joined-date">Joined on ${new Date(data.registeredDate).toDateString()}.</span>
				<span class="articles-number">${data.articlesPublished} articles published</span>`;

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
									(y) =>
										`<span class="category"><a href="categories/${y}">${y}</a></span>`
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
							console.log(
								`Error occurred when requesting user article data. ${res.message}`
							);
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
								document.querySelector('.page-heading-1').innerHTML =
									'Your Bookmarked Articles';
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
										(y) =>
											`<span class="category"><a href="categories/${y}">#${y}</a></span>`
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
							console.log(
								`Error occurred when requesting user article data. ${res.message}`
							);
						}
					});
			}
		} else displayAlertPopup('error', res.message);
	})
	.catch((err) => {
		console.log(err);
		displayAlertPopup(
			'error',
			'An error occurred when requesting your data. Please try again later.'
		);
	});
