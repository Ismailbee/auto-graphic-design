// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [
    vue()
  ],

  optimizeDeps: {
    exclude: ['pinia-plugin-persistedstate'] // ⬅️ stops esbuild from breaking it
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
