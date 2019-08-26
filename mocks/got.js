const sinon = require('sinon');
const got = require('got');

let ignoreRegExp;
let ignored = [];
let called = 0;

const original = got.get;

sinon.stub(got, 'get').callsFake((url, options) => {
	called++;
	if (ignoreRegExp && ignoreRegExp.test(url)) {
		ignored.push(url);
		throw new Error('Ignored by mock');
	}

	return original(url, options);
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
