'use strict';
const dgram = require('dgram');
const dns = require('dns-socket');
const pify = require('pify');

const type = {
	v4: {
		server: '208.67.222.222',
		question: {
			name: 'myip.opendns.com',
			type: 'A'
		}
	},
	v6: {
		server: '2620:0:ccc::2',
		question: {
			name: 'myip.opendns.com',
			type: 'AAAA'
		}
	}
};

const query = version => {
	const data = type[version];

	const socket = dns({
		socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4')
	});

	return pify(socket.query.bind(socket))({
		questions: [data.question]
	}, 53, data.server).then(res => {
		const ip = res.answers[0] && res.answers[0].data;
		socket.destroy();

		if (!ip) {
			throw new Error('Couldn\'t find your IP');
		}

		return ip;
	});
};

module.exports.v4 = () => query('v4');
module.exports.v6 = () => query('v6');
