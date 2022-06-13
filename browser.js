import {isIPv6, isIPv4} from 'is-ip';
import {createPublicIp, IpNotFoundError} from './core.js';

export class CancelError extends Error {
	constructor() {
		super('Request was cancelled');
		this.name = 'CancelError';
	}

	get isCanceled() {
		return true;
	}
}

export {IpNotFoundError} from './core.js';

const defaults = {
	timeout: 5000,
};

const urls = {
	v4: [
		'https://ipv4.icanhazip.com/',
		'https://api.ipify.org/',
	],
	v6: [
		'https://ipv6.icanhazip.com/',
		'https://api6.ipify.org/',
	],
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
			const method = version === 'v6' ? isIPv6 : isIPv4;

			if (!ip || !method(ip)) {
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
		const urls_ = [
			...urls[version],
			...(options.fallbackUrls ?? []),
		];

		let lastError;
		for (const url of urls_) {
			try {
				request = sendXhr(url, options, version);
				// eslint-disable-next-line no-await-in-loop
				const ip = await request;
				return ip;
			} catch (error) {
				lastError = error;

				if (error instanceof CancelError) {
					throw error;
				}
			}
		}

		throw new IpNotFoundError({cause: lastError});
	})();

	promise.cancel = () => {
		request.cancel();
	};

	return promise;
};

export const publicIp = createPublicIp(publicIpv4, publicIpv6);

export function publicIpv4(options) {
	return queryHttps('v4', {...defaults, ...options});
}

export function publicIpv6(options) {
	return queryHttps('v6', {...defaults, ...options});
}
