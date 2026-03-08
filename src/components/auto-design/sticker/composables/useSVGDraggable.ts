/**
 * SVG Draggable Composable
 * 
 * Makes SVG image elements draggable with mouse and touch support.
 * Includes pinch-to-zoom functionality for mobile devices.
 */

import type { Ref } from 'vue'

export interface SVGImage {
  id: string
  x: number
  y: number
  width: number
  height: number
  originalWidth: number
  originalHeight: number
  flipped: boolean
}

export interface SVGImageManager {
  images: Ref<SVGImage[]>
  updateImage: (id: string, updates: Partial<SVGImage>) => void
}

export interface UseSVGDraggableOptions {
  svgImageManager: SVGImageManager
}

export interface UseSVGDraggableReturn {
  makeSVGImageDraggable: (imageElement: SVGImageElement, imageId: string) => void
  cleanupDraggable: (imageElement: SVGImageElement) => void
}

export function useSVGDraggable(options: UseSVGDraggableOptions): UseSVGDraggableReturn {
  const { svgImageManager } = options

  function makeSVGImageDraggable(imageElement: SVGImageElement, imageId: string) {
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

    // Add visual feedback - make it clear the image is draggable
    imageElement.style.cursor = 'grab'
    imageElement.style.transition = 'opacity 0.2s, filter 0.2s'
    imageElement.setAttribute('data-draggable', 'true')

    // Add hover effect to indicate draggability
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

      // Update the image manager with new position
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

    // Touch event handlers for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - drag
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
        // Two finger - pinch to zoom
        isDragging = false
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )

        const img = svgImageManager.images.value.find(i => i.id === imageId)
        // Calculate scale from current dimensions vs original dimensions
        initialScale = img ? (img.width / img.originalWidth) : 1.15

        // Calculate base dimensions from current element size and scale
        const currentWidth = parseFloat(imageElement.getAttribute('width') || '0')
        const currentHeight = parseFloat(imageElement.getAttribute('height') || '0')

        // Avoid division by zero or invalid scale
        const safeScale = initialScale > 0 ? initialScale : 1
        baseWidth = currentWidth / safeScale
        baseHeight = currentHeight / safeScale
      }
      e.preventDefault()
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        // Single touch - drag
        const svgElement = imageElement.ownerSVGElement
        if (!svgElement) return

        const touch = e.touches[0]
        const pt = svgElement.createSVGPoint()
        pt.x = touch.clientX
        pt.y = touch.clientY
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

        // Update the image manager with new position
        svgImageManager.updateImage(imageId, { x: newX, y: newY })
      } else if (e.touches.length === 2) {
        // Two finger - pinch to zoom
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )

        const scaleFactor = currentDistance / initialDistance
        const newScale = Math.max(0.5, Math.min(2.5, initialScale * scaleFactor))

        // Update image scale
        const img = svgImageManager.images.value.find(i => i.id === imageId)
        if (img) {
          // Use calculated base dimensions instead of hardcoded values
          const adjustedWidth = baseWidth * newScale
          const adjustedHeight = baseHeight * newScale

          imageElement.setAttribute('width', adjustedWidth.toString())
          imageElement.setAttribute('height', adjustedHeight.toString())

          // Update in manager (will trigger re-render)
          const currentX = parseFloat(imageElement.getAttribute('x') || '0')
          const currentY = parseFloat(imageElement.getAttribute('y') || '0')
          svgImageManager.updateImage(imageId, {
            x: currentX,
            y: currentY,
            width: adjustedWidth,
            height: adjustedHeight
          })
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

    // Touch events
    imageElement.addEventListener('touchstart', handleTouchStart, { passive: false })
    imageElement.addEventListener('touchmove', handleTouchMove, { passive: false })
    imageElement.addEventListener('touchend', handleTouchEnd)

    // Store cleanup function
    const cleanup = () => {
      imageElement.removeEventListener('mouseenter', handleMouseEnter)
      imageElement.removeEventListener('mouseleave', handleMouseLeave)
      imageElement.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      imageElement.removeEventListener('touchstart', handleTouchStart)
      imageElement.removeEventListener('touchmove', handleTouchMove)
      imageElement.removeEventListener('touchend', handleTouchEnd)
    }

    // Store cleanup reference on element
    ;(imageElement as any).__dragCleanup = cleanup
  }

  function cleanupDraggable(imageElement: SVGImageElement) {
    const cleanup = (imageElement as any).__dragCleanup
    if (typeof cleanup === 'function') {
      cleanup()
      delete (imageElement as any).__dragCleanup
    }
    imageElement.removeAttribute('data-draggable')
  }

  return {
    makeSVGImageDraggable,
    cleanupDraggable
  }
}
