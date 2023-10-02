// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { ExtendedWebSocketServer } from '$lib/server/webSocketUtils';
import type { RealTimeServer } from '$lib/server/realtime';
import type { RedisClient } from '$lib/server/redis';
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			wss?: ExtendedWebSocketServer;
			rts: RealTimeServer;
			redis: RedisClient;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
