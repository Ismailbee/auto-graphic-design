// src/services/background-removal.service.ts

/**
 * Background Removal Service
 * Integrates with Remove.bg API or uses client-side processing
 */

export interface BackgroundRemovalOptions {
  size?: 'auto' | 'preview' | 'full' | 'medium' | 'hd' | '4k'
  type?: 'auto' | 'person' | 'product' | 'car'
  format?: 'auto' | 'png' | 'jpg' | 'zip'
  roi?: string // Region of interest (x1 y1 x2 y2)
  crop?: boolean
  scale?: string // e.g., "50%"
  position?: string // e.g., "center"
  channels?: 'rgba' | 'alpha'
}

export interface BackgroundRemovalResult {
  success: boolean
  imageUrl?: string
  imageBlob?: Blob
  creditsUsed?: number
  error?: string
}

class BackgroundRemovalService {
  private apiKey: string | null = null
  private apiUrl: string = 'https://api.remove.bg/v1.0/removebg'
  private useClientSide: boolean = true // Default to client-side processing

  /**
   * Set Remove.bg API key
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
    this.useClientSide = false
  }

  /**
   * Remove background from image
   */
  async removeBackground(
    imageFile: File,
    options: BackgroundRemovalOptions = {}
  ): Promise<BackgroundRemovalResult> {
    try {
      // If API key is set, use Remove.bg API
      if (this.apiKey && !this.useClientSide) {
        return await this.removeBackgroundAPI(imageFile, options)
      }

      // Otherwise, use client-side processing
      return await this.removeBackgroundClientSide(imageFile)
    } catch (error: any) {
      console.error('Background removal error:', error)
      return {
        success: false,
        error: error.message || 'Failed to remove background'
      }
    }
  }

  /**
   * Remove background using Remove.bg API
   */
  private async removeBackgroundAPI(
    imageFile: File,
    options: BackgroundRemovalOptions
  ): Promise<BackgroundRemovalResult> {
    if (!this.apiKey) {
      throw new Error('Remove.bg API key not set')
    }

    const formData = new FormData()
    formData.append('image_file', imageFile)
    formData.append('size', options.size || 'auto')
    
    if (options.type) formData.append('type', options.type)
    if (options.format) formData.append('format', options.format)
    if (options.roi) formData.append('roi', options.roi)
    if (options.crop !== undefined) formData.append('crop', String(options.crop))
    if (options.scale) formData.append('scale', options.scale)
    if (options.position) formData.append('position', options.position)
    if (options.channels) formData.append('channels', options.channels)

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0]?.title || 'API request failed')
    }

    const blob = await response.blob()
    const imageUrl = URL.createObjectURL(blob)

    // Get credits used from headers
    const creditsUsed = parseInt(response.headers.get('X-Credits-Charged') || '0')

    return {
      success: true,
      imageUrl,
      imageBlob: blob,
      creditsUsed
    }
  }

  /**
   * Remove background using client-side processing (Canvas API)
   * This is a simple implementation - for production, consider using libraries like:
   * - @imgly/background-removal
   * - rembg.js
   * - TensorFlow.js with BodyPix or DeepLab
   */
  private async removeBackgroundClientSide(imageFile: File): Promise<BackgroundRemovalResult> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target?.result as string
      }

      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            throw new Error('Failed to get canvas context')
          }

          canvas.width = img.width
          canvas.height = img.height

          // Draw image
          ctx.drawImage(img, 0, 0)

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Simple background removal based on color similarity
          // This is a basic implementation - replace with ML model for better results
          const threshold = 30
          const backgroundColor = this.detectBackgroundColor(data, canvas.width, canvas.height)

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]

            // Calculate color difference
            const diff = Math.sqrt(
              Math.pow(r - backgroundColor.r, 2) +
              Math.pow(g - backgroundColor.g, 2) +
              Math.pow(b - backgroundColor.b, 2)
            )

            // If color is similar to background, make it transparent
            if (diff < threshold) {
              data[i + 3] = 0 // Set alpha to 0 (transparent)
            }
          }

          // Put modified image data back
          ctx.putImageData(imageData, 0, 0)

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }

            const imageUrl = URL.createObjectURL(blob)
            resolve({
              success: true,
              imageUrl,
              imageBlob: blob
            })
          }, 'image/png')
        } catch (error: any) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      reader.readAsDataURL(imageFile)
    })
  }

  /**
   * Detect background color (simple edge detection)
   */
  private detectBackgroundColor(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): { r: number; g: number; b: number } {
    // Sample corners to detect background color
    const samples: number[][] = []
    const sampleSize = 10

    // Top-left corner
    for (let y = 0; y < sampleSize; y++) {
      for (let x = 0; x < sampleSize; x++) {
        const i = (y * width + x) * 4
        samples.push([data[i], data[i + 1], data[i + 2]])
      }
    }

    // Top-right corner
    for (let y = 0; y < sampleSize; y++) {
      for (let x = width - sampleSize; x < width; x++) {
        const i = (y * width + x) * 4
        samples.push([data[i], data[i + 1], data[i + 2]])
      }
    }

    // Bottom-left corner
    for (let y = height - sampleSize; y < height; y++) {
      for (let x = 0; x < sampleSize; x++) {
        const i = (y * width + x) * 4
        samples.push([data[i], data[i + 1], data[i + 2]])
      }
    }

    // Bottom-right corner
    for (let y = height - sampleSize; y < height; y++) {
      for (let x = width - sampleSize; x < width; x++) {
        const i = (y * width + x) * 4
        samples.push([data[i], data[i + 1], data[i + 2]])
      }
    }

    // Calculate average color
    const avgR = samples.reduce((sum, s) => sum + s[0], 0) / samples.length
    const avgG = samples.reduce((sum, s) => sum + s[1], 0) / samples.length
    const avgB = samples.reduce((sum, s) => sum + s[2], 0) / samples.length

    return {
      r: Math.round(avgR),
      g: Math.round(avgG),
      b: Math.round(avgB)
    }
  }

  /**
   * Check if Remove.bg API is available
   */
  isAPIAvailable(): boolean {
    return !!this.apiKey && !this.useClientSide
  }

  /**
   * Get remaining credits (if using Remove.bg API)
   */
  async getRemainingCredits(): Promise<number | null> {
    if (!this.apiKey) return null

    try {
      const response = await fetch('https://api.remove.bg/v1.0/account', {
        headers: {
          'X-Api-Key': this.apiKey
        }
      })

      if (!response.ok) return null

      const data = await response.json()
      return data.data?.attributes?.credits?.total || 0
    } catch (error) {
      console.error('Failed to get credits:', error)
      return null
    }
  }
}

// Export singleton instance
export const backgroundRemovalService = new BackgroundRemovalService()

