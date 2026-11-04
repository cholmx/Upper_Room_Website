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
        display: ['"Google Sans Flex"', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#14221d',
          deep: '#1c2622',
          900: '#14221d',
          800: '#1A2E28',
        },
        cream: {
          DEFAULT: '#F9F9F7',
          50: '#FDFDFC',
          100: '#F9F9F7',
          200: '#F2F1ED',
        },
        gold: {
          DEFAULT: '#EBC36B',
          light: '#FFD27A',
          dark: '#A6790F',
          bronze: '#CCA866',
          300: '#FFD27A',
          400: '#EBC36B',
          500: '#CCA866',
          600: '#8A6309',
          700: '#A6790F',
        },
      },
    },
  },
  plugins: [],
}
