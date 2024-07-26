export class IpNotFoundError extends Error {
	constructor(options) {
		super('Could not get the public IP address', options);
		this.name = 'IpNotFoundError';
	}
}

export function createPublicIp(publicIpv4, publicIpv6) {
	return function publicIp(options) { // eslint-disable-line func-names
		const ipv4Promise = publicIpv4(options);
		const ipv6Promise = publicIpv6(options);

		const promise = (async () => {
			try {
				const ipv6 = await ipv6Promise;

				// eslint-disable-next-line promise/prefer-await-to-then
				ipv4Promise.catch(() => {}); // Don't throw when cancelling

				ipv4Promise.cancel();
				return ipv6;
			} catch (ipv6Error) {
				if (!(ipv6Error instanceof IpNotFoundError)) {
					throw ipv6Error;
				}

				try {
					return await ipv4Promise;
				} catch (ipv4Error) {
					throw new AggregateError([ipv4Error, ipv6Error]); // eslint-disable-line unicorn/error-message
				}
			}
		})();

		promise.cancel = () => {
			ipv4Promise.cancel();
			ipv6Promise.cancel();
		};

		return promise;
	};
}
