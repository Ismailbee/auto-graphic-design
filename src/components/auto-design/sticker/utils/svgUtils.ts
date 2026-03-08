/**
 * SVG Utility Functions
 * 
 * Extracted from StickerTemplatePanel.vue to reduce file size.
 * These functions handle SVG manipulation, image positioning, and resizing.
 */

import { nextTick } from 'vue'

// ============================================
// MAKE SVG IMAGE DRAGGABLE
// ============================================

interface ImageManager {
  images: { value: Array<{ id: string; flipped: boolean; width: number; originalWidth: number; height: number; originalHeight: number }> }
  updateImage: (id: string, updates: Record<string, any>) => void
}

export function makeSVGImageDraggable(
  imageElement: SVGImageElement, 
  imageId: string, 
  svgImageManager: ImageManager
) {
  // Skip if already made draggable
  if (imageElement.getAttribute('data-draggable') === 'true') {
    return
  }

  let isDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0
  let initialDistance = 0
  let initialScale = 1
  let baseWidth = 0
  let baseHeight = 0

  // Add visual feedback
  imageElement.style.cursor = 'grab'
  imageElement.style.transition = 'opacity 0.2s, filter 0.2s'
  imageElement.setAttribute('data-draggable', 'true')
  
  // Hover effects
  const handleMouseEnter = () => {
    if (!isDragging) {
      imageElement.style.filter = 'brightness(1.05)'
    }
  }
  const handleMouseLeave = () => {
    if (!isDragging) {
      imageElement.style.filter = 'none'
    }
  }
  
  imageElement.addEventListener('mouseenter', handleMouseEnter)
  imageElement.addEventListener('mouseleave', handleMouseLeave)

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true
    const svgElement = imageElement.ownerSVGElement
    if (!svgElement) return

    const pt = svgElement.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

    startX = svgPt.x
    startY = svgPt.y
    initialX = parseFloat(imageElement.getAttribute('x') || '0')
    initialY = parseFloat(imageElement.getAttribute('y') || '0')

    imageElement.style.opacity = '0.8'
    imageElement.style.cursor = 'grabbing'
    imageElement.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const svgElement = imageElement.ownerSVGElement
    if (!svgElement) return

    const pt = svgElement.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

    let dx = svgPt.x - startX
    const dy = svgPt.y - startY

    // If image is flipped, invert horizontal drag direction
    const img = svgImageManager.images.value.find(i => i.id === imageId)
    if (img && img.flipped) {
      dx = -dx
    }

    const newX = initialX + dx
    const newY = initialY + dy

    imageElement.setAttribute('x', newX.toString())
    imageElement.setAttribute('y', newY.toString())

    svgImageManager.updateImage(imageId, { x: newX, y: newY })
    e.preventDefault()
  }

  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false
      imageElement.style.opacity = '1'
      imageElement.style.cursor = 'grab'
      imageElement.style.filter = 'none'
    }
  }

  // Touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging = true
      const svgElement = imageElement.ownerSVGElement
      if (!svgElement) return

      const touch = e.touches[0]
      const pt = svgElement.createSVGPoint()
      pt.x = touch.clientX
      pt.y = touch.clientY
      const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

      startX = svgPt.x
      startY = svgPt.y
      initialX = parseFloat(imageElement.getAttribute('x') || '0')
      initialY = parseFloat(imageElement.getAttribute('y') || '0')

      imageElement.style.opacity = '0.8'
      imageElement.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
    } else if (e.touches.length === 2) {
      isDragging = false
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const img = svgImageManager.images.value.find(i => i.id === imageId)
      initialScale = img ? (img.width / img.originalWidth) : 1.15
      
      const currentWidth = parseFloat(imageElement.getAttribute('width') || '0')
      const currentHeight = parseFloat(imageElement.getAttribute('height') || '0')
      const safeScale = initialScale > 0 ? initialScale : 1
      baseWidth = currentWidth / safeScale
      baseHeight = currentHeight / safeScale
    }
    e.preventDefault()
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const svgElement = imageElement.ownerSVGElement
      if (!svgElement) return

      const touch = e.touches[0]
      const pt = svgElement.createSVGPoint()
      pt.x = touch.clientX
      pt.y = touch.clientY
      const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

      let dx = svgPt.x - startX
      const dy = svgPt.y - startY

      const img = svgImageManager.images.value.find(i => i.id === imageId)
      if (img && img.flipped) {
        dx = -dx
      }

      const newX = initialX + dx
      const newY = initialY + dy

      imageElement.setAttribute('x', newX.toString())
      imageElement.setAttribute('y', newY.toString())
      svgImageManager.updateImage(imageId, { x: newX, y: newY })
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const scaleFactor = currentDistance / initialDistance
      const newScale = Math.max(0.5, Math.min(2.5, initialScale * scaleFactor))
      
      const img = svgImageManager.images.value.find(i => i.id === imageId)
      if (img) {
        const adjustedWidth = baseWidth * newScale
        const adjustedHeight = baseHeight * newScale
        
        imageElement.setAttribute('width', adjustedWidth.toString())
        imageElement.setAttribute('height', adjustedHeight.toString())
        
        const currentX = parseFloat(imageElement.getAttribute('x') || '0')
        const currentY = parseFloat(imageElement.getAttribute('y') || '0')
        svgImageManager.updateImage(imageId, { 
          x: currentX,
          y: currentY,
          scale: newScale 
        } as any)
      }
    }
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    if (isDragging) {
      isDragging = false
      imageElement.style.opacity = '1'
      imageElement.style.filter = 'none'
    }
  }

  // Add event listeners
  imageElement.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  imageElement.addEventListener('touchstart', handleTouchStart, { passive: false })
  imageElement.addEventListener('touchmove', handleTouchMove, { passive: false })
  imageElement.addEventListener('touchend', handleTouchEnd)

  // Store cleanup function
  const cleanup = () => {
    imageElement.removeEventListener('mousedown', handleMouseDown)
    imageElement.removeEventListener('mouseenter', handleMouseEnter)
    imageElement.removeEventListener('mouseleave', handleMouseLeave)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    imageElement.removeEventListener('touchstart', handleTouchStart)
    imageElement.removeEventListener('touchmove', handleTouchMove)
    imageElement.removeEventListener('touchend', handleTouchEnd)
  }

  ;(imageElement as any).__dragCleanup = cleanup
}

