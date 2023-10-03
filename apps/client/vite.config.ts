import {
	getGlobalWebSocketServer,
	onHttpServerUpgrade,
	type ExtendedWebSocket,
} from './src/lib/server/webSocketUtils';
import { getGlobalLogger } from './src/lib/server/logger';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'integratedWebsocketServer',
			configureServer(server) {
				const wss = getGlobalWebSocketServer();
				console.log(
					`[Vite] Configure Server: instanceId=${wss.instanceId},wssId=${wss.wssId}`,
				);
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
				server.httpServer?.on('error', (error) => {
					getGlobalLogger().error({ error }, `Server error`);
				});
				// server.httpServer?.on('close', () => {
				// 	console.log('Close configure server');
				// 	wss.close();
				// });
			},

			configurePreviewServer(server) {
				const wss = getGlobalWebSocketServer();
				console.log(
					`[Vite] Configure Preview Server: instanceId=${wss.instanceId},wssId=${wss.wssId}`,
				);
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
				server.httpServer?.on('error', (error) => {
					getGlobalLogger().error({ error }, `Server error`);
				});
				// server.httpServer.on('close', () => {
				// 	console.log('Close configure preview server');
				// 	wss.close();
				// });
			},
			// handleHotUpdate() {
			// 	const wss = getGlobalWebSocketServer();
			// 	wss.clients.forEach((ws: ExtendedWebSocket) => {
			// 		ws.close();
			// 	});
			// },
			// handleHotUpdate({ file, modules, server }) {
			// 	console.log({ file });
			// 	// if (file.includes('webSocketUtils')) {
			// 	// 	server.restart();
			// 	// }
			// 	// if (file.includes.server) {
			// 	// }
			// 	// server.restart;
			// },
			// watchChange(id, change) {
			// 	console.log(id, change);
			// },
		},
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
