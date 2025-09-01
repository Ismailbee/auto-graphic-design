
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
            backgroundColor: canvasStore.backgroundColor
          }"
          :class="{ 'animate-page-change': animateCanvas }"
          ref="artboardEl"
        >
          <!-- Konva Stage will be mounted here -->
          <div ref="stageContainer" id="konva-container" class="konva-stage"></div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useCanvasStore } from '../../../stores/canvas-konva'
import { useKonvaCanvas } from '../../../composables/useKonvaCanvas'
import { useViewCulling } from '../../../composables/useViewCulling'
import { Konva } from '../../../lib/konva-init'

// Canvas ref
const stageContainer = ref(null)
const artboardEl = ref(null)
const canvasStore = useCanvasStore()
const { initCanvas, disposeCanvas } = useKonvaCanvas()
const { setupCullingEvents } = useViewCulling()

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
onMounted(() => {
  console.log("Canvas mounting attempt...", stageContainer.value);
  if (stageContainer.value) {
    console.log("Stage container found, initializing...");
    
    // Initialize Konva Stage + Layer
    const konvaCanvas = initCanvas('konva-container', {
      width: canvasStore.canvasSize.width,
      height: canvasStore.canvasSize.height
    });
    
    console.log("Konva initialized:", konvaCanvas);
    canvasStore.setCanvas(konvaCanvas);
    
    // Set up event handlers
    setupKeyboardShortcuts();
    
    // Set up view culling for performance optimization
    const cleanupCulling = setupCullingEvents();
    
    // Show grid if enabled
    if (canvasStore.gridVisible) {
      console.log("Grid is visible, updating grid...");
      canvasStore.updateGrid();
    }
    
    // Add cleanup for culling to onUnmounted
    onUnmounted(() => {
      if (cleanupCulling) cleanupCulling();
    });
  } else {
    console.error("Stage container element not found!");
  }
});

// Clean up when component is unmounted
onUnmounted(() => {
  disposeCanvas()
  // No need to manually remove keydown listener since we're using the setupKeyboardShortcuts approach
})

// Watch for canvas size changes
watch(() => canvasStore.canvasSize, (newSize) => {
  if (canvasStore.stageInstance) {
    canvasStore.stageInstance.width(newSize.width)
    canvasStore.stageInstance.height(newSize.height)
    
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
  zoomLevel.value = newZoom
}, { immediate: true })

// Watch for tool changes
watch(() => canvasStore.activeTool, (newTool) => {
  if (!canvasStore.stageInstance) return
  
  if (newTool === 'Hand') {
    // Set hand cursor for panning
    canvasStore.stageInstance.container().style.cursor = 'grab';
    
    // Disable dragging for objects during hand tool
    if (canvasStore.layerInstance) {
      canvasStore.layerInstance.children.forEach((node) => {
        if (node.getClassName() !== 'Transformer') {
          node.draggable(false);
        }
      });
    }
  } else {
    canvasStore.stageInstance.container().style.cursor = 'default';
    
    // Re-enable dragging for select tool
    if (newTool === 'Select' && canvasStore.layerInstance) {
      canvasStore.layerInstance.children.forEach((node) => {
        if (node.getClassName() !== 'Transformer') {
          node.draggable(true);
        }
      });
    }
  }
})

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
  // Debounce keyboard events to avoid performance issues
  const keyHandlers = {
    'v': () => canvasStore.setActiveTool('Select'),
    'h': () => canvasStore.setActiveTool('Hand'),
    'delete': () => canvasStore.deleteSelectedObject(),
    'backspace': () => canvasStore.deleteSelectedObject(),
    '+': () => zoomIn(),
    '-': () => zoomOut()
  };
  
  const ctrlKeyHandlers = {
    'z': (e) => {
      if (e.shiftKey) {
        canvasStore.redo();
      } else {
        canvasStore.undo();
      }
      e.preventDefault();
    },
    'd': (e) => {
      canvasStore.duplicateSelectedObject();
      e.preventDefault();
    },
    'g': (e) => {
      if (e.shiftKey) {
        canvasStore.ungroupSelectedObjects();
      } else {
        canvasStore.groupSelectedObjects();
      }
      e.preventDefault();
    },
    'a': (e) => {
      if (canvasStore.stageInstance && canvasStore.layerInstance) {
        // Select all objects (except transformers)
        const objects = canvasStore.layerInstance.children.filter(
          node => node.getClassName() !== 'Transformer'
        );
        
        if (objects.length > 0) {
          // For multi-select, we should create a selection mechanism
          // For now, select the most recently added object
          const lastObject = objects[objects.length - 1];
          canvasStore.setActiveObject(lastObject);
          // Force draw to ensure selection is visible
          canvasStore.layerInstance.draw();
        }
      }
      e.preventDefault();
    },
    '0': (e) => {
      zoomLevel.value = 100;
      updateZoomWithPoint();
      e.preventDefault();
    },
    '+': (e) => {
      zoomIn();
      e.preventDefault();
    },
    '-': (e) => {
      zoomOut();
      e.preventDefault();
    },
    's': (e) => {
      canvasStore.saveToFile();
      e.preventDefault();
    }
  };
  
  // Throttle keydown events
  let lastKeyTime = 0;
  const KEY_THROTTLE = 50; // ms
  
  document.addEventListener('keydown', (e) => {
    // Only handle shortcuts when canvas is focused
    if (!canvasStore.stageInstance) return;
    
    // Don't handle shortcuts if user is typing in an input
    const target = e.target;
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable) {
      return;
    }
    
    // Throttle events
    const now = Date.now();
    if (now - lastKeyTime < KEY_THROTTLE) return;
    lastKeyTime = now;
    
    // Handle key combinations
    const key = e.key.toLowerCase();
    
    if (e.ctrlKey || e.metaKey) {
      const handler = ctrlKeyHandlers[key];
      if (handler) handler(e);
    } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      const handler = keyHandlers[key];
      if (handler) handler();
    }
  });
}

