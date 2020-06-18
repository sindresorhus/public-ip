// Need to test manually in DevTools
// $ browserify test-browser.js | pbcopy
'use strict';
const publicIp = require('./browser');
const test = require('tape');

let v6Address = false;

test('v6', async t => {
	publicIp.v6().then(async ip1 => {
		v6Address = await publicIp.v6();

		t.equal(ip1, v6Address);
		t.end();
	}).catch(err => {
		if (err === 'Couldn\'t find your IP') {
			v6Address = false;
		}
		t.end();
	});
});

test('v4', async t => {
	publicIp.v4().then(async ip1 => {
		console.log(ip1)
		const ip2 = await publicIp.v4({
			fallbackUrls: [
				'https://ifconfig.me'
			]
		});
		t.equal(ip1, ip2);
		t.end();
	});
});

test('v6or4', async t => {
	publicIp.v6or4().then(async ip1 => {
		const ip2 = await publicIp.v4();

		if (v6Address !== false) {
			t.equal(ip1, v6Address);
		} else {
			t.equal(ip1, ip2);
		}
	
		t.end();
	});
});
