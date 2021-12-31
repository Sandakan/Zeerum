// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

if (sessionStorage.getItem('userType') === 'author')
	document.querySelector('.banner-text').innerHTML = `<span
							>This <span class="banner-highlighted-text">feature </span>will be <br />
							available <span class="banner-highlighted-text">soon.</span></span
						>`;
else if (sessionStorage.getItem('userType') === 'reader')
	document.querySelector(
		'.banner-text'
	).innerHTML = `<span>You need to <a href="/profile?changeUserType=author">be an author</a> <br />to use this feature. <br /><h6>\*This feature is still under development and not available right now.</h6> </span>`;
else
	document.querySelector(
		'.banner-text'
	).innerHTML = `<span>You need to be logged in and be an author to use this feature. <br /><h6>\*This feature is still under development and not available right now.</h6> </span>`;
