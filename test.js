import process from 'node:process';
import test from 'ava';
import isIp from 'is-ip';
import timeSpan from 'time-span';
import dnsStub from './mocks/dns-socket.js';
import gotStub from './mocks/got.js';
import publicIp, {publicIpv4, publicIpv6} from './index.js';

test.afterEach.always(() => {
	dnsStub.restore();
	gotStub.restore();
});

test('IPv4 DNS - No HTTPS call', async t => {
	t.true(isIp.v4(await publicIpv4()));
	t.true(dnsStub.called() > 0);
	t.is(dnsStub.ignored(), 0);
	t.is(gotStub.called(), 0);
});

test('IPv4 DNS failure falls back to HTTPS', async t => {
	dnsStub.ignore(/.*/);
	const ip = await publicIpv4();
	t.true(isIp.v4(ip));
	t.is(dnsStub.ignored(), 8);
	t.true(gotStub.called() > 0);
});

test('IPv4 DNS failure OpenDNS falls back to Google DNS', async t => {
	dnsStub.ignore(/^208\./);
	const ip = await publicIpv4();
	t.true(isIp.v4(ip));
	t.is(dnsStub.ignored(), 4);
	t.is(gotStub.called(), 0);
});

test('IPv4 HTTPS - No DNS call', async t => {
	t.true(isIp.v4(await publicIpv4({onlyHttps: true})));
	t.is(dnsStub.called(), 0);
});

test('IPv4 HTTPS uses custom URLs', async t => {
	gotStub.ignore(/com|org/);
	t.true(isIp.v4(await publicIpv4({onlyHttps: true, fallbackUrls: [
		'https://ifconfig.co/ip',
		'https://ifconfig.io/ip',
	]})));
	t.is(gotStub.ignored(), 2);
	t.is(dnsStub.called(), 0);
});

test('IPv4 DNS timeout', async t => {
	t.true(isIp.v4(await publicIpv4({timeout: 2000})));
});

test('IPv4 HTTPS timeout', async t => {
	t.true(isIp.v4(await publicIpv4({onlyHttps: true, timeout: 4000})));
});

test('IPv4 DNS cancellation', async t => {
	const timeout = 5000;
	const end = timeSpan();
	const promise = publicIpv4({timeout});
	promise.cancel();
	await promise;
	t.true(end() < timeout);
});

test('IPv4 HTTPS cancellation', async t => {
	const timeout = 5000;
	const end = timeSpan();
	const promise = publicIpv4({timeout, onlyHttps: true});
	promise.cancel();
	await promise;
	t.true(end() < timeout);
});

// Impossible DNS timeouts seems unreliable to test on a working connection
// because of caches, so we're only testing HTTPS.

test('IPv4 HTTPS impossible timeout', async t => {
	await t.throwsAsync(publicIpv4({onlyHttps: true, timeout: 1}));
});

if (!process.env.CI) {
	test('IPv6 DNS', async t => {
		t.true(isIp.v6(await publicIpv6()));
	});

	test('IPv6 HTTPS', async t => {
		t.true(isIp.v6(await publicIpv6({onlyHttps: true})));
	});
}

test('IPv4 or IPv6', async t => {
	const ip = await publicIp({timeout: 100});
	t.true(isIp.v4(ip) || isIp.v6(ip));
});

test('IPv4 or IPv6 cancellation', async t => {
	const timeout = 5000;
	console.log('start')
	const end = timeSpan();
	const promise = publicIp({timeout});
	console.log(promise)
	promise.cancel();
	await promise;
	t.true(end() < timeout);
});