// ============================================
// UPDATE SVG WITH IMAGES
// ============================================

interface SVGImage {
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

interface UpdateSVGDeps {
  weddingPreviewContainer: { value: HTMLDivElement | null }
  svgImageManager: { images: { value: SVGImage[] } }
  formData: { customSize?: string }
  preGeneratedImageFile: { value: File | null }
  makeSVGImageDraggableFn: (el: SVGImageElement, id: string) => void
}

export function updateSVGWithImages(deps: UpdateSVGDeps) {
  const { weddingPreviewContainer, svgImageManager, formData, preGeneratedImageFile, makeSVGImageDraggableFn } = deps
  
  console.log('🖼️ updateSVGWithImages called:', {
    hasContainer: !!weddingPreviewContainer.value,
    imagesCount: svgImageManager.images.value.length,
    hasPreGeneratedFile: !!preGeneratedImageFile.value
  })
  
  if (!weddingPreviewContainer.value) {
    console.warn('⚠️ updateSVGWithImages: no weddingPreviewContainer')
    return
  }

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    console.warn('⚠️ updateSVGWithImages: no SVG element in container')
    return
  }

  const images = svgImageManager.images.value
  console.log('🖼️ updateSVGWithImages: images array:', images.map(img => ({
    id: img.id,
    hasDataUrl: !!img.dataUrl,
    dataUrlLength: img.dataUrl?.length || 0
  })))
  
  // Check for userImage element
  let userImageElement = svgElement.querySelector('#userImage') || svgElement.querySelector('#placeholder-image')
  console.log('🖼️ updateSVGWithImages: found userImageElement?', !!userImageElement, userImageElement?.id)
  
  // Create if needed
  if (!userImageElement && images.length > 0) {
    userImageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    userImageElement.setAttribute('id', 'userImage')
    // Insert ABOVE background layers (not as first child).
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
    const img = images[images.length - 1]

    const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number)
    const svgWidth = viewBox ? viewBox[2] : parseFloat(svgElement.getAttribute('width') || '400')
    const svgHeight = viewBox ? viewBox[3] : parseFloat(svgElement.getAttribute('height') || '400')
    
    const isLargeTemplate = svgWidth > 1000
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
      
