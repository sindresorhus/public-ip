'use strict';
const isIp = require('is-ip');

const defaults = {
	timeout: 5000
};

const urls = {
	v4: 'https://ipv4.icanhazip.com/',
	v6: 'https://ipv6.icanhazip.com/'
};

const queryHttps = (version, options) => {
	let xhr;
	const promise = new Promise((resolve, reject) => {
		const doReject = () => {
			reject(new Error('Couldn\'t find your IP'));
		};

		xhr = new XMLHttpRequest();
		xhr.addEventListener('error', doReject, {once: true});
		xhr.addEventListener('timeout', doReject, {once: true});

		xhr.addEventListener('load', () => {
			const ip = xhr.responseText.trim();

			if (!ip || !isIp[version](ip)) {
				doReject();
			}

			resolve(ip);
		}, {once: true});

		xhr.open('GET', urls[version]);
		xhr.timeout = options.timeout;
		xhr.send();
	});

	promise.cancel = () => {
		xhr.abort();
	};

	return promise;
};

module.exports.v4 = options => queryHttps('v4', {...defaults, ...options});

module.exports.v6 = options => queryHttps('v6', {...defaults, ...options});
