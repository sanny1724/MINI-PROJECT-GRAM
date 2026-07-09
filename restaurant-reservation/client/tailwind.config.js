/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf7f4',
          100: '#f5ebe4',
          200: '#ebd4c5',
          300: '#dbb49a',
          400: '#c58d69',
          500: '#b6734c',
          600: '#a75f3e',
          700: '#8c4c32',
          800: '#713e2b',
          900: '#5c3426',
          950: '#321a13',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
