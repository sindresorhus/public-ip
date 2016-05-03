#!/usr/bin/env node
/* eslint-disable no-nested-ternary */
'use strict';
const meow = require('meow');
const publicIp = require('./');

const cli = meow(`
	Usage
	  $ public-ip

	Options
	  -4, --ipv4  Return the IPv4 address (default)
	  -6, --ipv6  Return the IPv6 address

	Examples
	  $ public-ip
	    46.5.21.123
`, {
	alias: {
		4: 'ipv4',
		6: 'ipv6'
	}
});

const fn = cli.flags.ipv4 ? 'v4' : (cli.flags.ipv6 ? 'v6' : 'v4');

publicIp[fn]().then(console.log);
