/**
 * Fabric.js v6 Shapes Composable
 * Shape creation and manipulation
 */

import { ref, computed } from 'vue'
import { 
  Rect, Circle, Ellipse, Triangle, Line, Polygon, Polyline, Path,
  type TOptions 
} from 'fabric'
import type { UseFabricCanvasReturn } from './useFabricCanvas'
import type { UseFabricSelectionReturn } from './useFabricSelection'

export interface ShapeStyle {
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  rx?: number
  ry?: number
}

const DEFAULT_SHAPE_STYLE: ShapeStyle = {
  fill: '#4A90D9',
  stroke: '#333333',
  strokeWidth: 2,
  opacity: 1,
  rx: 0,
  ry: 0
}

export function useFabricShapes(
  canvasComposable: UseFabricCanvasReturn,
  selectionComposable: UseFabricSelectionReturn
) {
  const { canvas } = canvasComposable
  const { activeObject } = selectionComposable

  const currentStyle = ref<ShapeStyle>({ ...DEFAULT_SHAPE_STYLE })
  const isDrawingMode = ref(false)
  const drawingShape = ref<string | null>(null)

  const getCenterPosition = () => ({
    left: canvas.value?.width! / 2 || 100,
    top: canvas.value?.height! / 2 || 100,
    originX: 'center' as const,
    originY: 'center' as const
  })

  const addRect = (options: Partial<TOptions<Rect>> = {}) => {
    if (!canvas.value) return null
    
    const rect = new Rect({
      ...getCenterPosition(),
      width: 100,
      height: 80,
      ...currentStyle.value,
      ...options
    })
    
    canvas.value.add(rect)
    canvas.value.setActiveObject(rect)
    canvas.value.requestRenderAll()
    return rect
  }

  const addSquare = (size = 100, options: Partial<TOptions<Rect>> = {}) => {
    return addRect({ width: size, height: size, ...options })
  }

  const addRoundedRect = (options: Partial<TOptions<Rect>> = {}) => {
    return addRect({ rx: 10, ry: 10, ...options })
  }

  const addCircle = (options: Partial<TOptions<Circle>> = {}) => {
    if (!canvas.value) return null
    
    const circle = new Circle({
      ...getCenterPosition(),
      radius: 50,
      ...currentStyle.value,
      ...options
    })
    
    canvas.value.add(circle)
    canvas.value.setActiveObject(circle)
    canvas.value.requestRenderAll()
    return circle
  }

  const addEllipse = (options: Partial<TOptions<Ellipse>> = {}) => {
    if (!canvas.value) return null
    
    const ellipse = new Ellipse({
      ...getCenterPosition(),
      rx: 70,
      ry: 40,
      ...currentStyle.value,
      ...options
    })
    
    canvas.value.add(ellipse)
    canvas.value.setActiveObject(ellipse)
    canvas.value.requestRenderAll()
    return ellipse
  }

  const addTriangle = (options: Partial<TOptions<Triangle>> = {}) => {
    if (!canvas.value) return null
    
    const triangle = new Triangle({
      ...getCenterPosition(),
      width: 100,
      height: 100,
      ...currentStyle.value,
      ...options
    })
    
    canvas.value.add(triangle)
    canvas.value.setActiveObject(triangle)
    canvas.value.requestRenderAll()
    return triangle
  }

  const addLine = (points: [number, number, number, number] = [50, 50, 200, 200], options: Partial<TOptions<Line>> = {}) => {
    if (!canvas.value) return null
    
    const line = new Line(points, {
      stroke: currentStyle.value.stroke,
      strokeWidth: currentStyle.value.strokeWidth,
      ...options
    })
    
    canvas.value.add(line)
    canvas.value.setActiveObject(line)
    canvas.value.requestRenderAll()
    return line
  }

  const addPolygon = (points: { x: number; y: number }[], options: Partial<TOptions<Polygon>> = {}) => {
    if (!canvas.value) return null
    
    const polygon = new Polygon(points, {
      ...getCenterPosition(),
      ...currentStyle.value,
      ...options
    })
    
    canvas.value.add(polygon)
    canvas.value.setActiveObject(polygon)
    canvas.value.requestRenderAll()
    return polygon
  }

  const addStar = (points = 5, outerRadius = 50, innerRadius = 25, options = {}) => {
    const starPoints: { x: number; y: number }[] = []
    const step = Math.PI / points
    
    for (let i = 0; i < 2 * points; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = i * step - Math.PI / 2
      starPoints.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      })
    }
    
    return addPolygon(starPoints, options)
  }

  const addHexagon = (size = 50, options = {}) => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 30) * Math.PI / 180
      points.push({
        x: Math.cos(angle) * size,
        y: Math.sin(angle) * size
      })
    }
    return addPolygon(points, options)
  }

  const addArrow = (options = {}) => {
    if (!canvas.value) return null
    
    const arrowPath = 'M 0 25 L 75 25 L 75 0 L 100 50 L 75 100 L 75 75 L 0 75 Z'
    const arrow = new Path(arrowPath, {
      ...getCenterPosition(),
      ...currentStyle.value,
      scaleX: 0.5,
      scaleY: 0.5,
      ...options
    })
    
    canvas.value.add(arrow)
    canvas.value.setActiveObject(arrow)
    canvas.value.requestRenderAll()
    return arrow
  }

  const addHeart = (options = {}) => {
    if (!canvas.value) return null
    
    const heartPath = 'M 50 90 C 20 60, 0 30, 50 10 C 100 30, 80 60, 50 90 Z'
    const heart = new Path(heartPath, {
      ...getCenterPosition(),
      ...currentStyle.value,
      scaleX: 1,
      scaleY: 1,
      ...options
    })
    
    canvas.value.add(heart)
    canvas.value.setActiveObject(heart)
    canvas.value.requestRenderAll()
    return heart
  }

  const updateShapeStyle = (style: Partial<ShapeStyle>) => {
    currentStyle.value = { ...currentStyle.value, ...style }
    
    if (activeObject.value) {
      activeObject.value.set(style as any)
      canvas.value?.requestRenderAll()
    }
  }

  const setFillColor = (fill: string) => updateShapeStyle({ fill })
  const setStrokeColor = (stroke: string) => updateShapeStyle({ stroke })
  const setStrokeWidth = (strokeWidth: number) => updateShapeStyle({ strokeWidth })
  const setOpacity = (opacity: number) => updateShapeStyle({ opacity })
  const setCornerRadius = (rx: number, ry?: number) => updateShapeStyle({ rx, ry: ry ?? rx })

  const startDrawingShape = (shape: string) => {
    isDrawingMode.value = true
    drawingShape.value = shape
    // TODO: Implement interactive shape drawing
  }

  const stopDrawingShape = () => {
    isDrawingMode.value = false
    drawingShape.value = null
  }

  return {
    currentStyle,
    isDrawingMode,
    drawingShape,
    addRect,
    addSquare,
    addRoundedRect,
    addCircle,
    addEllipse,
    addTriangle,
    addLine,
    addPolygon,
    addStar,
    addHexagon,
    addArrow,
    addHeart,
    updateShapeStyle,
    setFillColor,
    setStrokeColor,
    setStrokeWidth,
    setOpacity,
    setCornerRadius,
    startDrawingShape,
    stopDrawingShape
  }
}

export type UseFabricShapesReturn = ReturnType<typeof useFabricShapes>
