import reportError from './formReportError.js';

// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

const queryErrors = document.location.search.split('?').at(-1);
let isErrorInForm = {
	name: null,
	email: null,
	password: null,
	confirmPassword: null,
};

if (queryErrors.includes('emailExists=true')) {
	reportError('email', 'add', 'Email is already taken.');
}
if (queryErrors.includes('nameExists=true')) {
	reportError('first-name', 'add', 'Firstname is used.');
	reportError('last-name', 'add', 'Lastname is used.');
}

const isNullOrEmpty = (id) => {
	const element = document.getElementById(id);
	if (element.value === '' || element.value === null || element.value === undefined) {
		reportError(id, 'add', 'Container empty');
		console.log(`Input is empty on element : ${id}`);
		return true;
	} else {
		console.log(`success on element : ${id}`);
		reportError(id, 'remove');
		return false;
	}
};

const nameValidator = (id) => {
	const elementValue = document.getElementById(id).value;
	if (!isNullOrEmpty(id)) {
		if (/[^a-zA-Z]/gi.test(elementValue)) {
			reportError(id, 'add', 'Invalid characters');
			isErrorInForm.name = true;
		} else {
			reportError(id, 'remove');
			isErrorInForm.name = false;
		}
	} else {
		reportError(id, 'remove');
		isErrorInForm.name = false;
	}
};

const emailValidator = (id) => {
	const elementValue = document.getElementById(id).value;
	if (!isNullOrEmpty(id)) {
		if (!/\@/gi.test(elementValue)) {
			reportError(id, 'add', "There is no '@' symbol in the email");
			isErrorInForm.email = true;
		} else if (!/\.com/gi.test(elementValue)) {
			reportError(id, 'add', "Email is incomplete. Missing '.com'");
			isErrorInForm.email = true;
		} else {
			reportError(id, 'remove');
			isErrorInForm.email = false;
		}
	} else {
		reportError(id, 'remove');
		isErrorInForm.email = false;
	}
};

const passwordValidator = (id) => {
	const element = document.getElementById(id);
	if (!isNullOrEmpty(id)) {
		if (element.value.length < 8) {
			reportError('password', 'add', 'Password must be at least 8 characters');
			isErrorInForm.password = true;
		} else if (!/[a-zA-z]/gi.test(element.value) || !/[0-9]/gi.test(element.value)) {
			reportError('password', 'add', 'Password must contain letters and digits');
			isErrorInForm.password = true;
		} else {
			reportError('password', 'remove');
			isErrorInForm.password = false;
		}
	} else {
		reportError('password', 'remove');
		isErrorInForm.password = false;
	}
};

const retypePasswordValidator = (id, confirmId) => {
	const password = document.getElementById(id);
	const confirmPassword = document.getElementById(confirmId);
	console.log(password.value, confirmPassword.value);
	console.log(password.value, confirmPassword.value);
	if (!isNullOrEmpty(confirmId)) {
		if (password.value !== confirmPassword.value) {
			reportError('confirm-password', 'add', 'Retyped password does not match');
			isErrorInForm.confirmPassword = true;
		} else {
			reportError('confirm-password', 'remove');
			isErrorInForm.confirmPassword = false;
		}
	} else {
		reportError('confirm-password', 'remove');
		isErrorInForm.confirmPassword = false;
	}
};

// ? Event Listeners //////////////////////////////////////////////////////////
document.getElementById('first-name').addEventListener('change', () => {
	nameValidator('first-name');
});
document.getElementById('last-name').addEventListener('change', () => {
	nameValidator('last-name');
});
document.getElementById('email').addEventListener('change', () => {
	emailValidator('email');
});

document.getElementById('password').addEventListener('change', () => {
	passwordValidator('password', 'password');
});

document.getElementById('confirm-password').addEventListener('change', () => {
	retypePasswordValidator('password', 'confirm-password');
});

document.getElementById('form').addEventListener('submit', (e) => {
	if (
		isErrorInForm.name ||
		isErrorInForm.email ||
		isErrorInForm.password ||
		isErrorInForm.confirmPassword
	) {
		e.preventDefault();
	} else {
		e.preventDefault();
		document.getElementById('submit').classList.add('submitting');
		document.getElementById('submit').value = 'LOADING...';
		fetch('/signup', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'CSRF-Token': token,
			},
			body: JSON.stringify({
				firstName: document.getElementById('first-name').value,
				lastName: document.getElementById('last-name').value,
				birthday: document.getElementById('birthday').value,
				email: document.getElementById('email').value,
				password: document.getElementById('password').value,
				confirmPassword: document.getElementById('confirm-password').value,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				document.getElementById('submit').classList.remove('submitting');
				if (res.success) {
					window.location.replace('/profile');
				} else {
					document.getElementById('submit').value = 'Sign Up';
					res.errors.forEach((x) => {
						switch (x) {
							case 'emailExists':
								reportError('email', 'add', 'Email exists.');
								break;
							case 'nameExists':
								reportError('first-name', 'add', 'Name exists.');
								reportError('last-name', 'add', 'Name exists.');
						}
					});
				}
			});
	}
});

// ? ///////////////////////////////////////////////////////////////////////////////////////////////
