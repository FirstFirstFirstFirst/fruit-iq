/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        thai: {
          red: '#B41E3D',
          blue: '#2D4A7C',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        'thai-sans': ['Noto Sans Thai', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'thai-sm': ['16px', '24px'],
        'thai-base': ['18px', '28px'],
        'thai-lg': ['20px', '32px'],
        'thai-xl': ['24px', '36px'],
        'thai-2xl': ['30px', '40px'],
        'thai-3xl': ['36px', '48px'],
      }
    },
  },
  plugins: [],
}