import test from 'ava';
import isIp from 'is-ip';
import m from './';

test('IPv4', async t => {
	t.true(isIp.v4(await m.v4()));
});

if (!process.env.CI) {
	test('IPv6', async t => {
		t.true(isIp.v6(await m.v6()));
	});
}
