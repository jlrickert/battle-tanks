/* eslint-disable @typescript-eslint/no-explicit-any */
import pino from "pino";
import { type Config, getGlobalConfig } from "./config";
import { createGlobalGroup } from "./globalGroup";

export type Logger = ReturnType<typeof createLogger>;
export type Level = "trace" | "debug" | "warn" | "info" | "error" | "critical";

const createLogger = (config: Config) => {
	const transport = pino.transport({
		target: "pino-mongodb",
		options: {
			uri: config?.mongoURI,
			database: "battle-tanks",
			collection: "logs",
		},
	});
	return pino({ level: config?.logLevel ?? "info" }, transport).child({
		instanceId: config.instanceId,
	});
};

export const getGlobalLogger = createGlobalGroup("sveltekit.logger", () => {
	const config = getGlobalConfig();
	return createLogger(config);
});
