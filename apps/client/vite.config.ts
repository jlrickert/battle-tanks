import {
	getGlobalWSSInstance,
	onHttpServerUpgrade,
} from './src/lib/server/webSocketUtils';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'integratedWebsocketServer',
			configureServer(server) {
				getGlobalWSSInstance();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			},
			configurePreviewServer(server) {
				getGlobalWSSInstance();
				server.httpServer?.on('upgrade', onHttpServerUpgrade);
			},
		},
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
