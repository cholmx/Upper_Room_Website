/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
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
          DEFAULT: '#1E2522',
          deep: '#141B18',
          900: '#1E2522',
          800: '#2B3530',
        },
        cream: {
          DEFAULT: '#F7F5EE',
          50: '#FCFBF7',
          100: '#F7F5EE',
          200: '#EDE9DC',
        },
        gold: {
          DEFAULT: '#D49E46',
          light: '#E8B96C',
          dark: '#A6790F',
          bronze: '#BD8937',
          300: '#E8B96C',
          400: '#D49E46',
          500: '#BD8937',
          600: '#8A6309',
          700: '#A6790F',
        },
      },
    },
  },
  plugins: [],
}
