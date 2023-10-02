import { parse } from 'url';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import type { WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { getLogger } from './logger';

export const wssLog = getLogger().child({ scope: 'wss' });

export const GlobalThisWSS = Symbol.for('sveltekit.wss');

export interface ExtendedWebSocket extends WebSocket {
	socketId: string;
	// userId: string;
}
// export type ExtendedWebSocket = WebSocket;
export type ExtendedIncomingMessage = IncomingMessage;

// You can define server-wide functions or class instances here
// export interface ExtendedServer extends Server<ExtendedWebSocket> {};

// export type ExtendedWebSocketServer = Server<ExtendedWebSocket>;
export type ExtendedWebSocketServer = ReturnType<
	typeof createWSSGlobalInstance
>;

export type ExtendedGlobal = typeof globalThis & {
	[GlobalThisWSS]: ExtendedWebSocketServer;
};

export const onHttpServerUpgrade = (
	req: IncomingMessage,
	sock: Duplex,
	head: Buffer,
) => {
	const pathname = req.url ? parse(req.url).pathname : null;
	if (pathname !== '/websocket') return;

	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];

	wss.handleUpgrade(req, sock, head, (ws) => {
		wssLog.debug('Connection upgraded');
		wss.emit('connection', ws, req);
	});
};

export const createWSSGlobalInstance = () => {
	const wss = new WebSocketServer({
		noServer: true,
	});

	wss.on('connection', (ws: ExtendedWebSocket) => {
		ws.socketId = nanoid();
		wssLog.debug(`client connected (${ws.socketId}`);

		ws.on('close', () => {
			wssLog.debug(`client disconnected (${ws.socketId})`);
		});
	});

	return wss;
};

export const getGlobalWSSInstance = () => {
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss) {
		return wss;
	}

	(globalThis as ExtendedGlobal)[GlobalThisWSS] = createWSSGlobalInstance();
	return (globalThis as ExtendedGlobal)[GlobalThisWSS];
};
