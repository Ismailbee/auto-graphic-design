module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/@ionic/**/*.{js,ts,vue}",
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles if Ionic handles it
  },
  plugins: [],
};