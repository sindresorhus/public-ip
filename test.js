import test from 'ava';
import isIp from 'is-ip';
import m from '.';

test('IPv4 DNS', async t => {
	t.true(isIp.v4(await m.v4()));
});

test('IPv4 HTTPS', async t => {
	t.true(isIp.v4(await m.v4({https: true})));
});

test('IPv4 DNS timeout', async t => {
	t.true(isIp.v4(await m.v4({timeout: 2000})));
});

test('IPv4 HTTPS timeout', async t => {
	t.true(isIp.v4(await m.v4({https: true, timeout: 4000})));
});

// Impossible DNS timeouts seems unreliable to test on a working connection
// because of caches, so we're only testing HTTPS

test('IPv4 HTTPS impossible timeout', async t => {
	t.throws(m.v4({https: true, timeout: 1}));
});

if (!process.env.CI) {
	test('IPv6 DNS', async t => {
		t.true(isIp.v6(await m.v6()));
	});

	test('IPv6 HTTPS', async t => {
		t.true(isIp.v6(await m.v6({https: true})));
	});
}
