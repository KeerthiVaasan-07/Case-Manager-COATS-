/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: { DEFAULT: '#0e0d0b', 2: '#141310', 3: '#1a1916' },
        ink: { DEFAULT: '#e8e2d9', dim: '#9e9a93', faint: '#4a4840' },
        border: { DEFAULT: '#2e2c28', bright: '#3d3b36' },
        ats: {
          red: '#c0392b', 'red-dim': '#7b241c',
          amber: '#d4a017', 'amber-dim': '#8c6a0e',
          green: '#2e7d52', 'green-bright': '#3da66b',
          blue: '#2e86c1', 'blue-dim': '#1a5276',
          purple: '#9b59b6', 'purple-dim': '#6c3483',
        }
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'Menlo', 'monospace'],
        display: ['Geist', 'Geist', 'sans-serif'],
      },
    },
  },
  plugins: [],
}