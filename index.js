'use strict';
const {promisify} = require('util');
const dgram = require('dgram');
const dns = require('dns-socket');
const {get: got, CancelError} = require('got');
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
		for (const dnsServerInfo of data.dnsServers) {
			const {servers, question} = dnsServerInfo;
			for (const server of servers) {
				try {
					const {name, type, clean} = question;

					// eslint-disable-next-line no-await-in-loop
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

					if (ip && isIp[version](ip)) {
						return ip;
					}
				} catch (_) {}
			}
		}

		socket.destroy();

		throw new Error('Couldn\'t find your IP');
	})();

	promise.cancel = () => {
		socket.cancel();
	};

	return promise;
};

const queryHttps = (version, options) => {
	let cancel;

	const promise = (async () => {
		try {
			const requestOptions = {
				family: version === 'v6' ? 6 : 4,
				retries: 0,
				timeout: options.timeout
			};

			const urls = [].concat.apply(type[version].httpsUrls, options.urls || []);

			for (const url of urls) {
				try {
					const gotPromise = got(url, requestOptions);
					cancel = gotPromise.cancel;

					// eslint-disable-next-line no-await-in-loop
					const response = await gotPromise;

					const ip = (response.body || '').trim();

					if (ip && isIp[version](ip)) {
						return ip;
					}
				} catch (error) {
					if (error instanceof CancelError) {
						throw error;
					}
				}
			}

			throw new Error('Couldn\'t find your IP');
		} catch (error) {
			// Don't throw a cancellation error for consistency with DNS
			if (!(error instanceof CancelError)) {
				throw error;
			}
		}
	})();

	promise.cancel = cancel;

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

	if (!('https' in options)) {
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

	if (!('https' in options)) {
		return queryAll('v6', options);
	}

	if (options.https) {
		return queryHttps('v6', options);
	}

	return queryDns('v6', options);
};
