import redis from 'redis';
import { getConfig } from './config';
import { getLogger } from './logger';

const redisLog = getLogger().child({ scope: 'redis' });

export const GlobalThisRedis = Symbol.for('sveltekit.redis');

export type RedisClient = ReturnType<typeof createRedisClient>;

const createRedisClient = () => {
	const config = getConfig();
	const client = redis.createClient({
		url: config.redisURI,
	});
	return client;
};

let redisClient: ReturnType<typeof createRedisClient>;
export const getGlobalRedisClient = () => {
	if (redisClient) {
		redisClient = createRedisClient();
	}
	return redisClient;
};
