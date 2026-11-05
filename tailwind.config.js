/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: ['Merriweather', 'Georgia', 'serif'],
        display: ['Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#1e2522',
          deep: '#1e2522',
          900: '#1e2522',
          800: '#2b433e',
        },
        cream: {
          DEFAULT: '#fcf9ed',
          50: '#fcf9ed',
          100: '#fcf9ed',
          200: '#fcf9ed',
        },
        gold: {
          DEFAULT: '#eaa235',
          light: '#eaa235',
          dark: '#d49e46',
          bronze: '#d49e46',
          300: '#eaa235',
          400: '#eaa235',
          500: '#d49e46',
          600: '#2b433e',
          700: '#d49e46',
        },
      },
    },
  },
  plugins: [],
}
