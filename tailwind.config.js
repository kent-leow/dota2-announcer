/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx,ts}', './src/ui/**/*.{tsx,ts}'],
  theme: {
    extend: {
      colors: {
        'dota-black': '#0d0d0d',
        'dota-dark': '#1a1a2e',
        'dota-grey': '#a0a0b0',
        'dota-gold': '#c9a83e',
        'dota-amber': '#e8b84b',
        'dota-red': '#c23a2b',
        'dota-green': '#4caf50',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
