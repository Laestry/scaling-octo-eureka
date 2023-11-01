/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: '#0B504F',
      secondary: '#90B7B6',
      tprimary: '#062C2B',
      tsecondary: '#487C7B',
      ttertiary: '#90B7B6',
      tonlayer: '#DAE5E5',
      white: '#ffffff',
    },
    screens: {
      'md': '784px',
      'lg': '1120px',
      'xl': '1600px',
    },
    extend: {
    },
  },
  plugins: []
};
