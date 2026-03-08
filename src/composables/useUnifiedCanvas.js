/**
 * Fabric.js Canvas Composable
 * 
 * This composable provides a unified interface for Fabric.js canvas operations
 */

import { ref, reactive, computed } from 'vue'
import { useCanvasStore } from '../stores/canvas'

export function useFabricCanvas() {
  const canvasStore = useCanvasStore()
  const isInitialized = ref(false)
  
  // Canvas state
  const canvasState = reactive({
    width: 800,
    height: 600,
    zoom: 100,
    tool: 'Select',
    objects: []
  })

  // Initialize Fabric.js canvas
  const initializeCanvas = async (container, options = {}) => {
    try {
      const { fabric } = await import('fabric')
      
      const canvas = new fabric.Canvas(container, {
        width: options.width || 800,
        height: options.height || 600,
        backgroundColor: 'white',
        selection: true,
        preserveObjectStacking: true,
        ...options
      })
      
      canvasStore.setCanvas(canvas)
      isInitialized.value = true
      return canvas
    } catch (error) {
      console.error('Fabric.js canvas initialization failed:', error)
      return null
    }
  }

  // Unified object operations
  const addObject = (type, properties) => {
    return canvasStore.addFabricObject(type, properties)
  }

  const deleteObject = (object) => {
    return canvasStore.deleteFabricObject(object)
  }

  const updateObject = (object, properties) => {
    return canvasStore.updateFabricObject(object, properties)
  }

  // Export functions
  const exportCanvas = async (format = 'png', quality = 1) => {
    return canvasStore.exportFabricCanvas(format, quality)
  }

  return {
    // State
    isInitialized: computed(() => isInitialized.value),
    canvasState,
    
    // Methods
    initializeCanvas,
    addObject,
    deleteObject,
    updateObject,
    exportCanvas
  }
}
