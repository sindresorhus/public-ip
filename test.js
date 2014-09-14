'use strict';
var test = require('ava');
var isIp = require('is-ip');
var publicIp = require('./');

test(function (t) {
	publicIp(function (err, ip) {
		t.assert(!err, err);
		t.assert(isIp(ip));
		t.end();
	});
});
