import pino from 'pino';
import { getConfig, type Config } from './config';

export type Logger = ReturnType<typeof createLogger>;
export type Level = 'trace' | 'debug' | 'warn' | 'info' | 'error' | 'critical';

const createLogger = (config: Config) => {
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
			instanceId: config.instanceId,
		},
	);
	return logger;
};

let rootLogger: Logger;
export const getLogger = () => {
	if (rootLogger) {
		return rootLogger;
	}

	const config = getConfig();
	rootLogger = createLogger(config);
	return rootLogger;
};
