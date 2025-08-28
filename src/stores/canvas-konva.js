import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { Konva } from '../lib/konva-init.js'

export const useCanvasStore = defineStore('canvas', () => {
  // Canvas references
  const stageInstance = ref(null)
  const layerInstance = ref(null)
  const activeObject = ref(null)
  const transformer = ref(null)
  const activeTool = ref('Select')
  
  // Theme
  const isDarkTheme = ref(false)
  const workspaceTheme = ref('light')

  // Canvas properties
  const canvasSize = ref({ width: 1200, height: 800 })
  const backgroundColor = ref('#ffffff')
  const zoomLevel = ref(50) // Set default zoom to 50%
  const gridVisible = ref(false)
  const snapToGrid = ref(true); // Enable snap-to-grid by default
  const gridSize = ref(20)
  const rulers = ref(true)
  
  // Pages (multi-page document)
  const pages = ref([
    {
      id: `page-${Date.now()}`,
      name: 'Page 1',
      data: null, // Konva JSON
      meta: { width: 350, height: 500, backgroundColor: '#ffffff' },
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
  const scaleContentWithCanvas = ref(true)

  // History for undo/redo
  const history = ref([])
  const historyIndex = ref(-1)
  const maxHistorySteps = ref(50)
  
  // Layers management
  const layers = ref([])
  const activeLayerIndex = ref(-1)
  
  // Multi-select
  const selectedObjects = ref([])
  const isMultiSelectActive = ref(false)

  // Computed properties
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)
  const isObjectSelected = computed(() => !!activeObject.value)
  const activeLayer = computed(() => activeLayerIndex.value >= 0 ? layers.value[activeLayerIndex.value] : null)
  const totalObjects = computed(() => layerInstance.value ? layerInstance.value.children.length : 0)
  const canvasAspectRatio = computed(() => canvasSize.value.width / canvasSize.value.height)
  const isPortrait = computed(() => canvasAspectRatio.value < 1)
  const isLandscape = computed(() => canvasAspectRatio.value > 1)
  const isSquare = computed(() => canvasAspectRatio.value === 1)
  const visibleLayers = computed(() => layers.value.filter(layer => layer.visible))
  const totalPages = computed(() => pages.value.length)

  // --- METHODS ---

  // Canvas setup
  function setCanvas(instance) {
    stageInstance.value = instance.stage
    layerInstance.value = instance.layer
    
    // Create a transformer for selections
    transformer.value = new Konva.Transformer({
      anchorSize: 8,
      anchorCornerRadius: 4,
      anchorStrokeWidth: 2,
      anchorStroke: '#4f46e5',
      anchorFill: '#ffffff',
      borderStroke: '#4f46e5',
      borderStrokeWidth: 2,
      borderDash: [],
      rotateAnchorOffset: 20
    })
    
    layerInstance.value.add(transformer.value)
    
    // Apply current zoom level
    const zoom = zoomLevel.value / 100
    stageInstance.value.scale({ x: zoom, y: zoom })
    
    // Set canvas size
    stageInstance.value.width(canvasSize.value.width)
    stageInstance.value.height(canvasSize.value.height)
    
    // Initialize layers
    initializeLayers()
    
    // Load first page if it has content
    if (pages.value[currentPageIndex.value]?.data) {
      loadPage(currentPageIndex.value)
    } else {
      // Ensure canvas size and bg match meta
      const meta = pages.value[currentPageIndex.value]?.meta
      if (meta) {
        setCanvasSize(meta.width, meta.height)
        setBackgroundColor(meta.backgroundColor)
      }
      saveState()
    }
  }

  function setActiveTool(tool) {
    activeTool.value = tool
    
    if (!stageInstance.value) return;
    
    // Set stage interaction based on tool
    if (tool === 'Select') {
      // Enable dragging for all objects
      layerInstance.value.children.forEach((node) => {
        if (node !== transformer.value) {
          node.draggable(true);
        }
      });
    } else if (tool === 'Hand') {
      // Disable dragging for objects during hand tool
      layerInstance.value.children.forEach((node) => {
        if (node !== transformer.value) {
          node.draggable(false);
        }
      });
    } else {
      // Other tools may have specific behaviors
      layerInstance.value.children.forEach((node) => {
        if (node !== transformer.value) {
          node.draggable(false);
        }
      });
    }
  }

  function setActiveObject(obj) {
    activeObject.value = obj
    
    if (!transformer.value) return;
    
    if (obj) {
      // Update transformer nodes
      transformer.value.nodes([obj]);
      transformer.value.moveToTop();
      
      // Make sure all resize anchors are visible
      if (obj.className === 'Image') {
        // Trigger a custom event to update image resize anchors
        const event = new CustomEvent('konva:select', { 
          detail: { target: obj } 
        });
        window.dispatchEvent(event);
      }
      
      layerInstance.value.draw();
    } else {
      // Clear selection
      transformer.value.nodes([]);
      
      // Trigger deselect event
      const event = new CustomEvent('konva:deselect');
      window.dispatchEvent(event);
      
      layerInstance.value.draw();
    }
    
    selectedObjects.value = obj ? [obj] : [];
    
    // Update active layer if object belongs to a layer
    if (obj?.id) {
      const layerIndex = layers.value.findIndex(layer => 
        layer.objects.includes(obj.id()))
      if (layerIndex !== -1) activeLayerIndex.value = layerIndex
    }
  }
  
  function setCanvasSize(width, height) {
    const oldSize = { ...canvasSize.value }
    canvasSize.value = { width, height }
    
    if (stageInstance.value) {
      stageInstance.value.width(width)
      stageInstance.value.height(height)
      
      if (scaleContentWithCanvas.value) {
        const scaleX = width / oldSize.width
        const scaleY = height / oldSize.height
        
        // Scale all objects in the layer
        layerInstance.value.children.forEach((node) => {
          if (node !== transformer.value) {
            node.x(node.x() * scaleX)
            node.y(node.y() * scaleY)
            node.scaleX(node.scaleX() * scaleX)
            node.scaleY(node.scaleY() * scaleY)
          }
        })
      }
      
      layerInstance.value.draw()
      saveState()
      
      // Keep page meta in sync
      if (pages.value[currentPageIndex.value]) {
        pages.value[currentPageIndex.value].meta = {
          ...(pages.value[currentPageIndex.value].meta || {}),
          width, height
        }
      }
    }
  }
  
  function setBackgroundColor(color) {
    backgroundColor.value = color
    
    if (stageInstance.value) {
      // Konva stage doesn't have a direct backgroundColor property,
      // so we'll update the container's background or create a background rect
      stageInstance.value.container().style.backgroundColor = color;
      
      saveState()
      
      if (pages.value[currentPageIndex.value]) {
        pages.value[currentPageIndex.value].meta = {
          ...(pages.value[currentPageIndex.value].meta || {}),
          backgroundColor: color,
          width: canvasSize.value.width,
          height: canvasSize.value.height
        }
      }
    }
  }

  function setProjectName(name) {
    projectName.value = name || 'Untitled Design'
    saveStatus.value = 'Unsaved changes'
  }
  
  function setZoomLevel(level) {
    // Ensure zoom level is within reasonable bounds
    const newZoom = Math.max(10, Math.min(200, level));
    zoomLevel.value = newZoom;
    
    if (stageInstance.value) {
      // Calculate zoom factor (1.0 = 100%)
      const zoom = newZoom / 100;
      
      // Apply zoom transformation to stage
      stageInstance.value.scale({ x: zoom, y: zoom });
      stageInstance.value.draw();
      
      console.log(`Zoom applied: ${zoom}x (${newZoom}%)`);
    }
  }
  
  function toggleTheme() {
    isDarkTheme.value = !isDarkTheme.value
  }
  
  // History management
  function saveState() {
    if (!stageInstance.value || !layerInstance.value) return
    
    saveStatus.value = 'Saving...'
    
    if (historyIndex.value < history.value.length - 1) {
      history.value.splice(historyIndex.value + 1)
    }
    
    if (history.value.length >= maxHistorySteps.value) {
      history.value.shift()
      historyIndex.value--
    }
    
    try {
      const json = stageInstance.value.toJSON()
      history.value.push(json)
      historyIndex.value++
      
      // Persist JSON into current page
      if (pages.value[currentPageIndex.value]) {
        pages.value[currentPageIndex.value].data = json
        pages.value[currentPageIndex.value].meta = {
          width: canvasSize.value.width,
          height: canvasSize.value.height,
          backgroundColor: backgroundColor.value
        }
        // Update thumbnail preview (small data URL)
        try {
          pages.value[currentPageIndex.value].thumbnail = generateThumbnail()
        } catch (_) {}
      }
      
      if (isAutosaveEnabled.value) {
        // Autosave current project pages/meta
        try {
          saveToLocalStorage(autosaveKey)
        } catch (_) {}
      }
      saveStatus.value = 'Saved'
    } catch (e) {
      console.warn('saveState failed', e)
      saveStatus.value = 'Error'
    }
  }

  function loadState(state) {
    if (!stageInstance.value || !layerInstance.value || !state) return
    
    // Clear the layer first
    layerInstance.value.destroyChildren();
    
    // Add back the transformer
    layerInstance.value.add(transformer.value);
    
    // Load from JSON
    try {
      const loadedStage = Konva.Node.create(state, stageInstance.value.container());
      
      // Copy children from loaded layer to current layer
      const loadedLayer = loadedStage.findOne('Layer');
      if (loadedLayer) {
        loadedLayer.children.forEach((child) => {
          // Skip transferring the transformer if it exists
          if (child.getClassName() !== 'Transformer') {
            // Clone the child to avoid reference issues
            const clone = child.clone();
            // Make object draggable
            if (clone.draggable) {
              clone.draggable(true);
            }
            layerInstance.value.add(clone);
          }
        });
      }
      
      // Clean up
      loadedStage.destroy();
      
      // Reset selection
      setActiveObject(null);
      
      // Initialize layers
      initializeLayers();
      
      // Redraw
      layerInstance.value.draw();
    } catch (e) {
      console.error('Error loading state:', e);
    }
  }

  // --- Pages management ---
  function addPage() {
    const index = pages.value.length + 1
    pages.value.push({
      id: `page-${Date.now()}-${index}`,
      name: `Page ${index}`,
      data: null,
      meta: { 
        width: canvasSize.value.width, 
        height: canvasSize.value.height, 
        backgroundColor: backgroundColor.value 
      },
      thumbnail: null
    })
    goToPage(pages.value.length - 1)
  }

  function duplicatePage(index = currentPageIndex.value) {
    const src = pages.value[index]
    if (!src) return
    const newIndex = index + 1
    const copy = {
      id: `page-${Date.now()}-${newIndex}`,
      name: `${src.name} Copy`,
      data: src.data ? JSON.parse(JSON.stringify(src.data)) : null,
      meta: { ...(src.meta || {}) },
      thumbnail: src.thumbnail || null
    }
    pages.value.splice(newIndex, 0, copy)
    goToPage(newIndex)
  }

  function deletePage(index = currentPageIndex.value) {
    if (pages.value.length <= 1) return // keep at least one page
    pages.value.splice(index, 1)
    const nextIndex = Math.min(index, pages.value.length - 1)
    goToPage(nextIndex)
  }

  function goToPage(index) {
    // Save current page before navigating
    if (stageInstance.value && pages.value[currentPageIndex.value]) {
      pages.value[currentPageIndex.value].data = stageInstance.value.toJSON()
      pages.value[currentPageIndex.value].meta = {
        width: canvasSize.value.width,
        height: canvasSize.value.height,
        backgroundColor: backgroundColor.value
      }
      try {
        pages.value[currentPageIndex.value].thumbnail = generateThumbnail()
      } catch (_) {}
    }
    currentPageIndex.value = index
    loadPage(index)
  }

  function loadPage(index) {
    const page = pages.value[index]
    if (!page || !stageInstance.value) return

    const { width, height, backgroundColor: bg } = page.meta || {}
    if (width && height) setCanvasSize(width, height)
    if (bg) setBackgroundColor(bg)

    if (page.data) {
      loadState(page.data)
    } else {
      // Empty page
      clearCanvas()
    }
  }

  function nextPage() {
    if (currentPageIndex.value < pages.value.length - 1) {
      goToPage(currentPageIndex.value + 1)
    }
  }

  function prevPage() {
    if (currentPageIndex.value > 0) {
      goToPage(currentPageIndex.value - 1)
    }
  }

  // Fast navigation ("next next" and "prev prev")
  function nextPageFast(step = 2) {
    if (pages.value.length <= 1) return
    const target = Math.min(currentPageIndex.value + step, pages.value.length - 1)
    if (target !== currentPageIndex.value) goToPage(target)
  }

  function prevPageFast(step = 2) {
    if (pages.value.length <= 1) return
    const target = Math.max(currentPageIndex.value - step, 0)
    if (target !== currentPageIndex.value) goToPage(target)
  }

  function undo() {
    if (canUndo.value) {
      historyIndex.value--
      loadState(history.value[historyIndex.value])
    }
  }

  function redo() {
    if (canRedo.value) {
      historyIndex.value++
      loadState(history.value[historyIndex.value])
    }
  }

  // Object & Element manipulation
  function addObjectToCanvas(konvaObject) {
    if (!layerInstance.value || !konvaObject) return;

    // Ensure object has a unique ID
    if (!konvaObject.id()) {
      konvaObject.id(`${konvaObject.getClassName()}-${Date.now()}`);
    }

    console.log("Adding object to canvas:", konvaObject.getClassName(), { 
      x: konvaObject.x(), 
      y: konvaObject.y(),
      width: konvaObject.width(),
      height: konvaObject.height()
    });

    // Make the object draggable by default
    konvaObject.draggable(true);
    
    // Add to layer
    layerInstance.value.add(konvaObject);
    
    if (activeLayer.value) {
      activeLayer.value.objects.push(konvaObject.id());
    }
    
    // Select the new object
    setActiveObject(konvaObject);
    
    // Draw the layer
    layerInstance.value.draw();
    
    // Save state
    saveState();
  }
  
  // Listen for Konva custom events
  function setupKonvaEventListeners() {
    window.addEventListener('konva:select', (e) => {
      setActiveObject(e.detail.target);
    });
    
    window.addEventListener('konva:deselect', () => {
      setActiveObject(null);
    });
    
    window.addEventListener('konva:statesave', () => {
      saveState();
    });
  }
  
  // Initialize event listeners when store is created
  setupKonvaEventListeners();

  function addElement(type, options = {}) {
    // Calculate center of viewport for initial placement
    const center = {
      x: options.left ?? canvasSize.value.width / 2,
      y: options.top ?? canvasSize.value.height / 2,
    };
    
    console.log(`Adding ${type} at position:`, center);

    let konvaObject = null;

    // Default properties for all objects
    const defaultProps = {
      x: center.x,
      y: center.y,
      draggable: true
    };

    switch (type) {
      case 'rect':
        konvaObject = new Konva.Rect({ 
          ...defaultProps,
          ...options, 
          width: 100, 
          height: 100, 
          fill: options.fill || '#4f46e5',
          stroke: '#000000',
          strokeWidth: 0,
          shadowColor: 'rgba(0,0,0,0.2)',
          shadowBlur: 10,
          shadowOffset: { x: 5, y: 5 },
          shadowOpacity: 0.5
        });
        break;
      case 'circle':
        konvaObject = new Konva.Circle({ 
          ...defaultProps,
          ...options, 
          radius: 50, 
          fill: options.fill || '#e11d48',
          stroke: '#000000',
          strokeWidth: 0,
          shadowColor: 'rgba(0,0,0,0.2)',
          shadowBlur: 10,
          shadowOffset: { x: 5, y: 5 },
          shadowOpacity: 0.5
        });
        break;
      case 'triangle':
        konvaObject = new Konva.RegularPolygon({ 
          ...defaultProps,
          ...options, 
          sides: 3,
          radius: 50,
          fill: options.fill || '#16a34a',
          stroke: '#000000',
          strokeWidth: 0,
          shadowColor: 'rgba(0,0,0,0.2)',
          shadowBlur: 10,
          shadowOffset: { x: 5, y: 5 },
          shadowOpacity: 0.5
        });
        break;
      case 'text':
        // Import the createEditableText function dynamically to avoid circular dependencies
        import('../composables/useKonvaText.js').then(({ createEditableText }) => {
          const textNode = createEditableText(stageInstance.value, layerInstance.value, {
            ...defaultProps,
            ...options,
            text: options.text || 'Hello',
            fontSize: 48,
            fill: '#1e293b',
            align: 'center',
            fontFamily: 'Arial',
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 10,
            shadowOffset: { x: 5, y: 5 },
            shadowOpacity: 0.5
          });
          
          // Select the new text object
          setActiveObject(textNode);
          
          // Save state
          saveState();
        });
        return; // Text creation is handled asynchronously
      case 'image':
        // Import the enhanced image handler dynamically to avoid circular dependencies
        import('../composables/useKonvaImage.js').then(({ createEnhancedImage, addResizeAnchors }) => {
          createEnhancedImage(stageInstance.value, layerInstance.value, {
            ...defaultProps,
            ...options,
            enableResizeAnchors: true
          })
            .then(konvaImg => {
              // Add to layer centrally so store can manage selection/undo
              if (layerInstance.value) {
                layerInstance.value.add(konvaImg);
                // Ensure the image is visible and positioned correctly
                konvaImg.visible(true);
                konvaImg.moveToTop();
                layerInstance.value.batchDraw();
              }

              // Attach anchors after the image is added to the layer
              try {
                addResizeAnchors(konvaImg, stageInstance.value, layerInstance.value);
              } catch (e) {
                // If addResizeAnchors is not exported, fall back to the module's internal behavior
                console.warn('addResizeAnchors attach failed, anchors may not be available', e);
              }

              // Select and save
              setActiveObject(konvaImg);
              saveState();
            })
            .catch(err => {
              console.error('Failed to create image:', err);
            });
        });
        return; // Async, handled in the import
    }

    if (konvaObject) {
      addObjectToCanvas(konvaObject);
    }
  }

  function deleteSelectedObject() {
    if (!layerInstance.value || !activeObject.value) return
    
    // Remove from layer
    activeObject.value.destroy();
    
    // Clear selection
    setActiveObject(null);
    
    // Redraw layer
    layerInstance.value.draw();
    
    // Save state
    saveState();
  }

  function duplicateSelectedObject() {
    if (!layerInstance.value || !activeObject.value) return
    
    const clone = activeObject.value.clone({
      x: activeObject.value.x() + 20,
      y: activeObject.value.y() + 20
    });
    
    addObjectToCanvas(clone);
  }

  // Layer management
  function initializeLayers() {
    if (!layerInstance.value) return
    
    layers.value = []
    const objects = layerInstance.value.children.filter(child => 
      child.getClassName() !== 'Transformer'
    );
    
    const objectIds = objects.map(obj => {
      if (!obj.id()) obj.id(`object-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
      return obj.id()
    })
    
    layers.value.push({
      id: 'layer-1',
      name: 'Layer 1',
      visible: true,
      locked: false,
      objects: objectIds
    })
    
    activeLayerIndex.value = 0
  }

  // Grid management
  function updateGrid() {
    if (!layerInstance.value) return
    
    // Remove existing grid
    const existingGrid = layerInstance.value.children.filter(child => child.attrs && child.attrs.isGrid);
    existingGrid.forEach(obj => obj.destroy());
    
    if (!gridVisible.value) {
      layerInstance.value.draw();
      return;
    }
    
    // Create new grid
    const width = canvasSize.value.width;
    const height = canvasSize.value.height;
    const size = gridSize.value;
    
    // Horizontal lines
    for (let i = 0; i <= height; i += size) {
      const line = new Konva.Line({
        points: [0, i, width, i],
        stroke: '#e5e7eb',
        strokeWidth: 0.5,
        opacity: 0.5,
        listening: false,
        isGrid: true
      });
      layerInstance.value.add(line);
      line.moveToBottom();
    }
    
    // Vertical lines
    for (let i = 0; i <= width; i += size) {
      const line = new Konva.Line({
        points: [i, 0, i, height],
        stroke: '#e5e7eb',
        strokeWidth: 0.5,
        opacity: 0.5,
        listening: false,
        isGrid: true
      });
      layerInstance.value.add(line);
      line.moveToBottom();
    }
    
    layerInstance.value.draw();
  }
  
  function toggleGrid() {
    gridVisible.value = !gridVisible.value;
    updateGrid();
  }
  
  function toggleSnapToGrid() {
    snapToGrid.value = !snapToGrid.value;
  }
  
  function toggleRulers() {
    rulers.value = !rulers.value;
  }
  
  // Workspace theme
  function setWorkspaceTheme(theme) {
    workspaceTheme.value = theme;
    // Sync with isDarkTheme for backward compatibility
    isDarkTheme.value = theme === 'dark';
  }
  
  // Group operations
  function groupSelectedObjects() {
    if (!layerInstance.value || !selectedObjects.value.length) return;
    
    const group = new Konva.Group({
      draggable: true,
      id: `group-${Date.now()}`
    });
    
    selectedObjects.value.forEach(obj => {
      // Remove from layer and add to group
      obj.remove();
      group.add(obj);
    });
    
    layerInstance.value.add(group);
    setActiveObject(group);
    layerInstance.value.draw();
    saveState();
  }
  
  function ungroupSelectedObjects() {
    if (!layerInstance.value || !activeObject.value || 
        activeObject.value.getClassName() !== 'Group') return;
    
    const group = activeObject.value;
    const children = group.children.toArray();
    
    // Remove from parent without destroying children
    group.removeChildren();
    
    // Add children back to layer
    children.forEach(child => {
      // Adjust position to account for group position
      child.x(child.x() + group.x());
      child.y(child.y() + group.y());
      
      // Apply group rotation and scaling
      const rotation = child.rotation() + group.rotation();
      const scaleX = child.scaleX() * group.scaleX();
      const scaleY = child.scaleY() * group.scaleY();
      
      child.rotation(rotation);
      child.scaleX(scaleX);
      child.scaleY(scaleY);
      
      layerInstance.value.add(child);
    });
    
    // Remove the group
    group.destroy();
    
    // Update transformer
    setActiveObject(null);
    
    layerInstance.value.draw();
    saveState();
  }
  
  // Clear canvas
  function clearCanvas() {
    if (!layerInstance.value) return;
    
    // Remove all objects except transformer
    const transformer = layerInstance.value.findOne('Transformer');
    layerInstance.value.destroyChildren();
    
    // Add transformer back
    if (transformer) {
      layerInstance.value.add(transformer);
    }
    
    // Update background color
    stageInstance.value.container().style.backgroundColor = backgroundColor.value;
    
    // Redraw
    layerInstance.value.draw();
    
    // Initialize layers
    initializeLayers();
    
    // Save state
    saveState();
  }
  
  // Export
  function exportCanvas(format = 'png', options = {}) {
    if (!stageInstance.value) return null;
    
    if (format === 'svg') {
      // Export as SVG
      return stageInstance.value.toDataURL({
        mimeType: 'image/svg+xml',
        ...options
      });
    }
    
    // Export as PNG or JPEG
    return stageInstance.value.toDataURL({
      mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
      quality: options.quality ?? (format === 'jpeg' ? 0.92 : 1),
      ...options
    });
  }

  function saveToFile() {
    if (!stageInstance.value) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.download = `${projectName.value}.png`;
    
    // Convert canvas to data URL
    link.href = stageInstance.value.toDataURL({
      mimeType: 'image/png',
      quality: 1
    });
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    saveStatus.value = 'Exported';
    lastSaved.value = new Date();
  }

  // Local storage (projects with pages)
  function buildProjectPayload(name = projectName.value) {
    return {
      version: 1,
      name,
      savedAt: new Date().toISOString(),
      pages: pages.value.map(p => ({
        id: p.id,
        name: p.name,
        meta: p.meta,
        data: p.data,
        thumbnail: p.thumbnail || null
      })),
      currentPageIndex: currentPageIndex.value,
      settings: {
        canvasSize: canvasSize.value,
        backgroundColor: backgroundColor.value,
        workspaceTheme: workspaceTheme.value
      }
    }
  }

  function saveToLocalStorage(key = autosaveKey) {
    const payload = buildProjectPayload();
    localStorage.setItem(key, JSON.stringify(payload));
    // Maintain a projects index
    const idxKey = 'agd-projects-index';
    const index = JSON.parse(localStorage.getItem(idxKey) || '[]');
    const existing = index.find(i => i.key === key);
    if (existing) {
      existing.name = payload.name;
      existing.updatedAt = payload.savedAt;
    } else {
      index.push({ key, name: payload.name, updatedAt: payload.savedAt });
    }
    localStorage.setItem(idxKey, JSON.stringify(index));
    return payload;
  }

  function loadFromLocalStorage(key = autosaveKey) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data) return null;
    projectName.value = data.name || 'Untitled Design';
    // Replace pages
    pages.value = (data.pages || []).map(p => ({
      id: p.id,
      name: p.name,
      data: p.data,
      meta: p.meta,
      thumbnail: p.thumbnail || null
    }));
    if (pages.value.length === 0) {
      pages.value = [{ 
        id: `page-${Date.now()}`, 
        name: 'Page 1', 
        data: null, 
        meta: { width: 1200, height: 800, backgroundColor: '#ffffff' }, 
        thumbnail: null 
      }];
    }
    const idx = Math.min(data.currentPageIndex || 0, pages.value.length - 1);
    currentPageIndex.value = idx;
    // Apply settings
    const s = data.settings || {};
    setWorkspaceTheme(s.workspaceTheme || workspaceTheme.value);
    setCanvasSize((s.canvasSize || canvasSize.value).width, (s.canvasSize || canvasSize.value).height);
    setBackgroundColor(s.backgroundColor || backgroundColor.value);
    // Load page content
    loadPage(currentPageIndex.value);
    return data;
  }

  // Generate a small thumbnail data URL of the current canvas
  function generateThumbnail(maxWidth = 200) {
    if (!stageInstance.value) return null;
    
    const w = canvasSize.value.width || 1;
    const scale = Math.min(1, Math.max(0.1, maxWidth / w));
    
    return stageInstance.value.toDataURL({
      mimeType: 'image/png',
      quality: 0.7,
      pixelRatio: scale
    });
  }

  function listLocalProjects() {
    const idxKey = 'agd-projects-index';
    return JSON.parse(localStorage.getItem(idxKey) || '[]');
  }

  function deleteLocalProject(key) {
    localStorage.removeItem(key);
    const idxKey = 'agd-projects-index';
    const index = JSON.parse(localStorage.getItem(idxKey) || '[]');
    const i = index.findIndex(x => x.key === key);
    if (i >= 0) {
      index.splice(i, 1);
      localStorage.setItem(idxKey, JSON.stringify(index));
    }
  }

  function exportProjectJson(filename = (projectName.value || 'design') + '.json') {
    const payload = buildProjectPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      URL.revokeObjectURL(url);
    }
    return payload;
  }

  return {
    // State
    stageInstance, layerInstance, activeObject, activeTool, isDarkTheme, workspaceTheme, canvasSize, 
    backgroundColor, zoomLevel, gridVisible, snapToGrid, gridSize, rulers,
    projectName, saveStatus, isAutosaveEnabled, scaleContentWithCanvas,
    layers, activeLayerIndex, selectedObjects, isMultiSelectActive,
    pages, currentPageIndex,
    
    // Getters
    canUndo, canRedo, isObjectSelected, activeLayer, totalObjects,
    canvasAspectRatio, isPortrait, isLandscape, isSquare, visibleLayers,
    totalPages,
    
    // Methods
    setCanvas, setActiveTool, setActiveObject, setCanvasSize, setBackgroundColor,
    setZoomLevel, setProjectName, toggleTheme, setWorkspaceTheme,
    saveState, loadState, undo, redo,
    addObjectToCanvas, addElement, deleteSelectedObject, duplicateSelectedObject,
    initializeLayers, clearCanvas, saveToFile,
    exportCanvas,
    updateGrid, toggleGrid, toggleSnapToGrid, toggleRulers,
    groupSelectedObjects, ungroupSelectedObjects,
    // Pages
    addPage, duplicatePage, deletePage, nextPage, prevPage, goToPage, loadPage,
    nextPageFast, prevPageFast,
    // Local projects
    saveToLocalStorage, loadFromLocalStorage, listLocalProjects, deleteLocalProject, exportProjectJson
  }
})
