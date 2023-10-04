/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from "zod";
import type { Level } from "./logger";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import { createGlobalGroup } from "./globalGroup";

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
				["trace", "debug", "warn", "info", "error", "fatal"] as const
			).includes(a as any);
		}),
});

const createConfig = () => {
	try {
		const parsedEnv = envSchema.parse(process.env);
		const instanceId = `config-${nanoid()}`;
		return {
			instanceId,
			url: parsedEnv.BATTLE_TANKS_URL,
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

export const getGlobalConfig = createGlobalGroup<Config>(
	"sveltekit.config",
	() => {
		return createConfig();
	},
);
