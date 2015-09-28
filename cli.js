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
		'  --ipv6  Return the IPv6 address instead of IPv4',
		'',
		'Examples',
		'  $ public-ip',
		'  46.5.21.123'
	]
});

var fn = cli.flags.ipv6 ? 'v6' : 'v4';

publicIp[fn](function (err, ip) {
	if (err) {
		console.error(err.stack);
		process.exit(1);
	}

	console.log(ip);
});
