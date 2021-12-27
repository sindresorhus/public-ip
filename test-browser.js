// Comment out the `is-ip` dependency, launch a local server, and then load the HTMl file.
import publicIp from './browser.js';

console.log('IP:', await publicIp.v4());
console.log('IP:', await publicIp.v4({
	fallbackUrls: [
		'https://ifconfig.me',
	],
}));
