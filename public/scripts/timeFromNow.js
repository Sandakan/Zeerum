export default (dateString) => {
	const now = new Date().getTime();
	const date = new Date(dateString);
	const diff = now - date;
	// console.log(`dateString`, dateString, now, date, diff);
	if (diff > 0 && diff <= 1000) return 'now';
	else if (diff < 1000 * 60)
		return `${Math.floor(diff / 1000)} second${Math.floor(diff / 1000) === 1 ? '' : 's'} ago`;
	else if (diff < 1000 * 60 * 60)
		return `${Math.floor(diff / (1000 * 60))} minute${
			Math.floor(diff / (1000 * 60)) === 1 ? '' : 's'
		} ago`;
	else if (diff < 1000 * 60 * 60 * 24)
		return `${Math.floor(diff / (1000 * 60 * 60))} hour${
			Math.floor(diff / (1000 * 60 * 60)) === 1 ? '' : 's'
		} ago`;
	else if (diff < 1000 * 60 * 60 * 24 * 30)
		return `${Math.floor(diff / (1000 * 60 * 60 * 24))} day${
			Math.floor(diff / (1000 * 60 * 60 * 24)) === 1 ? '' : 's'
		} ago`;
	else if (diff < 1000 * 60 * 60 * 24 * 30 * 12)
		return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 30))} month${
			Math.floor(diff / (1000 * 60 * 60 * 24 * 30)) === 1 ? '' : 's'
		} ago`;
	else if (diff > 1000 * 60 * 60 * 24 * 30 * 12)
		return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 30 * 12))} year${
			Math.floor(diff / (1000 * 60 * 60 * 24 * 30 * 12)) === 1 ? '' : 's'
		} ago`;
};

/*
second 1000
minute 1000 * 60 = 60_000 
hour 1000 * 60 * 60 = 3_600_000
day 1000 * 60 * 60 * 24 = 84_400_000
month 1000 * 60 * 60 * 24 * 30 = 2_592_000_000
year 1000 * 60 * 60 * 24 * 30 * 12 = 31_104_000_000
*/
