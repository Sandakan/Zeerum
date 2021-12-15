const navBar = document.querySelector('.nav-bar');
let scrollTopValue;
let previousScrollTopValue = 0;

window.onscroll = () => {
	scrollTopValue = document.documentElement.scrollTop;
	if (scrollTopValue > previousScrollTopValue && scrollTopValue > 300) {
		navBar.classList.add('hidden');
		previousScrollTopValue = scrollTopValue;
		document
			.querySelector('.user-profile-dropdown')
			.classList.remove('user-profile-dropdown-active');
		if (document.body.contains(document.querySelector('.author-information-container'))) {
			document.querySelector('.author-information-container').style.transform = `translateY(0)`;
		}
	} else {
		navBar.classList.remove('hidden');
		if (document.body.contains(document.querySelector('.author-information-container'))) {
			if (scrollTopValue < 50)
				document.querySelector(
					'.author-information-container'
				).style.transform = `translateY(0)`;
			else
				document.querySelector(
					'.author-information-container'
				).style.transform = `translateY(50px)`;
		}
		previousScrollTopValue = scrollTopValue;
	}
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
