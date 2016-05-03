# public-ip [![Build Status](https://travis-ci.org/sindresorhus/public-ip.svg?branch=master)](https://travis-ci.org/sindresorhus/public-ip)

> Get your public IP address - very fast!

Queries the DNS records of OpenDNS which has an entry with your IP address.


## Install

```
$ npm install --save public-ip
```


## Usage

```js
const publicIp = require('public-ip');

publicIp.v4().then(ip => {
	console.log(ip);
	//=> '46.5.21.123'
});

publicIp.v6().then(ip => {
	console.log(ip);
	//=> 'fe80::200:f8ff:fe21:67cf'
});
```


## API

### publicIp.v4()

Returns a Promise for your public IPv4 address.

### publicIp.v6()

Returns a Promise for your public IPv6 address.


## Related

- [public-ip-cli](https://github.com/sindresorhus/public-ip-cli) - CLI for this module
- [internal-ip](https://github.com/sindresorhus/internal-ip) - Get your internal IP address


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
