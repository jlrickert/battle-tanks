// import { env } from '$env/dynamic/private';
import { z } from 'zod';
import type { Level } from './logger';
import { env } from '$env/dynamic/private';

const envSchema = z.object({
	BATTLE_TANKS_URL: z.string().url(),
	BATTLE_TANKS_REDIS: z.string().url(),
	BATTLE_TANKS_LOG_LEVEL: z
		.string()
		.transform((a) => a.toLowerCase())
		.refine((a): a is Level => {
			return (
				(['trace', 'debug', 'warn', 'info', 'error', 'fatal'] as const)
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					.includes(a as any)
			);
		}),
});

const createConfig = () => {
	try {
		const parsedEnv = envSchema.parse(env);
		console.log({ parsedEnv });
		return {
			url: parsedEnv.BATTLE_TANKS_URL,
			redisUrl: parsedEnv.BATTLE_TANKS_REDIS,
			logLevel: parsedEnv.BATTLE_TANKS_LOG_LEVEL,
		};
	} catch (e) {
		console.error(`Unable to load config: ${JSON.stringify(e)}`);
	}
};
export type Config = ReturnType<typeof createConfig>;

let config: Config;
export const getConfig = () => {
	if (config) {
		return config;
	}
	const parsedEnv = envSchema.parse(process.env);
	config = {
		url: parsedEnv.BATTLE_TANKS_URL,
		redisUrl: parsedEnv.BATTLE_TANKS_REDIS,
		logLevel: parsedEnv.BATTLE_TANKS_LOG_LEVEL,
	};
	return config;
};
