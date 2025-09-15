import {promisify} from 'node:util';
import dgram from 'node:dgram';
import dns from 'dns-socket';
import {createPublicIp, IpNotFoundError} from './core.js';
import {validateIp} from './utils.js';
import {queryHttps} from './query.js';
import {dnsServers, httpsUrls} from './constants.js';
import {createIpFunction} from './shared.js';

export {IpNotFoundError} from './core.js';

const createDnsQuery = (server, version, {name, type, transform}) => {
	const socket = dns({
		retries: 0,
		maxQueries: 1,
		socket: dgram.createSocket(version === 'v6' ? 'udp6' : 'udp4'),
		timeout: 30_000,
	});

	const socketQuery = promisify(socket.query.bind(socket));

	return (async () => {
		try {
			const dnsResponse = await socketQuery({questions: [{name, type}]}, 53, server);
			const {data} = dnsResponse.answers[0];
			const response = (typeof data === 'string' ? data : data.toString()).trim();
			const ip = transform?.(response) ?? response;

			if (validateIp(ip, version)) {
				return ip;
			}

			throw new Error('Invalid IP');
		} finally {
			socket.destroy();
		}
	})();
};

const queryDns = async version => {
	const queries = dnsServers.flatMap(serverConfig => {
		const {servers, ...question} = serverConfig[version];
		return servers.map(server => createDnsQuery(server, version, question));
	});

	try {
		return await Promise.any(queries);
	} catch (error) {
		const errors = error.errors ?? [];
		const lastError = errors.at?.(-1) ?? error;
		throw new IpNotFoundError({cause: lastError});
	}
};

const queryAll = async (version, options) => {
	try {
		return await queryDns(version);
	} catch {
		return queryHttps(version, httpsUrls[version], options);
	}
};

const nodeQueryFunction = (version, options) => options.onlyHttps
	? queryHttps(version, httpsUrls[version], options)
	: queryAll(version, options);

export const publicIpv4 = createIpFunction('v4', nodeQueryFunction);
export const publicIpv6 = createIpFunction('v6', nodeQueryFunction);

export const publicIp = createPublicIp(publicIpv4, publicIpv6);
