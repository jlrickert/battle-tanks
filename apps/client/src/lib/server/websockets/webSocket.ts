import { WebSocket as BaseWebSocket } from "ws";
import { absurd } from "../../funcUtils";

export type ReadyState = "connecting" | "open" | "closing" | "closed";

export type WebSocket = {
	readonly sessionId: string;
	getReadyState(): ReadyState;
	ping(): void;
	onPong(f: () => void): void;
	onMessage(f: (message: string) => void): void;
	onClose(f: () => void): void;
	send(data: string): void;
	terminate(): void;
};

export const createWebSocket = (args: {
	sessionId: string;
	ws: BaseWebSocket;
}): WebSocket => {
	const { ws, sessionId } = args;
	return {
		sessionId,
		getReadyState: () => {
			switch (ws.readyState) {
				case BaseWebSocket.CONNECTING: {
					return "connecting";
				}
				case BaseWebSocket.OPEN: {
					return "open";
				}
				case BaseWebSocket.CLOSING: {
					return "closing";
				}
				case BaseWebSocket.CLOSED: {
					return "closed";
				}
				default: {
					return absurd<ReadyState>(ws.readyState);
				}
			}
		},
		send: (message) => {
			ws.send(message);
		},
		onMessage: (f) => {
			ws.on("message", (data) => {
				f(data.toString());
			});
		},
		onClose: (f: () => void) => {
			ws.on("close", () => {
				f();
			});
		},
		onPong: (f: () => void) => {
			ws.on("pong", () => {
				f();
			});
		},
		ping: () => {
			ws.ping();
		},
		terminate: () => {
			ws.terminate();
		},
	};
};
