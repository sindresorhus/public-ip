import {IpNotFoundError} from './core.js';
import {validateIp, createAbortSignal, withAbortSignal} from './utils.js';

export const queryHttps = async (version, urls, options = {}) => {
	const urlList = [
		...urls,
		...(options.fallbackUrls ?? []),
	];

	const requests = urlList.map(async url => {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'public-ip',
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const responseText = await response.text();
		const ip = responseText.trim();

		if (validateIp(ip, version)) {
			return ip;
		}

		throw new Error('Invalid IP');
	});

	try {
		return await Promise.any(requests);
	} catch (error) {
		const errors = error.errors ?? [];
		const lastError = errors.at?.(-1) ?? error;
		throw new IpNotFoundError({cause: lastError});
	}
};

export const createQuery = (version, queryFunction, options) => {
	const abortSignal = createAbortSignal(options.timeout, options.signal);
	return withAbortSignal(queryFunction(), abortSignal);
};
