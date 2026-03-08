/**
 * Image Management Utilities
 * Extracted from StickerTemplatePanel.vue to reduce file size
 * Contains functions for image manipulation, scaling, flipping, and cropping
 */

import type { Ref } from 'vue'

// Type for SVG Image Manager (matches useSVGImageManager)
interface SVGImageManager {
  images: Ref<Array<{
    id: string
    file: File
    dataUrl: string
    x: number
    y: number
    width: number
    height: number
    originalWidth: number
    originalHeight: number
    rotation: number
    flipped: boolean
    maintainAspectRatio: boolean
    isRetouched?: boolean
  }>>
  selectedImageId: Ref<string | null>
  getSelectedImage: () => any
  updateImage: (id: string, updates: Record<string, any>) => void
  addImage: (file: File, svgElement: SVGSVGElement) => Promise<any>
  clearAllImages: () => void
}

// Type for auth store notification
interface NotificationOptions {
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

// Type for crop complete data
export interface CropCompleteData {
  dataUrl: string
  blob: Blob
  width: number
  height: number
}

// Dependencies for image utilities
export interface ImageUtilsDeps {
  svgImageManager: SVGImageManager
  weddingPreviewContainer: Ref<HTMLElement | null>
  updateSVGWithImagesFn: () => void
  showNotification: (opts: NotificationOptions) => void
  applyRetouch: (dataUrl: string) => Promise<string>
}

/**
 * Handle image scale change from slider or direct value
 */
export function handleImageScaleChangeUtil(
  eventOrScale: Event | number,
  deps: Pick<ImageUtilsDeps, 'svgImageManager' | 'updateSVGWithImagesFn'>
) {
  const { svgImageManager, updateSVGWithImagesFn } = deps
  
  let scale: number
  
  if (typeof eventOrScale === 'number') {
    scale = eventOrScale
  } else {
    const target = eventOrScale.target as HTMLInputElement
    scale = parseFloat(target.value)
  }
  
  if (svgImageManager.selectedImageId.value) {
    const selectedImage = svgImageManager.images.value.find(
      img => img.id === svgImageManager.selectedImageId.value
    )
    if (selectedImage) {
      // Apply scale by adjusting width/height proportionally
      const newWidth = selectedImage.originalWidth * scale
      const newHeight = selectedImage.originalHeight * scale
      svgImageManager.updateImage(svgImageManager.selectedImageId.value, { width: newWidth, height: newHeight })
      updateSVGWithImagesFn()
    }
  }
}

/**
 * Set image to a specific scale value
 */
export function setImageScaleUtil(
  scale: number,
  deps: Pick<ImageUtilsDeps, 'svgImageManager' | 'updateSVGWithImagesFn'>
) {
  const { svgImageManager, updateSVGWithImagesFn } = deps
  
  if (svgImageManager.selectedImageId.value) {
    const selectedImage = svgImageManager.images.value.find(
      img => img.id === svgImageManager.selectedImageId.value
    )
    if (selectedImage) {
      const newWidth = selectedImage.originalWidth * scale
      const newHeight = selectedImage.originalHeight * scale
      svgImageManager.updateImage(svgImageManager.selectedImageId.value, { width: newWidth, height: newHeight })
      updateSVGWithImagesFn()
    }
  }
}

/**
 * Flip the selected image horizontally
 */
export function flipImageUtil(
  deps: Pick<ImageUtilsDeps, 'svgImageManager' | 'updateSVGWithImagesFn'>
) {
  const { svgImageManager, updateSVGWithImagesFn } = deps
  
  if (!svgImageManager.selectedImageId.value) {
    return
  }

  const selectedImage = svgImageManager.images.value.find(
    img => img.id === svgImageManager.selectedImageId.value
  )

  if (!selectedImage) {
    return
  }

  // Toggle flip state
  selectedImage.flipped = !selectedImage.flipped

  // Update SVG to reflect the change
  updateSVGWithImagesFn()
}

/**
 * Auto retouch the selected image
 */
export async function autoRetouchImageUtil(deps: ImageUtilsDeps): Promise<void> {
  const { svgImageManager, updateSVGWithImagesFn, showNotification, applyRetouch } = deps
  
  const selectedImage = svgImageManager.getSelectedImage()
  
  if (!selectedImage) {
    showNotification({
      title: 'No Image Selected',
      message: 'Please select an image to enhance',
      type: 'info'
    })
    return
  }

  // Check if image has already been retouched
  if (selectedImage.isRetouched) {
    showNotification({
      title: 'Already Enhanced',
      message: 'This image has already been retouched',
      type: 'info'
    })
    return
  }

  try {
    // Apply automatic retouch
    const retouchedDataUrl = await applyRetouch(selectedImage.dataUrl)
    
    // Update the image in the manager and mark as retouched
    if (svgImageManager.selectedImageId.value) {
      // Update dataUrl directly on the image object since it's excluded from updateImage
      selectedImage.dataUrl = retouchedDataUrl
      svgImageManager.updateImage(svgImageManager.selectedImageId.value, {
        isRetouched: true
      })
      
      // Update SVG preview
      updateSVGWithImagesFn()
      
      showNotification({
        title: 'Image Enhanced',
        message: 'Your image has been automatically retouched',
        type: 'success'
      })
    }
    
  } catch (error) {
    console.error('Auto retouch failed:', error)
    showNotification({
      title: 'Retouch Failed',
      message: 'Failed to enhance image. Please try again.',
      type: 'error'
    })
  }
}

/**
 * Update a single property on the selected image
 */
export function updateSelectedImagePropertyUtil(
  property: string,
  value: any,
  deps: Pick<ImageUtilsDeps, 'svgImageManager' | 'updateSVGWithImagesFn'>
) {
  const { svgImageManager, updateSVGWithImagesFn } = deps
  
  if (svgImageManager.selectedImageId.value) {
    svgImageManager.updateImage(svgImageManager.selectedImageId.value, { [property]: value })
    updateSVGWithImagesFn()
  }
}

/**
 * Handle image property input from form controls
 */
export function handleImagePropertyInputUtil(
  property: string,
  event: Event,
  selectedImage: any,
  updateFn: (property: string, value: any) => void
) {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)

