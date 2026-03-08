<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="isVisible && selectedObjects.length > 0"
        ref="floatingPanel"
        :style="floatingStyles"
        class="floating-properties-panel"
        @mousedown="handleMouseDown"
        @keydown="handleKeyDown"
        tabindex="-1"
      >
        <!-- Arrow (simplified - hidden for now) -->
        <div
          v-if="false"
          class="floating-panel-arrow"
        ></div>

        <!-- Panel Content -->
        <div class="panel-content">
          <!-- Header with drag handle and close button -->
          <div class="panel-header" :class="{ 'cursor-move': isDraggable }">
            <div class="flex items-center space-x-2">
              <!-- Drag handle -->
              <div v-if="isDraggable" class="drag-handle">
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                </svg>
              </div>
              
              <!-- Title -->
              <h3 class="panel-title">
                {{ panelTitle }}
              </h3>
            </div>

            <!-- Close button -->
            <button
              @click="$emit('close')"
              class="close-button"
              aria-label="Close properties panel"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Dynamic Controls -->
          <div class="panel-body">
            <!-- Text Controls -->  
            <TextControls
              v-if="hasTextObjects"
              :selected-objects="textObjects"
              @update-object="$emit('update-object', $event.id, $event.updates)"
            />

            <!-- Image Controls -->
            <ImageControls
              v-if="hasImageObjects"
              :selected-objects="imageObjects"
              @update-object="$emit('update-object', $event.id, $event.updates)"
              @replace-image="(id, file) => $emit('replace-image', id, file)"
              @crop-image="(id) => $emit('crop-image', id)"
            />

            <!-- Shape Controls -->
            <ShapeControls
              v-if="hasShapeObjects"
              :selected-objects="shapeObjects"
              @update-object="$emit('update-object', $event.id, $event.updates)"
            />

            <!-- Common Transform Controls -->
            <TransformControls
              v-if="selectedObjects.length > 0"
              :selected-objects="selectedObjects"
              @update-object="$emit('update-object', $event.id, $event.updates)"
              @duplicate="$emit('duplicate', $event)"
              @delete="$emit('delete', $event)"
              @bring-forward="$emit('bring-forward', $event)"
              @send-backward="$emit('send-backward', $event)"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
// Simple X icon component
const XMarkIcon = {
  template: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
}
// Simplified implementation without complex dependencies
import type { AnyDesignObject, TextObject, ImageObject, ShapeObject } from '@/types'

// Import control components
import TextControls from './controls/TextControls.vue'
import ImageControls from './controls/ImageControls.vue'
import ShapeControls from './controls/ShapeControls.vue'
import TransformControls from './controls/TransformControls.vue'

// Props
const props = defineProps<{
  selectedObjects: AnyDesignObject[]
  canvasContainer?: HTMLElement | null
  zoom?: number
  isDraggable?: boolean
  showArrow?: boolean
}>()

// Emits
const emit = defineEmits<{
  'update-object': [id: string, updates: Partial<AnyDesignObject>]
  'replace-image': [id: string, file: File]
  'crop-image': [id: string]
  'duplicate': [id: string]
  'delete': [id: string]
  'bring-forward': [id: string]
  'send-backward': [id: string]
  'close': []
}>()

// Refs
const floatingPanel = ref<HTMLElement | null>(null)
const referenceElement = ref<HTMLElement | null>(null)

// Simple positioning state
const isVisible = ref(false)
const panelX = ref(0)
const panelY = ref(0)

// Computed styles for positioning
const floatingStyles = computed(() => ({
  position: 'fixed' as const,
  top: `${panelY.value}px`,
  left: `${panelX.value}px`,
  zIndex: 1000
}))

const arrowStyles = computed(() => ({
  display: 'none' // Simplified - no arrow for now
}))

// Simple show/hide functions
const show = () => {
  isVisible.value = true
}

const hide = () => {
  isVisible.value = false
}

