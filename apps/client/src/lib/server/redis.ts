/* eslint-disable @typescript-eslint/no-explicit-any */
import redis from "redis";
import { createGlobalGroup } from "$lib/server/globalGroup";
import { getGlobalLogger } from "$lib/server/logger";
import { type Config, getGlobalConfig } from "./config";

const REDIS_SCOPE = "redis";

const createBaseRedisClient = (config: Config) => {
	return redis.createClient({
		url: config.redisURI,
	});
};

export type RedisClient = ReturnType<typeof createRedisClient>;

export const createRedisClient = (config: Config) => {
	const client = createBaseRedisClient(config);
	const log = getGlobalLogger().child({ scope: REDIS_SCOPE });
	return client;
};

export const getGlobalRedisClient = createGlobalGroup<RedisClient>(
	"sveltekit.redis",
	() => {
		const config = getGlobalConfig();
		return createRedisClient(config);
	},
);
