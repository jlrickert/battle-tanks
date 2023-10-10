<script lang='ts'>
	export let link = '';
</script>

<li>
	<a class='underline hover:bg-primary' href={link}>
		<slot />
	</a>
</li>