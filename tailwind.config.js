/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		screens: {
			md: '680px',
			lg: '1120px'
		},
		colors: {
			primary: '#0d99ff',
			secondary: '#bde3ff',
			layer: '#ededed',
			interactivelayer: '#fffcB2',
			background01: '#f9f9f9',
			background2: '#ffffff',
			contentp: '#000000',
			contents: '#a8a8a8',
			border1: '#000000',
			border2: '#ebebeb',
		},
		extend: {
			borderColor: {
				DEFAULT: 'rgb(0, 0, 0, 1)'
			},
		}
	},
	plugins: []
};
