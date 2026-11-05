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
          800: '#1e2522',
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
          dark: '#eaa235',
          bronze: '#eaa235',
          300: '#eaa235',
          400: '#eaa235',
          500: '#eaa235',
          600: '#1e2522',
          700: '#eaa235',
        },
      },
    },
  },
  plugins: [],
}
