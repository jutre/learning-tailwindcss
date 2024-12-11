/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    screens: {
      'sm': '550px',
      'md': '768px',
      'lg': '1000px',
      'xl': '1366px',
    },
    fontFamily: {
      sans: ['Source Sans Pro', 'sans-serif']
    }
  },
  plugins: [],
}

