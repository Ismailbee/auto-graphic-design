<!-- 
Copilot Setup: 
This is the main Fabric.js canvas container.
- Render Fabric.js canvas inside.
- Support drag, resize, rotate, group, and layer objects.
- Sync with Sidebar (layers & properties).
- Accepts uploads (images, shapes, text).
- Exposes undo/redo stack.
-->


<template>
  <div class="canvas-workspace" :class="{ 'dark-theme': canvasStore.workspaceTheme === 'dark' }">
    <!-- Canvas Workspace -->
    <div class="canvas-container">
      <!-- Horizontal Ruler -->
      <div class="ruler ruler-h" v-if="canvasStore.rulers">
        <div class="ruler-measure" v-for="i in rulerMarks.h" :key="`h-${i}`" :style="{ left: `${i * rulerUnit}px` }">
          <div class="ruler-mark"></div>
          <div class="ruler-text" v-if="i % 5 === 0">{{ i * 10 }}</div>
        </div>
      </div>
      
      <!-- Vertical Ruler -->
      <div class="ruler ruler-v" v-if="canvasStore.rulers">
        <div class="ruler-measure" v-for="i in rulerMarks.v" :key="`v-${i}`" :style="{ top: `${i * rulerUnit}px` }">
          <div class="ruler-mark"></div>
          <div class="ruler-text" v-if="i % 5 === 0">{{ i * 10 }}</div>
        </div>
      </div>
      
      <!-- Ruler Corner -->
      <div class="ruler-corner" v-if="canvasStore.rulers"></div>
      
      
      <!-- Canvas Wrapper -->
      <div 
        class="canvas-wrapper"
        :class="{ 'with-rulers': canvasStore.rulers, 'drag-over': isDragOver }"
        @wheel="handleZoomWheel"
        @mousedown="handleCanvasDrag"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <div 
          class="canvas-artboard" 
          :style="{ 
            width: `${canvasStore.canvasSize.width}px`,
            height: `${canvasStore.canvasSize.height}px`,
          }"
          :class="{ 'animate-page-change': animateCanvas }"
          ref="artboardEl"
        >
          <div ref="canvasEl" id="konva-canvas" class="konva-canvas"></div>
        </div>
        
        <!-- Drop Overlay -->
        <div class="drop-overlay" v-if="isDragOver">
          <div class="drop-message">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Drop to add to canvas</span>
          </div>
        </div>
      </div>

      <!-- Floating Controls -->
      <div class="floating-controls">
        <!-- Unified Control Bar -->
        <div class="unified-control-bar">
          <!-- Page Controls -->
          <div class="control-group">
            <button class="page-btn" :disabled="canvasStore.currentPageIndex === 0" @click="canvasStore.prevPage()" title="Previous page">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="page-indicator" :title="`Page ${canvasStore.currentPageIndex + 1} of ${canvasStore.totalPages}`">
              {{ canvasStore.currentPageIndex + 1 }} / {{ canvasStore.totalPages }}
            </div>
            <button class="page-btn" :disabled="canvasStore.currentPageIndex >= canvasStore.totalPages - 1" @click="canvasStore.nextPage()" title="Next page">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <div class="separator"></div>

          <!-- Page Actions -->
          <div class="control-group">
            <button class="page-btn" @click="canvasStore.addPage()" title="Add new page">
              <i class="fas fa-plus-square"></i>
            </button>
            <button class="page-btn" @click="canvasStore.duplicatePage()" title="Duplicate this page">
              <i class="fas fa-clone"></i>
            </button>
            <button class="page-btn danger" :disabled="canvasStore.totalPages <= 1" @click="canvasStore.deletePage()" title="Delete this page">
              <i class="fas fa-trash"></i>
            </button>
          </div>

          <div class="separator"></div>

          <!-- Zoom Controls -->
          <div class="control-group">
            <button @click="zoomOut()" class="page-btn" title="Zoom Out">
              <i class="fas fa-search-minus"></i>
            </button>
            <div class="zoom-dropdown">
              <select v-model="zoomLevel" @change="updateZoomWithPoint()" title="Set zoom level">
                <option v-for="zoom in zoomLevels" :key="zoom" :value="zoom">{{ zoom }}%</option>
              </select>
            </div>
            <button @click="zoomIn()" class="page-btn" title="Zoom In">
              <i class="fas fa-search-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Text Editing Toolbar -->
    <TextToolbar />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useCanvasStore } from '../../../stores/canvas-konva'
import { useKonvaCanvas } from '../../../composables/useKonvaCanvas'
import TextToolbar from './TextToolbar.vue'

