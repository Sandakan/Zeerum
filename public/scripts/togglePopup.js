const closePopup = () => {
	document.querySelector('.popup-container').classList.remove('popup-container-active');
	document.querySelector('body').style.overflowY = 'visible';
};

export default (innerHTML, popupClass, forceChangePopupData = false, forceAlwaysOnTop = false) => {
	if (
		!document.querySelector('.popup-container').classList.contains('popup-container-active') ||
		forceChangePopupData
	) {
		let classList = document.getElementById('popup').classList.value.split(' ');
		classList.splice(classList.indexOf('popup'), 1);
		document.getElementById('popup').classList.remove(...classList);
		document.querySelector('.popup-container').classList.add('popup-container-active');
		if (popupClass) document.querySelector('.popup').classList.add(popupClass);
		if (forceAlwaysOnTop) document.querySelector('.popup').classList.add('always-on-top');
		document.querySelector('body').style.overflowY = 'hidden';
		document.querySelector(
			'.popup'
		).innerHTML = `<span class="close-btn"><i class="far fa-times-circle"></i></span>${innerHTML}`;
	} else {
		closePopup();
	}

	document.querySelector('.popup .close-btn').addEventListener('click', () => {
		if (!document.querySelector('.popup').classList.contains('always-on-top')) closePopup();
	});

	document.getElementById('popup-container').addEventListener('click', (e) => {
		e.stopPropagation();
		if (!document.querySelector('.popup').classList.contains('always-on-top')) closePopup();
	});

	document.querySelector('.popup').addEventListener('click', (e) => {
		e.stopPropagation();
	});
};

// //! UNSTABLE CODE BELOW
// export default class Popup {
// 	constructor(innerHTML = '', classId, forceAlwaysOnTop = false) {
// 		if (classId !== '') {
// 			this.innerHTML = innerHTML;
// 			this.classId = classId;
// 			this.noOfRenderedPopups = 0;
// 			this.forceAlwaysOnTop = forceAlwaysOnTop;
// 		} else throw new Error('Cannot initiate a popup without a classID');
// 	}
// 	render() {
// 		const popupContainer = document.getElementById('popup-container');
// 		if (!popupContainer.contains(document.querySelector(this.classId))) {
// 			popupContainer.innerHTML += `<div class="popup ${this.classId}"><span class="close-btn"><i class="far fa-times-circle"></i></span> ${this.innerHTML}</div>`;
// 			if (this.noOfRenderedPopups === 0)
// 				popupContainer.classList.add('popup-container-active');
// 			this.noOfRenderedPopups++;
// 			console.log('Popup rendered', this.noOfRenderedPopups);
// 			document.querySelector('.popup .close-btn').addEventListener('click', () => {
// 				if (document.querySelector(`.popup.${this.classId}`)) {
// 					if (
// 						!document
// 							.querySelector(`.popup.${this.classId}`)
// 							.classList.contains('always-on-top')
// 					) {
// 						this.close();
// 					}
// 				} else alert(`popup with an id ${this.classId} cannot be found.`);
// 			});

// 			document.getElementById('popup-container').addEventListener('click', (e) => {
// 				if (document.querySelector(`.popup.${this.classId}`)) {
// 					if (
// 						!document
// 							.querySelector(`.popup.${this.classId}`)
// 							.classList.contains('always-on-top')
// 					) {
// 						e.stopPropagation();
// 						this.close();
// 					}
// 				} else alert(`popup with an id ${this.classId} cannot be found.`);
// 			});
// 			document.querySelector('.popup').addEventListener('click', (e) => {
// 				e.stopPropagation();
// 			});
// 			if (this.forceAlwaysOnTop)
// 				document.querySelector(`.popup.${this.classId}`).classList.add('always-on-top');
// 		} else alert(`Popup with id ${this.classId} is already rendered.`);
// 	}
// 	close() {
// 		const popupContainer = document.getElementById('popup-container');
// 		if (popupContainer.contains(document.querySelector(`.popup.${this.classId}`))) {
// 			popupContainer.removeChild(document.querySelector(`.popup.${this.classId}`));
// 			this.noOfRenderedPopups--;
// 			console.log('Popup removed', this.noOfRenderedPopups);
// 			if (this.noOfRenderedPopups === 0)
// 				popupContainer.classList.remove('popup-container-active');
// 		} else alert(`Popup with an id ${this.classId} cannot be found.`);
// 	}

// 	toggleRender() {
// 		if (
// 			document
// 				.getElementById('popup-container')
// 				.contains(document.querySelector(`.popup.${this.classId}`))
// 		)
// 			this.close();
// 		else this.render();
// 	}

// 	closeAllPopups() {
// 		const popupContainer = document.getElementById('popup-container');
// 		this.noOfRenderedPopups = 0;
// 		popupContainer.classList.remove('popup-container-active');
// 		for (const child of popupContainer.children) {
// 			popupContainer.removeChild(child);
// 		}
// 	}
// }
