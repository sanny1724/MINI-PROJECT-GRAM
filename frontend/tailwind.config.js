/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // GRAM palette: deep field-green ink, muted parchment surface,
        // marigold accent (harvest/seal), and a distinct risk scale
        // (kept separate from brand color so it always reads as data,
        // not decoration).
        ink: '#16241D',        // near-black deep forest — primary text/headers
        field: '#24382C',      // secondary dark green — panels, nav
        parchment: '#F2F0E6',  // warm neutral paper background
        marigold: '#C98A2E',   // brand accent — harvest gold
        marigolddark: '#9C6A1E',
        risk: {
          low: '#3E7A4C',
          medium: '#C98A2E',
          high: '#C24A2E',
          critical: '#7A2020',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
