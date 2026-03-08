import { ref, onUnmounted } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

/**
 * Image Cropper Composable
 * Handles image cropping functionality using Cropper.js v1.6.2
 */

export interface CropperOptions {
  aspectRatio?: number | undefined // undefined = free-form cropping
  viewMode?: 0 | 1 | 2 | 3 // 0 = no restrictions, 1 = restrict to container, 2 = restrict to canvas, 3 = restrict to container and canvas
  dragMode?: 'crop' | 'move' | 'none'
  autoCropArea?: number // 0-1, default 0.8 (80% of image)
  responsive?: boolean
  restore?: boolean
  checkCrossOrigin?: boolean
  checkOrientation?: boolean
  modal?: boolean
  guides?: boolean
  center?: boolean
  highlight?: boolean
  background?: boolean
  autoCrop?: boolean
  movable?: boolean
  rotatable?: boolean
  scalable?: boolean
  zoomable?: boolean
  zoomOnTouch?: boolean
  zoomOnWheel?: boolean
  wheelZoomRatio?: number
  cropBoxMovable?: boolean
  cropBoxResizable?: boolean
  toggleDragModeOnDblclick?: boolean
  minContainerWidth?: number
  minContainerHeight?: number
  minCanvasWidth?: number
  minCanvasHeight?: number
  minCropBoxWidth?: number
  minCropBoxHeight?: number
}

export interface CroppedImageData {
  dataUrl: string // Base64 data URL
  blob: Blob
  width: number
  height: number
  x: number
  y: number
}

export function useImageCropper() {
  const cropperInstance = ref<Cropper | null>(null)
  const imageElement = ref<HTMLImageElement | null>(null)
  const isInitialized = ref(false)
  const isProcessing = ref(false)
  const cropperError = ref<string | null>(null)

  /**
   * Initialize cropper on an image element
   */
  function initCropper(
    imgElement: HTMLImageElement,
    options: CropperOptions = {}
  ): void {
    try {
      // Destroy existing cropper if any
      destroyCropper()

      imageElement.value = imgElement

      // Default options
      const defaultOptions: CropperOptions = {
        aspectRatio: undefined, // Free-form cropping
        viewMode: 1,
        dragMode: 'crop',
        autoCropArea: 0.8,
        responsive: true,
        restore: true,
        checkCrossOrigin: true,
        checkOrientation: true,
        modal: true,
        guides: true,
        center: true,
        highlight: true,
        background: true,
        autoCrop: true,
        movable: true,
        rotatable: true,
        scalable: true,
        zoomable: true,
        zoomOnTouch: true,
        zoomOnWheel: true,
        wheelZoomRatio: 0.1,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: true
      }

      // Merge options
      const mergedOptions = { ...defaultOptions, ...options }

      // Initialize Cropper.js
      cropperInstance.value = new Cropper(imgElement, mergedOptions)
      isInitialized.value = true
      cropperError.value = null

      console.log('✅ Cropper initialized')
    } catch (error) {
      console.error('Failed to initialize cropper:', error)
      cropperError.value = error instanceof Error ? error.message : 'Failed to initialize cropper'
      isInitialized.value = false
    }
  }

  /**
   * Get cropped image as canvas
   */
  function getCroppedCanvas(options?: {
    width?: number
    height?: number
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    fillColor?: string
    imageSmoothingEnabled?: boolean
    imageSmoothingQuality?: 'low' | 'medium' | 'high'
  }): HTMLCanvasElement | null {
    if (!cropperInstance.value) {
      cropperError.value = 'Cropper not initialized'
      return null
    }

    try {
      const canvas = cropperInstance.value.getCroppedCanvas(options)
      return canvas
    } catch (error) {
      console.error('Failed to get cropped canvas:', error)
      cropperError.value = error instanceof Error ? error.message : 'Failed to get cropped canvas'
      return null
    }
  }

  /**
   * Get cropped image data (base64 + blob)
   */
  async function getCroppedImageData(
    format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
    quality: number = 0.92
  ): Promise<CroppedImageData | null> {
    if (!cropperInstance.value) {
      cropperError.value = 'Cropper not initialized'
      return null
    }

    isProcessing.value = true

    try {
      // Get cropped canvas
      const canvas = getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      })

      if (!canvas) {
        isProcessing.value = false
        return null
      }

      // Get crop box data
      const cropBoxData = cropperInstance.value.getCropBoxData()

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL(format, quality)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          format,
          quality
        )
      })

      const result: CroppedImageData = {
        dataUrl,
        blob,
        width: canvas.width,
        height: canvas.height,
        x: cropBoxData.left,
        y: cropBoxData.top
      }

      console.log('✅ Cropped image data:', {
        width: result.width,
        height: result.height,
        format,
        size: `${(blob.size / 1024).toFixed(2)} KB`
      })

      isProcessing.value = false
      return result
    } catch (error) {
      console.error('Failed to get cropped image data:', error)
      cropperError.value = error instanceof Error ? error.message : 'Failed to get cropped image data'
      isProcessing.value = false
      return null
    }
  }

  /**
   * Rotate image
   */
  function rotate(degree: number): void {
    if (!cropperInstance.value) return
    cropperInstance.value.rotate(degree)
  }

  /**
   * Zoom in
   */
  function zoomIn(ratio: number = 0.1): void {
    if (!cropperInstance.value) return
    cropperInstance.value.zoom(ratio)
  }

  /**
   * Zoom out
   */
  function zoomOut(ratio: number = 0.1): void {
    if (!cropperInstance.value) return
    cropperInstance.value.zoom(-ratio)
  }

  /**
   * Reset cropper to initial state
   */
  function reset(): void {
    if (!cropperInstance.value) return
    cropperInstance.value.reset()
  }

  /**
   * Set aspect ratio
   */
  function setAspectRatio(aspectRatio: number | undefined): void {
    if (!cropperInstance.value) return
    cropperInstance.value.setAspectRatio(aspectRatio || NaN)
  }

  /**
   * Destroy cropper instance
   */
  function destroyCropper(): void {
    if (cropperInstance.value) {
      cropperInstance.value.destroy()
      cropperInstance.value = null
      isInitialized.value = false
      console.log('🗑️ Cropper destroyed')
    }
  }

  /**
   * Get crop box data
   */
  function getCropBoxData() {
    if (!cropperInstance.value) return null
    return cropperInstance.value.getCropBoxData()
  }

  /**
   * Get canvas data
   */
  function getCanvasData() {
    if (!cropperInstance.value) return null
    return cropperInstance.value.getCanvasData()
  }

  /**
   * Get image data
   */
  function getImageData() {
    if (!cropperInstance.value) return null
    return cropperInstance.value.getImageData()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    destroyCropper()
  })

  return {
    // State
    cropperInstance,
    imageElement,
    isInitialized,
    isProcessing,
    cropperError,

    // Methods
    initCropper,
    getCroppedCanvas,
    getCroppedImageData,
    rotate,
    zoomIn,
    zoomOut,
    reset,
    setAspectRatio,
    destroyCropper,
    getCropBoxData,
    getCanvasData,
    getImageData
  }
}

