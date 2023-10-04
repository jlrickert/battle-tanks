/* eslint-disable @typescript-eslint/no-explicit-any */
import { building } from "$app/environment";
import type { Handle } from "@sveltejs/kit";
import { getGlobalWebSocketServer } from "$lib/server/webSocketUtils";
import { getGlobalRealtimeServer } from "$lib/server/realtime";
import { getGlobalLogger } from "$lib/server/logger";
import { getGlobalConfig } from "$lib/server/config";
import { getGlobalRedisClient } from "$lib/server/redis";
import { createGlobalGroup } from "$lib/server/globalGroup";

const startupWebsocketServer = createGlobalGroup("game logic", () => {
	const wss = getGlobalWebSocketServer();
	wss.addMiddleware(({ ws, req }, next) => {
		ws.userId = req.headers?.cookie;
		next();
	});

	wss.onConnect((ws) => {
		ws.send("Hello from sveltekit");

		ws.on("message", (data, isBinary) => {
			console.log({ msg: "Data received", data, isBinary });
		});

		let count = 0;
		const interval = setInterval(() => {
			ws.send(`Ping ${ws.id} ${count}`);
			count++;
		}, 5000);

		ws.on("close", () => {
			clearInterval(interval);
		});
	});

	wss.init();

	return () => {};
});

export const handle: Handle = async ({ event, resolve }) => {
	startupWebsocketServer();
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
