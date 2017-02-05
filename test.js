import test from 'ava';
import isIp from 'is-ip';
import m from './';

test('IPv4 DNS', async t => {
	t.true(isIp.v4(await m.v4()));
});

test('IPv4 HTTPS', async t => {
	t.true(isIp.v4(await m.v4({https: true})));
});

if (!process.env.CI) {
	test('IPv6 DNS', async t => {
		t.true(isIp.v6(await m.v6()));
	});

	test('IPv6 HTTPS', async t => {
		t.true(isIp.v6(await m.v6({https: true})));
	});
}
