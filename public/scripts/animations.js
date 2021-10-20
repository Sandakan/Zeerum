const navBar = document.querySelector('.nav-bar');
var initialValue = 0;
var scrollTopValue;
var previousScrollTopValue = 0;

window.onscroll = function () {
    scrollTopValue = document.documentElement.scrollTop;
    if (scrollTopValue > previousScrollTopValue && scrollTopValue > 300) {
        navBar.classList.add('hidden');
        previousScrollTopValue = scrollTopValue;
    } else {
        navBar.classList.remove('hidden');
        previousScrollTopValue = scrollTopValue;
    }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

