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
});

var fn;
if (Object.keys(cli.flags).length === 0 || cli.flags['4'] || cli.flags.ipv4) {
	fn = 'v4';
} else if (cli.flags['6'] || cli.flags.ipv6) {
	fn = 'v6';
} else {
	cli.showHelp();
}

publicIp[fn](function (err, ip) {
	if (err) {
		console.error(err.stack);
		process.exit(1);
	}

	console.log(ip);
});