// Computed properties
const hasTextObjects = computed(() => 
  props.selectedObjects.some(obj => obj.type === 'text')
)

const hasImageObjects = computed(() => 
  props.selectedObjects.some(obj => obj.type === 'image')
)

const hasShapeObjects = computed(() => 
  props.selectedObjects.some(obj => obj.type === 'shape')
)

const textObjects = computed(() => 
  props.selectedObjects.filter(obj => obj.type === 'text') as TextObject[]
)

const imageObjects = computed(() => 
  props.selectedObjects.filter(obj => obj.type === 'image') as ImageObject[]
)

const shapeObjects = computed(() => 
  props.selectedObjects.filter(obj => obj.type === 'shape') as ShapeObject[]
)

const panelTitle = computed(() => {
  if (props.selectedObjects.length === 0) return 'Properties'
  if (props.selectedObjects.length === 1) {
    const obj = props.selectedObjects[0]
    return `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} Properties`
  }
  return `${props.selectedObjects.length} Objects Selected`
})

// Dragging state
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// Watch for selection changes
watch(() => props.selectedObjects, (newSelection) => {
  if (newSelection.length > 0) {
    showPanel()
  } else {
    hidePanel()
  }
}, { immediate: true })

// Methods
function showPanel() {
  if (props.selectedObjects.length === 0) return

  nextTick(() => {
    if (props.canvasContainer && props.selectedObjects.length > 0) {
      // Simple positioning - place panel to the right of the canvas
      const containerRect = props.canvasContainer.getBoundingClientRect()
      panelX.value = containerRect.right + 20
      panelY.value = containerRect.top + 50
    }
    show()
  })
}

function hidePanel() {
  hide()
}

function handleMouseDown(event: MouseEvent) {
  if (!props.isDraggable) return
  
  const target = event.target as HTMLElement
  if (target.closest('.drag-handle') || target.closest('.panel-header')) {
    isDragging.value = true
    dragOffset.value = {
      x: event.clientX - floatingPanel.value!.offsetLeft,
      y: event.clientY - floatingPanel.value!.offsetTop
    }
    event.preventDefault()
  }
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value || !floatingPanel.value) return

  const newX = event.clientX - dragOffset.value.x
  const newY = event.clientY - dragOffset.value.y

  floatingPanel.value.style.left = `${newX}px`
  floatingPanel.value.style.top = `${newY}px`
}

function handleMouseUp() {
  isDragging.value = false
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Simple click outside handler
function handleClickOutside(event: MouseEvent) {
  if (!isDragging.value && floatingPanel.value && !floatingPanel.value.contains(event.target as Node)) {
    emit('close')
  }
}

// Event listeners for dragging and click outside
onMounted(() => {
  if (props.isDraggable) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (props.isDraggable) {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  document.removeEventListener('click', handleClickOutside)
})

// Expose methods for parent component
defineExpose({
  show: showPanel,
  hide: hidePanel,
  isVisible
})
</script>

<style scoped>
.floating-properties-panel {
  @apply bg-white rounded-lg shadow-xl border border-gray-200;
  @apply min-w-80 max-w-96;
  @apply backdrop-blur-sm;
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1));
}

.floating-panel-arrow {
  @apply bg-white border-gray-200;
  border-width: 1px 0 0 1px;
}

.panel-content {
  @apply overflow-hidden rounded-lg;
}

.panel-header {
  @apply flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50;
}

.panel-title {
  @apply text-sm font-semibold text-gray-800;
}

.drag-handle {
  @apply flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors;
}

.close-button {
  @apply flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700;
}

.panel-body {
  @apply p-4 space-y-4 max-h-96 overflow-y-auto;
}

/* Hide Custom scrollbar */
.panel-body::-webkit-scrollbar {
  display: none;
  width: 0px;
}

.panel-body::-webkit-scrollbar-track {
  display: none;
}

.panel-body::-webkit-scrollbar-thumb {
  display: none;
}
</style>
