import { z } from 'zod';
import { getLogger, type Level } from './logger';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

dotenv.config();

const envSchema = z.object({
	BATTLE_TANKS_URL: z.string().url(),
	BATTLE_TANKS_REDIS: z.string().url(),
	BATTLE_TANKS_MONGO_URI: z.string().url(),
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
		const parsedEnv = envSchema.parse(process.env);
		return {
			url: parsedEnv.BATTLE_TANKS_URL,
			instanceId: nanoid(),
			mongoURI: parsedEnv.BATTLE_TANKS_MONGO_URI,
			redisURI: parsedEnv.BATTLE_TANKS_REDIS,
			logLevel: parsedEnv.BATTLE_TANKS_LOG_LEVEL,
		};
	} catch (e) {
		console.error(`Unable to load config: ${JSON.stringify(e)}`);
		throw e;
	}
};
export type Config = ReturnType<typeof createConfig>;

let config: Config;
export const getConfig = () => {
	if (config) {
		return config;
	}
	config = createConfig();
	getLogger().child({ scope: 'config' }).debug({ config }, 'config loaded');
	console.log('WHAT');
	return config;
};
