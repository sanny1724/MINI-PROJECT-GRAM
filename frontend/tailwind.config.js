/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17352A',        // Deep Forest green ink
        field: '#E8EEE6',      // soft sage surface
        parchment: '#F5F1E7',  // warm ivory neutral background
        marigold: '#B87932',   // Terracotta gold accent
        marigolddark: '#965C20',
        risk: {
          low: '#2D6A4F',
          medium: '#B87932',
          high: '#C24A2E',
          critical: '#7A2020',
        },
      },
      fontFamily: {
        heading: ['"Fraunces"', 'serif'],
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
