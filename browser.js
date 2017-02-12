'use strict';
/* global XMLHttpRequest */

var urls = {
	v4: 'https://ipv4.icanhazip.com/',
	v6: 'https://ipv6.icanhazip.com/'
};

function queryHttps(version, opts) {
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.timeout = opts.timeout;
		xhr.onerror = () => reject(new Error('Couldn\'t find your IP'));
		xhr.ontimeout = () => reject(new Error('Couldn\'t find your IP'));
		xhr.onload = () => resolve(xhr.responseText.trim());
		xhr.open('GET', urls[version]);
		xhr.send();
	});
}

module.exports.v4 = function (opts) {
	opts = opts || {};
	opts.timeout = typeof opts.timeout === 'number' ? opts.timeout : 5000;
	return queryHttps('v4', opts);
};

module.exports.v6 = function (opts) {
	opts = opts || {};
	opts.timeout = typeof opts.timeout === 'number' ? opts.timeout : 5000;
	return queryHttps('v6', opts);
};
