import test from 'ava';
import isIp from 'is-ip';
import publicIp from '.';

test('IPv4 DNS', async t => {
	t.true(isIp.v4(await publicIp.v4()));
});

test('IPv4 HTTPS', async t => {
	t.true(isIp.v4(await publicIp.v4({https: true})));
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
