import AggregateError from 'aggregate-error'; // Use built-in when targeting Node.js 16

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
				ipv4Promise.cancel();
				return ipv6;
			} catch (ipv4Error) {
				if (!(ipv4Error instanceof IpNotFoundError)) {
					throw ipv4Error;
				}

				try {
					return await ipv4Promise;
				} catch (ipv6Error) {
					throw new AggregateError([ipv4Error, ipv6Error]);
				}
			}
		})()

		promise.cancel = () => {
			// Wait for cancellation methods to be assigned
			setImmediate(() => {
				ipv4Promise.cancel();
				ipv6Promise.cancel();
			})
		};

		return promise;
	};
}