      const clipPathRect = svgElement.querySelector('clipPath#imageClip rect, defs clipPath#imageClip rect')
      if (clipPathRect && isLargeTemplate) {
        const clipX = adjustedX
        const clipY = 0
        const clipWidth = adjustedWidth
        const clipHeight = svgHeight
        clipPathRect.setAttribute('x', clipX.toString())
        clipPathRect.setAttribute('y', clipY.toString())
        clipPathRect.setAttribute('width', clipWidth.toString())
        clipPathRect.setAttribute('height', clipHeight.toString())
      }
    }
    
    if (!img.dataUrl || img.dataUrl.length < 100) {
      console.error('Invalid dataUrl for image:', img.id)
      return
    }
    
    console.log('🖼️ updateSVGWithImages: setting image attributes', {
      id: img.id,
      dataUrlLength: img.dataUrl?.length || 0,
      dataUrlStart: img.dataUrl?.substring(0, 50) || 'none',
      x: adjustedX,
      y: adjustedY,
      width: adjustedWidth,
      height: adjustedHeight
    })
    
    userImageElement.setAttribute('x', adjustedX.toString())
    userImageElement.setAttribute('y', adjustedY.toString())
    userImageElement.setAttribute('width', adjustedWidth.toString())
    userImageElement.setAttribute('height', adjustedHeight.toString())
    userImageElement.setAttribute('opacity', (img.opacity / 100).toString())
    userImageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
    userImageElement.setAttribute('href', img.dataUrl)
    
    // Verify the href was actually set
    const verifyHref = userImageElement.getAttribute('href')
    console.log('🖼️ updateSVGWithImages: verified href set?', {
      hrefLength: verifyHref?.length || 0,
      hrefStart: verifyHref?.substring(0, 50) || 'none'
    })
    
    userImageElement.setAttribute('data-image-id', img.id)
    
    if (!userImageElement.hasAttribute('data-draggable')) {
      makeSVGImageDraggableFn(userImageElement as SVGImageElement, img.id)
    }
    
    if (!userImageElement.hasAttribute('clip-path')) {
      if (userImageElement.id === 'userImage' && isLargeTemplate) {
        userImageElement.setAttribute('clip-path', 'url(#imageClip)')
      }
    }
    userImageElement.setAttribute('preserveAspectRatio', 'xMidYMin slice')

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
  let insertionPoint = placeholderImage || firstTextElement

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

// ============================================
// HANDLE SIZE CHANGE
// ============================================

interface SizeChangeDeps {
  weddingPreviewContainer: { value: HTMLDivElement | null }
  updateSVGWithImagesFn: () => void
  updateChatPreviewSVG: () => void
}

