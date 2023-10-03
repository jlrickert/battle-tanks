/* eslint-disable @typescript-eslint/no-explicit-any */

import { parse } from 'url';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import type { Server, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { getGlobalLogger, type Logger } from './logger';
import { getGlobalConfig } from './config';

const GlobalThisWSS = Symbol.for('sveltekit.wss');
export const WSS_SCOPE = 'wss';

export interface ExtendedWebSocket extends WebSocket {
	instanceId: string;
	wssId: string;
	socketId: string;
	log: Logger;
}
// export type ExtendedWebSocket = WebSocket;
export type ExtendedIncomingMessage = IncomingMessage;

// You can define server-wide functions or class instances here
// export type ExtendedWebSocketServer = Server<ExtendedWebSocket>;
export type ExtendedWebSocketServer = Server<WebSocket, IncomingMessage> & {
	instanceId: string;
	wssId: string;
	log: Logger;
};

export const onHttpServerUpgrade = (
	req: IncomingMessage,
	sock: Duplex,
	head: Buffer,
) => {
	const pathname = req.url ? parse(req.url).pathname : null;
	if (pathname !== '/websocket') return;

	const wss = getGlobalWebSocketServer();

	wss.handleUpgrade(req, sock, head, (ws: any) => {
		wss.log.debug('Connection upgraded');
		wss.emit('connection', ws, req);
	});
};

const createGlobalWSSInstance = (): ExtendedWebSocketServer => {
	const config = getGlobalConfig();
	const wss = new WebSocketServer({
		noServer: true,
	}) as unknown as ExtendedWebSocketServer;
	wss.instanceId = config.instanceId;
	wss.wssId = nanoid();
	wss.log = getGlobalLogger().child({
		scope: 'wss',
		context: {
			instanceId: wss.instanceId,
			wssId: wss.wssId,
		},
	});

	wss.on('connection', (ws: ExtendedWebSocket) => {
		ws.socketId = nanoid();
		ws.wssId = wss.wssId;
		ws.log = wss.log.child({
			scope: 'ws',
			context: {
				instanceId: wss.instanceId,
				wssId: wss.wssId,
				socketId: ws.socketId,
			},
		});

		ws.log.debug(`client connected`);
		ws.on('close', () => {
			ws.log.debug(`client disconnected`);
		});
	});

	return wss;
};

export const getGlobalWebSocketServer = (): ExtendedWebSocketServer => {
	const wss = (globalThis as any)[GlobalThisWSS];
	if (wss) {
		return wss;
	}

	(globalThis as any)[GlobalThisWSS] = createGlobalWSSInstance();
	return (globalThis as any)[GlobalThisWSS];
};
