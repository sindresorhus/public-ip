var dns = require('native-dns');

module.exports = function (cb) {
	var req = dns.Request({
		server: {
			address: '208.67.222.222', // OpenDNS
			port: 53,
			type: 'udp'
		},
		question: dns.Question({
			name: 'myip.opendns.com',
			type: 'A'
		})
	});

	req.on('timeout', function () {
		cb(new Error('Request timed out'));
	});

	req.on('message', function (err, res) {
		var ip = res.answer[0] && res.answer[0].address;

		if (!ip) {
			cb(new Error('Couldn\'t find your IP'));
		}

		cb(null, ip);
	});

	req.send();
};