export async function handleSizeChange(
  widthInches: number, 
  heightInches: number,
  deps: SizeChangeDeps
) {
  const { weddingPreviewContainer, updateSVGWithImagesFn, updateChatPreviewSVG } = deps
  
  if (!weddingPreviewContainer.value) return

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) return

  // Get/store original viewBox
  let originalViewBox = svgElement.getAttribute('data-original-viewbox')?.split(/\s+|,/).map(Number)

  if (!originalViewBox || originalViewBox.length !== 4) {
    const currentViewBox = svgElement.getAttribute('viewBox')?.split(/\s+|,/).map(Number)
    if (currentViewBox && currentViewBox.length === 4) {
      svgElement.setAttribute('data-original-viewbox', currentViewBox.join(' '))
      originalViewBox = currentViewBox
    } else {
      const w = parseFloat(svgElement.getAttribute('width') || '1600')
      const h = parseFloat(svgElement.getAttribute('height') || '1600')
      originalViewBox = [0, 0, w, h]
      svgElement.setAttribute('data-original-viewbox', originalViewBox.join(' '))
    }
  }

  const origWidth = originalViewBox[2]
  const origHeight = originalViewBox[3]

  const DPI = 300
  const widthPixels = widthInches * DPI
  const heightPixels = heightInches * DPI

  const origAspectRatio = origWidth / origHeight
  const newAspectRatio = widthInches / heightInches

  svgElement.setAttribute('data-export-width', `${widthInches}in`)
  svgElement.setAttribute('data-export-height', `${heightInches}in`)
  svgElement.setAttribute('data-export-width-px', `${widthPixels}`)
  svgElement.setAttribute('data-export-height-px', `${heightPixels}`)

  let newViewBoxWidth: number
  let newViewBoxHeight: number

  if (newAspectRatio > origAspectRatio) {
    newViewBoxHeight = origHeight
    newViewBoxWidth = origHeight * newAspectRatio
  } else {
    newViewBoxWidth = origWidth
    newViewBoxHeight = origWidth / newAspectRatio
  }

  svgElement.setAttribute('viewBox', `0 0 ${newViewBoxWidth} ${newViewBoxHeight}`)
  svgElement.setAttribute('width', `${widthPixels}`)
  svgElement.setAttribute('height', `${heightPixels}`)
  svgElement.style.width = '100%'
  svgElement.style.height = 'auto'
  svgElement.style.maxWidth = '100%'
  svgElement.style.display = 'block'

  const contentOffsetX = (newViewBoxWidth - origWidth) / 2
  const contentOffsetY = (newViewBoxHeight - origHeight) / 2

  let contentWrapper = svgElement.querySelector('#content-wrapper') as SVGGElement

  if (!contentWrapper) {
    contentWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    contentWrapper.setAttribute('id', 'content-wrapper')
    const children = Array.from(svgElement.children)
    children.forEach(child => {
      if (child.tagName !== 'defs' && child.id !== 'content-wrapper') {
        contentWrapper.appendChild(child)
      }
    })
    svgElement.appendChild(contentWrapper)
  }

  if (contentOffsetX !== 0 || contentOffsetY !== 0) {
    contentWrapper.setAttribute('transform', `translate(${contentOffsetX}, ${contentOffsetY})`)
  } else {
    contentWrapper.removeAttribute('transform')
  }

  // Update background rects
  const bgRects = svgElement.querySelectorAll('rect')
  bgRects.forEach(rect => {
    const rectW = parseFloat(rect.getAttribute('width') || '0')
    const rectH = parseFloat(rect.getAttribute('height') || '0')
    if (Math.abs(rectW - origWidth) < 10 && Math.abs(rectH - origHeight) < 10) {
      rect.setAttribute('x', '0')
      rect.setAttribute('y', '0')
      rect.setAttribute('width', String(newViewBoxWidth))
      rect.setAttribute('height', String(newViewBoxHeight))
      if (rect.parentElement === (contentWrapper as unknown as HTMLElement)) {
        svgElement.insertBefore(rect, contentWrapper)
      }
    }
  })
  
  // Update clip-path
  const clipPathRect = svgElement.querySelector('clipPath#imageClip rect, defs clipPath#imageClip rect')
  if (clipPathRect) {
    const origClipX = 1400
    const origClipWidth = 1580
    const scaleX = newViewBoxWidth / origWidth
    
    const newClipX = origClipX * scaleX + contentOffsetX
    const newClipWidth = origClipWidth * scaleX
    
    clipPathRect.setAttribute('x', String(newClipX))
    clipPathRect.setAttribute('y', '0')
    clipPathRect.setAttribute('width', String(newClipWidth))
    clipPathRect.setAttribute('height', String(newViewBoxHeight))
  }

  // Scale wave paths
  const wavePaths = svgElement.querySelectorAll('path[fill="#FFCC29"], path[fill="url(#g1)"], path[fill="#507C95"], path[fill="#104C6E"]')
  if (wavePaths.length > 0) {
    const heightRatio = newViewBoxHeight / origHeight
    wavePaths.forEach((path) => {
      const d = path.getAttribute('d')
      if (d) {
        const scaledD = d.replace(/v([\d.]+)/g, (match, val) => {
          const scaledVal = parseFloat(val) * heightRatio
          return `v${scaledVal.toFixed(2)}`
        })
        
        const finalD = scaledD.replace(/([MmCcSsQqTtAaLlHhVv])([\d.-]+)\s+([\d.-]+)/g, (match, cmd, x, y) => {
          if (cmd === 'M' || cmd === 'm' || cmd === 'c' || cmd === 'C') {
            return `${cmd}${x} ${(parseFloat(y) * heightRatio).toFixed(2)}`
          }
          return match
        })
        
        path.setAttribute('d', finalD)
      }
    })
  }

  // Reposition text elements
  const heightDelta = newViewBoxHeight - origHeight
  if (heightDelta > 0) {
    const textOffset = heightDelta * 0.3
    
    const dateTextEl = svgElement.querySelector('#date-text') as SVGTextElement
    if (dateTextEl) {
      const currentY = parseFloat(dateTextEl.getAttribute('y') || '1480')
      dateTextEl.setAttribute('y', String(currentY + textOffset))
    }
    
    const courtesyTextEl = svgElement.querySelector('#courtesy-text') as SVGTextElement
    if (courtesyTextEl) {
      const currentY = parseFloat(courtesyTextEl.getAttribute('y') || '1600')
      courtesyTextEl.setAttribute('y', String(currentY + textOffset))
    }
    
    const weddingNamesGroup = svgElement.querySelector('#wedding-names-group') as SVGGElement
    if (weddingNamesGroup) {
      const transform = weddingNamesGroup.getAttribute('transform') || 'translate(400, 900) scale(2.5)'
      const translateMatch = transform.match(/translate\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)/)
      if (translateMatch) {
        const currentX = parseFloat(translateMatch[1])
        const currentY = parseFloat(translateMatch[2])
        const newTransform = transform.replace(/translate\([^)]+\)/, `translate(${currentX}, ${currentY + textOffset})`)
        weddingNamesGroup.setAttribute('transform', newTransform)
      }
    }
  }

  // Update background image
  const bgImage = svgElement.querySelector('#background-image') as SVGImageElement
  if (bgImage) {
    bgImage.setAttribute('width', String(newViewBoxWidth))
    bgImage.setAttribute('height', String(newViewBoxHeight))
    bgImage.setAttribute('x', '0')
    bgImage.setAttribute('y', '0')
  }

  await nextTick()
  updateSVGWithImagesFn()
  updateChatPreviewSVG()
}
