/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Jost', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brown · beige · baby pink pastel palette
        paper: '#fbf4ef', // pinkish cream panel
        beige: '#f5e9e1', // warm beige page background
        ink: '#6b5446', // warm brown text
        inkdeep: '#5c4636', // deep brown headings
        taupe: '#a98c79', // muted beige-brown labels
        sand: '#c2ab97', // light mono / placeholders
        line: '#eaddd2', // hairline borders
        line2: '#f3ebe3', // lighter hairline
        blush: {
          DEFAULT: '#e8b4bc', // baby pink brand
          soft: '#fbe6ea', // pale pink fill
          ink: '#c87f95', // pink text
          btn: '#cf9aa6', // pastel pink button
        },
        caramel: {
          DEFAULT: '#bd9a66',
          soft: '#f3e8d8',
          ink: '#a9854f',
        },
        rose: {
          soft: '#efe2e2',
          ink: '#a87f86',
        },
      },
      boxShadow: {
        soft: '0 1px 0 #f3ebe3',
        card: '0 8px 24px -16px rgba(150,110,110,0.45)',
        lift: '0 24px 60px -30px rgba(150,110,110,0.5)',
      },
    },
  },
  plugins: [],
};
