/* eslint-disable @typescript-eslint/no-explicit-any */

import { parse } from "url";
import invariant from "tiny-invariant";
import { WebSocketServer as BaseWebSocketServer } from "ws";
import { nanoid } from "nanoid";
import type { IncomingMessage } from "http";
import type { Duplex } from "stream";
import type { Document } from "mongodb";
import { createGlobalGroup } from "../globalGroup";
import { getGlobalLogger } from "../logger";
import {
	keepAliveMiddleware,
	loggingMiddleware,
	type Middleware,
} from "./middleware";
import { createWebSocket, type WebSocket } from "./webSocket";
import type { StringerT } from "../../stringerT";

export const WSS_SCOPE = "websocketServer";

const createBaseServer = () => {
	return new BaseWebSocketServer({
		noServer: true,
	});
};

export type WebSocketServer<A extends Document> = {
	readonly wssId: string;
	readonly clients: Map<string, WebSocket<A>>;
	init(): void;
	addMiddleware(middleware: Middleware<A>): void;
	broadcast(message: A, filter?: (ws: WebSocket<A>) => boolean): void;
	onHttpServerUpgrade(req: IncomingMessage, sock: Duplex, head: Buffer): void;
};

const createExtendedWebSocketServer = <A extends Document>(
	stringer: StringerT<A>,
): WebSocketServer<A> => {
	const baseWss = createBaseServer();
	const wssId = nanoid();
	const log = getGlobalLogger().child({ scope: WSS_SCOPE, wssId });
	const middlewares: Middleware<A>[] = [keepAliveMiddleware<A>()];
	const clients = new Map<string, WebSocket<A>>();

	let initiated = false;
	const wss: WebSocketServer<A> = {
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
			const pathname = req.url ? parse(req.url).pathname : null;
			if (pathname !== "/websocket") return;

			const { cookie } = req.headers;
			const sessionId = cookie?.split("=")[1];
			if (!sessionId) {
				return;
			}

			baseWss.handleUpgrade(req, sock, head, (rawWs) => {
				const ws = createWebSocket({ sessionId, ws: rawWs, stringer });
				(rawWs as any).sessionId = ws.sessionId;
				clients.set(sessionId, ws);
				log.trace("Connection upgraded");
				baseWss.emit("connection", rawWs, req);
			});
		},
	};
	return wss;
};

export const getGlobalWebSocketServer = <A extends Document>(
	stringer: StringerT<A>,
) => {
	return createGlobalGroup<WebSocketServer<A>>("sveltekit.wss", () => {
		const server = createExtendedWebSocketServer<A>(stringer);
		server.addMiddleware(loggingMiddleware);
		return server;
	})();
};
