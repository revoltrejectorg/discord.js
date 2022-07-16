import { MockAgent, setGlobalDispatcher } from 'undici';
import type { Interceptable } from 'undici/types/mock-interceptor';
import { beforeEach, afterEach, test, expect } from 'vitest';
import { genPath } from './util';
import { REST } from '../src';

const api = new REST();

let mockAgent: MockAgent;
let mockPool: Interceptable;

beforeEach(() => {
	mockAgent = new MockAgent();
	mockAgent.disableNetConnect();
	setGlobalDispatcher(mockAgent);

	mockPool = mockAgent.get('http://127.0.0.1:3001');
});

afterEach(async () => {
	await mockAgent.close();
});

test('no token', async () => {
	mockPool
		.intercept({
			path: genPath('/simpleGet'),
			method: 'GET',
		})
		.reply(200, 'Well this is awkward...');

	const promise = api.get('/simpleGet');
	await expect(promise).rejects.toThrowError('Expected token to be set for this request, but none was present');
	await expect(promise).rejects.toBeInstanceOf(Error);
});

test('negative offset', () => {
	const badREST = new REST({ offset: -5000 });

	expect(badREST.requestManager.options.offset).toEqual(0);
});
