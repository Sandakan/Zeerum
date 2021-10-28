export default reportError = (id, type, errMsg) => {
	if (type === 'add') {
		document.querySelector(`.${id}-container .data-error-container`).style.display = 'block';
		document.querySelector(`.${id}-container .data-error-container .data-error`).innerText =
			errMsg;
		document.getElementById(id).style.backgroundColor = 'rgba(255,0,0,0.3)';
		console.log(`error added to element : ${id}`);
	} else if (type === 'remove') {
		document.querySelector(`.${id}-container .data-error-container`).style.display = 'none';
		document.querySelector(`.${id}-container .data-error-container .data-error`).innerText = '';
		document.getElementById(id).style.backgroundColor = '#ccc';
		console.log(`error removed from element : ${id}`);
	} else console.log(`error: unknown error type \'${type}\'`);
};
