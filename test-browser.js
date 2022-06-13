// Comment out the `is-ip` dependency, launch a local server, and then load the HTMl file.
import {publicIp, publicIpv4} from './browser.js';

console.log('IP:', await publicIpv4());

console.log('IP:', await publicIpv4({
	fallbackUrls: [
		'https://ifconfig.me',
	],
}));

console.log('IP:', await publicIp());
