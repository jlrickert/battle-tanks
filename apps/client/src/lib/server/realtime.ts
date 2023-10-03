/* eslint-disable @typescript-eslint/no-explicit-any */
import { getGlobalLogger, type Logger } from './logger';
import { getGlobalRedisClient, type RedisClient } from './redis';
import {
	getGlobalWebSocketServer,
	type ExtendedWebSocketServer,
} from './webSocketUtils';

const GlobalThisRTS = Symbol.for('sveltekit.rts');
export const RTS_SCOPE = 'rts';

export class RealTimeServer {
	private log: Logger;
	constructor(
		private wss: ExtendedWebSocketServer,
		private redis: RedisClient,
	) {
		this.log = getGlobalLogger().child({ scope: RTS_SCOPE });
	}
	reset() {
		this.log.trace('calling reset');
	}
}

export const getGlobalRealtimeServer = (): RealTimeServer => {
	const rts = (globalThis as any)[GlobalThisRTS];
	if (rts) {
		return rts;
	}

	const wss = getGlobalWebSocketServer();
	const redis = getGlobalRedisClient();
	(globalThis as any)[GlobalThisRTS] = new RealTimeServer(wss, redis);
	return (globalThis as any)[GlobalThisRTS];
};
