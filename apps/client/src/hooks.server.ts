import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import {
	GlobalThisWSS,
	getGlobalWSSInstance,
	wssLog,
} from '$lib/server/webSocketUtils';
import type { ExtendedWebSocket } from '$lib/server/webSocketUtils';
import { getGlobalThis } from '$lib/server/globals';
import { GlobalThisRTS } from '$lib/server/realtime';
import { GlobalThisRedis } from '$lib/server/redis';

// This can be extracted into a separate file
let wssInitialized = false;
const startupWebsocketServer = () => {
	if (wssInitialized) return;
	wssLog.trace('Setup server');
	const wss = getGlobalWSSInstance();
	if (wss !== undefined) {
		wss.on('connection', (ws: ExtendedWebSocket) => {
			const log = wssLog.child({ socketId: ws.socketId });
			log.debug(`client connected`);
			// This is where you can authenticate the client from the request
			// const session = await getSessionFromCookie(request.headers.cookie || '');
			// if (!session) ws.close(1008, 'User not authenticated');
			// ws.userId = session.userId;
			ws.send(
				`Hello from SvelteKit ${new Date().toLocaleString()} (${
					ws.socketId
				})]`,
			);

			const pid = setInterval(() => {
				ws.send(`Ping, ${ws.socketId}`);
				log.debug(`ping`);
			}, 5000);

			ws.on('error', (error) => {
				log.error({ error }, 'some error detected');
			});

			ws.on('close', () => {
				log.debug(`client disconnected`);
				clearInterval(pid);
			});
		});
		wss.on('close', () => {
			wssLog.debug('Server closed');
		});
		wssInitialized = true;
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	startupWebsocketServer();
	// Skip WebSocket server when pre-rendering pages
	if (!building) {
		const wss = getGlobalThis()[GlobalThisWSS];
		if (wss !== undefined) {
			event.locals.wss = wss;
		}

		const rts = getGlobalThis()[GlobalThisRTS];
		if (rts !== undefined) {
			event.locals.rts = rts;
		}

		const redis = getGlobalThis()[GlobalThisRedis];
		if (redis !== undefined) {
			event.locals.redis = redis;
		}
	}
	const response = await resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-type',
	});
	return response;
};

function shutdownGracefully() {
	// anything you need to clean up manually goes in here
	wssLog.info('Shutting down');
}

process.on('SIGINT', shutdownGracefully);
process.on('SIGTERM', shutdownGracefully);
