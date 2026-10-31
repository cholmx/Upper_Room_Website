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
        headline: ['"Playfair Display"', 'serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        charcoal: '#1E2522',
        linen: '#F7F5EE',
        sandstone: '#EDE9DC',
        harvest: {
          DEFAULT: '#D49E46',
          hover: '#BD8937',
          light: '#E8B96C',
        },
        moss: '#3E584D',
        stone: '#6E706B',
        ink: {
          DEFAULT: '#0B1613',
          deep: '#080c0b',
          900: '#0B1613',
          800: '#1A2E28',
        },
        cream: {
          DEFAULT: '#F9F9F7',
          50: '#FDFDFC',
          100: '#F9F9F7',
          200: '#F2F1ED',
        },
        gold: {
          DEFAULT: '#FFC44F',
          light: '#FFD27A',
          dark: '#A6790F',
          bronze: '#CCA866',
          300: '#FFD27A',
          400: '#FFC44F',
          500: '#CCA866',
          600: '#8A6309',
          700: '#A6790F',
        },
      },
    },
  },
  plugins: [],
}
