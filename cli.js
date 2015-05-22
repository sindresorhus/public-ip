#!/usr/bin/env node
'use strict';
var meow = require('meow');
var publicIp = require('./');

meow({
	help: [
		'Example',
		'  $ public-ip',
		'  46.5.21.123'
	].join('\n')
});

publicIp(function (err, ip) {
	if (err) {
		console.error(err.message);
		process.exit(1);
	}

	console.log(ip);
});
