/**
 * Fabric.js v6 Composables - Barrel Export
 */

export { useFabricCanvas, type UseFabricCanvasReturn, type CanvasConfig } from './useFabricCanvas'
export { useFabricSelection, type UseFabricSelectionReturn } from './useFabricSelection'
export { useFabricHistory, type UseFabricHistoryReturn } from './useFabricHistory'
export { useFabricText, type UseFabricTextReturn } from './useFabricText'
export { useFabricImage, type UseFabricImageReturn, type ImageFilters } from './useFabricImage'
export { useFabricShapes, type UseFabricShapesReturn, type ShapeStyle } from './useFabricShapes'
export { useFabricTouch, type UseFabricTouchReturn } from './useFabricTouch'
export { useFabricExport, type UseFabricExportReturn, type ExportOptions } from './useFabricExport'
export { useFabricKeyboard, type UseFabricKeyboardReturn, type KeyboardShortcut } from './useFabricKeyboard'
export { useFabricAnimation, type UseFabricAnimationReturn, type AnimationPreset, type ObjectAnimation, ANIMATION_PRESETS } from './useFabricAnimation'
export { useFabricVoice, type UseFabricVoiceReturn, type VoiceCommand, type VoiceFeedback } from './useFabricVoice'

// Re-export Fabric types for convenience
export type { Canvas, FabricObject, FabricImage, IText, Textbox, Rect, Circle, Group } from 'fabric'
