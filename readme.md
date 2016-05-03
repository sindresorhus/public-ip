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

### publicIp()

Returns a Promise for your public IPv4 address.

### publicIp.v4()

Returns a Promise for your public IPv4 address.

### publicIp.v6()

Returns a Promise for your public IPv6 addres.


## CLI

```
$ npm install --global public-ip
```

```
$ public-ip --help

  Usage
    $ public-ip

  Options
    -4, --ipv4  Return the IPv4 address (default)
    -6, --ipv6  Return the IPv6 address

  Examples
    $ public-ip
    46.5.21.123
```

```
$ time public-ip
46.5.21.123

real    0.08s
user    0.05s
sys     0.02s
```


## Related

- [internal-ip](https://github.com/sindresorhus/internal-ip) - Get your internal IPv4 or IPv6 address


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
