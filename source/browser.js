import {createPublicIp} from './core.js';
import {queryHttps} from './query-browser.js';
import {browserUrls} from './constants.js';
import {createIpFunction} from './shared-browser.js';

export {IpNotFoundError} from './core.js';

const browserQueryFunction = (version, options) => queryHttps(version, browserUrls[version], options);

export const publicIpv4 = createIpFunction('v4', browserQueryFunction);
export const publicIpv6 = createIpFunction('v6', browserQueryFunction);

export const publicIp = createPublicIp(publicIpv4, publicIpv6);
