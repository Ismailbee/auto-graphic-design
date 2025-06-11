/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/@ionic/vue/**/*.js"
  ],
  theme: {
     extend: {
      fontFamily: {
        kenyan: ['"Kenyan Coffee"',  'sans-serif'],
        NICKERB1: ['"Nickerbocker-Normal"', 'sans-serif' ],
      },
    },
  },
  plugins: [],
}
