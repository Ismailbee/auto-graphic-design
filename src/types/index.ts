export interface DesignObject {
  id: string
  type: 'image' | 'text' | 'shape'
  x: number
  y: number
  width?: number  // Optional - auto-calculated for text
  height?: number // Optional - auto-calculated for text
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  visible: boolean
  locked: boolean
  zIndex: number
}

export interface ImageObject extends DesignObject {
  type: 'image'
  src: string
  cropX?: number
  cropY?: number
  cropWidth?: number
  cropHeight?: number
}

export interface TextObject extends DesignObject {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fontStyle: string
  textDecoration: string
  fill: string
  align: string
  verticalAlign: string
  lineHeight: number
  letterSpacing: number
}

export interface ShapeObject extends DesignObject {
  type: 'shape'
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'star'
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius?: number
}

export type AnyDesignObject = ImageObject | TextObject | ShapeObject

export interface CanvasState {
  width: number
  height: number
  backgroundColor: string
  objects: AnyDesignObject[]
  selectedObjectIds: string[]
}

export interface HistoryState {
  canvasState: CanvasState
  timestamp: number
}

export interface AssetItem {
  id: string
  type: 'image' | 'template'
  name: string
  thumbnail: string
  url?: string
  width?: number
  height?: number
  templateId?: string
}

export interface ColorPalette {
  name: string
  colors: string[]
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf'
  quality: number
  scale: number
  transparent: boolean
}
