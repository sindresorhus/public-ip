'use strict';
const dgram = require('dgram');
const dns = require('dns-socket');
const got = require('got');
const pify = require('pify');

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

const queryDns = version => {
	const data = type[version];

	const socket = dns({
		socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4')
	});

	return pify(socket.query.bind(socket))({
		questions: [data.dnsQuestion]
	}, 53, data.dnsServer).then(res => {
		const ip = res.answers[0] && res.answers[0].data;
		socket.destroy();

		if (!ip) {
			throw new Error('Couldn\'t find your IP');
		}

		return ip;
	});
};

const queryHttps = version => {
	const opts = {family: (version === 'v6') ? 6 : 4};

	return got(type[version].httpsUrl, opts).then(res => {
		const ip = (res.body || '').trim();

		if (!ip) {
			throw new Error('Couldn\'t find your IP');
		}

		return ip;
	});
};

module.exports.v4 = opts => {
	opts = opts || {};

	if (opts.https) {
		return queryHttps('v4');
	}

	return queryDns('v4');
};

module.exports.v6 = opts => {
	opts = opts || {};

	if (opts.https) {
		return queryHttps('v6');
	}

	return queryDns('v6');
};
