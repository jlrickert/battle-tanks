import type { IncomingMessage } from "http";
import type { Logger } from "../logger";
import type { WebSocket } from "./webSocket";
import type { WebSocketServer } from "./webSocketServer";
import type { Document } from "mongodb";

export type Middleware<A extends Document> = (
	context: {
		wss: WebSocketServer<A>;
		ws: WebSocket<A>;
		log: Logger;
		req: IncomingMessage;
	},
	next: () => void,
) => void;

export const keepAliveMiddleware = <A extends Document>(): Middleware<A> => {
	const map = new Map<string, boolean>();
	return ({ log, wss, ws }, next) => {
		map.set(ws.sessionId, true);
		ws.onPong(() => {
			map.set(ws.sessionId, true);
		});

		const interval = setInterval(() => {
			wss.clients.forEach((ws) => {
				if (!map.get(ws.sessionId)) {
					log.trace(
						{ socketId: ws.sessionId },
						"No response from ping. Terminating",
					);
					ws.terminate();
				}
				map.set(ws.sessionId, false);
				ws.ping();
			});
		}, 30000);

		ws.onClose(() => {
			log.trace("clearing ping interval");
			clearInterval(interval);
		});
		next();
	};
};

export const loggingMiddleware = <A extends Document>(): Middleware<A> => {
	return ({ log, ws, req }, next) => {
		log.debug(
			{
				socketId: ws.sessionId,
				ip: req.socket.remoteAddress,
				port: req.socket.remotePort,
				family: req.socket.remoteFamily,
			},
			"Socket created",
		);
		next();
	};
};
