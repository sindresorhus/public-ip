// Simple IP validation for browsers without external dependencies
export const validateIp = (ip, version) => {
	if (!ip || typeof ip !== 'string') {
		return false;
	}

	if (version === 'v6') {
		// Simple IPv6 validation - check for colons and hex characters
		return /^[\da-f:]+$/i.test(ip) && ip.includes(':');
	}

	// Simple IPv4 validation - check for dots and numbers
	const parts = ip.split('.');
	return parts.length === 4 && parts.every(part => {
		const number = Number(part);
		return !Number.isNaN(number) && number >= 0 && number <= 255;
	});
};

export const createAbortSignal = (timeout, signal) => {
	if (signal) {
		signal.throwIfAborted();
	}

	if (!timeout && !signal) {
		return undefined;
	}

	const signals = [];
	if (timeout) {
		signals.push(AbortSignal.timeout(timeout));
	}

	if (signal) {
		signals.push(signal);
	}

	return signals.length === 1 ? signals[0] : AbortSignal.any(signals);
};

export const withAbortSignal = async (promise, abortSignal) => {
	if (!abortSignal) {
		return promise;
	}

	abortSignal.throwIfAborted();

	const abortPromise = new Promise((_resolve, reject) => {
		abortSignal.addEventListener('abort', () => reject(abortSignal.reason), {once: true});
	});

	return Promise.race([promise, abortPromise]);
};
