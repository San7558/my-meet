/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 40%, 55%)',
        secondary: 'hsl(210, 30%, 30%)',
        accent: 'hsl(45, 100%, 55%)',
        background: 'hsl(210, 20%, 10%)',
        surface: 'hsla(210, 20%, 20%, 0.6)',
        glass: 'rgba(255,255,255,0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
