/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Handle, RequestEvent } from "@sveltejs/kit";
import { building } from "$app/environment";
import { nanoid } from "nanoid";
import { getGlobalWebSocketServer } from "$lib/server/websockets/webSocketServer";
import { getGlobalRealtimeServer } from "$lib/server/realtime";
import { getGlobalLogger } from "$lib/server/logger";
import { getGlobalConfig } from "$lib/server/config";
import { getGlobalRedisClient } from "$lib/server/redis";
import { createGlobalGroup } from "$lib/server/globalGroup";
import { messageM } from "$lib";
import type { WebSocket } from "$lib/server/websockets";
import { absurd, pipe } from "fp-ts/function";
import { option } from "fp-ts";
import type { Message } from "$lib/message";
import { getGlobalStorage } from "$lib/server/storage/storage";
import { userM } from "$lib/models/user";
import { sessionM } from "$lib/models/session";

const handleMessage = async (args: {
	ws: WebSocket<Message>;
	message: Message;
}) => {
	const { ws, message } = args;
	const redis = getGlobalRedisClient();
	const storage = await getGlobalStorage();
	switch (message.event) {
		case "fastForward": {
			const state = await redis.get({ gameId: message.request.roomId });
			const profile = pipe(message, messageM.respond());
			ws.send(messageM.respond());
			return;
		}
		case "updateProfile": {
			return;
		}
		default: {
			return absurd(message);
		}
	}
};

const startupWebsocketServer = createGlobalGroup("game logic", async () => {
	console.log({ message: "hooks", stringer: messageM.Stringer });
	const wss = getGlobalWebSocketServer(messageM.Stringer);
	wss.addMiddleware(({ ws }) => {
		ws.onMessage(async (message) => {
			await handleMessage({ ws, message });
			// const message = parseMessage(data);
			// switch (message.event) {
			// 	case "profile": {
			// 		const updatedUser = message.data;
			// 		wss.broadcast(
			// 			data,
			// 			(_ws) => ws.sessionId !== _ws.sessionId,
			// 		);
			// 		await storage.user.update(
			// 			updatedUser.id,
			// 			() => updatedUser,
			// 		)();
			// 		return;
			// 	}
			// 	case "fastForward": {
			// 		const user = storageM.getUserBySession(ws.sessionId);
			// 		messageM.ws.send(
			// 			JSON.stringify(
			// 				createMessage({
			// 					id: message.id,
			// 					event: message.event,
			// 					data: {
			// 						response: {
			// 							currentUserId: user.id,
			// 							users: getUsers(),
			// 						},
			// 					},
			// 				}),
			// 			),
			// 		);
			// 		return;
			// 	}
			// 	default: {
			// 		return absurd(message);
			// 	}
		});

		// let count = 0;
		// const interval = setInterval(() => {
		// 	ws.send(`Ping ${ws.sessionId} ${count}`);
		// 	count++;
		// }, 5000);
		//
		// ws.onClose(() => {
		// 	clearInterval(interval);
		// });
	});

	wss.init();
	return wss;
});

const attachUser = async (event: RequestEvent) => {
	const storage = await getGlobalStorage();

	const { cookies } = event;
	const sessionId = option.fromNullable(cookies.get("session"));
	const session = option.isSome(sessionId)
		? await storage.lookupSession(sessionId.value)
		: option.none;
	const user = option.isSome(session)
		? await storage.lookupUser(session.value.userId)
		: option.none;
	const maxAge = 60 * 60 * 24 * 30;

	if (option.isSome(user)) {
		event.locals.user = user.value;
		return;
	}

	if (option.isSome(session)) {
		await storage.deleteSession(session.value.id);
	}

	const now = Date.now();
	const newUser = userM.anonymousUser({
		id: nanoid(),
		createdAt: now,
		updatedAt: now,
		nickname: `Anon ${nanoid(4)}`,
	});
	const newSession = sessionM.make({
		userId: newUser.id,
		id: nanoid(),
		expiresAt: now + maxAge,
	});
	await storage.createUser(newUser);
	await storage.createSession(newSession);
	cookies.set("session", newSession.id, {
		path: "/",
		httpOnly: true,
		sameSite: "strict",
		secure: true,
		maxAge,
	});
	event.locals.user = newUser;
};

export const handle: Handle = async ({ event, resolve }) => {
	console.log("HERE");
	await startupWebsocketServer();
	await attachUser(event);

	// Skip WebSocket server when pre-rendering pages
	if (!building) {
		const logger = getGlobalLogger();
		if (logger !== undefined) {
			event.locals.logger = logger;
		}

		const config = getGlobalConfig();
		if (config !== undefined) {
			event.locals.config = config;
		}

		const wss = getGlobalWebSocketServer(messageM.Stringer);
		if (wss !== undefined) {
			event.locals.wss = wss;
		}

		const rts = getGlobalRealtimeServer();
		if (rts !== undefined) {
			event.locals.rts = rts;
		}

		const redis = getGlobalRedisClient();
		if (redis !== undefined) {
			event.locals.redis = redis;
		}
		// const db = getGlobalDatabase();
		// if (db !== undefined) {
		// 	event.locals.db = db;
		// }
	}
	return resolve(event, {
		filterSerializedResponseHeaders: (name) => name === "content-type",
	});
};

// function shutdownGracefully() {
// 	// anything you need to clean up manually goes in here
// 	serverLog.debug('Graceful shutdown');
// 	// const wss = getGlobalWebSocketServer();
// 	// if (wss) {
// 	// 	wss.log.trace('Shutting down web socket server');
// 	// 	wss.close();
// 	// } else {
// 	// 	console.error('Not server found');
// 	// }
// }

// process.on('SIGINT', shutdownGracefully);
// process.on('SIGTERM', shutdownGracefully);
