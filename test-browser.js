// Need to test manually in DevTools
// $ browserify test-browser.js | pbcopy
'use strict';
const publicIp = require('./browser');

(async () => {
	console.log('IP:', await publicIp.v4());
})();
