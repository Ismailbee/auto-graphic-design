import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage, useDebounceFn } from '@vueuse/core'
import type { CanvasState, AnyDesignObject, HistoryState, AssetItem, ColorPalette } from '@/types'
import { logger } from '@/utils/logger'

// Validation helpers
const isValidObject = (obj: any): obj is AnyDesignObject => {
  return obj && typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.x === 'number' &&
         typeof obj.y === 'number' &&
         typeof obj.width === 'number' &&
         typeof obj.height === 'number' &&
         ['image', 'text', 'shape'].includes(obj.type)
}

export const useEditorStore = defineStore('editor', () => {
  // Canvas state
  const canvasState = ref<CanvasState>({
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    objects: [],
    selectedObjectIds: []
  })

  // History management
  const history = ref<HistoryState[]>([])
  const historyIndex = ref(-1)
  const maxHistorySize = 50

  // UI state
  const zoom = ref(1)
  const activeTab = ref<'templates' | 'uploads' | 'elements' | 'text' | 'background' | 'filters' | 'crop' | 'qrcode'>('templates')

  // Auto-save to localStorage
  const savedState = useLocalStorage('design-editor-state', canvasState.value)

  // Sample assets
  const sampleAssets = ref<AssetItem[]>([
    {
      id: 'freedom-ceremony',
      type: 'template',
      name: 'Freedom Ceremony',
      thumbnail: '/templates/freedom-ceremony-preview.svg',
      url: '/templates/freedom-ceremony-preview.svg',
      width: 1024,
      height: 576,
      templateId: 'freedom-ceremony'
    },
    {
      id: '1',
      type: 'image',
      name: 'Sample Image 1',
      thumbnail: 'https://picsum.photos/150/150?random=1',
      url: 'https://picsum.photos/400/300?random=1',
      width: 400,
      height: 300
    },
    {
      id: '2',
      type: 'image',
      name: 'Sample Image 2',
      thumbnail: 'https://picsum.photos/150/150?random=2',
      url: 'https://picsum.photos/400/300?random=2',
      width: 400,
      height: 300
    },
    {
      id: '3',
      type: 'image',
      name: 'Sample Image 3',
      thumbnail: 'https://picsum.photos/150/150?random=3',
      url: 'https://picsum.photos/400/300?random=3',
      width: 400,
      height: 300
    }
  ])

  // Color palette
  const colorPalette = ref<ColorPalette>({
    name: 'Default',
    colors: [
      '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
      '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
      '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080'
    ]
  })

  // Computed properties
  const selectedObjects = computed(() => 
    canvasState.value.objects.filter(obj => 
      canvasState.value.selectedObjectIds.includes(obj.id)
    )
  )

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  // Debounced auto-save to localStorage (500ms delay to batch rapid changes)
  const debouncedSaveToLocalStorage = useDebounceFn(() => {
    try {
      savedState.value = canvasState.value
      logger.info('Auto-saved to localStorage')
    } catch (error) {
      logger.error('Failed to auto-save:', error)
    }
  }, 500)

  // Actions
  function saveToHistory() {
    try {
      // Remove any history after current index (when undoing then making new changes)
      if (historyIndex.value < history.value.length - 1) {
        history.value = history.value.slice(0, historyIndex.value + 1)
      }

      // Create a clean snapshot without circular references
      const snapshot = JSON.parse(JSON.stringify(canvasState.value, (key, value) => {
        // Filter out large or unnecessary data
        if (key === 'image' || key === 'imageElement') {
          return undefined
        }
        return value
      }))

      // Add new state to history
      history.value.push({
        canvasState: snapshot,
        timestamp: Date.now()
      })

      // Limit history size
      if (history.value.length > maxHistorySize) {
        history.value.shift()
      } else {
        historyIndex.value++
      }

      // Debounced auto-save to localStorage (batches rapid changes)
      debouncedSaveToLocalStorage()
    } catch (error) {
      logger.error('Failed to save to history:', error)
    }
  }

  function undo() {
    if (canUndo.value) {
      try {
        historyIndex.value--
        canvasState.value = JSON.parse(JSON.stringify(history.value[historyIndex.value].canvasState))
      } catch (error) {
        logger.error('Failed to undo:', error)
        historyIndex.value++ // Revert the index change
      }
    }
  }

  function redo() {
    if (canRedo.value) {
      try {
        historyIndex.value++
        canvasState.value = JSON.parse(JSON.stringify(history.value[historyIndex.value].canvasState))
      } catch (error) {
        logger.error('Failed to redo:', error)
        historyIndex.value-- // Revert the index change
      }
    }
  }

  function addObject(object: AnyDesignObject) {
    if (!isValidObject(object)) {
      logger.error('Invalid object provided to addObject:', object)
      return
    }

    canvasState.value.objects.push(object)
    canvasState.value.selectedObjectIds = [object.id]
    saveToHistory()
  }

  function updateObject(id: string, updates: Partial<AnyDesignObject>) {
    if (!id || typeof id !== 'string') {
      logger.error('Invalid id provided to updateObject:', id)
      return
    }

    const index = canvasState.value.objects.findIndex(obj => obj.id === id)
    if (index !== -1) {
      const currentObject = canvasState.value.objects[index]
      // Type-safe update: only update properties that exist on the current object
      canvasState.value.objects[index] = { ...currentObject, ...updates } as AnyDesignObject
    } else {
      logger.warn('Object not found for update:', id)
    }
  }

  function deleteObject(id: string) {
    if (!id || typeof id !== 'string') {
      logger.error('Invalid id provided to deleteObject:', id)
      return
    }

    const initialLength = canvasState.value.objects.length
    canvasState.value.objects = canvasState.value.objects.filter(obj => obj.id !== id)
    canvasState.value.selectedObjectIds = canvasState.value.selectedObjectIds.filter(objId => objId !== id)

    if (canvasState.value.objects.length < initialLength) {
      saveToHistory()
    } else {
      logger.warn('Object not found for deletion:', id)
    }
  }

  function selectObject(id: string, multiSelect = false) {
    if (multiSelect) {
      if (canvasState.value.selectedObjectIds.includes(id)) {
        canvasState.value.selectedObjectIds = canvasState.value.selectedObjectIds.filter(objId => objId !== id)
      } else {
        canvasState.value.selectedObjectIds.push(id)
      }
    } else {
      canvasState.value.selectedObjectIds = [id]
    }
  }

  function clearSelection() {
    canvasState.value.selectedObjectIds = []
  }

  function duplicateSelected() {
    const objectsToDuplicate = selectedObjects.value
    const newObjects: AnyDesignObject[] = []

    objectsToDuplicate.forEach(obj => {
      const newObj = {
        ...JSON.parse(JSON.stringify(obj)),
        id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        x: obj.x + 20,
        y: obj.y + 20
      }
      newObjects.push(newObj)
      canvasState.value.objects.push(newObj)
    })

    canvasState.value.selectedObjectIds = newObjects.map(obj => obj.id)
    saveToHistory()
  }

  function bringForward(id: string) {
    if (!id || typeof id !== 'string') {
      logger.error('Invalid id provided to bringForward:', id)
      return
    }

    const obj = canvasState.value.objects.find(o => o.id === id)
    if (obj) {
      const maxZIndex = canvasState.value.objects.length > 0
        ? Math.max(...canvasState.value.objects.map(o => o.zIndex))
        : 0
      obj.zIndex = maxZIndex + 1
      saveToHistory()
    } else {
      logger.warn('Object not found for bringForward:', id)
    }
  }

  function sendBackward(id: string) {
    if (!id || typeof id !== 'string') {
      logger.error('Invalid id provided to sendBackward:', id)
      return
    }

    const obj = canvasState.value.objects.find(o => o.id === id)
    if (obj) {
      const minZIndex = canvasState.value.objects.length > 0
        ? Math.min(...canvasState.value.objects.map(o => o.zIndex))
        : 0
      obj.zIndex = minZIndex - 1
      saveToHistory()
    } else {
      logger.warn('Object not found for sendBackward:', id)
    }
  }

  function resetCanvas() {
    canvasState.value = {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      objects: [],
      selectedObjectIds: []
    }
    history.value = []
    historyIndex.value = -1
    saveToHistory()
  }

  function loadFromStorage() {
    if (savedState.value) {
      canvasState.value = savedState.value
      saveToHistory()
    }
  }

  // Load SVG Template
  async function loadSVGTemplate(svgUrl: string) {
    try {
      logger.info('Loading SVG template:', svgUrl)

      // Emit event to WhiteboardCanvas to load the template
      window.dispatchEvent(new CustomEvent('load-svg-template', {
        detail: { svgUrl }
      }))

      return true
    } catch (error) {
      logger.error('Failed to load SVG template:', error)
      throw error
    }
  }

  // Initialize with first history state
  saveToHistory()

  return {
    // State
    canvasState,
    zoom,
    activeTab,
    sampleAssets,
    colorPalette,

    // Computed
    selectedObjects,
    canUndo,
    canRedo,

    // Actions
    saveToHistory,
    undo,
    redo,
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    clearSelection,
    duplicateSelected,
    bringForward,
    sendBackward,
    resetCanvas,
    loadFromStorage,
    loadSVGTemplate
  }
})
