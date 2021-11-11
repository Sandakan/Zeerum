import reportError from './formReportError.js';
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
