/**
 * MODNet Background Removal - Functional Tests
 * 
 * Tests basic functionality, alpha channel validation, and edge cases.
 * 
 * Run with: npm test -- modnet-bg-removal.functional.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { removeBackground, isSupported, getExecutionProviderInfo, reset } from '../src/lib/modnet-bg-removal'
import { readFileSync } from 'fs'
import { join } from 'path'

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Load test image as File object
 */
async function loadTestImage(filename: string): Promise<File> {
  const imagePath = join(__dirname, 'fixtures', filename)
  const buffer = readFileSync(imagePath)
  const blob = new Blob([buffer], { type: 'image/jpeg' })
  return new File([blob], filename, { type: 'image/jpeg' })
}

/**
 * Load image as HTMLImageElement
 */
async function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Extract alpha channel data from image blob
 */
async function extractAlphaChannel(blob: Blob): Promise<Uint8ClampedArray> {
  const img = await loadImageElement(new File([blob], 'test.png'))
  
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const alphaChannel = new Uint8ClampedArray(imageData.width * imageData.height)
  
  for (let i = 0; i < alphaChannel.length; i++) {
    alphaChannel[i] = imageData.data[i * 4 + 3]
  }
  
  return alphaChannel
}

/**
 * Calculate alpha channel statistics
 */
function analyzeAlphaChannel(alphaData: Uint8ClampedArray) {
  let min = 255
  let max = 0
  let sum = 0
  let transparentPixels = 0
  let opaquePixels = 0
  let semiTransparentPixels = 0
  
  for (let i = 0; i < alphaData.length; i++) {
    const alpha = alphaData[i]
    
    min = Math.min(min, alpha)
    max = Math.max(max, alpha)
    sum += alpha
    
    if (alpha === 0) transparentPixels++
    else if (alpha === 255) opaquePixels++
    else semiTransparentPixels++
  }
  
  const mean = sum / alphaData.length
  
  return {
    min,
    max,
    mean,
    transparentPixels,
    opaquePixels,
    semiTransparentPixels,
    totalPixels: alphaData.length,
    transparentRatio: transparentPixels / alphaData.length,
    opaqueRatio: opaquePixels / alphaData.length,
    semiTransparentRatio: semiTransparentPixels / alphaData.length,
  }
}

// ============================================================================
// Test Suite
// ============================================================================

