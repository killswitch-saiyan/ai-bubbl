/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        comic: {
          yellow: '#fde047',
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#22c55e',
        }
      },
      fontFamily: {
        comic: ['Comic Neue', 'Comic Sans MS', 'cursive'],
        heading: ['Fredoka One', 'cursive'],
      }
    },
  },
  plugins: [],
}