import {serial as test} from 'ava';
import isIp from 'is-ip';
import dnsStub from './mocks/dns-socket';
import gotStub from './mocks/got';
import publicIp from '.';

test.afterEach.always(() => {
	dnsStub.restore();
	gotStub.restore();
});

test('IPv4 DNS - No HTTPS call', async t => {
	t.true(isIp.v4(await publicIp.v4()));
	t.true(dnsStub.called() > 0);
	t.is(dnsStub.ignored(), 0);
	t.is(gotStub.called(), 0);
});

test('IPv4 DNS failure falls back to HTTPS', async t => {
	dnsStub.ignore(/.*/);
	const ip = await publicIp.v4();
	t.true(isIp.v4(ip));
	t.is(dnsStub.ignored(), 8);
	t.true(gotStub.called() > 0);
});

test('IPv4 DNS failure OpenDNS falls back to Google DNS', async t => {
	dnsStub.ignore(/^208\./);
	const ip = await publicIp.v4();
	t.true(isIp.v4(ip));
	t.is(dnsStub.ignored(), 4);
	t.is(gotStub.called(), 0);
});

test('IPv4 HTTPS - No DNS call', async t => {
	t.true(isIp.v4(await publicIp.v4({onlyHttps: true})));
	t.is(dnsStub.called(), 0);
});

test('IPv4 HTTPS uses custom URLs', async t => {
	gotStub.ignore(/com|org/);
	t.true(isIp.v4(await publicIp.v4({onlyHttps: true, fallbackUrls: [
		'https://ifconfig.co/ip',
		'https://ifconfig.io/ip'
	]})));
	t.is(gotStub.ignored(), 2);
	t.is(dnsStub.called(), 0);
});

test('IPv4 DNS timeout', async t => {
	t.true(isIp.v4(await publicIp.v4({timeout: 2000})));
});

test('IPv4 HTTPS timeout', async t => {
	t.true(isIp.v4(await publicIp.v4({onlyHttps: true, timeout: 4000})));
});

test('IPv4 DNS cancellation', async t => {
	const timeout = 5000;
	const start = process.hrtime();
	const promise = publicIp.v4({timeout});
	promise.cancel();
	await promise;
	const difference = process.hrtime(start);
	const milliseconds = ((difference[0] * 1e9) + difference[1]) / 1e6;
	t.true(milliseconds < timeout);
});

test('IPv4 HTTPS cancellation', async t => {
	const timeout = 5000;
	const start = process.hrtime();
	const promise = publicIp.v4({timeout, onlyHttps: true});
	promise.cancel();
	await promise;
	const difference = process.hrtime(start);
	const milliseconds = ((difference[0] * 1e9) + difference[1]) / 1e6;
	t.true(milliseconds < timeout);
});

// Impossible DNS timeouts seems unreliable to test on a working connection
// because of caches, so we're only testing HTTPS.

test('IPv4 HTTPS impossible timeout', async t => {
	await t.throwsAsync(publicIp.v4({onlyHttps: true, timeout: 1}));
});

if (!process.env.CI) {
	test('IPv6 DNS', async t => {
		t.true(isIp.v6(await publicIp.v6()));
	});

	test('IPv6 HTTPS', async t => {
		t.true(isIp.v6(await publicIp.v6({onlyHttps: true})));
	});
}
