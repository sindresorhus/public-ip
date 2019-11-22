'use strict';
const stub = require('./stub');

module.exports = stub(require('dns-socket').prototype, 'query', -2);
