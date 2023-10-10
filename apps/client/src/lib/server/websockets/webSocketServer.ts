/* eslint-disable @typescript-eslint/no-explicit-any */

import { WebSocketServer as BaseWebSocketServer } from "ws";
import { nanoid } from "nanoid";
import type { IncomingMessage } from "http";
import type { Duplex } from "stream";
import { createGlobalGroup } from "../globalGroup";
import { getGlobalLogger } from "../logger";
import {
	keepAliveMiddleware,
	loggingMiddleware,
	type Middleware,
} from "./middleware";
import { createWebSocket, type WebSocket } from "./webSocket";
import invariant from "tiny-invariant";

export const WSS_SCOPE = "wss";

const createBaseServer = () => {
	return new BaseWebSocketServer({
		noServer: true,
	});
};

export type WebSocketServer = {
	readonly wssId: string;
	readonly clients: Map<string, WebSocket>;
	init(): void;
	addMiddleware(middleware: Middleware): void;
	broadcast(data: string, filter?: (ws: WebSocket) => boolean): void;
	onHttpServerUpgrade(req: IncomingMessage, sock: Duplex, head: Buffer): void;
};

const createExtendedWebSocketServer = (
	baseWss: ReturnType<typeof createBaseServer>,
): WebSocketServer => {
	const wssId = nanoid();
	const log = getGlobalLogger().child({ scope: WSS_SCOPE, wssId });
	const middlewares: Middleware[] = [keepAliveMiddleware()];
	const clients = new Map<string, WebSocket>();

	let initiated = false;
	const wss: WebSocketServer = {
		wssId,
		clients,
		addMiddleware: (middleware) => {
			middlewares.push(middleware);
		},
		init: () => {
			if (initiated) {
				return;
			}
			initiated = true;

			// Start the service
			baseWss.on("connection", (baseWss, req) => {
				const client = clients.get((baseWss as any).sessionId);
				invariant(
					client,
					"ws must be defined in order to connect to it",
				);

				const context = { log, wss, req, ws: client };
				const step = (index: number) => {
					const handler = middlewares[index];
					if (!handler) {
						return () => {};
					}
					let called = false;
					return () => {
						const next = () => {
							called = true;
							return step(index + 1)();
						};
						handler(context, next);
						if (!called) {
							next();
						}
					};
				};
				step(0)();

				client.onClose(() => {
					clients.delete(client.sessionId);
				});
			});
		},
		broadcast: (data, filter) => {
			log.debug({ data }, "broadcasting");
			clients.forEach((client) => {
				if (client.getReadyState() !== "open") {
					return;
				}

				if (filter) {
					if (filter(client)) {
						client.send(data);
					}
					return;
				} else {
					client.send(data);
					return;
				}
			});
		},
		onHttpServerUpgrade: (req, sock, head) => {
			const pathname = req.url ? new URL(req.url).pathname : null;
			log.warn('Parsing url with deprecated "parse" api');
			if (pathname !== "/websocket") return;

			const { cookie } = req.headers;
			const sessionId = cookie?.split("=")[1];
			if (!sessionId) {
				return;
			}

			baseWss.handleUpgrade(req, sock, head, (rawWs) => {
				const ws = createWebSocket({ sessionId, ws: rawWs });
				(rawWs as any).sessionId = ws.sessionId;
				clients.set(sessionId, ws);
				log.trace("Connection upgraded");
				baseWss.emit("connection", rawWs, req);
			});
		},
	};
	return wss;
};

export const getGlobalWebSocketServer = createGlobalGroup<WebSocketServer>(
	"sveltekit.wss",
	() => {
		const wss = createBaseServer();
		const server = createExtendedWebSocketServer(wss);
		server.addMiddleware(loggingMiddleware);
		return server;
	},
);
