/* eslint-disable @typescript-eslint/no-explicit-any */
import redis from 'redis';
import { getGlobalConfig } from './config';
import { getGlobalLogger, type Logger } from './logger';

export const GlobalThisRedis = Symbol.for('sveltekit.redis');
export const REDIS_SCOPE = 'redis';

type Client = ReturnType<typeof createRedisClient>;

const createRedisClient = () => {
	const config = getGlobalConfig();
	const client = redis.createClient({
		url: config.redisURI,
	});
	return client;
};

export class RedisClient {
	private log: Logger;
	constructor(private redis: Client) {
		this.log = getGlobalLogger().child({ scope: REDIS_SCOPE });
	}
}

export const getGlobalRedisClient = (): RedisClient => {
	const client = (globalThis as any)[GlobalThisRedis];
	if (client) {
		return client;
	}

	const redisClient = createRedisClient();
	(globalThis as any)[GlobalThisRedis] = new RedisClient(redisClient);
	return (globalThis as any)[GlobalThisRedis];
};
