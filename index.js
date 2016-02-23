'use strict';
var dgram = require('dgram');
var dns = require('dns-socket');

var type = {
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

function query(version, cb) {
	var data = type[version];

	var socket = dns({
		socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4')
	});

	socket.query({
		questions: [data.question]
	}, 53, data.server, function (err, res) {
		if (err) {
			cb(err);
			return;
		}

		var ip = res.answers[0] && res.answers[0].data;
		socket.destroy();

		if (!ip) {
			cb(new Error('Couldn\'t find your IP'));
			return;
		}

		cb(null, ip);
	});
}

function v4(cb) {
	query('v4', cb);
}

function v6(cb) {
	query('v6', cb);
}

module.exports = v4;
module.exports.v4 = v4;
module.exports.v6 = v6;
