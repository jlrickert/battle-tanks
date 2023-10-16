// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { WebSocketServer } from "$lib/server/websockets/webSocketServer";
import type { RealTimeServer } from "$lib/server/realtime";
import type { RedisClient } from "$lib/server/redis";
import type { Config } from "$lib/server/config";
import type { Logger } from "$lib/server/logger";
import type { User } from "$lib/sessions";
import type {Database} from "$lib/server/db";

declare global {
	namespace App {
		interface Error {
			errorId: string;
		}

		interface Locals {
			wss?: WebSocketServer;
			rts?: RealTimeServer;
			redis?: RedisClient;
			config?: Config;
			logger?: Logger;
			db?: Database;
			user: User;
		}

		// interface PageData {}
		// interface Platform {}
	}
}

export {};
