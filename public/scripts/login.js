import reportError from './formReportError.js';

// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

const queryErrors = document.location.search.split('?').at(-1);
console.log(queryErrors || `no query errors found`);

if (queryErrors.includes('emailOrPasswordMismatch=true')) {
	reportError('email', 'add', 'No available account with that email');
	reportError('password', 'add', 'Password is incorrect');
}
document.getElementById('email').addEventListener('change', (event) => {
	reportError('email', 'remove');
});
document.getElementById('password').addEventListener('change', (event) => {
	reportError('password', 'remove');
});

document.getElementById('form').addEventListener('submit', (e) => {
	e.preventDefault();
	document.getElementById('submit').classList.add('submitting');
	document.getElementById('submit').value = 'LOADING...';
	fetch('/login', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'CSRF-Token': token,
		},
		body: JSON.stringify({
			email: document.getElementById('email').value,
			password: document.getElementById('password').value,
		}),
	})
		.then((res) => res.json())
		.then((res) => {
			document.getElementById('submit').classList.remove('submitting');
			if (res.success) {
				window.location.replace('/profile');
			} else {
				document.getElementById('submit').value = 'Log In';
				res.errors.forEach((x) => {
					switch (x) {
						case 'passwordMismatch':
							reportError('password', 'add', 'Incorrect password.');
							break;

						case 'noAccountFound':
							reportError('email', 'add', 'No account available with provided credentials.');
							break;
					}
				});
			}
		});
});
