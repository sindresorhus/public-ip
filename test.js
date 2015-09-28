'use strict';
var test = require('ava');
var isIp = require('is-ip');
var publicIp = require('./');

test('Default IPv4', function (t) {
	t.plan(2);

	publicIp(function (err, ip) {
		t.assert(!err, err);
		t.assert(isIp(ip));
		t.end();
	});
});

test('Explicit IPv4', function (t) {
	t.plan(2);

	publicIp.v4(function (err, ip) {
		t.assert(!err, err);
		t.assert(isIp(ip));
		t.end();
	});
});

test('IPv6 param', function (t) {
	t.plan(2);

	publicIp.v6(function (err, ip) {
		t.assert(!err, err);
		t.assert(isIp(ip));
		t.end();
	});
});
