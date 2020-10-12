// Need to test manually in DevTools
// $ browserify test-browser.js | pbcopy
'use strict';
const publicIp = require('./browser');
const test = require('tape');

test('v6', async t => {
	try {
		const ip1 = await publicIp.v6();
		const ip2 = await publicIp.v6();

		console.log(ip1);
		t.equal(ip1, ip2);
		t.end();
	} catch (error) {
		t.end(error);
	}
});

test('v4', async t => {
	try {
		const ip1 = await publicIp.v4();
		const ip2 = await publicIp.v4({
			fallbackUrls: [
				'https://ifconfig.me'
			]
		});

		console.log(ip1);
		t.equal(ip1, ip2);
		t.end();
	} catch (error) {
		t.end(error);
	}
});
