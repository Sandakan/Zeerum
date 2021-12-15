export default (innerHTML, popupClass, forceOpen = false) => {
	if (!document.querySelector('.popup-container').classList.contains('popup-container-active')) {
		document.querySelector('.popup-container').classList.add('popup-container-active');
		if (popupClass) document.querySelector('.popup').classList.add(popupClass);
		document.querySelector('body').style.overflowY = 'hidden';
		document.querySelector(
			'.popup'
		).innerHTML = `<span class="close-btn"><i class="far fa-times-circle"></i></span>${innerHTML}`;
	} else {
		document.querySelector('.popup-container').classList.remove('popup-container-active');
		document.querySelector('body').style.overflowY = 'visible';
	}
	document.querySelector('.popup .close-btn').addEventListener('click', () => {
		document.querySelector('.popup-container').classList.remove('popup-container-active');
		document.querySelector('body').style.overflowY = 'visible';
	});
};
