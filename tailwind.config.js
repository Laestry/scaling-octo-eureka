/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		screens: {
			md: '680px',
			lg: '1120px'
		},
		extend: {
			borderColor: {
				DEFAULT: 'black'
			}
		}
	},
	plugins: []
};
