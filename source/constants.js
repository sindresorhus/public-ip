export const defaults = {
	timeout: 5000,
	onlyHttps: false,
};

export const httpsUrls = {
	v4: [
		'https://icanhazip.com/',
		'https://api.ipify.org/',
	],
	v6: [
		'https://icanhazip.com/',
		'https://api6.ipify.org/',
	],
};

// Browser-specific URLs (IPv4/IPv6 specific endpoints)
export const browserUrls = {
	v4: [
		'https://ipv4.icanhazip.com/',
		'https://api.ipify.org/',
	],
	v6: [
		'https://ipv6.icanhazip.com/',
		'https://api6.ipify.org/',
	],
};

export const dnsServers = [
	{
		v4: {
			servers: [
				'208.67.222.222',
				'208.67.220.220',
				'208.67.222.220',
				'208.67.220.222',
			],
			name: 'myip.opendns.com',
			type: 'A',
		},
		v6: {
			servers: [
				'2620:0:ccc::2',
				'2620:0:ccd::2',
			],
			name: 'myip.opendns.com',
			type: 'AAAA',
		},
	},
	{
		v4: {
			servers: [
				'216.239.32.10',
				'216.239.34.10',
				'216.239.36.10',
				'216.239.38.10',
			],
			name: 'o-o.myaddr.l.google.com',
			type: 'TXT',
			transform: ip => ip.replaceAll('"', ''),
		},
		v6: {
			servers: [
				'2001:4860:4802:32::a',
				'2001:4860:4802:34::a',
				'2001:4860:4802:36::a',
				'2001:4860:4802:38::a',
			],
			name: 'o-o.myaddr.l.google.com',
			type: 'TXT',
			transform: ip => ip.replaceAll('"', ''),
		},
	},
];
