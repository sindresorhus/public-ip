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
	],
	// These URLs accept both IPv6/IPv4 connectivity
	// Response might change for dual IPv6/IPv4 stack network interface
	// URL => regex which match IP in response
	general: {
		'https://www.cloudflare.com/cdn-cgi/trace': 'ip(=)(.*?)\n',
		'https://ip-api.io/api/json': 'ip"(.*?)"(.*?)"'
	}
};

let xhr;

const sendXhr = async (url, options, version) => {
	return new Promise((resolve, reject) => {
		xhr = new XMLHttpRequest();
		xhr.addEventListener('error', reject, {once: true});
		xhr.addEventListener('timeout', reject, {once: true});

		xhr.addEventListener('load', () => {
			const ip = xhr.responseText.trim();

			if (!ip || (version && !isIp[version](ip))) {
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

const queryGeneral = async options => {
	const urls_ = urls.general;

	for (const url of Object.keys(urls_)) {
		try {
			// eslint-disable-next-line no-await-in-loop
			let ip = await sendXhr(url, options);
			ip = ip.match(urls_[url])[2];
			if (ip && (isIp.v4(ip) || isIp.v6(ip))) {
				return ip;
			}
		} catch (_) {}
	}

	throw new Error('Couldn\'t find your IP');
};

const queryHttps = async (version, options) => {
	const urls_ = [].concat.apply(urls[version], options.fallbackUrls || []);
	for (const url of urls_) {
		let ip;
		try {
			// eslint-disable-next-line no-await-in-loop
			ip = await sendXhr(url, options, version);
			return ip;
		} catch (_) {}
	}

	// Try general
	await queryGeneral(options);
};

queryHttps.cancel = () => {
	xhr.abort();
};

module.exports.v4 = options => queryHttps('v4', {...defaults, ...options});

module.exports.v6 = options => queryHttps('v6', {...defaults, ...options});
