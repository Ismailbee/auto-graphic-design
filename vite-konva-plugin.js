// vite-konva-plugin.js
export default function vitePluginKonva() {
  return {
    name: 'vite-plugin-konva',
    config() {
      return {
        // Ensure Konva is properly resolved
        resolve: {
          dedupe: ['konva'],
          alias: {
            konva: 'konva/konva.js'
          }
        },
        optimizeDeps: {
          include: ['konva'],
          esbuildOptions: {
            define: {
              global: 'globalThis'
            }
          }
        },
        build: {
          commonjsOptions: {
            include: [/konva/],
            transformMixedEsModules: true
          }
        }
      };
    }
  };
}
