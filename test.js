import test from 'ava';
import isIp from 'is-ip';
import fn from './';

test.cb('main', t => {
	fn((err, ip) => {
		t.ifError(err);
		t.true(isIp.v4(ip));
		t.end();
	});
});

test.cb('IPv4', t => {
	fn.v4((err, ip) => {
		t.ifError(err);
		t.true(isIp.v4(ip));
		t.end();
	});
});

if (!process.env.CI) {
	test.cb('IPv6', t => {
		fn.v6((err, ip) => {
			t.ifError(err);
			t.true(isIp.v6(ip));
			t.end();
		});
	});
}
