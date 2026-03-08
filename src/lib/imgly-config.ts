/**
 * @imgly/background-removal Configuration
 * 
 * This file configures the @imgly library to work properly with Vite
 * by setting the correct publicPath for WASM/ONNX model files.
 */

import { Config } from '@imgly/background-removal'

/**
 * Configure @imgly background removal
 * Sets the publicPath to load WASM and ONNX files from CDN
 */
export function configureImgly(): Partial<Config> {
  return {
    // Use CDN for model files to avoid CORS issues
    publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/',
    
    // Model configuration
    model: 'medium', // Options: 'small', 'medium', 'large'
    
    // Output configuration
    output: {
      format: 'image/png',
      quality: 0.8,
      type: 'foreground', // Remove background, keep foreground
    },
    
    // Performance options
    debug: false,
    proxyToWorker: true, // Use web worker for better performance
    
    // Progress callback will be set per-call
  }
}

/**
 * Default configuration for quick access
 */
export const IMGLY_CONFIG = configureImgly()

