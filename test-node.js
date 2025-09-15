import process from 'node:process';
import {test, describe} from 'node:test';
import {strict as assert} from 'node:assert';
import {performance} from 'node:perf_hooks';
import {isIPv6, isIPv4} from 'is-ip';
import {
	publicIp, publicIpv4, publicIpv6,
} from './source/index.js';

// Simple time span utility for timing tests
const timeSpan = () => {
	const start = performance.now();
	return () => performance.now() - start;
};

// Mock global fetch for testing
let originalFetch;
const mockResponses = new Map();
let ignoredUrls = [];

const mockFetch = (url, options) => {
	if (ignoredUrls.some(pattern => pattern.test(url))) {
		return Promise.reject(new Error('Mocked network error'));
	}

	if (mockResponses.has(url)) {
		const mockResponse = mockResponses.get(url);
		return Promise.resolve({
			ok: true,
			text: () => Promise.resolve(mockResponse),
		});
	}

	// Default to real fetch
	return originalFetch(url, options);
};

const withMocks = async callback => {
	originalFetch = globalThis.fetch;
	globalThis.fetch = mockFetch;
	ignoredUrls = [];
	mockResponses.clear();

	try {
		await callback();
	} finally {
		globalThis.fetch = originalFetch;
	}
};

const ignoreFetch = pattern => {
	ignoredUrls.push(pattern);
};

const mockFetchResponse = (url, response) => {
	mockResponses.set(url, response);
};

describe('public-ip', () => {
	test('IPv4 or IPv6', async () => {
		const ip = await publicIp({timeout: 10_000});
		assert.ok(isIPv4(ip) || isIPv6(ip), `Expected valid IP, got: ${ip}`);
	});

	test('IPv4', async () => {
		const ip = await publicIpv4();
		assert.ok(isIPv4(ip), `Expected IPv4, got: ${ip}`);
	});

	test('IPv6', {skip: process.env.CI === 'true'}, async () => {
		try {
			const ip = await publicIpv6({timeout: 10_000});
			assert.ok(isIPv6(ip), `Expected IPv6, got: ${ip}`);
		} catch (error) {
			// Skip test if IPv6 is not available on this network
			if (error.message.includes('Could not get the public IP address')
				|| error.message.includes('timeout')
				|| error.message.includes('aborted')) {
				console.log('  → Skipping: IPv6 not available on this network');
				return;
			}

			throw error;
		}
	});

	test('IPv4 HTTPS only', async () => {
		const ip = await publicIpv4({onlyHttps: true});
		assert.ok(isIPv4(ip), `Expected IPv4, got: ${ip}`);
	});

	test('IPv6 HTTPS only', {skip: process.env.CI === 'true'}, async () => {
		try {
			const ip = await publicIpv6({onlyHttps: true, timeout: 10_000});
			assert.ok(isIPv6(ip), `Expected IPv6, got: ${ip}`);
		} catch (error) {
			// Skip test if IPv6 is not available on this network
			if (error.message.includes('Could not get the public IP address')
				|| error.message.includes('timeout')
				|| error.message.includes('aborted')) {
				console.log('  → Skipping: IPv6 HTTPS only not available on this network');
				return;
			}

			throw error;
		}
	});

	test('timeout applies to overall operation', async () => {
		const timeout = 5; // Extremely short timeout to force failure
		const end = timeSpan();

		await assert.rejects(
			publicIpv4({timeout, onlyHttps: true}),
			error => error.message.includes('Could not get the public IP address')
				|| error.message.includes('Operation timed out')
				|| error.message.includes('operation was aborted')
				|| error.message.includes('This operation was aborted'),
		);

		const elapsed = end();
		assert.ok(elapsed < 200, `Expected quick timeout, got ${elapsed}ms`);
	});

	test('AbortSignal functionality', async () => {
		const controller = new AbortController();
		controller.abort();

		// Should throw when signal is already aborted
		try {
			await publicIpv4({signal: controller.signal});
			assert.fail('Expected an error to be thrown');
		} catch (error) {
			assert.ok(error instanceof Error, 'Should throw an error');
		}
	});

	test('fallback URLs work', async () => {
		await withMocks(async () => {
			// Mock default URLs to fail
			ignoreFetch(/icanhazip\.com/);
			ignoreFetch(/ipify\.org/);

			// Mock fallback URL to succeed
			mockFetchResponse('https://ifconfig.co/ip', '192.168.1.1');

			const ip = await publicIpv4({
				onlyHttps: true,
				fallbackUrls: ['https://ifconfig.co/ip'],
			});

			assert.equal(ip, '192.168.1.1');
		});
	});

	test('handles invalid IP responses', async () => {
		await withMocks(async () => {
			// Mock to return invalid IP
			mockFetchResponse('https://icanhazip.com/', 'invalid-ip-address');
			mockFetchResponse('https://api.ipify.org/', 'also-invalid');

			await assert.rejects(
				publicIpv4({onlyHttps: true}),
				error => error.message.includes('Could not get the public IP address'),
			);
		});
	});

	test('DNS fallback mode works', async () => {
		const ip = await publicIpv4({onlyHttps: false});
		assert.ok(isIPv4(ip), `Expected IPv4, got: ${ip}`);
	});

	test('uses defaults when no options provided', async () => {
		const ip = await publicIpv4();
		assert.ok(isIPv4(ip), `Expected IPv4, got: ${ip}`);
	});
});
