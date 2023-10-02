import type { GlobalThisRTS, RealTimeServer } from './realtime';
import type { GlobalThisRedis, RedisClient } from './redis';
import type { ExtendedWebSocketServer, GlobalThisWSS } from './webSocketUtils';

export type ExtendedGlobal = typeof globalThis & {
	[GlobalThisWSS]: ExtendedWebSocketServer;
	[GlobalThisRTS]: RealTimeServer;
	[GlobalThisRedis]: RedisClient;
};

export const getGlobalThis = () => {
	return globalThis as ExtendedGlobal;
};

export const setGlobalThis = <K extends keyof ExtendedGlobal>(
	key: K,
	value: ExtendedGlobal[K],
) => {
	(globalThis as ExtendedGlobal)[key] = value;
};
