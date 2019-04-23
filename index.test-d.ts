import {expectType} from 'tsd';
import publicIp = require('.');

const options: publicIp.Options = {};

expectType<publicIp.CancelablePromise<string>>(publicIp.v4());
expectType<publicIp.CancelablePromise<string>>(publicIp.v4({https: false}));
expectType<publicIp.CancelablePromise<string>>(publicIp.v4({timeout: 10}));
publicIp.v4().cancel();

expectType<publicIp.CancelablePromise<string>>(publicIp.v6());
expectType<publicIp.CancelablePromise<string>>(publicIp.v6({https: false}));
expectType<publicIp.CancelablePromise<string>>(publicIp.v6({timeout: 10}));
publicIp.v6().cancel();
