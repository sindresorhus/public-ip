const sinon = require('sinon');
const dnsSocket = require('dns-socket');

let ignoreRegExp;
let ignored = [];
let called = 0;

const original = dnsSocket.prototype.query;

sinon.stub(dnsSocket.prototype, 'query').callsFake(function (...args) {
	called++;
	const host = args.slice(-2, -1)[0];
	if (ignoreRegExp && ignoreRegExp.test(host)) {
		ignored.push(host);
		throw new Error('Ignored by mock');
	}

	return original.bind(this)(...args);
});

exports.ignore = _ignoreRegExp => {
	ignoreRegExp = _ignoreRegExp;
};

exports.ignored = () => ignored;

exports.called = () => called;

exports.restore = () => {
	ignoreRegExp = undefined;
	ignored = [];
	called = 0;
};
