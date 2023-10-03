/* eslint-disable @typescript-eslint/no-explicit-any */
import pino from 'pino';
import { getGlobalConfig } from './config';

const GlobalThisLogger = Symbol.for('sveltekit.logger');

export type Logger = ReturnType<typeof createLogger>;
export type Level = 'trace' | 'debug' | 'warn' | 'info' | 'error' | 'critical';

const createLogger = () => {
	const config = getGlobalConfig();
	const transport = pino.transport({
		target: 'pino-mongodb',
		options: {
			uri: config?.mongoURI,
			database: 'battle-tanks',
			collection: 'logs',
		},
	});
	const logger = pino({ level: config?.logLevel ?? 'info' }, transport).child(
		{
			context: {
				instanceId: config.instanceId,
			},
		},
	);

	return logger;
};

export const getGlobalLogger = (): Logger => {
	const logger = (globalThis as any)[GlobalThisLogger];
	if (logger) {
		return logger;
	}

	(globalThis as any)[GlobalThisLogger] = createLogger();
	return (globalThis as any)[GlobalThisLogger];
};
