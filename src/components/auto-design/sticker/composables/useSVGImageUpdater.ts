/**
 * SVG Image Updater Composable
 * 
 * Handles updating SVG elements with user-uploaded images,
 * including positioning, clip-paths, and transforms.
 */

import type { Ref } from 'vue'

export interface SVGImageData {
  id: string
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  originalWidth: number
  originalHeight: number
  opacity: number
  zIndex: number
  flipped: boolean
  rotation: number
}

export interface UseSVGImageUpdaterOptions {
  weddingPreviewContainer: Ref<HTMLDivElement | null>
  svgImageManager: {
    images: Ref<SVGImageData[]>
  }
  formData: { customSize?: string }
  preGeneratedImageFile: Ref<File | null>
  makeSVGImageDraggable: (el: SVGImageElement, id: string) => void
}

export interface UseSVGImageUpdaterReturn {
  updateSVGWithImages: () => void
}

export function useSVGImageUpdater(options: UseSVGImageUpdaterOptions): UseSVGImageUpdaterReturn {
  const {
    weddingPreviewContainer,
    svgImageManager,
    formData,
    preGeneratedImageFile,
    makeSVGImageDraggable
  } = options

  function updateSVGWithImages() {
    if (!weddingPreviewContainer.value) {
      console.warn('⚠️ updateSVGWithImages: weddingPreviewContainer not available')
      return
    }

    const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    if (!svgElement) {
      console.warn('⚠️ updateSVGWithImages: SVG element not found')
      return
    }

    const images = svgImageManager.images.value

    console.log('📸 updateSVGWithImages called:', {
      imagesCount: images.length,
      hasImages: images.length > 0,
      firstImageDataUrlLength: images[0]?.dataUrl?.length || 0,
      firstImageId: images[0]?.id || 'none'
    })

    // If no images in manager but we have preGeneratedImageFile, log warning
    if (images.length === 0 && preGeneratedImageFile.value) {
      console.warn('⚠️ No images in svgImageManager but preGeneratedImageFile exists')
    }

    // Check for the specific userImage element we want to control
    let userImageElement = svgElement.querySelector('#userImage') || svgElement.querySelector('#placeholder-image')

    // If no image element exists, create one
    if (!userImageElement && images.length > 0) {
      userImageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      userImageElement.setAttribute('id', 'userImage')
      // IMPORTANT: Insert the user image ABOVE the background layers.
      // Inserting as the first child can put it *behind* the background.
      const bgImage = svgElement.querySelector('#background-image')
      const firstText = svgElement.querySelector('text')

      if (bgImage && bgImage.parentNode === svgElement) {
        bgImage.after(userImageElement)
      } else if (firstText && firstText.parentNode === svgElement) {
        svgElement.insertBefore(userImageElement, firstText)
      } else {
        svgElement.appendChild(userImageElement)
      }
    }

    if (userImageElement && images.length > 0) {
      // Ensure layer ordering: background -> user image -> text
      const bgImage = svgElement.querySelector('#background-image')
      const firstText = svgElement.querySelector('text')
      if (bgImage && bgImage.parentNode === svgElement && bgImage.nextSibling !== userImageElement) {
        bgImage.after(userImageElement)
      } else if (!bgImage && firstText && firstText.parentNode === svgElement) {
        // Keep user image before first text element (above shapes, below text)
        if (userImageElement.nextSibling !== firstText) {
          svgElement.insertBefore(userImageElement, firstText)
        }
      }

      // Use the LAST image (most recent)
      const img = images[images.length - 1]

      // Determine frame dimensions based on SVG size
      const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number)
      const svgWidth = viewBox ? viewBox[2] : parseFloat(svgElement.getAttribute('width') || '400')
      const svgHeight = viewBox ? viewBox[3] : parseFloat(svgElement.getAttribute('height') || '400')

      const isLargeTemplate = svgWidth > 1000

      // Original template dimensions
      const origTemplateWidth = 2996.9
      const origTemplateHeight = 1685.75

      let frameX: number, frameY: number, frameWidth: number, frameHeight: number

      if (isLargeTemplate) {
        const origFrameX = 1400
        const origFrameY = 0
        const origFrameWidth = 1580
        const origFrameHeight = 1685.75

        const scaleX = svgWidth / origTemplateWidth
        const scaleY = svgHeight / origTemplateHeight

        // Check for content wrapper transform offset
        const contentWrapper = svgElement.querySelector('#content-wrapper')
        let offsetX = 0
        let offsetY = 0
        if (contentWrapper) {
          const transform = contentWrapper.getAttribute('transform')
          if (transform) {
            const translateMatch = transform.match(/translate\(\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)/)
            if (translateMatch) {
              offsetX = parseFloat(translateMatch[1])
              offsetY = parseFloat(translateMatch[2])
            }
          }
        }

        frameX = origFrameX * scaleX + offsetX
        frameY = origFrameY * scaleY + offsetY
        frameWidth = origFrameWidth * scaleX
        frameHeight = origFrameHeight * scaleY
      } else {
        // Centered position for smaller templates
        const existingWidth = parseFloat(userImageElement.getAttribute('width') || '0')
        const existingHeight = parseFloat(userImageElement.getAttribute('height') || '0')

        if (existingWidth > 0 && existingHeight > 0) {
          frameX = parseFloat(userImageElement.getAttribute('x') || '0')
          frameY = parseFloat(userImageElement.getAttribute('y') || '0')
          frameWidth = existingWidth
          frameHeight = existingHeight
        } else {
          frameWidth = svgWidth * 0.5
          frameHeight = svgHeight * 0.5
          frameX = (svgWidth - frameWidth) / 2
          frameY = (svgHeight - frameHeight) / 2
        }
      }

      const hasCustomSize = formData.customSize && formData.customSize !== ''

      let adjustedWidth: number
      let adjustedHeight: number
      let adjustedX: number
      let adjustedY: number

      if (hasCustomSize && isLargeTemplate) {
        // Span image to full SVG height
        adjustedHeight = svgHeight
        const frameAspect = frameWidth / frameHeight
        adjustedWidth = adjustedHeight * frameAspect
        adjustedX = frameX + (frameWidth - adjustedWidth) / 2
        adjustedY = 0
        userImageElement.removeAttribute('clip-path')
      } else {
        const scale = (img.width / img.originalWidth) || 1.15
        adjustedWidth = frameWidth * scale
        adjustedHeight = frameHeight * scale
        adjustedX = frameX - (adjustedWidth - frameWidth) / 2
        adjustedY = 0

        // Update clip-path
        const clipPathRect = svgElement.querySelector('clipPath#imageClip rect, defs clipPath#imageClip rect')
        if (clipPathRect && isLargeTemplate) {
          clipPathRect.setAttribute('x', adjustedX.toString())
          clipPathRect.setAttribute('y', '0')
          clipPathRect.setAttribute('width', adjustedWidth.toString())
          clipPathRect.setAttribute('height', svgHeight.toString())
        }
      }

      // Verify dataUrl is valid
      if (!img.dataUrl || img.dataUrl.length < 100) {
        console.error('❌ Invalid or missing dataUrl for image:', img.id)
        return
      }

      userImageElement.setAttribute('x', adjustedX.toString())
      userImageElement.setAttribute('y', adjustedY.toString())
      userImageElement.setAttribute('width', adjustedWidth.toString())
      userImageElement.setAttribute('height', adjustedHeight.toString())
      userImageElement.setAttribute('opacity', (img.opacity / 100).toString())
      userImageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
      userImageElement.setAttribute('href', img.dataUrl)
      
      // Ensure user image is visible
      userImageElement.removeAttribute('display')
      userImageElement.setAttribute('visibility', 'visible')

      userImageElement.setAttribute('data-image-id', img.id)

      // Make draggable
      if (!userImageElement.hasAttribute('data-draggable')) {
        makeSVGImageDraggable(userImageElement as SVGImageElement, img.id)
      }

      if (!userImageElement.hasAttribute('clip-path')) {
        if (userImageElement.id === 'userImage' && isLargeTemplate) {
          userImageElement.setAttribute('clip-path', 'url(#imageClip)')
        }
      }

      userImageElement.setAttribute('preserveAspectRatio', 'xMidYMin slice')

      // Build transforms
      const transforms: string[] = []
      const displayCenterX = adjustedX + adjustedWidth / 2
      const displayCenterY = adjustedY + adjustedHeight / 2

      if (img.flipped) {
        transforms.push(`translate(${displayCenterX}, 0) scale(-1, 1) translate(-${displayCenterX}, 0)`)
      }

      if (img.rotation !== 0) {
        transforms.push(`rotate(${img.rotation} ${displayCenterX} ${displayCenterY})`)
      }

      if (transforms.length > 0) {
        userImageElement.setAttribute('transform', transforms.join(' '))
      } else {
        userImageElement.removeAttribute('transform')
      }

      // Remove old user images
      const existingImages = svgElement.querySelectorAll('image[id^="user-image-"]')
      existingImages.forEach(img => img.remove())

      return
    }

    // Fallback behavior
    const existingImages = svgElement.querySelectorAll('image[id^="user-image-"]')
    existingImages.forEach(img => img.remove())

    if (images.length === 0) return

    const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex)
    const placeholderImage = svgElement.querySelector('#placeholder-image')
    const firstTextElement = svgElement.querySelector('text')
    const insertionPoint = placeholderImage || firstTextElement

    sortedImages.forEach(img => {
      const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')

      imageElement.setAttribute('id', img.id)
      imageElement.setAttribute('x', img.x.toString())
      imageElement.setAttribute('y', img.y.toString())
      imageElement.setAttribute('width', img.width.toString())
      imageElement.setAttribute('height', img.height.toString())
      imageElement.setAttribute('opacity', (img.opacity / 100).toString())
      imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)

      const transforms: string[] = []

      if (img.flipped) {
        const centerX = img.x + img.width / 2
        transforms.push(`translate(${centerX}, 0) scale(-1, 1) translate(-${centerX}, 0)`)
      }

      if (img.rotation !== 0) {
        const centerX = img.x + img.width / 2
        const centerY = img.y + img.height / 2
        transforms.push(`rotate(${img.rotation} ${centerX} ${centerY})`)
      }

      if (transforms.length > 0) {
        imageElement.setAttribute('transform', transforms.join(' '))
      }

      if (insertionPoint && insertionPoint.parentNode === svgElement) {
        svgElement.insertBefore(imageElement, insertionPoint)
      } else {
        svgElement.appendChild(imageElement)
      }
    })
  }

  return {
    updateSVGWithImages
  }
}