describe('MODNet Background Removal - Functional Tests', () => {
  
  beforeAll(() => {
    console.log('🧪 Starting functional tests...')
  })
  
  afterAll(() => {
    reset()
    console.log('✅ Functional tests complete')
  })
  
  // ==========================================================================
  // Basic Functionality
  // ==========================================================================
  
  describe('Basic Functionality', () => {
    
    it('should be supported in browser environment', () => {
      expect(isSupported()).toBe(true)
    })
    
    it('should detect available execution providers', async () => {
      const info = await getExecutionProviderInfo()
      
      expect(info).toHaveProperty('webgpu')
      expect(info).toHaveProperty('wasm')
      expect(info).toHaveProperty('recommended')
      expect(['webgpu', 'wasm']).toContain(info.recommended)
    })
    
    it('should remove background from portrait image', async () => {
      const imageFile = await loadTestImage('portrait.jpg')
      
      const result = await removeBackground(imageFile, {
        onProgress: (progress, stage) => {
          console.log(`  ${stage}: ${progress}%`)
        }
      })
      
      // Verify result structure
      expect(result).toHaveProperty('blob')
      expect(result).toHaveProperty('dataUrl')
      expect(result).toHaveProperty('processingTime')
      expect(result).toHaveProperty('executionProvider')
      expect(result).toHaveProperty('width')
      expect(result).toHaveProperty('height')
      
      // Verify blob is not empty
      expect(result.blob.size).toBeGreaterThan(0)
      expect(result.blob.type).toBe('image/png')
      
      // Verify data URL
      expect(result.dataUrl).toMatch(/^blob:/)
      
      // Verify execution provider
      expect(['webgpu', 'wasm']).toContain(result.executionProvider)
      
      // Verify dimensions
      expect(result.width).toBeGreaterThan(0)
      expect(result.height).toBeGreaterThan(0)
      
      console.log(`  ✅ Processed in ${result.processingTime.toFixed(0)}ms`)
      console.log(`  📊 Output: ${result.width}x${result.height}`)
      console.log(`  🚀 Provider: ${result.executionProvider}`)
    }, 30000) // 30s timeout
    
    it('should accept HTMLImageElement as input', async () => {
      const imageFile = await loadTestImage('portrait.jpg')
      const imageElement = await loadImageElement(imageFile)
      
      const result = await removeBackground(imageElement)
      
      expect(result.blob.size).toBeGreaterThan(0)
      expect(result.width).toBe(imageElement.width)
      expect(result.height).toBe(imageElement.height)
    }, 30000)
    
    it('should accept Blob as input', async () => {
      const imageFile = await loadTestImage('portrait.jpg')
      const blob = new Blob([await imageFile.arrayBuffer()], { type: 'image/jpeg' })
      
      const result = await removeBackground(blob)
      
      expect(result.blob.size).toBeGreaterThan(0)
    }, 30000)
    
  })
  
  // ==========================================================================
  // Alpha Channel Validation
  // ==========================================================================
  
  describe('Alpha Channel Validation', () => {
    
    it('should produce valid alpha channel (not fully opaque)', async () => {
      const imageFile = await loadTestImage('portrait.jpg')
      const result = await removeBackground(imageFile)
      
      const alphaData = await extractAlphaChannel(result.blob)
      const stats = analyzeAlphaChannel(alphaData)
      
      console.log('  📊 Alpha channel statistics:')
      console.log(`     Min: ${stats.min}, Max: ${stats.max}, Mean: ${stats.mean.toFixed(1)}`)
      console.log(`     Transparent: ${(stats.transparentRatio * 100).toFixed(1)}%`)
      console.log(`     Opaque: ${(stats.opaqueRatio * 100).toFixed(1)}%`)
      console.log(`     Semi-transparent: ${(stats.semiTransparentRatio * 100).toFixed(1)}%`)
      
      // Alpha should not be fully opaque (all 255)
      expect(stats.min).toBeLessThan(255)
      
      // Should have some transparent pixels (background removed)
      expect(stats.transparentPixels).toBeGreaterThan(0)
      
      // Should have some opaque pixels (foreground preserved)
      expect(stats.opaquePixels).toBeGreaterThan(0)
      
      // Mean alpha should be reasonable (not all 0 or all 255)
      expect(stats.mean).toBeGreaterThan(50)
      expect(stats.mean).toBeLessThan(200)
    }, 30000)
    
    it('should preserve fine details (hair strands)', async () => {
      const imageFile = await loadTestImage('portrait_with_hair.jpg')
      const result = await removeBackground(imageFile)
      
      const alphaData = await extractAlphaChannel(result.blob)
      const stats = analyzeAlphaChannel(alphaData)
      
      // Should have semi-transparent pixels for hair edges
      expect(stats.semiTransparentPixels).toBeGreaterThan(0)
      expect(stats.semiTransparentRatio).toBeGreaterThan(0.01) // At least 1%
      
      console.log(`  ✅ Semi-transparent pixels: ${stats.semiTransparentPixels} (${(stats.semiTransparentRatio * 100).toFixed(2)}%)`)
    }, 30000)
    
  })
  
  // ==========================================================================
  // Output Formats
  // ==========================================================================
  
  describe('Output Formats', () => {
    
    it('should output PNG by default', async () => {
      const imageFile = await loadTestImage('portrait.jpg')
      const result = await removeBackground(imageFile)
      
      expect(result.blob.type).toBe('image/png')
    }, 30000)
    
    it('should support WebP output format', async () => {
      const imageFile = await loadTestImage('portrait.jpg')
      const result = await removeBackground(imageFile, {
        outputFormat: 'image/webp'
      })
      
      expect(result.blob.type).toBe('image/webp')
    }, 30000)
    
  })
  
  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  
  describe('Edge Cases', () => {
    
    it('should handle small images', async () => {
      const imageFile = await loadTestImage('portrait_small.jpg') // e.g., 256x256
      const result = await removeBackground(imageFile)
      
      expect(result.blob.size).toBeGreaterThan(0)
      expect(result.width).toBeGreaterThan(0)
      expect(result.height).toBeGreaterThan(0)
    }, 30000)
    
    it('should handle large images', async () => {
      const imageFile = await loadTestImage('portrait_large.jpg') // e.g., 4096x4096
      const result = await removeBackground(imageFile)
      
      expect(result.blob.size).toBeGreaterThan(0)
      expect(result.width).toBeGreaterThan(0)
      expect(result.height).toBeGreaterThan(0)
    }, 60000) // 60s timeout for large images
    
    it('should handle non-square images', async () => {
      const imageFile = await loadTestImage('portrait_wide.jpg') // e.g., 1920x1080
      const result = await removeBackground(imageFile)
      
      expect(result.blob.size).toBeGreaterThan(0)
      expect(result.width).not.toBe(result.height)
    }, 30000)
    
    it('should report progress correctly', async () => {
      const imageFile = await loadTestImage('portrait.jpg')
      
      const progressUpdates: Array<{ progress: number; stage: string }> = []
      
      await removeBackground(imageFile, {
        onProgress: (progress, stage) => {
          progressUpdates.push({ progress, stage })
        }
      })
      
      // Should have multiple progress updates
      expect(progressUpdates.length).toBeGreaterThan(3)
      
      // Progress should be monotonically increasing
      for (let i = 1; i < progressUpdates.length; i++) {
        expect(progressUpdates[i].progress).toBeGreaterThanOrEqual(progressUpdates[i - 1].progress)
      }
      
      // Final progress should be 100
      expect(progressUpdates[progressUpdates.length - 1].progress).toBe(100)
      
      console.log(`  ✅ Progress updates: ${progressUpdates.length}`)
    }, 30000)
    
  })
  
  // ==========================================================================
  // Error Handling
  // ==========================================================================
  
  describe('Error Handling', () => {
    
    it('should throw error for invalid input', async () => {
      const invalidInput = null as any
      
      await expect(removeBackground(invalidInput)).rejects.toThrow()
    })
    
    it('should throw error for corrupted image', async () => {
      const corruptedBlob = new Blob(['not an image'], { type: 'image/jpeg' })
      
      await expect(removeBackground(corruptedBlob)).rejects.toThrow()
    })
    
  })
  
})