// Canvas ref
const canvasEl = ref(null)
const artboardEl = ref(null)
const canvasStore = useCanvasStore()
const { initCanvas, disposeCanvas } = useKonvaCanvas()

// Local state
const zoomLevel = ref(canvasStore.zoomLevel)
const zoomLevels = [10, 25, 50, 75, 100, 125, 150, 200, 300, 400]
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const scrollPos = ref({ x: 0, y: 0 })
const isDragOver = ref(false)
const animateCanvas = ref(false)

// Ruler settings
const rulerUnit = 10 // pixels between marks
const rulerMarks = computed(() => ({
  h: Math.ceil(canvasStore.canvasSize.width / 10),
  v: Math.ceil(canvasStore.canvasSize.height / 10)
}))

// Initialize canvas when component is mounted
onMounted(async () => {
  console.log("Canvas mounting attempt...", canvasEl.value);
  
  try {
    if (canvasEl.value) {
      console.log("Canvas element found, initializing...");
      
      // Wait for next tick to ensure DOM is fully ready
      await nextTick();
      
      // Double check the element exists in the DOM
      const domElement = document.getElementById('konva-canvas');
      if (!domElement) {
        console.error("Canvas element not found in DOM!");
        return;
      }
      
      console.log("DOM element found:", domElement);
      
      const canvasInstance = initCanvas('konva-canvas', {
        width: canvasStore.canvasSize.width,
        height: canvasStore.canvasSize.height
      });
      
      if (canvasInstance) {
        console.log("Canvas initialized:", canvasInstance);
        canvasStore.setCanvas(canvasInstance);
        
        // Set up event handlers
        setupKeyboardShortcuts();
        
        // Show grid if enabled
        if (canvasStore.gridVisible) {
          console.log("Grid is visible, updating grid...");
          canvasStore.updateGrid();
        }
        
        // Save initial state
        canvasStore.saveState();
      } else {
        console.error("Canvas initialization failed!");
      }
    } else {
      console.error("Canvas element ref is null!");
    }
  } catch (error) {
    console.error("Error during canvas initialization:", error);
  }
})

// Clean up when component is unmounted
onUnmounted(() => {
  disposeCanvas()
  document.removeEventListener('keydown', handleKeyDown)
})

// Watch for canvas size changes
watch(() => canvasStore.canvasSize, (newSize) => {
  if (canvasStore.stageInstance) {
    canvasStore.stageInstance.width(newSize.width)
    canvasStore.stageInstance.height(newSize.height)
    canvasStore.layerInstance?.batchDraw()
    
    // Update grid if visible
    if (canvasStore.gridVisible) {
      canvasStore.updateGrid()
    }
  }
}, { deep: true })
// Watch for page changes to trigger animation
watch(() => canvasStore.currentPageIndex, (newIndex, oldIndex) => {
  if (newIndex !== oldIndex) {
    animateCanvas.value = true
    setTimeout(() => {
      animateCanvas.value = false
    }, 600) // Animation duration is 500ms
  }
})

// Watch for zoom level changes from store
watch(() => canvasStore.zoomLevel, (newZoom) => {
  zoomLevel.value = newZoom;
  if (canvasStore.stageInstance) {
    const zoom = newZoom / 100;
    canvasStore.stageInstance.scale({ x: zoom, y: zoom });
    canvasStore.layerInstance?.batchDraw();
  }
}, { immediate: true });

// Watch for tool changes
watch(() => canvasStore.activeTool, (newTool) => {
  if (!canvasStore.stageInstance) return
  
  // Tool-specific behaviors are handled in the store
  // This is just for cursor updates
  if (newTool === 'Hand') {
    canvasStore.stageInstance.container().style.cursor = 'grab'
  } else if (newTool === 'Select') {
    canvasStore.stageInstance.container().style.cursor = 'default'
  } else {
    canvasStore.stageInstance.container().style.cursor = 'crosshair'
  }
})

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', handleKeyDown)
}

