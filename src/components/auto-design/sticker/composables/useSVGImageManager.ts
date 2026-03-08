import { ref, reactive } from 'vue'

/**
 * SVG Image Manager Composable
 * Handles image upload, embedding, positioning, and layer management for SVG templates
 */

export interface SVGImage {
  id: string
  file: File
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  zIndex: number
  maintainAspectRatio: boolean
  originalWidth: number
  originalHeight: number
  flipped: boolean
  isRetouched?: boolean
}

export interface ImageUploadOptions {
  maxFileSize?: number // in bytes, default 5MB
  allowedTypes?: string[] // default: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
  defaultWidth?: number
  defaultHeight?: number
  defaultX?: number
  defaultY?: number
}

const DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
  defaultWidth: 300,
  defaultHeight: 300,
  defaultX: 100,
  defaultY: 100
}

export function useSVGImageManager(options: ImageUploadOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  
  const images = ref<SVGImage[]>([])
  const selectedImageId = ref<string | null>(null)
  const isDragging = ref(false)
  const uploadError = ref<string | null>(null)
  const isProcessing = ref(false)

  let imageCounter = 0

  /**
   * Validate file before upload
   */
  function validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`
      }
    }

    // Check file size
    if (file.size > config.maxFileSize) {
      const maxSizeMB = (config.maxFileSize / (1024 * 1024)).toFixed(2)
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      }
    }

    return { valid: true }
  }

  /**
   * Get image dimensions from file
   */
  function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      img.src = dataUrl
    })
  }

  /**
   * Convert file to base64 data URL
   */
  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      reader.readAsDataURL(file)
    })
  }

  /**
   * Read placeholder image attributes from SVG template
   * Returns position and size from the placeholder-image element
   */
  function getPlaceholderAttributes(svgElement?: SVGSVGElement | null): {
    x: number
    y: number
    width: number
    height: number
  } {
    // Default values if placeholder not found
    const defaults = {
      x: config.defaultX,
      y: config.defaultY,
      width: config.defaultWidth,
      height: config.defaultHeight
    }

    if (!svgElement) {
      return defaults
    }

    // Find placeholder image element
    const placeholder = (svgElement.querySelector('#userImage') || svgElement.querySelector('#placeholder-image')) as SVGImageElement
    if (!placeholder) {
      return defaults
    }

    // Read attributes
    const x = parseFloat(placeholder.getAttribute('x') || String(config.defaultX))
    const y = parseFloat(placeholder.getAttribute('y') || String(config.defaultY))
    const width = parseFloat(placeholder.getAttribute('width') || String(config.defaultWidth))
    const height = parseFloat(placeholder.getAttribute('height') || String(config.defaultHeight))
    return { x, y, width, height }
  }

  /**
   * Add image to SVG
   * @param file - Image file to upload
   * @param svgElement - Optional SVG element to read placeholder position from
   */
  async function addImage(file: File, svgElement?: SVGSVGElement | null): Promise<SVGImage | null> {
    uploadError.value = null
    isProcessing.value = true

    try {
      // Validate file
      const validation = validateFile(file)
      if (!validation.valid) {
        uploadError.value = validation.error || 'Invalid file'
        isProcessing.value = false
        return null
      }

      // Convert to data URL
      const dataUrl = await fileToDataUrl(file)

      // Get original dimensions
      const { width: originalWidth, height: originalHeight } = await getImageDimensions(dataUrl)

      // Get placeholder position and size from SVG template
      const placeholderAttrs = getPlaceholderAttributes(svgElement)

      // Use placeholder dimensions exactly (no scaling)
      // This ensures uploaded images match the placeholder's exact size and position
      const defaultWidth = placeholderAttrs.width
      const defaultHeight = placeholderAttrs.height

      // Create image object using placeholder position and dimensions exactly
      const image: SVGImage = {
        id: `user-image-${++imageCounter}`,
        file,
        dataUrl,
        x: placeholderAttrs.x,
        y: placeholderAttrs.y,
        width: defaultWidth,
        height: defaultHeight,
        rotation: 0,
        opacity: 100,
        zIndex: images.value.length,
        maintainAspectRatio: true,
        originalWidth,
        originalHeight,
        flipped: false
      }

      // Add to images array
      images.value.push(image)

      // Select the newly added image
      selectedImageId.value = image.id

      console.log('✅ useSVGImageManager.addImage: image added', {
        id: image.id,
        dataUrlLength: image.dataUrl?.length || 0,
        dataUrlStart: image.dataUrl?.substring(0, 50) || 'none',
        totalImages: images.value.length
      })

      isProcessing.value = false
      return image
    } catch (error) {
      console.error('Failed to add image:', error)
      uploadError.value = error instanceof Error ? error.message : 'Failed to add image'
      isProcessing.value = false
      return null
    }
  }

  /**
   * Remove image by ID
   */
  function removeImage(imageId: string) {
    const index = images.value.findIndex(img => img.id === imageId)
    if (index !== -1) {
      images.value.splice(index, 1)
      
      // Update z-indices
      images.value.forEach((img, idx) => {
        img.zIndex = idx
      })

      // Clear selection if removed image was selected
      if (selectedImageId.value === imageId) {
        selectedImageId.value = images.value.length > 0 ? images.value[0].id : null
      }
    }
  }

  /**
   * Update image properties
   */
  function updateImage(imageId: string, updates: Partial<Omit<SVGImage, 'id' | 'file' | 'dataUrl'>>) {
    const image = images.value.find(img => img.id === imageId)
    if (image) {
      // Handle aspect ratio maintenance
      if (updates.width !== undefined && image.maintainAspectRatio) {
        const aspectRatio = image.originalWidth / image.originalHeight
        updates.height = updates.width / aspectRatio
      } else if (updates.height !== undefined && image.maintainAspectRatio) {
        const aspectRatio = image.originalWidth / image.originalHeight
        updates.width = updates.height * aspectRatio
      }

      Object.assign(image, updates)
    }
  }

  /**
   * Select image for editing
   */
  function selectImage(imageId: string | null) {
    selectedImageId.value = imageId
  }

  /**
   * Get selected image
   */
  function getSelectedImage(): SVGImage | null {
    if (!selectedImageId.value) return null
    return images.value.find(img => img.id === selectedImageId.value) || null
  }

  /**
   * Move image up in layer order (increase z-index)
   */
  function moveImageUp(imageId: string) {
    const index = images.value.findIndex(img => img.id === imageId)
    if (index < images.value.length - 1) {
      // Swap with next image
      const temp = images.value[index + 1]
      images.value[index + 1] = images.value[index]
      images.value[index] = temp

      // Update z-indices
      images.value.forEach((img, idx) => {
        img.zIndex = idx
      })
    }
  }

  /**
   * Move image down in layer order (decrease z-index)
   */
  function moveImageDown(imageId: string) {
    const index = images.value.findIndex(img => img.id === imageId)
    if (index > 0) {
      // Swap with previous image
      const temp = images.value[index - 1]
      images.value[index - 1] = images.value[index]
      images.value[index] = temp

      // Update z-indices
      images.value.forEach((img, idx) => {
        img.zIndex = idx
      })
    }
  }

  /**
   * Bring image to front (highest z-index)
   */
  function bringToFront(imageId: string) {
    const index = images.value.findIndex(img => img.id === imageId)
    if (index !== -1 && index < images.value.length - 1) {
      const image = images.value.splice(index, 1)[0]
      images.value.push(image)

      // Update z-indices
      images.value.forEach((img, idx) => {
        img.zIndex = idx
      })
    }
  }

  /**
   * Send image to back (lowest z-index)
   */
  function sendToBack(imageId: string) {
    const index = images.value.findIndex(img => img.id === imageId)
    if (index > 0) {
      const image = images.value.splice(index, 1)[0]
      images.value.unshift(image)

      // Update z-indices
      images.value.forEach((img, idx) => {
        img.zIndex = idx
      })
    }
  }

  /**
   * Clear all images
   */
  function clearAllImages() {
    images.value = []
    selectedImageId.value = null
    imageCounter = 0
  }

  /**
   * Handle drag over event
   */
  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    isDragging.value = true
  }

  /**
   * Handle drag leave event
   */
  function handleDragLeave(event: DragEvent) {
    event.preventDefault()
    isDragging.value = false
  }

  /**
   * Handle drop event
   * @param event - Drag event
   * @param svgElement - Optional SVG element to read placeholder position from
   */
  async function handleDrop(event: DragEvent, svgElement?: SVGSVGElement | null) {
    event.preventDefault()
    isDragging.value = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      // Add all dropped files
      for (let i = 0; i < files.length; i++) {
        await addImage(files[i], svgElement)
      }
    }
  }

  return {
    // State
    images,
    selectedImageId,
    isDragging,
    uploadError,
    isProcessing,

    // Methods
    addImage,
    removeImage,
    updateImage,
    selectImage,
    getSelectedImage,
    moveImageUp,
    moveImageDown,
    bringToFront,
    sendToBack,
    clearAllImages,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}

