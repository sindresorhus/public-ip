import test from 'ava';
import isIp from 'is-ip';
import {
	restore as restoreDnsMock,
	ignore as ignoreDnsHost,
	ignored as getIgnoredDnsHosts,
	called as getDnsCalledCount
} from './mocks/dns-socket';
import {
	restore as restoreGotMock,
	called as getGotCalledCount,
	ignore as ignoreGotHosts,
	ignored as getIgnoredGotHosts
} from './mocks/got';
import publicIp from '.';

test.afterEach(() => {
	restoreDnsMock();
	restoreGotMock();
});

test('IPv4 DNS - No HTTPS call', async t => {
	t.true(isIp.v4(await publicIp.v4()));
	t.true(getDnsCalledCount() > 0);
	t.true(getIgnoredDnsHosts().length === 0);
	t.true(getGotCalledCount() === 0);
});

test('IPv4 DNS failure fallbacks to HTTPS', async t => {
	ignoreDnsHost(/.*/);
	const ip = await publicIp.v4();
	t.true(isIp.v4(ip));
	t.true(getIgnoredDnsHosts().length === 8);
	t.true(getGotCalledCount() > 0);
});

test('IPv4 DNS failure opendns fallbacks to google dns', async t => {
	ignoreDnsHost(/opendns/);
	const ip = await publicIp.v4();
	t.true(isIp.v4(ip));
	t.true(getIgnoredDnsHosts().length === 4);
	t.true(getGotCalledCount() === 0);
});

test('IPv4 HTTPS - No DNS call', async t => {
	t.true(isIp.v4(await publicIp.v4({https: true})));
	t.true(getDnsCalledCount() === 0);
});

test('IPv4 HTTPS Disabled - Should only call DNS', async t => {
	ignoreDnsHost(/.*/);
	await t.throwsAsync(publicIp.v4({https: false}));
	t.true(getDnsCalledCount() > 0);
	t.true(getGotCalledCount() === 0);
});

test('IPv4 HTTPS Uses custom urls', async t => {
	ignoreGotHosts(/com|org/);
	t.true(isIp.v4(await publicIp.v4({https: true, urls: [
		'https://ifconfig.co/ip',
		'https://ifconfig.io/ip'
	]})));
	t.true(getIgnoredGotHosts().length === 2);
	t.true(getDnsCalledCount() === 0);
});

test('IPv4 DNS timeout', async t => {
	t.true(isIp.v4(await publicIp.v4({timeout: 2000})));
});

test('IPv4 HTTPS timeout', async t => {
	t.true(isIp.v4(await publicIp.v4({https: true, timeout: 4000})));
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
	const promise = publicIp.v4({timeout, https: true});
	promise.cancel();
	await promise;
	const difference = process.hrtime(start);
	const milliseconds = ((difference[0] * 1e9) + difference[1]) / 1e6;
	t.true(milliseconds < timeout);
});

// Impossible DNS timeouts seems unreliable to test on a working connection
// because of caches, so we're only testing HTTPS

test('IPv4 HTTPS impossible timeout', async t => {
	await t.throwsAsync(publicIp.v4({https: true, timeout: 1}));
});

if (!process.env.CI) {
	test('IPv6 DNS', async t => {
		t.true(isIp.v6(await publicIp.v6()));
	});

	test('IPv6 HTTPS', async t => {
		t.true(isIp.v6(await publicIp.v6({https: true})));
	});
}
