# public-ip [![Build Status](https://travis-ci.org/sindresorhus/public-ip.svg?branch=master)](https://travis-ci.org/sindresorhus/public-ip)

> Get your public IP address - very fast!

Queries the DNS records of OpenDNS which has an entry with your IP address.


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


## API

```
$ npm install --save public-ip
```

```js
var publicIp = require('public-ip');

publicIp.v4(function (err, ip) {
	console.log(ip);
	//=> '46.5.21.123'
});

publicIp.v6(function (err, ip) {
	console.log(ip);
	//=> 'fe80::200:f8ff:fe21:67cf'
});
```


## Related

See [internal-ip](https://github.com/sindresorhus/internal-ip) to get your internal IP address.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
