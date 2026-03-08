/**
 * Composable for image retouching/enhancement
 * Provides automatic image enhancement features
 */

import { ref } from 'vue'

export function useImageRetouch() {
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  /**
   * Apply automatic retouch/enhancement to an image
   * Uses canvas to apply basic enhancements like brightness, contrast, and sharpening
   */
  async function applyRetouch(imageDataUrl: string, options: {
    brightness?: number      // -100 to 100, default 10
    contrast?: number        // -100 to 100, default 15
    saturation?: number      // -100 to 100, default 10
    sharpen?: boolean        // Apply sharpening, default true
  } = {}): Promise<string> {
    isProcessing.value = true
    error.value = null

    const {
      brightness = 10,
      contrast = 15,
      saturation = 10,
      sharpen = true
    } = options

    try {
      return await new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            if (!ctx) {
              reject(new Error('Failed to get canvas context'))
              return
            }

            canvas.width = img.width
            canvas.height = img.height

            // Draw original image
            ctx.drawImage(img, 0, 0)

            // Get image data for manipulation
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            // Apply brightness, contrast, and saturation adjustments
            const brightnessFactor = brightness / 100
            const contrastFactor = (contrast + 100) / 100
            const saturationFactor = saturation / 100

            for (let i = 0; i < data.length; i += 4) {
              let r = data[i]
              let g = data[i + 1]
              let b = data[i + 2]

              // Apply brightness
              r = r + (255 * brightnessFactor)
              g = g + (255 * brightnessFactor)
              b = b + (255 * brightnessFactor)

              // Apply contrast
              r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255
              g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255
              b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255

              // Apply saturation
              const gray = 0.2989 * r + 0.587 * g + 0.114 * b
              r = gray + saturationFactor * (r - gray) + r * saturationFactor
              g = gray + saturationFactor * (g - gray) + g * saturationFactor
              b = gray + saturationFactor * (b - gray) + b * saturationFactor

              // Clamp values
              data[i] = Math.max(0, Math.min(255, r))
              data[i + 1] = Math.max(0, Math.min(255, g))
              data[i + 2] = Math.max(0, Math.min(255, b))
            }

            ctx.putImageData(imageData, 0, 0)

            // Apply sharpening using convolution if enabled
            if (sharpen) {
              applySharpen(ctx, canvas.width, canvas.height)
            }

            // Convert to data URL
            const resultDataUrl = canvas.toDataURL('image/png', 0.95)
            resolve(resultDataUrl)
          } catch (err) {
            reject(err)
          }
        }

        img.onerror = () => {
          reject(new Error('Failed to load image for retouching'))
        }

        img.src = imageDataUrl
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error during retouch'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Apply sharpening filter using convolution
   */
  function applySharpen(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const copy = new Uint8ClampedArray(data)

    // Sharpen kernel
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]

    const kernelSize = 3
    const half = Math.floor(kernelSize / 2)

    for (let y = half; y < height - half; y++) {
      for (let x = half; x < width - half; x++) {
        let r = 0, g = 0, b = 0

        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const px = x + kx - half
            const py = y + ky - half
            const idx = (py * width + px) * 4
            const weight = kernel[ky * kernelSize + kx]

            r += copy[idx] * weight
            g += copy[idx + 1] * weight
            b += copy[idx + 2] * weight
          }
        }

        const idx = (y * width + x) * 4
        data[idx] = Math.max(0, Math.min(255, r))
        data[idx + 1] = Math.max(0, Math.min(255, g))
        data[idx + 2] = Math.max(0, Math.min(255, b))
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * Auto-enhance an image with preset values for best results
   */
  async function autoEnhance(imageDataUrl: string): Promise<string> {
    return applyRetouch(imageDataUrl, {
      brightness: 8,
      contrast: 12,
      saturation: 15,
      sharpen: true
    })
  }

  /**
   * Apply portrait enhancement (lighter touch for faces)
   */
  async function enhancePortrait(imageDataUrl: string): Promise<string> {
    return applyRetouch(imageDataUrl, {
      brightness: 5,
      contrast: 8,
      saturation: 5,
      sharpen: false // Avoid over-sharpening faces
    })
  }

  return {
    isProcessing,
    error,
    applyRetouch,
    autoEnhance,
    enhancePortrait
  }
}
