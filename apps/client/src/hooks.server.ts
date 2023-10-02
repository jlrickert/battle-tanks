import { building } from '$app/environment';
import {
	GlobalThisWSS,
	getGlobalWSSInstance,
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
	console.log('[wss:kit] setup');
	const wss = getGlobalWSSInstance();
	if (wss !== undefined) {
		wss.on('connection', (ws: ExtendedWebSocket) => {
			// This is where you can authenticate the client from the request
			// const session = await getSessionFromCookie(request.headers.cookie || '');
			// if (!session) ws.close(1008, 'User not authenticated');
			// ws.userId = session.userId;
			console.log(`[wss:kit] client connected (${ws.socketId})`);
			ws.send(
				`Hello from SvelteKit ${new Date().toLocaleString()} (${
					ws.socketId
				})]`,
			);

			const pid = setInterval(() => {
				ws.send('Ping');
				console.log(`[wss:kit] ping ${ws.socketId}`);
			}, 5000);

			ws.on('close', () => {
				console.log(`[wss:kit] client disconnected (${ws.socketId})`);
				clearInterval(pid);
			});
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
