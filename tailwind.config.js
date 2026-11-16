/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Aleo', 'Georgia', 'serif'],
        sans: ['Aleo', 'Georgia', 'serif'],
        display: ['Inter Tight', 'Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        // The site palette: jet black, dark teal, jungle teal, sandy brown, rosy copper, cream and white.
        black: '#1C2A2B',
        teal: { DEFAULT: '#003235' },
        jungle: { DEFAULT: '#5D947B' },
        sand: { DEFAULT: '#F4ECDD' },
        copper: { DEFAULT: '#C65D3B' },
        ink: {
          DEFAULT: '#1C2A2B',
          deep: '#1C2A2B',
          900: '#1C2A2B',
          800: '#1C2A2B',
        },
        cream: {
          DEFAULT: '#ffffff',
          50: '#ffffff',
          100: '#ffffff',
          200: '#ffffff',
        },
        gold: {
          DEFAULT: '#F9AB55',
          light: '#F9AB55',
          dark: '#F9AB55',
          bronze: '#F9AB55',
          300: '#F9AB55',
          400: '#F9AB55',
          500: '#F9AB55',
          600: '#1C2A2B',
          700: '#F9AB55',
        },
      },
    },
  },
  plugins: [],
}
