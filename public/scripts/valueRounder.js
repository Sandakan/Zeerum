//jshint ignore:start
const round = (value, precision) => {
	const multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
};

export default (val = undefined, precision = 2) => {
	if (!isNaN(Number(val) && val !== null)) {
		val = Number(val);
		if (0 <= val && val < 1_000) {
			return val;
		} else if (1_000 < val && val < 1_000_000) {
			return `${round(val / 1_000, precision)} K`;
		} else if (1_000_000 < val && val < 1_000_000_000) {
			return `${round(val / 1_000_000, precision)} M`;
		} else if (1_000_000_000 < val && val < 1_000_000_000_000) {
			return `${round(val / 1_000_000_000, precision)} B`;
		} else if (1_000_000_000_000 < val && val < 1_000_000_000_000_000) {
			return `${round(val / 1_000_000_000_000, precision)} T`;
		}
	} else {
		console.error('Entered value is not a number. value :', val);
		return 'NaN';
	}
};

/*
   val < 1_000  => normal operation
   1_000 < val < 1_000_000  => K
   1_000_000 val < 1_000_000_000 => M
   1_000_000_000 val < 1_000_000_000_000 => B
   1_000_000_000_000 val < 1_000_000_000_000_000 => T
*/
