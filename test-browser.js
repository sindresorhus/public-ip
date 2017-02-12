// Need to test manually in devtools
// $ browserify test-browser.js | pbcopy
'use strict';
const publicIp = require('./browser');

publicIp.v4().then(ip => {
	console.log('ip', ip);
});
