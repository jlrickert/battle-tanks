/* eslint-disable @typescript-eslint/no-explicit-any */

import { parse } from "url";
import { WebSocket, WebSocketServer } from "ws";
import { nanoid } from "nanoid";
import type { IncomingMessage } from "http";
import type { Duplex } from "stream";
import { createGlobalGroup } from "./globalGroup";
import { getGlobalLogger, type Logger } from "./logger";
import { type Config, getGlobalConfig } from "./config";

export const WSS_SCOPE = "wss";

type BufferLike =
	| string
	| Buffer
	| DataView
	| number
	| ArrayBufferView
	| Uint8Array
	| ArrayBuffer
	| SharedArrayBuffer
	| ReadonlyArray<any>
	| ReadonlyArray<number>
	| {
			valueOf(): ArrayBuffer;
	  }
	| {
			valueOf(): SharedArrayBuffer;
	  }
	| {
			valueOf(): Uint8Array;
	  }
	| {
			valueOf(): ReadonlyArray<number>;
	  }
	| {
			valueOf(): string;
	  }
	| {
			[Symbol.toPrimitive](hint: string): string;
	  };

export type ExtendedWebSocket = WebSocket & {
	id: string;
	userId?: string;
	isAlive: boolean;
};

const createWSSInstance = () => {
	return new WebSocketServer({
		noServer: true,
	});
};

export type Middleware = (
	context: {
		wss: ReturnType<typeof createWSSInstance>;
		ws: ExtendedWebSocket;
		log: Logger;
		req: IncomingMessage;
	},
	next: () => void,
) => void;

const idMiddleware: Middleware = ({ ws }, next) => {
	ws.id = nanoid();
	next();
};
const keepAliveMiddleware: Middleware = ({ log, wss, ws }, next) => {
	ws.isAlive = true;
	ws.on("pong", () => {
		log.trace({ socketId: ws.id }, "pong");
		ws.isAlive = true;
	});

	const interval = setInterval(() => {
		wss.clients.forEach((ws) => {
			const socket = ws as ExtendedWebSocket;
			if (!socket.isAlive) {
				log.trace(
					{ socketId: socket.id },
					"No response from ping. Terminating",
				);
				ws.terminate();
			}
			socket.isAlive = false;
			log.trace({ socketId: socket.id }, "ping");
			ws.ping();
		});
	}, 30000);

	wss.on("close", () => {
		log.trace("clearing ping interval");
		clearInterval(interval);
	});
	next();
};

const loggingMiddleware: Middleware = ({ log, ws, req }, next) => {
	log.debug(
		{
			socketId: ws.id,
			ip: req.socket.remoteAddress,
			port: req.socket.remotePort,
			family: req.socket.remoteFamily,
		},
		"Socket created",
	);
	next();
};
export type ExtendedWebSocketServer = ReturnType<
	typeof createExtendedWebSocketServer
>;
const createExtendedWebSocketServer = (
	wss: ReturnType<typeof createWSSInstance>,
	config: Config,
) => {
	const id = nanoid();
	const instanceId = config.instanceId;
	const log = getGlobalLogger().child({
		scope: WSS_SCOPE,
		wssId: id,
	});
	let initiated = false;
	const middlewares: Middleware[] = [];

	const addMiddleware = (middleware: Middleware) => {
		middlewares.push(middleware);
	};

	const reset = () => {};

	const init = () => {
		if (initiated) {
			return;
		}
		initiated = true;

		log.trace("Initiating middleware");

		addMiddleware(idMiddleware);
		addMiddleware(keepAliveMiddleware);
		addMiddleware(loggingMiddleware);

		log.trace("Starting service");
		// Start the service
		wss.on("connection", (ws: ExtendedWebSocket, req) => {
			let prevIndex = -1;
			let index = 0;
			let middleware = middlewares[index] ?? null;
			do {
				if (index === prevIndex) {
					throw new Error("Next called multiple times");
				}
				prevIndex = index;

				middleware = middlewares[index] ?? null;
				if (middleware !== null) {
					middleware({ log, wss, req, ws }, () => {
						index++;
					});
				}
			} while (middleware);
			ws.on("close", () => {
				ws.terminate();
			});
		});
	};

	const broadcast = (
		data: BufferLike,
		options: {
			mask?: boolean | undefined;
			binary?: boolean | undefined;
			compress?: boolean | undefined;
			fin?: boolean | undefined;
		},
	) => {
		log.debug("broadcasting");
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data, options);
			}
		});
	};

	const onHttpServerUpgrade = (
		req: IncomingMessage,
		sock: Duplex,
		head: Buffer,
	) => {
		const pathname = req.url ? parse(req.url).pathname : null;
		log.warn('Parsing url with deprecated "parse" api');
		if (pathname !== "/websocket") return;

		// authenticate here

		wss.handleUpgrade(req, sock, head, (ws: any) => {
			log.trace("Connection upgraded");
			wss.emit("connection", ws, req);
		});
	};

	return {
		id: nanoid(),
		instanceId,
		addMiddleware,
		reset,
		init,
		broadcast,
		onConnect(
			cb: (ws: ExtendedWebSocket, request: IncomingMessage) => void,
		) {
			return wss.on("connection", cb);
		},
		onError(cb: (error: unknown) => void) {
			return wss.on("error", cb);
		},
		onHeaders(cb: (headers: string[], request: IncomingMessage) => void) {
			return wss.on("headers", cb);
		},
		onClose(cb: () => void) {
			return wss.on("close", cb);
		},
		onListening(cb: () => void) {
			return wss.on("listening", cb);
		},
		onHttpServerUpgrade,
	} as const;
};
export const getGlobalWebSocketServer =
	createGlobalGroup<ExtendedWebSocketServer>("sveltekit.wss", () => {
		const wss = createWSSInstance();
		const config = getGlobalConfig();
		return createExtendedWebSocketServer(wss, config);
	});
