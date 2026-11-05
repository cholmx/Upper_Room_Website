/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Caladea', 'serif'],
        sans: ['Inter', 'sans-serif'],
        display: ['Archivo', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#1e2522',
          deep: '#1e2522',
          900: '#1e2522',
          800: '#2b433e',
        },
        cream: {
          DEFAULT: '#f7f5ee',
          50: '#f7f5ee',
          100: '#f7f5ee',
          200: '#f7f5ee',
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
