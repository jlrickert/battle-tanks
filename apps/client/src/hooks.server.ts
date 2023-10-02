import { building } from '$app/environment';
import {
	GlobalThisWSS,
	getGlobalWSSInstance,
	wssLog,
} from '$lib/server/webSocketUtils';
import type { Handle } from '@sveltejs/kit';
import type {
	ExtendedGlobal,
	ExtendedWebSocket,
} from '$lib/server/webSocketUtils';

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
		const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
		if (wss !== undefined) {
			event.locals.wss = wss;
		}
	}
	const response = await resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-type',
	});
	return response;
};
