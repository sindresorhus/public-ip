import {createQuery} from './query.js';
import {defaults} from './constants.js';

export const createIpFunction = (version, queryFunction) => (options = {}) => {
	const mergedOptions = {
		...defaults,
		...options,
	};

	return createQuery(version, () => queryFunction(version, mergedOptions), mergedOptions);
};
