import { WebSocket as BaseWebSocket } from "ws";
import type { Document } from "mongodb";
import { absurd, pipe } from "fp-ts/function";
import type { StringerT } from "../../stringerT";
import { option } from "fp-ts";
import { getGlobalLogger } from "../logger";

export type ReadyState = "connecting" | "open" | "closing" | "closed";

export type WebSocket<A extends Document> = {
	readonly sessionId: string;
	getReadyState(): ReadyState;
	ping(): void;
	onPong(f: () => void): void;
	onMessage(f: (message: A) => void): void;
	onClose(f: () => void): void;
	send(data: A): void;
	terminate(): void;
};

export const createWebSocket = <A extends Document>(args: {
	sessionId: string;
	ws: BaseWebSocket;
	stringer: StringerT<A>;
}): WebSocket<A> => {
	const { ws, sessionId, stringer } = args;
	const log = getGlobalLogger().child({ sessionId, scope: "webSocket" });
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
			ws.send(stringer.serialize(message));
		},
		onMessage: (f) => {
			ws.on("message", (data) => {
				const message = pipe(data.toString(), stringer.parse);
				if (option.isNone(message)) {
					log.warn({ data }, "Unable to parse data");
					throw new Error("Unable to parse data");
				}
				f(message.value);
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
