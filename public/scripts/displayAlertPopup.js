const closeAlertPopup = () => {
	if (document.body.contains(document.querySelector('.alert-container'))) {
		document.querySelector('.alert-container').classList.remove('visible');
	}
};

export default (messageType = '', message = '', delay = 5000) => {
	return new Promise((resolve, reject) => {
		if (document.body.contains(document.querySelector('.alert-container'))) {
			const classList = document.querySelector('.alert-container').classList.value.split(' ');
			classList.splice(classList.indexOf('alert-container'), 1);
			document.querySelector('.alert-container').classList.remove(...classList);
			document.querySelector('.alert-container').classList.add('visible', messageType);
			document.querySelector('.alert-container .message-container').innerText = message;
			if (delay === 0)
				setTimeout(() => {
					closeAlertPopup();
					resolve();
				}, 5000);
			else
				setTimeout(() => {
					closeAlertPopup();
					resolve();
				}, delay);
			if (document.body.contains(document.querySelector('.alert-container'))) {
				document
					.querySelector('.alert-container .buttons-container .close-btn')
					.addEventListener('click', (e) => {
						closeAlertPopup();
						resolve();
					});
			}
		} else reject("Alert container couldn't be found.");
	});
};
