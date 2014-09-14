# public-ip [![Build Status](https://travis-ci.org/sindresorhus/public-ip.svg?branch=master)](https://travis-ci.org/sindresorhus/public-ip)

> Get your public IP address - very fast!

Queries the DNS records of OpenDNS which has an entry with your IP address.


## CLI

```sh
$ npm install --global public-ip
```

```
$ public-ip --help

  Example
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

```sh
$ npm install --save public-ip
```

```js

var publicIp = require('public-ip');

publicIp(function (err, ip) {
	console.log(ip);
	//=> 46.5.21.123
});
```


## Related

See [internal-ip](https://github.com/sindresorhus/internal-ip) to get your internal IP address.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
