/**
 * Fabric.js v6 Canvas Composable
 * Core canvas initialization and management
 */

import { ref, shallowRef, computed, onUnmounted } from 'vue'
import { Canvas, FabricImage, Line, FabricObject, Point } from 'fabric'

export interface CanvasConfig {
  width: number
  height: number
  backgroundColor: string
  gridSize?: number
  minZoom?: number
  maxZoom?: number
}

export interface CanvasState {
  zoom: number
  panX: number
  panY: number
  gridEnabled: boolean
  snapEnabled: boolean
  isReady: boolean
}

export function useFabricCanvas(initialConfig?: Partial<CanvasConfig>) {
  const canvas = shallowRef<Canvas | null>(null)
  
  const config = ref<CanvasConfig>({
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    gridSize: 20,
    minZoom: 0.1,
    maxZoom: 5,
    ...initialConfig
  })
  
  const state = ref<CanvasState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    gridEnabled: false,
    snapEnabled: false,
    isReady: false
  })

  const containerRef = ref<HTMLElement | null>(null)
  const gridLines: Line[] = []

  const currentZoom = computed(() => state.value.zoom)
  const canZoomIn = computed(() => state.value.zoom < (config.value.maxZoom || 5))
  const canZoomOut = computed(() => state.value.zoom > (config.value.minZoom || 0.1))

  const initCanvas = (canvasElement: HTMLCanvasElement, container?: HTMLElement) => {
    if (canvas.value) disposeCanvas()
    containerRef.value = container || null

    canvas.value = new Canvas(canvasElement, {
      width: config.value.width,
      height: config.value.height,
      backgroundColor: config.value.backgroundColor,
      selection: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      controlsAboveOverlay: true,
    })

    setupEventListeners()
    state.value.isReady = true
    return canvas.value
  }

  const setupEventListeners = () => {
    if (!canvas.value) return

    // Mouse wheel zoom
    canvas.value.on('mouse:wheel', (opt) => {
      const event = opt.e as WheelEvent
      event.preventDefault()
      event.stopPropagation()

      let zoom = canvas.value!.getZoom()
      zoom *= 0.999 ** event.deltaY
      zoom = Math.max(config.value.minZoom!, Math.min(config.value.maxZoom!, zoom))

      canvas.value!.zoomToPoint(new Point(event.offsetX, event.offsetY), zoom)
      state.value.zoom = zoom
    })

    // Pan with alt+drag
    let isPanning = false
    let lastX = 0, lastY = 0

    canvas.value.on('mouse:down', (opt) => {
      const e = opt.e as MouseEvent
      if (e.altKey || e.button === 1) {
        isPanning = true
        canvas.value!.selection = false
        lastX = e.clientX
        lastY = e.clientY
      }
    })

    canvas.value.on('mouse:move', (opt) => {
      if (!isPanning) return
      const e = opt.e as MouseEvent
      const vpt = canvas.value!.viewportTransform!
      vpt[4] += e.clientX - lastX
      vpt[5] += e.clientY - lastY
      canvas.value!.requestRenderAll()
      lastX = e.clientX
      lastY = e.clientY
      state.value.panX = vpt[4]
      state.value.panY = vpt[5]
    })

    canvas.value.on('mouse:up', () => {
      isPanning = false
      canvas.value!.selection = true
    })

    // Snap to grid
    canvas.value.on('object:moving', (opt) => {
      if (!state.value.snapEnabled || !opt.target) return
      const gridSize = config.value.gridSize || 20
      opt.target.set({
        left: Math.round(opt.target.left! / gridSize) * gridSize,
        top: Math.round(opt.target.top! / gridSize) * gridSize
      })
    })
  }

  const zoomIn = (factor = 1.1) => {
    if (!canvas.value || !canZoomIn.value) return
    const newZoom = Math.min(state.value.zoom * factor, config.value.maxZoom!)
    canvas.value.zoomToPoint(canvas.value.getCenterPoint(), newZoom)
    state.value.zoom = newZoom
  }

  const zoomOut = (factor = 1.1) => {
    if (!canvas.value || !canZoomOut.value) return
    const newZoom = Math.max(state.value.zoom / factor, config.value.minZoom!)
    canvas.value.zoomToPoint(canvas.value.getCenterPoint(), newZoom)
    state.value.zoom = newZoom
  }

  const resetZoom = () => {
    if (!canvas.value) return
    canvas.value.setViewportTransform([1, 0, 0, 1, 0, 0])
    state.value.zoom = 1
    state.value.panX = 0
    state.value.panY = 0
  }

  const fitToView = () => {
    if (!canvas.value || !containerRef.value) return
    const cw = containerRef.value.clientWidth
    const ch = containerRef.value.clientHeight
    const zoom = Math.min((cw * 0.9) / config.value.width, (ch * 0.9) / config.value.height, 1)
    
    canvas.value.zoomToPoint(canvas.value.getCenterPoint(), zoom)
    const vpt = canvas.value.viewportTransform!
    vpt[4] = (cw - config.value.width * zoom) / 2
    vpt[5] = (ch - config.value.height * zoom) / 2
    canvas.value.requestRenderAll()
    
    state.value.zoom = zoom
    state.value.panX = vpt[4]
    state.value.panY = vpt[5]
  }

  const toggleGrid = () => {
    state.value.gridEnabled = !state.value.gridEnabled
    state.value.gridEnabled ? drawGrid() : clearGrid()
  }

  const toggleSnap = () => {
    state.value.snapEnabled = !state.value.snapEnabled
  }

  const drawGrid = () => {
    if (!canvas.value) return
    clearGrid()
    const { gridSize = 20, width, height } = config.value

    for (let x = 0; x <= width; x += gridSize) {
      const line = new Line([x, 0, x, height], {
        stroke: '#e5e7eb',
        strokeWidth: x % (gridSize * 5) === 0 ? 1 : 0.5,
        selectable: false,
        evented: false,
      })
      gridLines.push(line)
      canvas.value.add(line)
      canvas.value.sendObjectToBack(line)
    }

    for (let y = 0; y <= height; y += gridSize) {
      const line = new Line([0, y, width, y], {
        stroke: '#e5e7eb',
        strokeWidth: y % (gridSize * 5) === 0 ? 1 : 0.5,
        selectable: false,
        evented: false,
      })
      gridLines.push(line)
      canvas.value.add(line)
      canvas.value.sendObjectToBack(line)
    }
    canvas.value.requestRenderAll()
  }

  const clearGrid = () => {
    if (!canvas.value) return
    gridLines.forEach(l => canvas.value!.remove(l))
    gridLines.length = 0
    canvas.value.requestRenderAll()
  }

  const addObject = (obj: FabricObject) => {
    if (!canvas.value) return
    canvas.value.add(obj)
    canvas.value.setActiveObject(obj)
    canvas.value.requestRenderAll()
  }

  const removeObject = (obj: FabricObject) => {
    if (!canvas.value) return
    canvas.value.remove(obj)
    canvas.value.requestRenderAll()
  }

  const clearCanvas = () => {
    if (!canvas.value) return
    canvas.value.clear()
    canvas.value.backgroundColor = config.value.backgroundColor
    canvas.value.requestRenderAll()
  }

  const setBackgroundColor = (color: string) => {
    if (!canvas.value) return
    canvas.value.backgroundColor = color
    config.value.backgroundColor = color
    canvas.value.requestRenderAll()
  }

  const setBackgroundImage = async (url: string) => {
    if (!canvas.value) return
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
      const scale = Math.min(config.value.width / (img.width || 1), config.value.height / (img.height || 1))
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (config.value.width - (img.width || 0) * scale) / 2,
        top: (config.value.height - (img.height || 0) * scale) / 2,
        selectable: false,
        evented: false
      })
      canvas.value.backgroundImage = img
      canvas.value.requestRenderAll()
    } catch (e) {
      console.error('Failed to set background image:', e)
    }
  }

  const on = (event: string, handler: (e: any) => void) => {
    canvas.value?.on(event as any, handler)
  }

  const off = (event: string, handler?: (e: any) => void) => {
    if (handler) canvas.value?.off(event as any, handler)
    else canvas.value?.off(event as any)
  }

  const disposeCanvas = () => {
    if (canvas.value) {
      clearGrid()
      canvas.value.dispose()
      canvas.value = null
      state.value.isReady = false
    }
  }

  onUnmounted(disposeCanvas)

  // Convenience getters for zoom and pan
  const zoom = computed(() => state.value.zoom)
  const panX = computed(() => state.value.panX)
  const panY = computed(() => state.value.panY)

  const setZoom = (newZoom: number) => {
    if (!canvas.value) return
    const clampedZoom = Math.max(config.value.minZoom!, Math.min(config.value.maxZoom!, newZoom))
    canvas.value.zoomToPoint(canvas.value.getCenterPoint(), clampedZoom)
    state.value.zoom = clampedZoom
  }

  const setPan = (x: number, y: number) => {
    if (!canvas.value) return
    const vpt = canvas.value.viewportTransform!
    vpt[4] = x
    vpt[5] = y
    canvas.value.requestRenderAll()
    state.value.panX = x
    state.value.panY = y
  }

  const resizeCanvas = (width: number, height: number) => {
    if (!canvas.value) return
    canvas.value.setDimensions({ width, height })
    config.value.width = width
    config.value.height = height
    canvas.value.requestRenderAll()
  }

  return {
    canvas, containerRef, state, config,
    currentZoom, canZoomIn, canZoomOut,
    zoom, panX, panY,
    initCanvas, disposeCanvas,
    zoomIn, zoomOut, setZoom, setPan, resetZoom, fitToView, resizeCanvas,
    toggleGrid, toggleSnap, drawGrid, clearGrid,
    addObject, removeObject, clearCanvas,
    setBackgroundColor, setBackgroundImage,
    on, off
  }
}

export type UseFabricCanvasReturn = ReturnType<typeof useFabricCanvas>
