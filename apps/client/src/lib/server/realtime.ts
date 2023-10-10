/* eslint-disable @typescript-eslint/no-explicit-any */
import { getGlobalLogger } from "./logger";
import { getGlobalRedisClient, type RedisClient } from "./redis";
import {
	getGlobalWebSocketServer,
	type WebSocketServer,
} from "./websockets/webSocketServer";
import { nanoid } from "nanoid";
import { createGlobalGroup } from "$lib/server/globalGroup";

export const RTS_SCOPE = "rts";

// class Collection<A = unknown> {
// 	private id = nanoid();
// 	private items: {
// 		[id: string]: ;
// 	} = {};
//
// 	onCreate(f: (data: A) => void) {}
//
// 	onChange(f: (data: A) => void) {}
//
// 	createItem(data: A): Item<A> {}
//
// 	getItem(id: string): Item<A> {
// 		return new Item();
// 	}
// }
//
// class Item<A = unknown> {}
//
// export { type Collection, type Item };

export type RealTimeServer = ReturnType<typeof createRealTimeServer>;
const createRealTimeServer = (
	wss: WebSocketServer,
	redis: RedisClient,
) => {
	const id = `rts-${nanoid()}`;
	const log = getGlobalLogger().child({ scope: RTS_SCOPE });
	let initiated = false;
	return {
		id,
		log,
		wss,
		redis,
		init() {
			if (!initiated) {
				return;
			}
			initiated = true;
		},
	} as const;
};

export const getGlobalRealtimeServer = createGlobalGroup<RealTimeServer>(
	"sveltekit.rts",
	() => {
		const wss = getGlobalWebSocketServer();
		const redis = getGlobalRedisClient();
		return createRealTimeServer(wss, redis);
	},
);