function handleKeyDown(e) {
  // Only handle shortcuts when canvas is focused
  if (!canvasStore.stageInstance) return
  
  // Shortcut keys (without modifiers)
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    switch(e.key.toLowerCase()) {
      case 'v': 
        canvasStore.setActiveTool('Select'); 
        break
      case 'h': 
        canvasStore.setActiveTool('Hand'); 
        break
      case 'delete':
      case 'backspace':
        canvasStore.deleteSelectedObject();
        break
      case '+':
        zoomIn();
        break
      case '-':
        zoomOut();
        break
    }
  }
  
  // Ctrl/Cmd shortcuts
  if (e.ctrlKey || e.metaKey) {
    switch(e.key.toLowerCase()) {
      case 'z':
        if (e.shiftKey) {
          canvasStore.redo();
        } else {
          canvasStore.undo();
        }
        e.preventDefault();
        break
      case 'd':
        canvasStore.duplicateSelectedObject();
        e.preventDefault();
        break
      case 'g':
        if (e.shiftKey) {
          canvasStore.ungroupSelectedObjects();
        } else {
          canvasStore.groupSelectedObjects();
        }
        e.preventDefault();
        break
      case 'a':
        // Select all - would need Konva implementation
        e.preventDefault();
        break
      case '0':
        zoomLevel.value = 100
        updateZoomWithPoint()
        e.preventDefault();
        break
      case '+':
        zoomIn();
        e.preventDefault();
        break
      case '-':
        zoomOut();
        e.preventDefault();
        break
      case 's':
        canvasStore.saveToFile();
        e.preventDefault();
        break
    }
  }
}

// Text tool click handler - now handled by Konva composables
function handleTextToolClick(pointer) {
  if (canvasStore.activeTool === 'Text') {
    // Import and use Konva text creation
    import('../../../composables/useKonvaText.js').then(({ createEditableText }) => {
      const textNode = createEditableText(
        canvasStore.stageInstance, 
        canvasStore.layerInstance, 
        {
          x: pointer.x,
          y: pointer.y,
          text: 'Type here...',
          fontSize: 20,
          fill: '#000000'
        }
      );
      
      canvasStore.setActiveObject(textNode);
      canvasStore.saveState();
      canvasStore.setActiveTool('Select');
      
      // Enter edit mode immediately
      textNode.fire('dblclick');
    });
  }
}

// Mouse wheel zoom
function handleZoomWheel(e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    
    if (!canvasStore.stageInstance) return;
    
    // Get mouse position relative to stage
    const stage = canvasStore.stageInstance;
    const pointer = stage.getPointerPosition();
    
    if (e.deltaY < 0) {
      zoomIn(pointer);
    } else {
      zoomOut(pointer);
    }
  }
}

// Zoom functions
function zoomIn(point) {
  const currentZoom = zoomLevel.value;
  const nextZoom = zoomLevels.find(z => z > currentZoom);
  zoomLevel.value = nextZoom || Math.min(currentZoom + 25, 400);
  updateZoomWithPoint(point);
}

function zoomOut(point) {
  const currentZoom = zoomLevel.value;
  const prevZoom = [...zoomLevels].reverse().find(z => z < currentZoom);
  zoomLevel.value = prevZoom || Math.max(currentZoom - 25, 10);
  updateZoomWithPoint(point);
}

function updateZoomWithPoint(point) {
  canvasStore.setZoomLevel(zoomLevel.value);

  if (!canvasStore.stageInstance) return
  const zoom = zoomLevel.value / 100

  if (point) {
    // Zoom to specific point (Konva implementation would need custom logic)
    canvasStore.stageInstance.scale({ x: zoom, y: zoom })
  } else {
    // Simple zoom
    canvasStore.stageInstance.scale({ x: zoom, y: zoom })
  }
  canvasStore.layerInstance?.batchDraw()
}

// Canvas drag (hand tool)
function handleCanvasDrag(e) {
  const wrapper = e.currentTarget

  // Hand tool: pan the workspace
  if (canvasStore.activeTool === 'Hand') {
    isDragging.value = true
    dragStart.value = { x: e.clientX, y: e.clientY }
    scrollPos.value = { 
      x: wrapper.scrollLeft,
      y: wrapper.scrollTop
    }
    
    const moveHandler = (moveEvent) => {
      if (!isDragging.value) return
      const dx = dragStart.value.x - moveEvent.clientX
      const dy = dragStart.value.y - moveEvent.clientY
      wrapper.scrollLeft = scrollPos.value.x + dx
      wrapper.scrollTop = scrollPos.value.y + dy
    }

    const upHandler = () => {
      isDragging.value = false
      document.removeEventListener('mousemove', moveHandler)
      document.removeEventListener('mouseup', upHandler)
    }

    document.addEventListener('mousemove', moveHandler)
    document.addEventListener('mouseup', upHandler)
    return
  }

  // For other tools, handle through Konva stage events
}

// Handle drag events
function handleDragOver(e) {
  isDragOver.value = true
  e.dataTransfer.dropEffect = 'copy'
}

function handleDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragOver.value = false
  }
}

function handleDrop(e) {
  isDragOver.value = false
  
  if (!canvasStore.stageInstance) return;
  
  // Get mouse position relative to stage
  const pointer = canvasStore.stageInstance.getPointerPosition();
  const dropX = pointer ? pointer.x : 100;
  const dropY = pointer ? pointer.y : 100;
  
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleDroppedFiles(e.dataTransfer.files, dropX, dropY)
    return
  }
  
  try {
    const raw = e.dataTransfer.getData('application/json') || ''
    if (!raw.trim()) return
    const data = JSON.parse(raw)
    if (data) {
      handleDroppedElement(data, dropX, dropY)
    }
  } catch (err) {
    console.error('Failed to parse dropped element data', err)
  }
}

// Handle dropped files (images)
function handleDroppedFiles(files, x, y) {
  Array.from(files).forEach((file, index) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        // Use Konva image creation
        import('../../../composables/useKonvaImage.js').then(({ createEnhancedImage }) => {
          createEnhancedImage(
            canvasStore.stageInstance, 
            canvasStore.layerInstance, 
            {
              src: e.target.result,
              x: x + (index * 20),
              y: y + (index * 20),
              maxWidth: 300
            }
          ).then(img => {
            canvasStore.setActiveObject(img);
            canvasStore.saveState();
          });
        });
      }
      
      reader.readAsDataURL(file)
    }
  })
}

// Handle dropped elements from sidebar
function handleDroppedElement(data, x, y) {
  canvasStore.addElement(data.type, {
    ...data.options,
    left: x,
    top: y,
  });
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

:root {
  --canvas-bg-light: #e6eef6; /* slightly deeper, subtle blue-gray */
  --canvas-bg-dark: #111827; /* gray-900 */
  --toolbar-bg-light: #ffffff;
  --toolbar-bg-dark: #1f2937; /* gray-800 */
  --border-light: #e5e7eb; /* gray-200 */
  --border-dark: #374151; /* gray-700 */
  --text-light: #4b5563; /* gray-600 */
  --text-dark: #d1d5db; /* gray-300 */
  --primary-color: #4f46e5; /* indigo-600 */
  --primary-color-light: #e0e7ff; /* indigo-100 */
  --primary-color-dark: #3730a3; /* indigo-800 */
  --ruler-bg-light: #ffffff;
  --ruler-bg-dark: #1f2937;
  --font-sans: 'Inter', sans-serif;
}

.canvas-workspace {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--canvas-bg-light);
  overflow: hidden; /* Changed from commented to hidden */
  transition: background-color 0.3s;
  font-family: var(--font-sans);
  position: absolute; /* Added to ensure canvas is fixed */
  inset: 0; /* Added to ensure canvas fills available space */
  z-index: 5; /* Ensure proper stacking */
}

.dark-theme {
  background-color: var(--canvas-bg-dark);
  color: var(--text-dark);
}

.canvas-container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.ruler {
  position: absolute;
  background-color: var(--ruler-bg-light);
  z-index: 15;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: background-color 0.3s;
}
.dark-theme .ruler {
  background-color: var(--ruler-bg-dark);
}

.ruler-h { 
  left: 20px; 
  right: 0; 
  top: 0; 
  height: 20px; 
}
.ruler-v { 
  top: 20px; 
  left: 0; 
  width: 20px; 
  bottom: 0; 
}

.ruler-corner {
  position: absolute;
  left: 0; top: 0;
  width: 20px; height: 20px;
  background-color: var(--ruler-bg-light);
  z-index: 16;
  border-right: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}
.dark-theme .ruler-corner {
  background-color: var(--canvas-bg-dark);
  border-color: var(--border-dark);
}

.ruler-measure { position: absolute; }
.ruler-h .ruler-measure { top: 0; height: 100%; }
.ruler-v .ruler-measure { left: 0; width: 100%; }

