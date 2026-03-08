/**
 * Background Removal Composable
 *
 * Provides client-side background removal functionality for uploaded images
 * using MODNet ONNX Runtime implementation (4-10× faster than @imgly).
 *
 * Features:
 * - WebGPU/WASM acceleration
 * - Browser-based processing (no backend required)
 * - Progress tracking
 * - Cancellation support
 * - Error handling with fallback
 * - Mobile optimization
 * - Server fallback option
 *
 * Usage:
 * ```typescript
 * const { removeBackground, isProcessing, progress, error } = useBackgroundRemoval()
 * const result = await removeBackground(file)
 * ```
 */

import { ref, Ref } from 'vue'
import {
  removeBackground as modnetRemoveBackground,
  isSupported as isModnetSupported,
  getExecutionProviderInfo
} from '@/lib/modnet-bg-removal'

export interface BackgroundRemovalOptions {
  // Model quality: 'fast' | 'balanced' | 'high'
  quality?: 'fast' | 'balanced' | 'high'
  // Output format: 'image/png' | 'image/webp'
  outputFormat?: 'image/png' | 'image/webp'
  // Max dimensions for processing (mobile optimization)
  maxDimensions?: number
  // Progress callback
  onProgress?: (progress: number) => void
  // Use server fallback if local processing fails
  useServerFallback?: boolean
}

export interface BackgroundRemovalResult {
  blob: Blob
  dataUrl: string
  width: number
  height: number
  processingTime: number
  executionProvider?: 'webgpu' | 'wasm' | 'server'
}

export function useBackgroundRemoval() {
  const isProcessing = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)
  const abortController = ref<AbortController | null>(null)

  /**
   * Resize image if it exceeds max dimensions
   * This improves performance on mobile devices
   */
  const resizeImageIfNeeded = async (
    file: File,
    maxDimensions: number
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)

        const { width, height } = img
        
        // Check if resizing is needed
        if (width <= maxDimensions && height <= maxDimensions) {
          resolve(file)
          return
        }

        // Calculate new dimensions maintaining aspect ratio
        let newWidth = width
        let newHeight = height
        
        if (width > height) {
          newWidth = maxDimensions
          newHeight = Math.round((height / width) * maxDimensions)
        } else {
          newHeight = maxDimensions
          newWidth = Math.round((width / height) * maxDimensions)
        }

        // Create canvas and resize
        const canvas = document.createElement('canvas')
        canvas.width = newWidth
        canvas.height = newHeight
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create resized image'))
              return
            }
            
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            
            console.log(`📐 Image resized: ${width}×${height} → ${newWidth}×${newHeight}`)
            resolve(resizedFile)
          },
          file.type,
          0.95 // Quality
        )
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image for resizing'))
      }

      img.src = url
    })
  }

  /**
   * Convert Blob to Data URL
   */
  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Remove background from an image file using MODNet ONNX Runtime
   *
   * @param file - Image file to process
   * @param options - Processing options
   * @returns Processed image with transparent background
   */
  const removeBackground = async (
    file: File,
    options: BackgroundRemovalOptions = {}
  ): Promise<BackgroundRemovalResult> => {
    const startTime = Date.now()

    try {
      // Reset state
      isProcessing.value = true
      progress.value = 0
      error.value = null
      abortController.value = new AbortController()

      // Set default options
      const {
        quality = 'balanced',
        outputFormat = 'image/png',
        maxDimensions = 2048, // Optimize for mobile
        onProgress,
        useServerFallback = false
      } = options

      console.log('🎨 Starting background removal (MODNet)...')
      console.log(`📊 Quality: ${quality}, Format: ${outputFormat}, Max: ${maxDimensions}px`)

      // Step 1: Resize image if needed (5% progress)
      progress.value = 5
      onProgress?.(5)

      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 10))

      const processedFile = await resizeImageIfNeeded(file, maxDimensions)

      // Step 2: Process with MODNet (5% - 95% progress)
      console.log('🔄 Processing with MODNet ONNX Runtime...')

      const result = await modnetRemoveBackground(processedFile, {
        quality,
        outputFormat,
        useServerFallback,
        onProgress: (progressValue, stage) => {
          // Map MODNet progress (0-100) to our progress (5-100)
          const mappedProgress = 5 + Math.round(progressValue * 0.95)
          progress.value = mappedProgress
          onProgress?.(mappedProgress)
          console.log(`⏳ ${stage}: ${progressValue}%`)

          // Ensure UI updates are not blocked
          // This is handled by Vue's reactivity, but we add a small delay
          // to allow the browser to render the progress update
        }
      })

      // Complete
      progress.value = 100
      onProgress?.(100)

      // Allow UI to update before returning
      await new Promise(resolve => setTimeout(resolve, 10))

      console.log(`✅ Background removed successfully in ${result.processingTime}ms`)
      console.log(`📐 Output dimensions: ${result.width}×${result.height}`)
      console.log(`🚀 Execution provider: ${result.executionProvider}`)

      return {
        blob: result.blob,
        dataUrl: result.dataUrl,
        width: result.width,
        height: result.height,
        processingTime: result.processingTime,
        executionProvider: result.executionProvider
      }

    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error during background removal'
      error.value = errorMessage

      // Log detailed error information
      console.error('❌ Background removal failed:', err)
      console.error('Error name:', err?.name)
      console.error('Error message:', err?.message)
      console.error('Error stack:', err?.stack)

      // Check for specific error types
      if (err?.message?.includes('ONNX Runtime')) {
        console.error('💡 ONNX Runtime error. Check model file and browser compatibility.')
      }

      if (err?.message?.includes('Failed to fetch')) {
        console.error('💡 Network error: Unable to download ONNX model.')
        console.error('💡 Check your internet connection or model URL configuration.')
      }

      if (err?.message?.includes('WebGPU')) {
        console.error('💡 WebGPU error. Falling back to WASM should happen automatically.')
      }

      // Re-throw to allow caller to handle
      throw new Error(errorMessage)

    } finally {
      isProcessing.value = false
      abortController.value = null
    }
  }

  /**
   * Cancel ongoing background removal process
   */
  const cancelProcessing = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
      isProcessing.value = false
      progress.value = 0
      console.log('🛑 Background removal cancelled')
    }
  }

  /**
   * Reset state
   */
  const reset = () => {
    isProcessing.value = false
    progress.value = 0
    error.value = null
    abortController.value = null
  }

  /**
   * Check if background removal is supported in current browser
   */
  const isSupported = (): boolean => {
    return isModnetSupported()
  }

  /**
   * Get execution provider information
   */
  const getProviderInfo = async () => {
    return await getExecutionProviderInfo()
  }

  return {
    // State
    isProcessing,
    progress,
    error,

    // Methods
    removeBackground,
    cancelProcessing,
    reset,
    isSupported,
    getProviderInfo
  }
}

