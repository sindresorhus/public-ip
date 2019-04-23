export interface Options {
	/**
	Use a HTTPS check using the [icanhazip.com](https://github.com/major/icanhaz) service instead of the DNS query. This check is much more secure and tamper-proof, but also a lot slower. **This option is only available in the Node.js version**.

	@default false
	*/
	readonly https?: boolean;

	/**
	The time in milliseconds until a request is considered timed out.

	@default 5000
	*/
	readonly timeout?: number;
}

export type CancelablePromise<T> = Promise<T> & {
	cancel(): void;
};

/**
Get your public IP address - very fast!

In Node.js, it queries the DNS records of OpenDNS which has an entry with your IP address. In browsers, it uses the excellent [icanhaz](https://github.com/major/icanhaz) service through HTTPS.

@returns Your public IPv4 address. Throws on error or timeout. A `.cancel()` method is available on the promise, which can be used to cancel the request.

@example
```
import publicIp = require('public-ip');

(async () => {
	console.log(await publicIp.v4());
	//=> '46.5.21.123'
})();
```
*/
export function v4(options?: Options): CancelablePromise<string>;

/**
Get your public IP address - very fast!

In Node.js, it queries the DNS records of OpenDNS which has an entry with your IP address. In browsers, it uses the excellent [icanhaz](https://github.com/major/icanhaz) service through HTTPS.

@returns Your public IPv6 address. Throws on error or timeout. A `.cancel()` method is available on the promise, which can be used to cancel the request.

@example
```
import publicIp = require('public-ip');

(async () => {
	console.log(await publicIp.v6());
	//=> 'fe80::200:f8ff:fe21:67cf'
})();
```
*/
export function v6(options?: Options): CancelablePromise<string>;