// Mouse wheel zoom with throttling
const lastWheelTime = ref(0);
const WHEEL_THROTTLE = 50; // ms

function handleZoomWheel(e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    
    if (!canvasStore.stageInstance) return;
    
    // Throttle wheel events
    const now = Date.now();
    if (now - lastWheelTime.value < WHEEL_THROTTLE) return;
    lastWheelTime.value = now;
    
    // Get mouse position relative to stage
    const stage = canvasStore.stageInstance;
    const mousePointTo = {
      x: stage.getPointerPosition().x / stage.scaleX(),
      y: stage.getPointerPosition().y / stage.scaleY()
    };
    
    if (e.deltaY < 0) {
      zoomIn(mousePointTo);
    } else {
      zoomOut(mousePointTo);
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

  if (!canvasStore.stageInstance) return;
  
  const stage = canvasStore.stageInstance;
  const oldScale = stage.scaleX();
  const newScale = zoomLevel.value / 100;
  
  if (point) {
    // Calculate new position
    const mousePointTo = {
      x: point.x / oldScale,
      y: point.y / oldScale
    };
    
    const newPos = {
      x: point.x - mousePointTo.x * newScale,
      y: point.y - mousePointTo.y * newScale
    };
    
    // Apply new scale and position
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
  // stage draws are batched in the store scheduler as well
  stage.batchDraw();
  } else {
    // Just apply new scale
    stage.scale({ x: newScale, y: newScale });
  stage.batchDraw();
  }
}

// Canvas drag (hand tool) with performance optimization
function handleCanvasDrag(e) {
  if (canvasStore.activeTool !== 'Hand') return;
  
  isDragging.value = true;
  const stage = canvasStore.stageInstance;
  
  if (!stage) return;
  
  // Get initial position
  const startPos = stage.position();
  const startPointer = stage.getPointerPosition();
  
  // Change cursor to grabbing
  stage.container().style.cursor = 'grabbing';
  
  // Throttle move events for better performance
  let lastMoveTime = Date.now();
  const MOVE_THROTTLE = 16; // ~60fps
  let rafId = null;
  let lastDx = 0;
  let lastDy = 0;
  
  const moveHandler = (moveEvent) => {
    if (!isDragging.value) return;
    
    // Throttle moves
    const now = Date.now();
    if (now - lastMoveTime < MOVE_THROTTLE) {
      // Queue update via RAF instead of skipping completely
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          updatePosition(lastDx, lastDy);
          rafId = null;
        });
      }
      return;
    }
    
    lastMoveTime = now;
    
    const currentPointer = stage.getPointerPosition();
    
    // Calculate delta
    const dx = currentPointer.x - startPointer.x;
    const dy = currentPointer.y - startPointer.y;
    
    lastDx = dx;
    lastDy = dy;
    
    updatePosition(dx, dy);
  };
  
  const updatePosition = (dx, dy) => {
    // Set new position
    stage.position({
      x: startPos.x + dx,
      y: startPos.y + dy
    });
    
    // Use scheduleDraw for better performance
    canvasStore.scheduleDraw();
  };
  
  const upHandler = () => {
    isDragging.value = false;
    
    // Cancel any pending RAF
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    
    // Reset cursor
    if (canvasStore.activeTool === 'Hand') {
      stage.container().style.cursor = 'grab';
    } else {
      stage.container().style.cursor = 'default';
    }
    
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
  };
  
  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
}

