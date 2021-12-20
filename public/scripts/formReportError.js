export default reportError = (id, type, errMsg) => {
	if (type === 'add') {
		document.querySelector(`.${id}-container .data-error-container .data-error`).innerText =
			errMsg;
		document.querySelector(`.${id}-container`).classList.add('error');
		console.log(`error added to element : ${id}`);
	} else if (type === 'remove') {
		document.querySelector(`.${id}-container .data-error-container .data-error`).innerText = '';
		document.querySelector(`.${id}-container`).classList.remove('error');
		console.log(`error removed from element : ${id}`);
	} else console.log(`error: unknown error type \'${type}\'`);
};
