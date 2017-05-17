'use strict';
const isIp = require('is-ip');

const defaults = {
	timeout: 5000
};

const urls = {
	v4: 'https://ipv4.icanhazip.com/',
	v6: 'https://ipv6.icanhazip.com/'
};

function queryHttps(version, opts) {
	return new Promise((resolve, reject) => {
		const doReject = () => reject(new Error('Couldn\'t find your IP'));
		const xhr = new XMLHttpRequest();

		xhr.onerror = doReject;
		xhr.ontimeout = doReject;
		xhr.onload = () => {
			const ip = xhr.responseText.trim();

			if (!ip || !isIp[version](ip)) {
				doReject();
			}

			resolve(ip);
		};

		xhr.open('GET', urls[version]);
		xhr.timeout = opts.timeout;
		xhr.send();
	});
}

module.exports.v4 = opts => {
	opts = Object.assign({}, defaults, opts);
	return queryHttps('v4', opts);
};

module.exports.v6 = opts => {
	opts = Object.assign({}, defaults, opts);
	return queryHttps('v6', opts);
};
