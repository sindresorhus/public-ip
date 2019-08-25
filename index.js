'use strict';
const {promisify} = require('util');
const dgram = require('dgram');
const dns = require('dns-socket');
const got = require('got');
const isIp = require('is-ip');

const defaults = {
	timeout: 5000
};

const dnsServers = [
	{
		servers: [
			'resolver1.opendns.com',
			'resolver2.opendns.com',
			'resolver3.opendns.com',
			'resolver4.opendns.com'
		],
		v4: {
			name: 'myip.opendns.com',
			type: 'A'
		},
		v6: {
			name: 'myip.opendns.com',
			type: 'AAAA'
		}
	},
	{
		servers: [
			'ns1.google.com',
			'ns2.google.com',
			'ns3.google.com',
			'ns4.google.com'
		],
		v4: {
			name: 'o-o.myaddr.l.google.com',
			type: 'TXT',
			clean: ip => ip.replace(/"/g, '')
		},
		v6: {
			name: 'o-o.myaddr.l.google.com',
			type: 'TXT',
			clean: ip => ip.replace(/"/g, '')
		}
	}
];

const type = {
	v4: {
		dnsServers: dnsServers.map(({servers, v4}) => ({
			servers,
			question: v4
		})),
		httpsUrls: [
			'https://ipv4.icanhazip.com/',
			'https://api.ipify.org/'
		]
	},
	v6: {
		dnsServers: dnsServers.map(({servers, v6}) => ({
			servers,
			question: v6
		})),
		httpsUrls: [
			'https://ipv6.icanhazip.com/',
			'https://api6.ipify.org/'
		]
	}
};

const queryDns = (version, options) => {
	const data = type[version];

	const socket = dns({
		retries: 0,
		socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4'),
		timeout: options.timeout
	});

	const socketQuery = promisify(socket.query.bind(socket));

	const promise = (async () => {
		let internalPromise = Promise.resolve();

		data.dnsServers.forEach(dnsServerInfo => {
			const {servers, question} = dnsServerInfo;
			servers.forEach(server => {
				// eslint-disable-next-line promise/prefer-await-to-then
				internalPromise = internalPromise.then(async ip => {
					if (ip) {
						return ip;
					}

					try {
						const {name, type, clean} = question;

						const dnsResponse = await socketQuery({questions: [{name, type}]}, 53, server);

						const {
							answers: {
								0: {
									data
								}
							}
						} = dnsResponse;

						const response = typeof data === 'string' ? data.trim() : data.toString().trim();

						const ip = clean ? clean(response) : response;

						if (!ip || !isIp[version](ip)) {
							return null;
						}

						return ip;
					} catch (error) {
						return null;
					}
				});
			});
		});

		const ip = await internalPromise;

		socket.destroy();

		if (!ip) {
			throw new Error('Couldn\'t find your IP');
		}

		return ip;
	})();

	promise.cancel = () => {
		socket.cancel();
	};

	return promise;
};

const queryHttps = (version, options) => {
	const promise = (async () => {
		let internalPromise = Promise.resolve();

		try {
			const requestOptions = {
				family: version === 'v6' ? 6 : 4,
				retries: 0,
				timeout: options.timeout
			};

			const urls = [].concat.apply(type[version].httpsUrls, options.urls || []);

			urls.forEach(url => {
				// eslint-disable-next-line promise/prefer-await-to-then
				internalPromise = internalPromise.then(async ip => {
					if (ip) {
						return ip;
					}

					if (promise._cancelled) {
						throw new got.CancelError();
					}

					const gotPromise = got(url, requestOptions);
					promise.cancel = gotPromise.cancel;

					try {
						const response = await gotPromise;

						const ip = (response.body || '').trim();

						if (!ip || !isIp[version](ip)) {
							return null;
						}

						return ip;
					} catch (error) {
						if (error instanceof got.CancelError) {
							throw error;
						}

						return null;
					}
				});
			});

			const ip = await internalPromise;

			if (!ip) {
				throw new Error('Couldn\'t find your IP');
			}

			return ip;
		} catch (error) {
			// Don't throw a cancellation error for consistency with DNS
			if (!(error instanceof got.CancelError)) {
				throw error;
			}
		}
	})();

	promise.cancel = () => {
		promise._cancelled = true;
	};

	return promise;
};

const queryAll = (version, options) => {
	let cancel;
	const promise = (async () => {
		let response;
		const dnsPromise = queryDns(version, options);
		cancel = dnsPromise.cancel;
		try {
			response = await dnsPromise;
		} catch (_) {
			const httpsPromise = queryHttps(version, options);
			cancel = httpsPromise.cancel;
			response = await httpsPromise;
		}

		return response;
	})();

	promise.cancel = cancel;

	return promise;
};

module.exports.v4 = options => {
	options = {
		...defaults,
		...options
	};

	if (!('dns' in options || 'https' in options)) {
		return queryAll('v4', options);
	}

	if (options.https) {
		return queryHttps('v4', options);
	}

	return queryDns('v4', options);
};

module.exports.v6 = options => {
	options = {
		...defaults,
		...options
	};

	if (!('dns' in options || 'https' in options)) {
		return queryAll('v6', options);
	}

	if (options.https) {
		return queryHttps('v6', options);
	}

	return queryDns('v6', options);
};
