/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Handle, RequestEvent } from "@sveltejs/kit";
import { building } from "$app/environment";
import invariant from "tiny-invariant";
import { nanoid } from "nanoid";
import { getGlobalWebSocketServer } from "$lib/server/websockets/webSocketServer";
import { getGlobalRealtimeServer } from "$lib/server/realtime";
import { getGlobalLogger } from "$lib/server/logger";
import { getGlobalConfig } from "$lib/server/config";
import { getGlobalRedisClient } from "$lib/server/redis";
import { createGlobalGroup } from "$lib/server/globalGroup";
import type { User } from "$lib/sessions";
import { createAnonymousUser } from "$lib/sessions";
import { createMessage, parseMessage } from "$lib/messages";
import { absurd } from "$lib/funcUtils";

const serverState = createGlobalGroup("server state", () => {
	type SessionId = string;
	type UserId = string;
	const sessionMap = new Map<SessionId, UserId>();
	const users = new Map<UserId, User>();

	const updateUser = (userId: string, f: (user: User) => User) => {
		const user = users.get(userId);
		if (!user) {
			return;
		}
		users.set(user.id, f(user));
	};

	return {
		getUsers: () => {
			const rec: { [userId: string]: User } = {};
			for (const [userId, user] of users) {
				rec[userId] = { ...user }; // FIXME: deep clone this
			}
			return rec;
		},
		updateUserBySessionId: (
			sessionId: SessionId,
			f: (user: User) => User,
		): void => {
			const userId = sessionMap.get(sessionId);
			if (!userId) {
				return;
			}
			return updateUser(userId, f);
		},
		updateUser,
		getOrCreateUser: (sessionId: SessionId): User => {
			const userId = sessionMap.get(sessionId);
			if (!userId) {
				const user = createAnonymousUser({
					id: nanoid(),
					name: `Anon-${nanoid(4)}`,
				});
				sessionMap.set(sessionId, user.id);
				users.set(user.id, user);
				return user;
			}
			const user = users.get(userId);
			invariant(
				user,
				"Logic Error: user expected to exit when userId exists",
			);
			return user;
		},
	};
});

const startupWebsocketServer = createGlobalGroup("game logic", () => {
	const { updateUser, getOrCreateUser, getUsers } = serverState();

	const wss = getGlobalWebSocketServer();

	wss.addMiddleware(({ ws }) => {
		ws.onMessage((data) => {
			const message = parseMessage(data);
			switch (message.event) {
				case "profile": {
					const updatedUser = message.data;
					updateUser(updatedUser.id, () => updatedUser);
					wss.broadcast(
						JSON.stringify(message),
						(_ws) => ws.sessionId !== _ws.sessionId,
					);
					return;
				}
				case "fastForward": {
					const user = getOrCreateUser(ws.sessionId);
					ws.send(
						JSON.stringify(
							createMessage({
								id: message.id,
								event: message.event,
								data: {
									response: {
										currentUserId: user.id,
										users: getUsers(),
									},
								},
							}),
						),
					);
					return;
				}
				default: {
					return absurd(message);
				}
			}
		});

		let count = 0;
		const interval = setInterval(() => {
			ws.send(`Ping ${ws.sessionId} ${count}`);
			count++;
		}, 5000);

		ws.onClose(() => {
			clearInterval(interval);
		});
	});

	wss.init();
	return wss;
});

const attachUser = async (event: RequestEvent) => {
	const { getOrCreateUser } = serverState();

	const { cookies } = event;
	let sessionId = cookies.get("session");
	if (!sessionId) {
		sessionId = nanoid();
		cookies.set("session", nanoid());
	}
	event.locals.user = getOrCreateUser(sessionId);
};

export const handle: Handle = async ({ event, resolve }) => {
	startupWebsocketServer();
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

		const wss = getGlobalWebSocketServer();
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
