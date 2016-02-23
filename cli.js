#!/usr/bin/env node
'use strict';
var meow = require('meow');
var publicIp = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ public-ip',
		'',
		'Options',
		'  -4, --ipv4  Return the IPv4 address (default)',
		'  -6, --ipv6  Return the IPv6 address',
		'',
		'Examples',
		'  $ public-ip',
		'  46.5.21.123'
	]
}, {
	alias: {
		4: 'ipv4',
		6: 'ipv6'
	}
});

var fn = cli.flags.ipv4 ? 'v4' : cli.flags.ipv6 ? 'v6' : 'v4';

publicIp[fn](function (err, ip) {
	if (err) {
		console.error(err.stack);
		process.exit(1);
	}

	console.log(ip);
});
