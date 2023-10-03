/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from 'zod';
import { getGlobalLogger, type Level } from './logger';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

const GlobalThisConfig = Symbol.for('sveltekit.config');
export const CONFIG_SCOPE = 'config';

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
				['trace', 'debug', 'warn', 'info', 'error', 'fatal'] as const
			).includes(a as any);
		}),
});

const createConfig = () => {
	try {
		const parsedEnv = envSchema.parse(process.env);
		const instanceId = nanoid();
		return {
			url: parsedEnv.BATTLE_TANKS_URL,
			instanceId,
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

export const getGlobalConfig = (): Config => {
	const config = (globalThis as any)[GlobalThisConfig];
	if (config) {
		return config;
	}

	(globalThis as any)[GlobalThisConfig] = createConfig();
	getGlobalLogger().debug(
		{ config: (globalThis as any)[GlobalThisConfig] },
		'Config loaded',
	);
	return (globalThis as any)[GlobalThisConfig];
};
