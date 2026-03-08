import { ref, computed, type Ref } from 'vue'
import { useElementBounding, useWindowSize } from '@vueuse/core'
import { autoUpdate, computePosition, flip, shift, offset, arrow, type Placement } from '@floating-ui/dom'

export interface FloatingPositionOptions {
  offset?: number
  placement?: Placement
  fallbackPlacements?: Placement[]
  boundary?: Element | null
}

export interface ElementBounds {
  x: number
  y: number
  width: number
  height: number
}

export function useFloatingPosition(
  referenceElement: Ref<HTMLElement | null>,
  floatingElement: Ref<HTMLElement | null>,
  options: FloatingPositionOptions = {}
) {
  const {
    offset: offsetValue = 8,
    placement = 'right-start',
    fallbackPlacements = ['left-start', 'top-start', 'bottom-start'],
    boundary = null
  } = options

  const x = ref(0)
  const y = ref(0)
  const strategy = ref<'absolute' | 'fixed'>('absolute')
  const actualPlacement = ref<Placement>(placement)
  const isVisible = ref(false)

  const { width: windowWidth, height: windowHeight } = useWindowSize()

  // Arrow element ref for arrow positioning
  const arrowElement = ref<HTMLElement | null>(null)
  const arrowX = ref(0)
  const arrowY = ref(0)

  let cleanup: (() => void) | null = null

  const update = async () => {
    if (!referenceElement.value || !floatingElement.value) {
      return
    }

    const middleware = [
      offset(offsetValue),
      flip({
        fallbackPlacements,
        boundary: boundary || undefined
      }),
      shift({
        boundary: boundary || undefined,
        padding: 8
      })
    ]

    // Add arrow middleware if arrow element exists
    if (arrowElement.value) {
      middleware.push(arrow({ element: arrowElement.value }))
    }

    const { x: newX, y: newY, strategy: newStrategy, placement: newPlacement, middlewareData } = 
      await computePosition(referenceElement.value, floatingElement.value, {
        placement,
        middleware,
        strategy: 'absolute'
      })

    x.value = newX
    y.value = newY
    strategy.value = newStrategy
    actualPlacement.value = newPlacement

    // Update arrow position if arrow middleware was used
    if (middlewareData.arrow && arrowElement.value) {
      const { x: arrowXPos, y: arrowYPos } = middlewareData.arrow
      arrowX.value = arrowXPos ?? 0
      arrowY.value = arrowYPos ?? 0
    }
  }

  const startAutoUpdate = () => {
    if (!referenceElement.value || !floatingElement.value) {
      return
    }

    cleanup = autoUpdate(referenceElement.value, floatingElement.value, update)
  }

  const stopAutoUpdate = () => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  }

  const show = () => {
    isVisible.value = true
    startAutoUpdate()
  }

  const hide = () => {
    isVisible.value = false
    stopAutoUpdate()
  }

  // Computed styles for the floating element
  const floatingStyles = computed(() => ({
    position: strategy.value,
    top: `${y.value}px`,
    left: `${x.value}px`,
    zIndex: 1000
  }))

  // Computed styles for the arrow element
  const arrowStyles = computed(() => {
    const side = actualPlacement.value.split('-')[0]
    
    const staticSide = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right'
    }[side]

    return {
      position: 'absolute' as const,
      left: arrowX.value != null ? `${arrowX.value}px` : '',
      top: arrowY.value != null ? `${arrowY.value}px` : '',
      [staticSide!]: '-4px',
      transform: 'rotate(45deg)',
      width: '8px',
      height: '8px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb'
    }
  })

  // Manual positioning function for custom element bounds
  const positionFromBounds = (bounds: ElementBounds) => {
    const panelWidth = floatingElement.value?.offsetWidth || 320
    const panelHeight = floatingElement.value?.offsetHeight || 200
    
    let newX = bounds.x + bounds.width + offsetValue
    let newY = bounds.y

    // Check if panel would overflow right edge
    if (newX + panelWidth > windowWidth.value) {
      newX = bounds.x - panelWidth - offsetValue
    }

    // Check if panel would overflow bottom edge
    if (newY + panelHeight > windowHeight.value) {
      newY = windowHeight.value - panelHeight - 16
    }

    // Check if panel would overflow top edge
    if (newY < 16) {
      newY = 16
    }

    // Check if panel would overflow left edge (fallback to right side)
    if (newX < 16) {
      newX = bounds.x + bounds.width + offsetValue
      // If still overflowing, center it
      if (newX + panelWidth > windowWidth.value) {
        newX = Math.max(16, (windowWidth.value - panelWidth) / 2)
      }
    }

    x.value = newX
    y.value = newY
    strategy.value = 'fixed'
  }

  return {
    x,
    y,
    strategy,
    actualPlacement,
    isVisible,
    arrowElement,
    arrowX,
    arrowY,
    floatingStyles,
    arrowStyles,
    update,
    show,
    hide,
    startAutoUpdate,
    stopAutoUpdate,
    positionFromBounds
  }
}

// Utility function to get element bounds from canvas coordinates
export function getCanvasElementBounds(
  element: { x: number; y: number; width: number; height: number },
  canvasContainer: HTMLElement,
  zoom: number = 1
): ElementBounds {
  const containerRect = canvasContainer.getBoundingClientRect()
  
  return {
    x: containerRect.left + (element.x * zoom),
    y: containerRect.top + (element.y * zoom),
    width: element.width * zoom,
    height: element.height * zoom
  }
}
