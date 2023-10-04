<script lang='ts'>
	import { onMount } from 'svelte';
	import '../app.css';

	let webSocketEstablished = false;
	let ws: WebSocket | null = null;
	let log: string[] = [];

	const logEvent = (str: string) => {
		log = [...log, str];
	};

	const establishWebSocket = () => {
		if (webSocketEstablished) return;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);
		ws.addEventListener('open', (event) => {
			webSocketEstablished = true;
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

	const requestData = async () => {
		const res = await fetch('/api/test');
		const data = await res.json();
		console.log('Data from GET endpoint', data);
		logEvent(`[GET] data received: ${JSON.stringify(data)}`);
	};

	let primaryColor = '#ff0000';
	let secondaryColor = '#00ff00';
	let tertiaryColor = '#0000ff';

	let rootElement: HTMLDivElement;
	$: rootElement && rootElement.style.setProperty('--color-primary', primaryColor);
	$: rootElement && rootElement.style.setProperty('--color-secondary', secondaryColor);
	$: rootElement && rootElement.style.setProperty('--color-tertiary', tertiaryColor);
</script>

<div bind:this={rootElement} class='h-screen bg-primary'>
	<nav>
		<ul>
			<li><a href='/'>Battle Tanks</a></li>
			<li><a href='/admin'>Admin</a></li>
			<li><a href='/room/1'>Room</a></li>
		</ul>
	</nav>

	<input type='color' bind:value={primaryColor} class='aspect-square'>
	<input type='color' bind:value={secondaryColor} class='aspect-square'>
	<input type='color' bind:value={tertiaryColor} class='aspect-square'>

	<slot />

	<button disabled={webSocketEstablished}
			on:click={() => establishWebSocket()}>
		Establish WebSocket connection
	</button>

	<button on:click={() => requestData()}> Request Data from GET endpoint
	</button>

	<ul>
		{#each log as event}
			<li>{event}</li>
		{/each}
	</ul>

</div>

<style>
    :global(:root) {
        --color-primary: red;
        --color-secondary: blue;
        --color-tertiary: green;
    }
</style>