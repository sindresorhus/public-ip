import {publicIp, publicIpv4} from './source/browser.js';

console.log('IP:', await publicIpv4());

console.log('IP:', await publicIpv4({
	fallbackUrls: [
		'https://ifconfig.me',
	],
}));

console.log('IP:', await publicIp());
