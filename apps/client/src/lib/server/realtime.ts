import { getLogger } from './logger';
import type { ExtendedWebSocketServer } from './webSocketUtils';

const rtsLog = getLogger().child({ scope: 'rts' });

export const GlobalThisRTS = Symbol.for('sveltekit.rts');

export class RealTimeServer {
	constructor(private wss: ExtendedWebSocketServer) {}
	init() {
		this.wss;
	}
}

let realtimeServer: RealTimeServer;
export const getGlobalRTS = (wss: ExtendedWebSocketServer) => {
	if (realtimeServer) {
		return realtimeServer;
	}

	realtimeServer = new RealTimeServer(wss);
	return realtimeServer;
};
