/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
		colors: {
			primary: 'var(--color-primary, red)',
			secondary: 'var(--color-secondary, blue)',
			tertiary: 'var(--color-tertiary, green)',
		},
	},
	plugins: [],
};
