import dnsSocket_ from 'dns-socket';
import stub from './stub.js';

const dnsSocket = stub(dnsSocket_.prototype, 'query', -2);

export default dnsSocket;
