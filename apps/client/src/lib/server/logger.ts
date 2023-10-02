import pino from 'pino';
import { nanoid } from 'nanoid';

const createLogger = () => {
	const logger = pino({ level: 'trace' }).child({ instanceId: nanoid() });
	return logger;
};

export type Logger = ReturnType<typeof createLogger>;

let rootLogger: Logger;
export const getLogger = () => {
	if (rootLogger) {
		return rootLogger;
	}
	rootLogger = createLogger();
	return rootLogger;
};
