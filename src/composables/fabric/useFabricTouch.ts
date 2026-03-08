/**
 * Fabric.js v6 Touch Composable
 * Mobile touch gestures: pinch-zoom, pan, two-finger rotation
 */

import { ref, watch, onUnmounted } from 'vue'
import type { Canvas } from 'fabric'
import type { UseFabricCanvasReturn } from './useFabricCanvas'

interface TouchState {
  isPinching: boolean
  isPanning: boolean
  lastDistance: number
  lastAngle: number
  lastCenter: { x: number; y: number }
  startZoom: number
  startViewport: { x: number; y: number }
}

export function useFabricTouch(canvasComposable: UseFabricCanvasReturn) {
  const { canvas, containerRef, zoom, panX, panY, setZoom, setPan } = canvasComposable

  const isMultiTouch = ref(false)
  const touchCount = ref(0)
  
  const touchState: TouchState = {
    isPinching: false,
    isPanning: false,
    lastDistance: 0,
    lastAngle: 0,
    lastCenter: { x: 0, y: 0 },
    startZoom: 1,
    startViewport: { x: 0, y: 0 }
  }

  const getDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getCenter = (touches: TouchList): { x: number; y: number } => {
    if (touches.length < 2) return { x: touches[0]?.clientX || 0, y: touches[0]?.clientY || 0 }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    }
  }

  const getAngle = (touches: TouchList): number => {
    if (touches.length < 2) return 0
    return Math.atan2(
      touches[1].clientY - touches[0].clientY,
      touches[1].clientX - touches[0].clientX
    )
  }

  const handleTouchStart = (e: TouchEvent) => {
    touchCount.value = e.touches.length
    
    if (e.touches.length === 2) {
      e.preventDefault()
      isMultiTouch.value = true
      touchState.isPinching = true
      touchState.lastDistance = getDistance(e.touches)
      touchState.lastAngle = getAngle(e.touches)
      touchState.lastCenter = getCenter(e.touches)
      touchState.startZoom = zoom.value
      touchState.startViewport = { x: panX.value, y: panY.value }
      
      // Disable fabric selection during pinch
      if (canvas.value) {
        canvas.value.selection = false
      }
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!canvas.value) return
    
    if (e.touches.length === 2 && touchState.isPinching) {
      e.preventDefault()
      
      const currentDistance = getDistance(e.touches)
      const currentCenter = getCenter(e.touches)
      
      // Pinch zoom
      if (touchState.lastDistance > 0) {
        const scale = currentDistance / touchState.lastDistance
        const newZoom = Math.min(Math.max(touchState.startZoom * scale, 0.1), 5)
        setZoom(newZoom)
      }
      
      // Pan
      const dx = currentCenter.x - touchState.lastCenter.x
      const dy = currentCenter.y - touchState.lastCenter.y
      setPan(panX.value + dx, panY.value + dy)
      
      touchState.lastCenter = currentCenter
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    touchCount.value = e.touches.length
    
    if (e.touches.length < 2) {
      touchState.isPinching = false
      isMultiTouch.value = false
      
      // Re-enable fabric selection
      if (canvas.value) {
        canvas.value.selection = true
      }
    }
  }

  const setupTouchListeners = () => {
    const container = containerRef.value
    if (!container) return
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false })
  }

  const removeTouchListeners = () => {
    const container = containerRef.value
    if (!container) return
    
    container.removeEventListener('touchstart', handleTouchStart)
    container.removeEventListener('touchmove', handleTouchMove)
    container.removeEventListener('touchend', handleTouchEnd)
    container.removeEventListener('touchcancel', handleTouchEnd)
  }

  // Add double-tap to reset zoom
  let lastTapTime = 0
  const handleDoubleTap = (e: TouchEvent) => {
    const now = Date.now()
    if (now - lastTapTime < 300 && e.touches.length === 1) {
      e.preventDefault()
      setZoom(1)
      setPan(0, 0)
    }
    lastTapTime = now
  }

  // Setup when container is available
  watch(() => containerRef.value, (container) => {
    if (container) {
      setupTouchListeners()
      container.addEventListener('touchstart', handleDoubleTap, { passive: false })
    }
  }, { immediate: true })

  onUnmounted(() => {
    removeTouchListeners()
    const container = containerRef.value
    if (container) {
      container.removeEventListener('touchstart', handleDoubleTap)
    }
  })

  return {
    isMultiTouch,
    touchCount,
    setupTouchListeners,
    removeTouchListeners
  }
}

export type UseFabricTouchReturn = ReturnType<typeof useFabricTouch>
