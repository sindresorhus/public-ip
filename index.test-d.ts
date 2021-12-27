import {expectType} from 'tsd';
import publicIp, {CancelablePromise} from './index.js';

expectType<CancelablePromise<string>>(publicIp.v4());
expectType<CancelablePromise<string>>(publicIp.v4({onlyHttps: true}));
expectType<CancelablePromise<string>>(publicIp.v4({timeout: 10}));
expectType<CancelablePromise<string>>(publicIp.v4({fallbackUrls: ['https://ifconfig.io']}));
publicIp.v4().cancel();

expectType<CancelablePromise<string>>(publicIp.v6());
expectType<CancelablePromise<string>>(publicIp.v6({onlyHttps: true}));
expectType<CancelablePromise<string>>(publicIp.v6({timeout: 10}));
expectType<CancelablePromise<string>>(publicIp.v6({fallbackUrls: ['https://ifconfig.io']}));
publicIp.v6().cancel();
