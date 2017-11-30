'use strict';
const dgram = require('dgram');
const dns = require('dns-socket');
const got = require('got');
const isIp = require('is-ip');
const pify = require('pify');

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
		httpsUrl: 'https://ipv4.icanhazip.com/'
	},
	v6: {
		dnsServer: '2620:0:ccc::2',
		dnsQuestion: {
			name: 'myip.opendns.com',
			type: 'AAAA'
		},
		httpsUrl: 'https://ipv6.icanhazip.com/'
	}
};

const queryDns = (version, opts) => {
	const data = type[version];

	const socket = dns({
		retries: 0,
		socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4'),
		timeout: opts.timeout
	});

	const promise = pify(socket.query.bind(socket))({
		questions: [data.dnsQuestion]
	}, 53, data.dnsServer).then(res => {
		socket.destroy();
		const ip = ((res.answers[0] && res.answers[0].data) || '').trim();

		if (!ip || !isIp[version](ip)) {
			throw new Error('Couldn\'t find your IP');
		}

		return ip;
	}).catch(err => {
		socket.destroy();
		throw err;
	});

	promise.cancel = () => {
		socket.cancel();
	};

	return promise;
};

const queryHttps = (version, opts) => {
	const gotOpts = {
		family: version === 'v6' ? 6 : 4,
		retries: 0,
		timeout: opts.timeout
	};

	const gotPromise = got(type[version].httpsUrl, gotOpts);

	const promise = gotPromise.then(res => {
		const ip = (res.body || '').trim();

		if (!ip) {
			throw new Error('Couldn\'t find your IP');
		}

		return ip;
	}).catch(err => {
		// Don't throw a cancellation error for consistency with DNS
		if (!(err instanceof got.CancelError)) {
			throw err;
		}
	});

	promise.cancel = gotPromise.cancel;

	return promise;
};

module.exports.v4 = opts => {
	opts = Object.assign({}, defaults, opts);

	if (opts.https) {
		return queryHttps('v4', opts);
	}

	return queryDns('v4', opts);
};

module.exports.v6 = opts => {
	opts = Object.assign({}, defaults, opts);

	if (opts.https) {
		return queryHttps('v6', opts);
	}

	return queryDns('v6', opts);
};
