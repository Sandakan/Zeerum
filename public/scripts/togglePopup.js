const closePopup = () => {
	let classList = document.getElementById('popup').classList.value.split(' ');

	document.querySelector('.popup-container').classList.remove('popup-container-active');
	classList.splice(classList.indexOf('popup'), 1);
	document.getElementById('popup').classList.remove(...classList);
	document.querySelector('body').style.overflowY = 'visible';
};

export default (innerHTML, popupClass, forceChangePopupData = false) => {
	if (
		!document.querySelector('.popup-container').classList.contains('popup-container-active') ||
		forceChangePopupData
	) {
		let classList = document.getElementById('popup').classList.value.split(' ');
		classList.splice(classList.indexOf('popup'), 1);
		document.getElementById('popup').classList.remove(...classList);
		document.querySelector('.popup-container').classList.add('popup-container-active');
		if (popupClass) document.querySelector('.popup').classList.add(popupClass);
		document.querySelector('body').style.overflowY = 'hidden';
		document.querySelector(
			'.popup'
		).innerHTML = `<span class="close-btn"><i class="far fa-times-circle"></i></span>${innerHTML}`;
	} else {
		closePopup();
	}
	document.querySelector('.popup .close-btn').addEventListener('click', () => {
		closePopup();
	});

	document.getElementById('popup-container').addEventListener('click', (e) => {
		e.stopPropagation();
		closePopup();
	});

	document.querySelector('.popup').addEventListener('click', (e) => {
		e.stopPropagation();
	});
};
