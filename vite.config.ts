import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import os from 'os'

// Use temp directory for cache to avoid OneDrive sync issues
const tempDir = path.join(os.tmpdir(), 'vite-cache-design-editor')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // Exclude Ican micro-app from compilation (unused, 4MB+)
      exclude: [/src\/views\/micro-apps\/Ican\//]
    }),
    VitePWA({
      // We register manually from main.ts so we can skip SW on Capacitor.
      injectRegister: null,
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'SmartDesignPro',
        short_name: 'SmartDesignPro',
        description: 'Professional design editor with AI capabilities',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Default is 2 MiB; our ONNX runtime WASM binaries are much larger.
        // Without this, `vite build` fails during SW generation.
        maximumFileSizeToCacheInBytes: 40 * 1024 * 1024,
        // Cache remote images (e.g., CloudFront/S3 backgrounds) for offline.
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => {
              if (request.destination !== 'image') return false
              return url.origin !== self.location.origin
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'remote-images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  // Use temp directory for cache to avoid OneDrive conflicts
  cacheDir: tempDir,
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Exclude Ican micro-app completely (unused, ~4MB)
  // This prevents it from being bundled or processed
  assetsInclude: [],
  optimizeDeps: {
    include: [
      'onnxruntime-web', 
      '@capacitor/app', 
      '@capacitor/core',
      'konva',
      'ionicons/icons'
    ],
    exclude: [
      '@imgly/background-removal',
      // Note: optimizeDeps.exclude must be package ids (not glob paths).
      // The Ican micro-app is excluded at bundling time via rollupOptions.external.
    ],
    // Force optimization to avoid OneDrive sync issues
    force: true
  },
  build: {
    // Increase chunk size warning limit (some libs are large)
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      // Exclude Ican micro-app from build completely
      external: (id) => {
        // Exclude any imports from Ican folder
        if (id.includes('micro-apps/Ican') || id.includes('micro-apps\\Ican')) {
          return true
        }
        return false
      },
      output: {
        // Optimized manual chunks for better code splitting and caching
        // IMPORTANT: vue-konva must be in same chunk as Vue to avoid initialization errors
        manualChunks(id) {
          // Skip Ican folder - not used
          if (id.includes('micro-apps/Ican') || id.includes('micro-apps\\Ican')) return undefined
          
          // AI/ML - Heavy libs (load only when needed)
          if (id.includes('onnxruntime-web')) return 'onnxruntime'
          if (id.includes('tesseract.js')) return 'tesseract'

          // PDF/Export - Heavy libs (load on export)
          if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html2pdf') || id.includes('pdf-lib')) return 'pdf'

          // Charts - Visualization
          if (id.includes('chart.js')) return 'charts'

          // Firebase - Auth and backend
          if (id.includes('firebase')) return 'firebase-vendor'

          // Ionic - UI framework (separate from Vue core)
          if (id.includes('@ionic') || id.includes('ionicons') || id.includes('@stencil')) return 'ionic'

          // Speech/TTS - Lazy loaded (only when user uses voice)
          if (id.includes('text-to-speech') || id.includes('speech')) return 'speech'
          
          // Konva standalone (without vue-konva)
          if (id.includes('node_modules/konva/') && !id.includes('vue-konva')) return 'konva'

          // Vue ecosystem - Core framework
          if (id.includes('node_modules/vue/') || 
              id.includes('node_modules/@vue/') || 
              id.includes('vue-router') ||
              id.includes('pinia') || 
              id.includes('@vueuse') ||
              id.includes('vue3-lottie')) return 'vue-vendor'
        }
      }
    },
    // Ensure WASM files are copied to dist
    assetsDir: 'assets',
    copyPublicDir: true
  },
  server: {
    fs: {
      strict: false,
      // Allow serving files from outside the root
      allow: ['..']
    },
    // Serve WASM files with correct MIME type
    middlewareMode: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    },
    // Watch options to handle OneDrive
    watch: {
      usePolling: true,
      interval: 100
    },
    // Force HMR to always refresh
    hmr: {
      overlay: true
    }
  },
  // Configure WASM handling
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
