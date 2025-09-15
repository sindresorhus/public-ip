export class IpNotFoundError extends Error {
	constructor(options) {
		super('Could not get the public IP address', options);
		this.name = 'IpNotFoundError';
	}
}

export const createPublicIp = (publicIpv4, publicIpv6) => async options => {
	try {
		return await publicIpv6(options);
	} catch (ipv6Error) {
		// Always try IPv4 as fallback regardless of the IPv6 error type
		try {
			return await publicIpv4(options);
		} catch (ipv4Error) {
			throw new AggregateError([ipv4Error, ipv6Error]); // eslint-disable-line unicorn/error-message
		}
	}
};
