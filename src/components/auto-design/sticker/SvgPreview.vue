<template>
  <div class="svg-preview-container" ref="containerRef">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading preview...</p>
    </div>
    
    <!-- SVG Content -->
    <div 
      v-show="!isLoading"
      ref="svgContainerRef"
      class="svg-content"
      :class="{ 
        'interactive': isInteractive,
        'has-selection': selectedElement !== null
      }"
      @click="handleContainerClick"
      v-html="svgContent"
    ></div>
    
    <!-- Selection Overlay -->
    <div 
      v-if="selectedElement && showSelectionOverlay"
      class="selection-overlay"
      :style="selectionOverlayStyle"
    >
      <div class="selection-actions">
        <button @click="$emit('edit-text', selectedElement)" class="selection-action-btn" title="Edit">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button @click="$emit('delete-element', selectedElement)" class="selection-action-btn delete" title="Delete">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Zoom Controls -->
    <div v-if="showZoomControls" class="zoom-controls">
      <button @click="zoomIn" class="zoom-btn" title="Zoom In">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>
      <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
      <button @click="zoomOut" class="zoom-btn" title="Zoom Out">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>
      <button @click="resetZoom" class="zoom-btn" title="Reset">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

// Props
const props = defineProps<{
  svgContent: string
  isLoading?: boolean
  isInteractive?: boolean
  showZoomControls?: boolean
  showSelectionOverlay?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'element-click', element: SVGElement): void
  (e: 'edit-text', element: SVGElement): void
  (e: 'delete-element', element: SVGElement): void
  (e: 'svg-loaded', svg: SVGSVGElement): void
}>()

// Refs
const containerRef = ref<HTMLDivElement>()
const svgContainerRef = ref<HTMLDivElement>()

// State
const selectedElement = ref<SVGElement | null>(null)
const zoomLevel = ref(1)

// Computed
const selectionOverlayStyle = computed(() => {
  if (!selectedElement.value || !containerRef.value) return {}
  
  const rect = selectedElement.value.getBoundingClientRect()
  const containerRect = containerRef.value.getBoundingClientRect()
  
  return {
    left: `${rect.left - containerRect.left}px`,
    top: `${rect.top - containerRect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  }
})

// Methods
function handleContainerClick(event: MouseEvent) {
  if (!props.isInteractive) return
  
  const target = event.target as SVGElement
  
  // Check if clicked on an interactive element
  if (target.closest('text, tspan, image, [data-editable]')) {
    const interactiveElement = target.closest('text, tspan, image, [data-editable]') as SVGElement
    selectedElement.value = interactiveElement
    emit('element-click', interactiveElement)
  } else {
    selectedElement.value = null
  }
}

function zoomIn() {
  zoomLevel.value = Math.min(zoomLevel.value + 0.25, 3)
  applyZoom()
}

function zoomOut() {
  zoomLevel.value = Math.max(zoomLevel.value - 0.25, 0.5)
  applyZoom()
}

function resetZoom() {
  zoomLevel.value = 1
  applyZoom()
}

function applyZoom() {
  if (!svgContainerRef.value) return
  const svg = svgContainerRef.value.querySelector('svg')
  if (svg) {
    svg.style.transform = `scale(${zoomLevel.value})`
    svg.style.transformOrigin = 'center center'
  }
}

// Watch for SVG content changes
watch(() => props.svgContent, async () => {
  await nextTick()
  if (svgContainerRef.value) {
    const svg = svgContainerRef.value.querySelector('svg') as SVGSVGElement
    if (svg) {
      emit('svg-loaded', svg)
      applyZoom()
    }
  }
})

// Initialize
onMounted(async () => {
  await nextTick()
  if (svgContainerRef.value) {
    const svg = svgContainerRef.value.querySelector('svg') as SVGSVGElement
    if (svg) {
      emit('svg-loaded', svg)
    }
  }
})

// Expose methods for parent component
defineExpose({
  zoomIn,
  zoomOut,
  resetZoom,
  getSvgElement: () => svgContainerRef.value?.querySelector('svg') as SVGSVGElement | null
})
</script>

<style scoped>
.svg-preview-container {
  position: relative;
  width: 100%;
  min-height: 300px;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e8e8e8;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.svg-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: transform 0.3s ease;
}

.svg-content :deep(svg) {
  max-width: 100%;
  max-height: 100%;
  height: auto;
  transition: transform 0.3s ease;
}

.svg-content.interactive {
  cursor: pointer;
}

.svg-content.interactive :deep(text),
.svg-content.interactive :deep(tspan),
.svg-content.interactive :deep([data-editable]) {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.svg-content.interactive :deep(text):hover,
.svg-content.interactive :deep(tspan):hover,
.svg-content.interactive :deep([data-editable]):hover {
  opacity: 0.8;
}

.selection-overlay {
  position: absolute;
  border: 2px dashed #667eea;
  background: rgba(102, 126, 234, 0.1);
  pointer-events: none;
  border-radius: 4px;
}

.selection-actions {
  position: absolute;
  top: -36px;
  right: 0;
  display: flex;
  gap: 4px;
  pointer-events: auto;
}

.selection-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: white;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.selection-action-btn:hover {
  background: #f5f5f5;
  transform: scale(1.1);
}

.selection-action-btn.delete {
  color: #dc3545;
}

.selection-action-btn.delete:hover {
  background: #fee;
}

.zoom-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  background: #e8e8e8;
}

.zoom-level {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  min-width: 45px;
  text-align: center;
}

/* Icon sizes */
.w-4 { width: 1rem; }
.h-4 { height: 1rem; }
.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }
</style>
