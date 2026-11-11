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
        ink: {
          DEFAULT: '#1e2522',
          deep: '#1e2522',
          900: '#1e2522',
          800: '#1e2522',
        },
        cream: {
          DEFAULT: '#ffffff',
          50: '#ffffff',
          100: '#ffffff',
          200: '#ffffff',
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
