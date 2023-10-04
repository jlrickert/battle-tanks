// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { ExtendedWebSocketServer } from "$lib/server/webSocketUtils";
import type { RealTimeServer } from "$lib/server/realtime";
import type { RedisClient } from "$lib/server/redis";
import type { Config } from "$lib/server/config";
import type { Logger } from "$lib/server/logger";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			wss?: ExtendedWebSocketServer;
			rts?: RealTimeServer;
			redis?: RedisClient;
			config?: Config;
			logger?: Logger;
		}

		// interface PageData {}
		// interface Platform {}
	}
}

export {};
