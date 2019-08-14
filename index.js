'use strict';
const {promisify} = require('util');
const dgram = require('dgram');
const dns = require('dns-socket');
const got = require('got');
const isIp = require('is-ip');

const defaults = {
	timeout: 5000,
	https: false
};

const type = {
	v4: {
		dnsServer: '208.67.222.222',
		dnsQuestion: {
			name: 'myip.opendns.com',
			type: 'A'
		},
		httpsUrl: 'https://ipv4.icanhazip.com/',
		httpsFallbackUrl: 'https://api.ipify.org/'
	},
	v6: {
		dnsServer: '2620:0:ccc::2',
		dnsQuestion: {
			name: 'myip.opendns.com',
			type: 'AAAA'
		},
		httpsUrl: 'https://ipv6.icanhazip.com/',
		httpsFallbackUrl: 'https://api6.ipify.org/'
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

	// eslint-disable-next-line promise/prefer-await-to-then
	const promise = socketQuery({questions: [data.dnsQuestion]}, 53, data.dnsServer).then(({answers}) => {
		socket.destroy();

		const ip = ((answers[0] && answers[0].data) || '').trim();

		if (!ip || !isIp[version](ip)) {
			throw new Error('Couldn\'t find your IP');
		}

		return ip;
	}).catch(error => { // TODO: Move both the `socket.destroy()` calls into a `Promise#finally()` handler when targeting Node.js 10.
		socket.destroy();
		throw error;
	});

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

			const gotPromise = got(type[version].httpsUrl, requestOptions);

			cancel = gotPromise.cancel;

			let response;
			try {
				response = await gotPromise;
			} catch (_) {
				const gotBackupPromise = got(type[version].httpsFallbackUrl, requestOptions);

				cancel = gotBackupPromise.cancel;

				response = await gotBackupPromise;
			}

			const ip = (response.body || '').trim();

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

	promise.cancel = cancel;

	return promise;
};

module.exports.v4 = options => {
	options = {
		...defaults,
		...options
	};

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

	if (options.https) {
		return queryHttps('v6', options);
	}

	return queryDns('v6', options);
};
