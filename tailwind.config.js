/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/@ionic/vue/**/*.js"
  ],
  theme: {
    extend: {
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px', // now lg starts at 1024px
        xl: '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        primary: '#502800',
        secondary: '#f6ebcd',
        contrast: '#BA6900',
      },
    },
  },
  plugins: [],
}
