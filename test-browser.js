// Need to test manually in DevTools
// $ browserify test-browser.js | pbcopy
'use strict';
const publicIp = require('./browser');
const test = require('tape');

test('ipv4', async t => {
	const ip1 = await publicIp.v4();
	const ip2 = await publicIp.v4({
		fallbackUrls: [
			'https://ifconfig.me'
		]
	});
	t.equal(ip1, ip2);
	t.end();
});

test('ipv6', async t => {
	const ip1 = await publicIp.v6();
	const ip2 = await publicIp.v6();
	t.equal(ip1, ip2);
	t.end();
});
