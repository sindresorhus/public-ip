import got_ from 'got';
import stub from './stub.js';

const got = stub(got_, 'get', 0);

export default got;
