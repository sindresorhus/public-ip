#!/usr/bin/env node
'use strict';
var pkg = require('./package.json');
var publicIp = require('./');
var argv = process.argv.slice(2);

function help() {
	console.log([
		'',
		'  ' + pkg.description,
		'',
		'  Example',
		'    $ public-ip',
		'    46.5.21.123'
	].join('\n'));
}

if (argv.indexOf('--help') !== -1) {
	help();
	return;
}

if (argv.indexOf('--version') !== -1) {
	console.log(pkg.version);
	return;
}

publicIp(function (err, ip) {
	if (err) {
		throw err;
	}

	console.log(ip);
});
