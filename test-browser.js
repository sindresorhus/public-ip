// Need to test manually in DevTools
// $ browserify test-browser.js | pbcopy
'use strict';
const publicIp = require('./browser');
const test = require('tape');

let v6Address = null;

test('v6', async t => {
	try {
		const ip1 = await publicIp.v6();
		v6Address = await publicIp.v6();

		t.equal(ip1, v6Address);
		t.end();
	} catch (error) {
		if (error === 'Couldn\'t find your IP') {
			v6Address = null;
		}

		t.end();
	}
});

test('v4', async t => {
	const ip1 = await publicIp.v4();
	const ip2 = await publicIp.v4({
		fallbackUrls: [
			'https://ifconfig.me'
		]
	});
	t.equal(ip1, ip2);
	t.end();
});
