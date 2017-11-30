# public-ip [![Build Status](https://travis-ci.org/sindresorhus/public-ip.svg?branch=master)](https://travis-ci.org/sindresorhus/public-ip)

> Get your public IP address - very fast!

In Node.js, it queries the DNS records of OpenDNS which has an entry with your IP address.

In browsers, it uses the excellent [icanhaz](https://github.com/major/icanhaz) service through HTTPS.

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

### publicIp.v4([options])
### publicIp.v6([options])

Returns a `Promise` which resolves to your public IPv4 or IPv6 address. Will reject on error or timeout. A `.cancel()` method is available on the promise, which can be used to cancel the request.

#### options

Type: `Object`

##### https

Type: `boolean`<br>
Default: `false`

Use a HTTPS check using the [icanhazip.com](https://github.com/major/icanhaz) service instead of the DNS query. This check is much more secure and tamper-proof, but also a lot slower. **This option is only available in the Node.js version**.

##### timeout

Type: `number`<br>
Default: `5000`

The time in milliseconds until a request is considered timed out.


## Maintainers

- [silverwind](https://github.com/silverwind)


## Related

- [public-ip-cli](https://github.com/sindresorhus/public-ip-cli) - CLI for this module
- [internal-ip](https://github.com/sindresorhus/internal-ip) - Get your internal IP address


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
