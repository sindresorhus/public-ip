import process from 'node:process';
import test from 'ava';
import esmock from 'esmock';
import {isIPv6, isIPv4} from 'is-ip';
import timeSpan from 'time-span';
import dnsStub from './mocks/dns-socket.js';
import gotStub from './mocks/got.js';
import {publicIp, publicIpv4, publicIpv6} from './index.js';

test.afterEach.always(() => {
	dnsStub.restore();
	gotStub.restore();
});

test('IPv4 DNS - No HTTPS call', async t => {
	t.true(isIPv4(await publicIpv4()));
	t.true(dnsStub.called() > 0);
	t.is(dnsStub.ignored(), 0);
	t.is(gotStub.called(), 0);
});

test('IPv4 DNS failure falls back to HTTPS', async t => {
	dnsStub.ignore(/.*/);
	const ip = await publicIpv4();
	t.true(isIPv4(ip));
	t.is(dnsStub.ignored(), 8);
	t.true(gotStub.called() > 0);
});

test('IPv4 DNS failure OpenDNS falls back to Google DNS', async t => {
	dnsStub.ignore(/^208\./);
	const ip = await publicIpv4();
	t.true(isIPv4(ip));
	t.is(dnsStub.ignored(), 4);
	t.is(gotStub.called(), 0);
});

test('IPv4 HTTPS - No DNS call', async t => {
	t.true(isIPv4(await publicIpv4({onlyHttps: true})));
	t.is(dnsStub.called(), 0);
});

test('IPv4 HTTPS uses custom URLs', async t => {
	gotStub.ignore(/com|org/);
	t.true(isIPv4(await publicIpv4({
		onlyHttps: true,
		fallbackUrls: [
			'https://ifconfig.co/ip',
			'https://ifconfig.io/ip',
		],
	})));
	t.is(gotStub.ignored(), 2);
	t.is(dnsStub.called(), 0);
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
		t.true(isIPv6(await publicIpv6()));
	});

	test('IPv6 HTTPS', async t => {
		t.true(isIPv6(await publicIpv6({onlyHttps: true})));
	});

	test.failing('IPv4 call cancels after IPv6 call succeeds first', async t => {
		const {publicIp} = await esmock('./index.js', {
			publicIpv4(...arguments_) {
				const promise = publicIpv4(...arguments_);

				const returnValue = new Promise(() => {});
				returnValue.cancel = promise.cancel;

				return returnValue;
			},
		});

		t.true(isIPv6(await publicIp()));
	});
}

test.serial('IPv4 or IPv6', async t => {
	const ip = await publicIp({timeout: 500});
	t.true(isIPv4(ip) || isIPv6(ip));
});

test.serial('IPv4 or IPv6 cancellation', async t => {
	const timeout = 5000;
	const end = timeSpan();
	const promise = publicIp({timeout});
	promise.cancel();
	await promise;
	t.true(end() < timeout);
});

test('timeout applies to overall operation, not individual requests', async t => {
	// Use very small timeout to ensure timeout behavior is tested
	const timeout = 10; // 10ms should definitely timeout
	const end = timeSpan();

	await t.throwsAsync(publicIpv4({timeout, onlyHttps: true}), {
		message: /Could not get the public IP address/,
	});

	const elapsed = end();

	// Should timeout quickly (within reasonable bounds), not take cumulative time
	// This verifies our fix works - before the fix, this would take much longer
	t.true(elapsed < 150, `Expected quick timeout, but took ${elapsed}ms`);
	t.true(elapsed >= timeout * 0.5, `Timeout too fast: ${elapsed}ms (expected ~${timeout}ms)`);
});
