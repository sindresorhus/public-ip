import test from 'ava';
import isIp from 'is-ip';
import m from './';

test('main', async t => {
	t.true(isIp.v4(await m()));
});

test('IPv4', async t => {
	t.true(isIp.v4(await m.v4()));
});

if (!process.env.CI) {
	test('IPv6', async t => {
		t.true(isIp.v6(await m.v6()));
	});
}
