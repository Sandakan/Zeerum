import fetchData from './fetchData.js';

fetchData('/data/profile', (res) => {
	console.log(res);
	const { success, data } = res;
	if (success) {
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

			document.querySelector('.user-img-container').innerHTML = `<img src="${
				data.profilePictureUrl || '/images/user.png'
			}" alt="" /><span class="edit-profile-picture"><i class="fas fa-pen"></i></span>`;
			document.querySelector('.user-data-container').innerHTML = `<span class="name">${
				data.firstName
			} ${data.lastName}</span>
				<span class="user-type-and-id">${data.userType} <span class="id">#${data.userId}</span></span>
				<span class="country">${data.country || 'Country unknown'}</span>
				<span class="joined-date">Joined on ${new Date(data.registeredDate).toDateString()}.</span>
				<span class="followers-and-followings">${data.followers.length} followers / ${
				data.followings.length
			} followings</span>
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
