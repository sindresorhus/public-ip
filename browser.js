'use strict';
const isIp = require('is-ip');

const defaults = {
	timeout: 5000
};

const urls = {
	v4: [
		'https://ipv4.icanhazip.com/',
		'https://api.ipify.org/'
	],
	v6: [
		'https://ipv6.icanhazip.com/',
		'https://api6.ipify.org/'
	]
};

let xhr;

const sendXhr = async (url, options, version) => {
	return new Promise((resolve, reject) => {
		xhr = new XMLHttpRequest();
		xhr.addEventListener('error', reject, {once: true});
		xhr.addEventListener('timeout', reject, {once: true});

		xhr.addEventListener('load', () => {
			const ip = xhr.responseText.trim();

			if (!ip || !isIp[version](ip)) {
				reject();
				return;
			}

			resolve(ip);
		}, {once: true});

		xhr.open('GET', url);
		xhr.timeout = options.timeout;
		xhr.send();
	});
};

const queryHttps = async (version, options) => {
	let ip;
	const urls_ = [].concat.apply(urls[version], options.fallbackUrls || []);
	for (const url of urls_) {
		try {
			// eslint-disable-next-line no-await-in-loop
			ip = await sendXhr(url, options, version);
			return ip;
		} catch (_) {}
	}

	throw new Error('Couldn\'t find your IP');
};

queryHttps.cancel = () => {
	xhr.abort();
};

module.exports.v4 = options => queryHttps('v4', {...defaults, ...options});

module.exports.v6 = options => queryHttps('v6', {...defaults, ...options});
