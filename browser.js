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

const sendXhr = (url, options, version) => {
	const xhr = new XMLHttpRequest();

	let _reject;
	const promise = new Promise((resolve, reject) => {
		_reject = reject;
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

	promise.cancel = () => {
		xhr.abort();
		_reject(new CancelError());
	};

	return promise;
};

const queryHttps = (version, options) => {
	let request;
	const promise = (async function () {
		const urls_ = [].concat.apply(urls[version], options.fallbackUrls || []);
		for (const url of urls_) {
			try {
				request = sendXhr(url, options, version);
				// eslint-disable-next-line no-await-in-loop
				const ip = await request;
				return ip;
			} catch (e) {
				if(e instanceof CancelError) {
					throw e;
				}
			}
		}

		throw new Error('Couldn\'t find your IP');
	})();

	promise.cancel = () => {
		request.cancel();
	};

	return promise;
};

class CancelError extends Error {
	constructor() {
		super("Request was cancelled");
		this.name = "CancelError";
	}

	get isCanceled() {
		return true;
	}
}

module.exports.v4 = options => queryHttps('v4', {...defaults, ...options});

module.exports.v6 = options => queryHttps('v6', {...defaults, ...options});
