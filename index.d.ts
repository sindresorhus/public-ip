declare namespace publicIp {
	interface Options {
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

	type CancelablePromise<T> = Promise<T> & {
		cancel(): void;
	};
}

declare const publicIp: {
	/**
	Get your public IP address - very fast!

	In Node.js, it queries the DNS records of OpenDNS which has an entry with your IP address. In browsers, it uses the excellent [icanhaz](https://github.com/major/icanhaz) service through HTTPS.

	@returns Your public IPv4 address. A `.cancel()` method is available on the promise, which can be used to cancel the request.
	@throws On error or timeout.

	@example
	```
	import publicIp = require('public-ip');

	(async () => {
		console.log(await publicIp.v4());
		//=> '46.5.21.123'
	})();
	```
	*/
	v4(options?: publicIp.Options): publicIp.CancelablePromise<string>;

	/**
	Get your public IP address - very fast!

	In Node.js, it queries the DNS records of OpenDNS which has an entry with your IP address. In browsers, it uses the excellent [icanhaz](https://github.com/major/icanhaz) service through HTTPS.

	@returns Your public IPv6 address. A `.cancel()` method is available on the promise, which can be used to cancel the request.
	@throws On error or timeout.

	@example
	```
	import publicIp = require('public-ip');

	(async () => {
		console.log(await publicIp.v6());
		//=> 'fe80::200:f8ff:fe21:67cf'
	})();
	```
	*/
	v6(options?: publicIp.Options): publicIp.CancelablePromise<string>;
};

export = publicIp;
