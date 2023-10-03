/* eslint-disable @typescript-eslint/no-explicit-any */
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { getGlobalWebSocketServer } from '$lib/server/webSocketUtils';
import type { ExtendedWebSocket } from '$lib/server/webSocketUtils';
import { getGlobalRealtimeServer } from '$lib/server/realtime';
import { getGlobalLogger } from '$lib/server/logger';
import { getGlobalConfig } from '$lib/server/config';
import { getGlobalRedisClient } from '$lib/server/redis';

const serverLog = getGlobalLogger().child({
	scope: 'server',
});

// This can be extracted into a separate file
let wssInitialized = false;
const startupWebsocketServer = () => {
	if (wssInitialized) {
		return;
	}

	serverLog.trace('Setup WSS server');
	const wss = getGlobalWebSocketServer();
	if (wss !== undefined) {
		wss.log.trace('Creating ping logic');
		wss.on('connection', (ws: ExtendedWebSocket) => {
			// This is where you can authenticate the client from the request
			// const session = await getSessionFromCookie(request.headers.cookie || '');
			// if (!session) ws.close(1008, 'User not authenticated');
			// ws.userId = session.userId;
			ws.send(
				JSON.stringify({
					msg: 'Hello',
					instanceId: getGlobalConfig().instanceId,
					wssId: ws.wssId,
					socketId: ws.socketId,
				}),
			);
			ws.log.trace('Sending hello');

			let count = 0;
			const pid = setInterval(() => {
				ws.send(`Ping ${count}, ${ws.socketId}`);
				ws.log.debug({ count }, `ping`);
				count++;
			}, 5000);

			ws.on('error', (error) => {
				ws.log.error({ error }, 'some error detected');
			});

			ws.on('close', () => {
				ws.log.debug(`clearing ping interval`);
				clearInterval(pid);
			});
		});

		wss.on('close', () => {
			wss.clients.forEach((ws: ExtendedWebSocket) => {
				ws.close();
				ws.log.trace('Closing client');
			});
			wss.log.debug('Server closed');
		});
		wssInitialized = true;
	} else {
		serverLog.error('wss not found');
	}
};

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
	const response = await resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-type',
	});
	return response;
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
