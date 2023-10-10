<script lang="ts">
	import { loginSession } from '$lib/store';
</script>

<div>
	<label for="primary">Primary</label>
	<input
		id="primary"
		type="color"
		bind:value={$loginSession.color.primary}
		class="aspect-square"
	/>

	<label for="secondary">Secondary</label>
	<input
		id="secondary"
		type="color"
		bind:value={$loginSession.color.secondary}
		class="aspect-square"
	/>

	<label for="tertiary">Tertiary</label>
	<input
		id="primary"
		type="color"
		bind:value={$loginSession.color.tertiary}
		class="aspect-square"
	/>
</div>