  if (selectedImage) {
    updateFn(property, value)
  }
}

/**
 * Handle aspect ratio toggle
 */
export function handleAspectRatioToggleUtil(
  event: Event,
  selectedImage: any,
  updateFn: (property: string, value: any) => void
) {
  const target = event.target as HTMLInputElement
  const checked = target.checked

  if (selectedImage) {
    updateFn('maintainAspectRatio', checked)
  }
}

// Dependencies for crop handling
export interface CropHandlerDeps {
  svgImageManager: SVGImageManager
  weddingPreviewContainer: Ref<HTMLElement | null>
  updateSVGWithImagesFn: () => void
  scrollToBottom: () => void
  showNotification: (opts: NotificationOptions) => void
  chatMessages: Ref<Array<any>>
  uploadedImages: Ref<Array<{ file: File; timestamp: number; used: boolean }>>
  preGeneratedImageFile: Ref<File | null>
  pictureStepComplete: Ref<boolean>
  pendingImageFile: Ref<File | null>
  extractedInfo: Ref<{
    names: { name1: string | null; name2: string | null }
    date: string | null
    courtesy: string | null
    size: string | null
  }>
  sizeStepComplete: Ref<boolean>
  awaitingSizeDecision: Ref<boolean>
  awaitingBackgroundRemovalDecision: Ref<boolean>
  backgroundRemovalAlreadyHandled: Ref<boolean>
  accumulatedDescription: Ref<string>
  formData: { description: string }
  generateWeddingPreviewFn: () => void
}

/**
 * Handle pre-generation crop completion
 * Returns true if handled as pre-generation, false otherwise
 */
