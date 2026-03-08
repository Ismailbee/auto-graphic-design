import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fabric } from 'fabric'

export const useCanvasStore = defineStore('fabric-canvas', () => {
  // Canvas references
  const fabricCanvas = ref(null)
  const activeObject = ref(null)
  const activeTool = ref('Select')
  
  // Theme
  const isDarkTheme = ref(false)
  const workspaceTheme = ref('light')

  // Canvas properties
  const canvasSize = ref({ width: 1200, height: 800 })
  const backgroundColor = ref('#ffffff')
  const zoomLevel = ref(100) // Set default zoom to 100%
  const gridVisible = ref(false)
  const snapToGrid = ref(true)
  const gridSize = ref(20)
  const rulers = ref(true)
  
  // Pages (multi-page document)
  const pages = ref([
    {
      id: `page-${Date.now()}`,
      name: 'Page 1',
      data: null, // Fabric.js JSON
      meta: { width: 1200, height: 800, backgroundColor: '#ffffff' },
      thumbnail: null
    }
  ])
  const currentPageIndex = ref(0)
  
  // Project details
  const projectName = ref('Untitled Design')
  const saveStatus = ref('Saved')
  const projectTags = ref([])
  const lastSaved = ref(null)
  const isAutosaveEnabled = ref(true)
  const autosaveKey = 'audio-graphic-design-current-project'

  // History for undo/redo
  const history = ref([])
  const historyIndex = ref(-1)
  const maxHistorySize = ref(50)

  // Selection state
  const selectedObjects = ref([])

  // Computed properties
  const totalPages = computed(() => pages.value.length)
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)
  const currentPage = computed(() => pages.value[currentPageIndex.value])

  // Canvas management
  const setCanvas = (canvas) => {
    fabricCanvas.value = canvas
    setupCanvasEvents()
  }

  const setupCanvasEvents = () => {
    if (!fabricCanvas.value) return

    fabricCanvas.value.on('selection:created', (e) => {
      activeObject.value = e.target
      selectedObjects.value = e.target._objects || [e.target]
    })

    fabricCanvas.value.on('selection:updated', (e) => {
      activeObject.value = e.target
      selectedObjects.value = e.target._objects || [e.target]
    })

    fabricCanvas.value.on('selection:cleared', () => {
      activeObject.value = null
      selectedObjects.value = []
    })

    fabricCanvas.value.on('object:modified', () => {
      saveState()
    })
  }

  // Tool management
  const setActiveTool = (tool) => {
    activeTool.value = tool
  }

  // Object management
  const setActiveObject = (obj) => {
    activeObject.value = obj
    if (fabricCanvas.value) {
      if (obj) {
        fabricCanvas.value.setActiveObject(obj)
      } else {
        fabricCanvas.value.discardActiveObject()
      }
      fabricCanvas.value.renderAll()
    }
  }

  const deleteSelectedObject = () => {
    if (!fabricCanvas.value || !activeObject.value) return
    
    if (activeObject.value.type === 'activeSelection') {
      // Multiple objects selected
      activeObject.value.forEachObject((obj) => {
        fabricCanvas.value.remove(obj)
      })
    } else {
      // Single object
      fabricCanvas.value.remove(activeObject.value)
    }
    
    fabricCanvas.value.discardActiveObject()
    fabricCanvas.value.renderAll()
    saveState()
  }

  const duplicateSelectedObject = () => {
    if (!fabricCanvas.value || !activeObject.value) return
    
    activeObject.value.clone((cloned) => {
      cloned.set({
        left: cloned.left + 10,
        top: cloned.top + 10,
      })
      fabricCanvas.value.add(cloned)
      fabricCanvas.value.setActiveObject(cloned)
      fabricCanvas.value.renderAll()
      saveState()
    })
  }

  const groupSelectedObjects = () => {
    if (!fabricCanvas.value || selectedObjects.value.length < 2) return
    
    const group = new fabric.Group(selectedObjects.value)
    fabricCanvas.value.remove(...selectedObjects.value)
    fabricCanvas.value.add(group)
    fabricCanvas.value.setActiveObject(group)
    fabricCanvas.value.renderAll()
    saveState()
  }

  const ungroupSelectedObjects = () => {
    if (!fabricCanvas.value || !activeObject.value || activeObject.value.type !== 'group') return
    
    const items = activeObject.value.getObjects()
    fabricCanvas.value.remove(activeObject.value)
    
    items.forEach((item) => {
      fabricCanvas.value.add(item)
    })
    
    fabricCanvas.value.renderAll()
    saveState()
  }

  // Zoom management
  const setZoomLevel = (level) => {
    zoomLevel.value = Math.max(10, Math.min(400, level))
    if (fabricCanvas.value) {
      const zoom = zoomLevel.value / 100
      fabricCanvas.value.setZoom(zoom)
      fabricCanvas.value.renderAll()
    }
  }

  const zoomIn = () => {
    setZoomLevel(zoomLevel.value + 25)
  }

  const zoomOut = () => {
    setZoomLevel(zoomLevel.value - 25)
  }

  const zoomToFit = () => {
    if (!fabricCanvas.value) return
    // Implementation for zoom to fit
    setZoomLevel(100)
  }

  // Grid management
  const updateGrid = () => {
    if (!fabricCanvas.value) return
    
    // Remove existing grid
    const existingGrid = fabricCanvas.value.getObjects().filter(obj => obj.isGrid)
    existingGrid.forEach(obj => fabricCanvas.value.remove(obj))
    
    if (!gridVisible.value) return
    
    // Add new grid
    const canvasWidth = fabricCanvas.value.width
    const canvasHeight = fabricCanvas.value.height
    
    // Vertical lines
    for (let i = 0; i <= canvasWidth; i += gridSize.value) {
      const line = new fabric.Line([i, 0, i, canvasHeight], {
        stroke: '#ddd',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        isGrid: true
      })
      fabricCanvas.value.add(line)
      fabricCanvas.value.sendToBack(line)
    }
    
    // Horizontal lines
    for (let i = 0; i <= canvasHeight; i += gridSize.value) {
      const line = new fabric.Line([0, i, canvasWidth, i], {
        stroke: '#ddd',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        isGrid: true
      })
      fabricCanvas.value.add(line)
      fabricCanvas.value.sendToBack(line)
    }
    
    fabricCanvas.value.renderAll()
  }

  const toggleGrid = () => {
    gridVisible.value = !gridVisible.value
    updateGrid()
  }

  // History management
  const saveState = () => {
    if (!fabricCanvas.value) return
    
    const state = JSON.stringify(fabricCanvas.value.toJSON())
    
    // Remove any states after current index (when undoing then making new changes)
    history.value = history.value.slice(0, historyIndex.value + 1)
    
    // Add new state
    history.value.push(state)
    historyIndex.value = history.value.length - 1
    
    // Limit history size
    if (history.value.length > maxHistorySize.value) {
      history.value.shift()
      historyIndex.value--
    }
  }

  const undo = () => {
    if (!canUndo.value || !fabricCanvas.value) return
    
    historyIndex.value--
    const state = history.value[historyIndex.value]
    
    fabricCanvas.value.loadFromJSON(state, () => {
      fabricCanvas.value.renderAll()
      setupCanvasEvents()
    })
  }

  const redo = () => {
    if (!canRedo.value || !fabricCanvas.value) return
    
    historyIndex.value++
    const state = history.value[historyIndex.value]
    
    fabricCanvas.value.loadFromJSON(state, () => {
      fabricCanvas.value.renderAll()
      setupCanvasEvents()
    })
  }

  // Page management
  const addPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      name: `Page ${pages.value.length + 1}`,
      data: null,
      meta: { ...canvasSize.value, backgroundColor: backgroundColor.value },
      thumbnail: null
    }
    pages.value.push(newPage)
    currentPageIndex.value = pages.value.length - 1
  }

  const deletePage = () => {
    if (pages.value.length <= 1) return
    
    pages.value.splice(currentPageIndex.value, 1)
    if (currentPageIndex.value >= pages.value.length) {
      currentPageIndex.value = pages.value.length - 1
    }
  }

  const duplicatePage = () => {
    const currentPageData = currentPage.value
    const newPage = {
      ...currentPageData,
      id: `page-${Date.now()}`,
      name: `${currentPageData.name} Copy`
    }
    pages.value.splice(currentPageIndex.value + 1, 0, newPage)
    currentPageIndex.value++
  }

  const nextPage = () => {
    if (currentPageIndex.value < pages.value.length - 1) {
      currentPageIndex.value++
    }
  }

  const prevPage = () => {
    if (currentPageIndex.value > 0) {
      currentPageIndex.value--
    }
  }

  // Save/Load
  const saveToFile = () => {
    // Implementation for saving to file
    console.log('Saving project...')
    saveStatus.value = 'Saving...'
    
    setTimeout(() => {
      saveStatus.value = 'Saved'
      lastSaved.value = new Date()
    }, 1000)
  }

  const exportCanvas = (format = 'png', quality = 1) => {
    if (!fabricCanvas.value) return null
    
    return fabricCanvas.value.toDataURL({
      format: format,
      quality: quality
    })
  }

  return {
    // State
    fabricCanvas,
    activeObject,
    activeTool,
    isDarkTheme,
    workspaceTheme,
    canvasSize,
    backgroundColor,
    zoomLevel,
    gridVisible,
    snapToGrid,
    gridSize,
    rulers,
    pages,
    currentPageIndex,
    projectName,
    saveStatus,
    projectTags,
    lastSaved,
    isAutosaveEnabled,
    autosaveKey,
    history,
    historyIndex,
    selectedObjects,
    
    // Computed
    totalPages,
    canUndo,
    canRedo,
    currentPage,
    
    // Methods
    setCanvas,
    setActiveTool,
    setActiveObject,
    deleteSelectedObject,
    duplicateSelectedObject,
    groupSelectedObjects,
    ungroupSelectedObjects,
    setZoomLevel,
    zoomIn,
    zoomOut,
    zoomToFit,
    updateGrid,
    toggleGrid,
    saveState,
    undo,
    redo,
    addPage,
    deletePage,
    duplicatePage,
    nextPage,
    prevPage,
    saveToFile,
    exportCanvas
  }
})