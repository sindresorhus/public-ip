import test from 'ava';
import isIp from 'is-ip';
import fn from './';

test('main', t => {
	fn(function (err, ip) {
		t.ifError(err);
		t.true(isIp.v4(ip));
		t.end();
	});
});

test('IPv4', t => {
	fn.v4((err, ip) => {
		t.ifError(err);
		t.true(isIp.v4(ip));
		t.end();
	});
});

test('IPv6', t => {
	fn.v6((err, ip) => {
		t.ifError(err);
		t.true(isIp.v6(ip));
		t.end();
	});
});