.ruler-mark { background-color: #d1d5db; }
.dark-theme .ruler-mark { background-color: #4b5563; }

.ruler-h .ruler-mark { width: 1px; height: 5px; margin-top: 15px; }
.ruler-v .ruler-mark { height: 1px; width: 5px; margin-left: 15px; }

.ruler-text {
  position: absolute;
  font-size: 10px;
  color: #6b7280;
}
.dark-theme .ruler-text { color: #9ca3af; }

.ruler-h .ruler-text { top: 2px; left: 2px; }
.ruler-v .ruler-text { transform: rotate(-90deg); transform-origin: left top; left: 2px; top: 15px; }

.canvas-wrapper {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
  background-color: var(--canvas-bg-light);
  background-image: 
    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  transition: background-color 0.3s;
  z-index: 5; /* Ensures it's above other elements but below floating controls */
}
.dark-theme .canvas-wrapper {
  background-color: var(--canvas-bg-dark);
  background-image: 
    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
}

.canvas-wrapper.with-rulers {
  top: 20px;
  left: 20px;
}

.canvas-artboard {
  position: relative;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  z-index: 6; /* Ensure the artboard is above the wrapper */
  transition: transform 0.5s ease, opacity 0.5s ease;
}
.dark-theme .canvas-artboard {
  box-shadow: 0 0 0 1px var(--border-dark), 0 8px 25px rgba(0, 0, 0, 0.3);
  background-color: #1f2937;
}

.canvas-artboard.animate-page-change {
  animation: page-transition 0.5s ease-out;
}

@keyframes page-transition {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.konva-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* === NEW PROFESSIONAL FLOATING CONTROLS STYLES === */

.floating-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 20;
}

.unified-control-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}
.dark-theme .unified-control-bar {
  background-color: rgba(31, 41, 55, 0.85);
  border-color: var(--border-dark);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.separator {
  width: 1px;
  height: 20px;
  background-color: var(--border-light);
  margin: 0 4px;
}
.dark-theme .separator {
  background-color: var(--border-dark);
}

.page-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-light);
  transition: all 0.2s ease;
  font-size: 14px;
}
.dark-theme .page-btn { color: var(--text-dark); }

.page-btn:hover:not(:disabled) {
  background-color: var(--canvas-bg-light);
  color: var(--primary-color);
}
.dark-theme .page-btn:hover:not(:disabled) {
  background-color: var(--border-dark);
  color: #fff;
}
.page-btn:disabled { 
  opacity: 0.4; 
  cursor: not-allowed; 
}

.page-btn.danger:hover:not(:disabled) {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}
.dark-theme .page-btn.danger:hover:not(:disabled) {
  color: #f87171;
  background-color: rgba(248, 113, 113, 0.1);
}

.page-indicator {
  padding: 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-light);
  white-space: nowrap;
}
.dark-theme .page-indicator { color: var(--text-dark); }

.zoom-dropdown select {
  min-width: 70px;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-light);
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 4px center;
  background-repeat: no-repeat;
  background-size: 1em;
  padding-right: 20px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s ease;
}
.dark-theme .zoom-dropdown select {
  color: var(--text-dark);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
}
.zoom-dropdown select:hover {
  background-color: var(--canvas-bg-light);
}
.dark-theme .zoom-dropdown select:hover {
  background-color: var(--border-dark);
}
.zoom-dropdown select:focus {
  outline: none;
}

/* Refined Page Thumbnails */
.page-thumbs {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background-color: rgba(255,255,255,.8);
  backdrop-filter: blur(4px);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,.05);
}
.dark-theme .page-thumbs { 
  background-color: rgba(31,41,55,.7); 
  border-color: var(--border-dark); 
}

.page-thumbs .thumb {
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: transform 0.2s ease;
}
.page-thumbs .thumb:hover {
  transform: translateY(-3px);
}

.page-thumbs .thumb .thumb-canvas {
  width: 64px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
}
.dark-theme .page-thumbs .thumb .thumb-canvas { 
  background: #111827; 
  border-color: var(--border-dark); 
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.page-thumbs .thumb.active .thumb-canvas { 
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.page-thumbs .thumb .thumb-canvas img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  display: block; 
}
.page-thumbs .thumb .thumb-placeholder { 
  font-size: 18px; 
  color: #d1d5db; 
}
.dark-theme .page-thumbs .thumb .thumb-placeholder { 
  color: #4b5563; 
}

.page-thumbs .thumb .thumb-label { 
  position: absolute;
  top: -2px;
  left: -2px;
  background-color: var(--primary-color);
  color: white;
  font-size: 10px; 
  font-weight: 600;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.drop-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  background-color: rgba(79, 70, 229, 0.1);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  border: 2px dashed var(--primary-color);
  border-radius: 12px;
  pointer-events: none;
  transition: all 0.2s;
}

.dark-theme .drop-overlay {
  background-color: rgba(99, 102, 241, 0.1);
}

.drop-message {
  background-color: white;
  border-radius: 50px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  font-weight: 500;
  color: var(--primary-color);
}

.dark-theme .drop-message {
  background-color: #1f2937;
  color: #c7d2fe;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.drop-message i {
  font-size: 20px;
}
</style>
