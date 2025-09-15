import {promisify} from 'node:util';
import dgram from 'node:dgram';
import dns from 'dns-socket';
import got, {CancelError} from 'got';
import {isIPv6, isIPv4} from 'is-ip';
import {createPublicIp, IpNotFoundError} from './core.js';

export {IpNotFoundError} from './core.js';

const defaults = {
	timeout: 5000,
	onlyHttps: false,
};

const dnsServers = [
	{
		v4: {
			servers: [
				'208.67.222.222',
				'208.67.220.220',
				'208.67.222.220',
				'208.67.220.222',
			],
			name: 'myip.opendns.com',
			type: 'A',
		},
		v6: {
			servers: [
				'2620:0:ccc::2',
				'2620:0:ccd::2',
			],
			name: 'myip.opendns.com',
			type: 'AAAA',
		},
	},
	{
		v4: {
			servers: [
				'216.239.32.10',
				'216.239.34.10',
				'216.239.36.10',
				'216.239.38.10',
			],
			name: 'o-o.myaddr.l.google.com',
			type: 'TXT',
			transform: ip => ip.replaceAll('"', ''),
		},
		v6: {
			servers: [
				'2001:4860:4802:32::a',
				'2001:4860:4802:34::a',
				'2001:4860:4802:36::a',
				'2001:4860:4802:38::a',
			],
			name: 'o-o.myaddr.l.google.com',
			type: 'TXT',
			transform: ip => ip.replaceAll('"', ''),
		},
	},
];

const type = {
	v4: {
		dnsServers: dnsServers.map(({v4: {servers, ...question}}) => ({
			servers, question,
		})),
		httpsUrls: [
			'https://icanhazip.com/',
			'https://api.ipify.org/',
		],
	},
	v6: {
		dnsServers: dnsServers.map(({v6: {servers, ...question}}) => ({
			servers, question,
		})),
		httpsUrls: [
			'https://icanhazip.com/',
			'https://api6.ipify.org/',
		],
	},
};

const validateIp = (ip, version) => {
	const method = version === 'v6' ? isIPv6 : isIPv4;
	return ip && method(ip);
};

const withTimeout = (promise, timeout) => {
	let timeoutId;
	const timeoutPromise = new Promise((_resolve, reject) => {
		timeoutId = setTimeout(() => {
			reject(new IpNotFoundError({cause: new Error(`Timeout of ${timeout}ms exceeded`)}));
		}, timeout);
	});

	const wrappedPromise = (async () => {
		try {
			return await Promise.race([promise, timeoutPromise]);
		} finally {
			clearTimeout(timeoutId);
		}
	})();

	wrappedPromise.cancel = () => {
		clearTimeout(timeoutId);
		promise.cancel?.();
	};

	return wrappedPromise;
};

const queryDns = version => {
	const data = type[version];
	const sockets = [];
	let cancelled = false;

	const promise = (async () => {
		const queries = [];

		for (const dnsServerInfo of data.dnsServers) {
			const {servers, question} = dnsServerInfo;
			for (const server of servers) {
				if (cancelled) {
					break;
				}

				const socket = dns({
					retries: 0,
					maxQueries: 1,
					socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4'),
					timeout: 30_000, // Use high individual timeout, overall timeout handled by wrapper
				});

				sockets.push(socket);
				const socketQuery = promisify(socket.query.bind(socket));

				const queryPromise = (async () => {
					try {
						const {name, type, transform} = question;
						const dnsResponse = await socketQuery({questions: [{name, type}]}, 53, server);

						const {
							answers: {
								0: {
									data,
								},
							},
						} = dnsResponse;

						const response = (typeof data === 'string' ? data : data.toString()).trim();
						const ip = transform ? transform(response) : response;

						if (validateIp(ip, version)) {
							return ip;
						}

						throw new Error('Invalid IP');
					} finally {
						socket.destroy();
					}
				})();

				queries.push(queryPromise);
			}
		}

		try {
			return await Promise.any(queries);
		} catch (error) {
			const errors = error.errors || [];
			const lastError = errors.at(-1) || error;
			throw new IpNotFoundError({cause: lastError});
		} finally {
			for (const socket of sockets) {
				socket.destroy();
			}
		}
	})();

	promise.cancel = () => {
		cancelled = true;
		for (const socket of sockets) {
			socket.destroy();
		}
	};

	return promise;
};

const queryHttps = (version, options) => {
	const cancellers = [];
	let cancelled = false;

	const promise = (async () => {
		const requestOptions = {
			dnsLookupIpVersion: version === 'v6' ? 6 : 4,
			retry: {
				limit: 0,
			},
			timeout: {
				request: 30_000, // Use high individual timeout, overall timeout handled by wrapper
			},
		};

		const urls = [
			...type[version].httpsUrls,
			...(options.fallbackUrls ?? []),
		];

		const requests = urls.map(url => {
			if (cancelled) {
				return Promise.reject(new CancelError('Request cancelled'));
			}

			return (async () => {
				const gotPromise = got.get(url, requestOptions);
				if (gotPromise?.cancel) {
					cancellers.push(gotPromise.cancel);
				}

				const response = await gotPromise;
				const ip = response.body?.trim();

				if (validateIp(ip, version)) {
					return ip;
				}

				throw new Error('Invalid IP');
			})();
		});

		try {
			return await Promise.any(requests);
		} catch (error) {
			if (error instanceof CancelError) {
				return;
			}

			const errors = error.errors || [];
			const lastError = errors.at(-1) || error;

			if (lastError instanceof CancelError) {
				return;
			}

			throw new IpNotFoundError({cause: lastError});
		}
	})();

	promise.cancel = () => {
		cancelled = true;
		for (const cancel of cancellers) {
			try {
				cancel?.();
			} catch {
				// Ignore cancellation errors
			}
		}
	};

	return promise;
};

const queryAll = (version, options) => {
	let dnsPromise;
	let httpsPromise;

	const promise = (async () => {
		dnsPromise = queryDns(version);

		try {
			return await dnsPromise;
		} catch {
			httpsPromise = queryHttps(version, options);
			return httpsPromise;
		}
	})();

	promise.cancel = () => {
		dnsPromise?.cancel();
		httpsPromise?.cancel();
	};

	return promise;
};

export const publicIp = createPublicIp(publicIpv4, publicIpv6);

export function publicIpv4(options) {
	options = {
		...defaults,
		...options,
	};

	const promise = options.onlyHttps
		? queryHttps('v4', options)
		: queryAll('v4', options);

	return withTimeout(promise, options.timeout);
}

export function publicIpv6(options) {
	options = {
		...defaults,
		...options,
	};

	const promise = options.onlyHttps
		? queryHttps('v6', options)
		: queryAll('v6', options);

	return withTimeout(promise, options.timeout);
}

export {CancelError} from 'got';