export function handlePreGenerationCropUtil(
  data: CropCompleteData,
  cropImageFile: Ref<File | null>,
  deps: CropHandlerDeps
): boolean {
  const {
    chatMessages,
    scrollToBottom,
    uploadedImages,
    preGeneratedImageFile,
    pictureStepComplete,
    pendingImageFile,
    extractedInfo,
    sizeStepComplete,
    awaitingSizeDecision,
    awaitingBackgroundRemovalDecision,
    backgroundRemovalAlreadyHandled,
    accumulatedDescription,
    formData,
    generateWeddingPreviewFn
  } = deps
  
  if (!cropImageFile.value) return false
  
  const croppedFile = new File([data.blob], cropImageFile.value.name, {
    type: 'image/png',
    lastModified: Date.now()
  })

  // Mark this image as used in the tracking array
  const uploadIndex = uploadedImages.value.findIndex(img => img.file === cropImageFile.value)
  if (uploadIndex >= 0) {
    uploadedImages.value[uploadIndex].used = true
  }

  // Add cropped image message to chat
  chatMessages.value.push({
    id: Date.now(),
    text: 'Image cropped',
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    image: data.dataUrl
  })
  scrollToBottom()

  // Check if BG removal was already handled
  if (backgroundRemovalAlreadyHandled.value) {
    preGeneratedImageFile.value = croppedFile
    console.log('📸 handlePreGenerationCropUtil: set preGeneratedImageFile', {
      fileName: croppedFile.name,
      fileSize: croppedFile.size,
      fileType: croppedFile.type
    })
    pictureStepComplete.value = true
    backgroundRemovalAlreadyHandled.value = false
    pendingImageFile.value = null
    
    setTimeout(() => {
      const hasAllInfo = extractedInfo.value.names.name1 && extractedInfo.value.date && extractedInfo.value.courtesy
      const hasSize = sizeStepComplete.value || extractedInfo.value.size
      
      if (hasAllInfo && hasSize) {
        chatMessages.value.push({
          id: Date.now(),
          text: "Perfect! Your image is ready! Let me create your sticker now! 🎨",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        formData.description = accumulatedDescription.value
        setTimeout(() => generateWeddingPreviewFn(), 300)
      } else if (hasAllInfo && !sizeStepComplete.value) {
        chatMessages.value.push({
          id: Date.now(),
          text: "Perfect! Your image is ready! 📸\n\nWhat size would you like the sticker? (e.g., '3x3' or 'default' for 4x4 inches)",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        awaitingSizeDecision.value = true
        scrollToBottom()
      } else {
        chatMessages.value.push({
          id: Date.now(),
          text: "Perfect! Your image is ready! 📸\n\n💡 **Tip:** You can drag the image to reposition it after the design is generated!",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
      }
    }, 300)
  } else {
    pendingImageFile.value = croppedFile
    setTimeout(() => {
      chatMessages.value.push({
        id: Date.now(),
        text: "Nice crop! Would you like me to remove the background from this image? Say 'yes' or 'no'.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      awaitingBackgroundRemovalDecision.value = true
    }, 500)
  }
  
  return true
}

/**
 * Handle post-generation crop completion (update existing image)
 */
export async function handlePostGenerationCropUtil(
  data: CropCompleteData,
  cropImageFile: Ref<File | null>,
  deps: Pick<CropHandlerDeps, 'svgImageManager' | 'weddingPreviewContainer' | 'updateSVGWithImagesFn'>
): Promise<void> {
  const { svgImageManager, weddingPreviewContainer, updateSVGWithImagesFn } = deps
  
  const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement

  if (!svgElement || !cropImageFile.value) {
    console.error('SVG element or crop image file not found')
    return
  }

  const croppedFile = new File([data.blob], cropImageFile.value.name, {
    type: 'image/png',
    lastModified: Date.now()
  })

  // Clear existing images to prevent accumulation/duplication
  svgImageManager.clearAllImages()

  // Add the cropped image using the existing image manager
  await svgImageManager.addImage(croppedFile, svgElement)

  // Update SVG preview with new images
  updateSVGWithImagesFn()
}
