import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 👈 Add this line

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 👈 Add this line
    },
  },
})
