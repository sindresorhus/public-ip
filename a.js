import publicIp from './index.js';
import timeSpan from 'time-span';

const timeout = 5000;
const end = timeSpan();
const promise = publicIp({timeout});
promise.cancel();
await promise;
console.log(end() < timeout);
