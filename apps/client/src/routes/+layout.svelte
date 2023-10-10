<script lang="ts">
	import { onMount } from 'svelte';
	import { nanoid } from 'nanoid';
	import NavItem from '$lib/components/NavItem.svelte';
	import { loginSession } from '$lib/store';
	import { createMessage } from '$lib/messages';
	import type { LayoutServerData } from './$types';
	import '../app.css';

	export let data: LayoutServerData;
	$loginSession = data.user ? data.user : $loginSession;

	let webSocketEstablished = false;
	let ws: WebSocket | null = null;
	let log: string[] = [];

	const logEvent = (str: string) => {
		log = [...log, str];
	};

	const establishWebSocket = () => {
		if (webSocketEstablished) {
			return;
		}
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);
		ws.addEventListener('open', (event) => {
			webSocketEstablished = true;
			ws?.send(
				JSON.stringify(
					createMessage({
						id: nanoid(),
						event: 'fastForward',
						data: {},
					}),
				),
			);
			console.log('[websocket] connection open', event);
			logEvent('[websocket] connection open');
		});
		ws.addEventListener('close', (event) => {
			console.log('[websocket] connection closed', event);
			logEvent('[websocket] connection closed');
		});
		ws.addEventListener('message', (event) => {
			console.log('[websocket] message received', event);
			logEvent(
				`[websocket] message received: ${JSON.stringify(event.data)}`,
			);
		});
	};

	onMount(() => {
		establishWebSocket();
	});

	$: {
		if (ws && ws.readyState === ws.OPEN) {
			const message = createMessage({
				id: nanoid(),
				event: 'profile',
				data: $loginSession,
			});
			ws.send(JSON.stringify(message));
		}
	}
</script>

<div
	class="grid absolute h-full w-full grid-rows-[auto_1fr] grid-cols-1 bg-secondary"
	style={`
		--color-primary: ${$loginSession.color.primary};
		--color-secondary: ${$loginSession.color.secondary};
		--color-tertiary: ${$loginSession.color.tertiary};
	`}
>
	<header>
		<nav class="flex flex-col relative bg-primary h-12 justify-center">
			<ul class="flex flex-row gap-4 justify-center">
				<NavItem link="/">Battle Tanks</NavItem>
				<NavItem link="/game">Game</NavItem>
				<NavItem link="/profile">Profile</NavItem>
				<NavItem link="/admin">Admin</NavItem>
			</ul>
		</nav>
	</header>

	<main
		class="flex flex-col justify-center items-center overflow-y-auto container bg-secondary ml-auto mr-auto"
	>
		{#if $loginSession && $loginSession.name.length > 0}
			<p>Hi {$loginSession.name}</p>
		{/if}
		<slot />

		<ul>
			{#each log as event}
				<li>{event}</li>
			{/each}
		</ul>
	</main>
</div>

<style global>
	:root {
		--color-primary: red;
		--color-secondary: blue;
		--color-tertiary: green;
	}
</style>
