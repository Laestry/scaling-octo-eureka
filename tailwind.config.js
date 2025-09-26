/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        screens: {
            md: '767px',
            lg: '1162px'
        },
        extend: {
            cursor: {
                'blue-dot': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iMyIgZmlsbD0iIzM3NzdiYyIvPjwvc3ZnPg==') 8 8, pointer"
            },
            colors: {
                wred: '#F15A38',
                wblue: '#3777BC',
                wpink: '#DA5899',
                wblack: '#181C1C',
                wwhite: '#F6F1F2',
                wblue50: 'rgba(55, 119, 188, 0.5)',
                wblack20: 'rgba(24, 28, 28, 0.2)',
                wblack50: 'rgba(24, 28, 28, 0.5)',
                wwhite60: 'rgba(246, 241, 242, 0.6)',
                wred20: 'rgba(241, 90, 56, 0.2)',
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
                buttonP: '#DFDFDF',
                buttonS: '#000',
                color5: '#2D63B0',
                color1: '#DE6643',
                colorPurple: '#CA6097',
                colorBlue: '#4975B8'
            },
            borderColor: {
                DEFAULT: 'rgb(0, 0, 0, 1)'
            }
        }
    },
    plugins: []
};
