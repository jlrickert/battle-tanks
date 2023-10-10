<script lang="ts">
	import { loginSession } from '$lib/store';
	import { debounce } from '$lib/funcUtils';

	const updateName = debounce((name: string) => {
		loginSession.update((user) => {
			return { ...user, name };
		});
	});
	let name = $loginSession.name;
	$: {
		updateName(name);
	}

	const validCharacters =
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
	const handleInput = (
		event: Event & { currentTarget: EventTarget & HTMLInputElement },
	) => {
		name = event.currentTarget.value
			.split('')
			.filter((a) => validCharacters.includes(a))
			.join('');
	};
</script>

<h1>Home page</h1>

<div>
	<label for="name">Nickname</label>
	<input
		autocomplete="off"
		bind:value={name}
		on:input={handleInput}
		type="text"
		minlength="3"
		maxlength="20"
	/>
</div>
