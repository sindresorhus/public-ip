import {expectType} from 'tsd';
import publicIp = require('.');

const options: publicIp.Options = {};

expectType<publicIp.CancelablePromise<string>>(publicIp.v4());
expectType<publicIp.CancelablePromise<string>>(publicIp.v4({onlyHttps: true}));
expectType<publicIp.CancelablePromise<string>>(publicIp.v4({timeout: 10}));
expectType<publicIp.CancelablePromise<string>>(publicIp.v4({fallbackUrls: ['https://ifconfig.io']}));
publicIp.v4().cancel();

expectType<publicIp.CancelablePromise<string>>(publicIp.v6());
expectType<publicIp.CancelablePromise<string>>(publicIp.v6({onlyHttps: true}));
expectType<publicIp.CancelablePromise<string>>(publicIp.v6({timeout: 10}));
expectType<publicIp.CancelablePromise<string>>(publicIp.v6({fallbackUrls: ['https://ifconfig.io']}));
publicIp.v6().cancel();
