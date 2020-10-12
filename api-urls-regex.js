// URL and regex which matches the IP in the response.
// These URLs accept both IPv6/IPv4 connectivity
// Response might change for dual IPv6/IPv4 stack network interface
const regexUrls = {
	'https://www.cloudflare.com/cdn-cgi/trace': /ip=(?<ip>.*)/,
	'https://ip-api.io/api/json': /ip"(.*?)"(?<ip>.*?)"/
};

module.exports = regexUrls;
