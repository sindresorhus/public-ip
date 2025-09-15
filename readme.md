# public-ip

> Get your public IP address - very fast!

In Node.js, it queries the DNS records of OpenDNS, Google DNS, and HTTPS services to determine your IP address. In browsers, it uses the [icanhaz](https://github.com/major/icanhaz) and [ipify](https://ipify.org) services through HTTPS.

## Install

```sh
npm install public-ip
```

## Usage

```js
import {publicIp, publicIpv4, publicIpv6} from 'public-ip';

console.log(await publicIp()); // Tries IPv6 first, falls back to IPv4
//=> 'fe80::200:f8ff:fe21:67cf'

console.log(await publicIpv6());
//=> 'fe80::200:f8ff:fe21:67cf'

console.log(await publicIpv4());
//=> '46.5.21.123'
```

## API

### publicIp(options?)

Returns a `Promise<string>` with your public IPv4 or IPv6 address. Tries IPv6 first, then falls back to IPv4. Rejects on error or timeout.

### publicIpv4(options?)

Returns a `Promise<string>` with your public IPv4 address. Rejects on error or timeout.

### publicIpv6(options?)

Returns a `Promise<string>` with your public IPv6 address. Rejects on error or timeout.

#### options

Type: `object`

##### onlyHttps

Type: `boolean`\
Default: `false`

Use a HTTPS check using the [icanhazip.com](https://github.com/major/icanhaz) service instead of the DNS query. [ipify.org](https://ipify.org) is used as a fallback if `icanhazip.com` fails. This check is much more secure and tamper-proof, but also a lot slower. **This option is only available in the Node.js version**. The default behaviour is to check against DNS before using HTTPS fallback. If set to `true`, it will *only* check against HTTPS.

##### fallbackUrls

Type: `string[]`\
Default: `[]`

Add your own custom HTTPS endpoints to get the public IP from. They will only be used if everything else fails. Any service used as fallback *must* return the IP as a plain string.

```js
import {publicIpv6} from 'public-ip';

await publicIpv6({
	fallbackUrls: [
		'https://ifconfig.co/ip'
	]
});
```

##### timeout

Type: `number`\
Default: `5000`

The time in milliseconds until the operation is considered timed out. This applies to the entire operation, not individual requests.

##### signal

Type: [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)

An `AbortSignal` to cancel the operation. If both `timeout` and `signal` are provided, the operation will be aborted when either the timeout is reached or the signal is aborted.

### Error Handling

```js
import {publicIpv4, IpNotFoundError} from 'public-ip';

try {
	const ip = await publicIpv4({timeout: 5000});
	console.log(ip);
} catch (error) {
	if (error instanceof IpNotFoundError) {
		console.log('Could not determine public IP address');
	} else if (error.message.includes('aborted')) {
		console.log('Request was cancelled');
	} else {
		console.log('An error occurred:', error.message);
	}
}
```

### IpNotFoundError

Error thrown when the public IP address could not be found.

## Related

- [public-ip-cli](https://github.com/sindresorhus/public-ip-cli) - CLI for this module
- [internal-ip](https://github.com/sindresorhus/internal-ip) - Get your internal IP address
