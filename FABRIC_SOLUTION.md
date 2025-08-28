## Fabric.js Import Issue in Vite - Complete Solution

We're facing an error with Fabric.js imports in Vite:
`Error: Missing "./dist/fabric.js" specifier in "fabric" package`

### Solution: Create a local browser implementation

1. **Remove fabric.js dependency**:
   ```
   npm uninstall fabric
   ```

2. **Remove fabric plugin from vite.config.js**:
   ```javascript
   // vite.config.js
   import { defineConfig } from 'vite'
   import vue from '@vitejs/plugin-vue'
   import path from 'path'

   export default defineConfig({
     plugins: [vue()],
     optimizeDeps: {
       exclude: ['pinia-plugin-persistedstate']
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src')
       }
     }
   })
   ```

3. **Create a custom local implementation** (see fabricjs-browser.js)

4. **Update fabric-init.js to use our local implementation**:
   ```javascript
   // Import our local browser-compatible implementation
   import { fabric } from './fabricjs-browser.js';

   // Export for use in other modules
   export { fabric };
   ```

5. **Make sure to initialize it early in main.js**:
   ```javascript
   // At the top, before other imports
   import './lib/fabric-init.js';
   ```

6. **Use consistent imports in all components**:
   ```javascript
   import { fabric } from '../path/to/lib/fabric-init.js';
   ```

### Why This Solution Works:

1. Avoids dependency issues with fabric.js in Vite
2. Provides a minimal custom implementation for the features you're using
3. Eliminates path resolution problems
4. Maintains a consistent API for your components

### Alternative Solutions:

If you need the full fabric.js functionality:

1. Try CDN approach:
   ```html
   <!-- In index.html -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
   ```
   
   Then in fabric-init.js:
   ```javascript
   // Access the global fabric object
   export const fabric = window.fabric;
   ```

2. Use a bundled build of fabric.js in your public directory
3. Consider using Canvas API directly for simpler drawing needs