// Handle drag events
function handleDragOver(e) {
  isDragOver.value = true;
  e.dataTransfer.dropEffect = 'copy';
}

function handleDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragOver.value = false;
  }
}

function handleDrop(e) {
  isDragOver.value = false;
  
  if (!canvasStore.stageInstance) return;
  
  // Get stage position
  const stage = canvasStore.stageInstance;
  const stageRect = stage.container().getBoundingClientRect();
  
  // Calculate position relative to stage
  const scale = stage.scaleX();
  const position = {
    x: (e.clientX - stageRect.left) / scale,
    y: (e.clientY - stageRect.top) / scale
  };
  
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleDroppedFiles(e.dataTransfer.files, position.x, position.y);
    return;
  }
  
  try {
    const raw = e.dataTransfer.getData('application/json') || '';
    if (!raw.trim()) return;
    const data = JSON.parse(raw);
    if (data) {
      handleDroppedElement(data, position.x, position.y);
    }
  } catch (err) {
    console.error('Failed to parse dropped element data', err);
  }
}

// Handle dropped files (images)
function handleDroppedFiles(files, x, y) {
  Array.from(files).forEach(async (file, index) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const dataUrl = await compressImageFile(file, { maxDim: 2048, quality: 0.85 });
      canvasStore.addElement('image', {
        src: dataUrl,
        left: x + (index * 20),
        top: y + (index * 20)
      });
    } catch (err) {
      console.warn('Image compression failed, using original', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        canvasStore.addElement('image', {
          src: e.target.result,
          left: x + (index * 20),
          top: y + (index * 20)
        });
      };
      reader.readAsDataURL(file);
    }
  });
}

// Handle dropped elements from sidebar
function handleDroppedElement(data, x, y) {
  console.log('Dropped element:', data);
  canvasStore.addElement(data.type, {
    ...data.options,
    left: x,
    top: y
  });
}

// Util: client-side compress and resize images to reduce GPU memory
async function compressImageFile(file, { maxDim = 2048, quality = 0.85 } = {}) {
  // Use offscreen canvas if available for better performance
  const useOffscreen = typeof OffscreenCanvas !== 'undefined';
  
  const dataUrl = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
  
  const img = await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = dataUrl;
  });
  
  const { width, height } = img;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);
  
  let canvas, ctx;
  
  if (useOffscreen) {
    canvas = new OffscreenCanvas(targetW, targetH);
    ctx = canvas.getContext('2d', { alpha: file.type === 'image/png' });
  } else {
    canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    ctx = canvas.getContext('2d');
  }
  
  // Use low quality interpolation for speed; browsers may support imageSmoothingQuality
  if (ctx.imageSmoothingEnabled !== undefined) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium'; // Balance between quality and performance
  }
  
  ctx.drawImage(img, 0, 0, targetW, targetH);
  
  if (useOffscreen) {
    const blob = await canvas.convertToBlob({
      type: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
      quality: quality
    });
    return URL.createObjectURL(blob);
  } else {
    return canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
  }
}
</script>

<style scoped>
/* Fonts: moved to index.html with preconnect + display=swap for non-blocking load */

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
  z-index: 6; /* Ensure the artboard is above the wrapper */
  transition: transform 0.5s ease, opacity 0.5s ease;
}
.dark-theme .canvas-artboard {
  box-shadow: 0 0 0 1px var(--border-dark), 0 8px 25px rgba(0, 0, 0, 0.3);
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

.konva-stage {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

/* Selection styles - for konva objects */
.konva-stage .konva-shape-selected {
  box-shadow: 0 0 0 2px #4f46e5, 0 0 10px rgba(79, 70, 229, 0.5);
}

/* Make transformer anchors more visible */
.konva-stage .anchor {
  stroke: #4f46e5 !important;
  fill: white !important;
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 3px rgba(79, 70, 229, 0.5));
}

/* === FLOATING CONTROLS STYLES === */

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
    