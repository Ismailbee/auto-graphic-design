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
        <!-- Panel Content -->
        <div class="panel-content">
          <!-- Header with close button -->
          <div class="panel-header">
            <div class="flex items-center space-x-2">
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
              ✕
            </button>
          </div>

          <!-- Simple Controls -->
          <div class="panel-body">
            <!-- Text Controls -->
            <div v-if="hasTextObjects" class="control-section">
              <h4 class="section-title">Text Properties</h4>
              
              <div class="space-y-3">
                <div>
                  <label class="control-label">Font Size</label>
                  <input
                    type="number"
                    :value="getCommonProperty('fontSize')"
                    @input="updateProperty('fontSize', getInputIntValue($event))"
                    class="control-input"
                    min="8"
                    max="200"
                  />
                </div>
                
                <div>
                  <label class="control-label">Color</label>
                  <input
                    type="color"
                    :value="getCommonProperty('fill')"
                    @input="updateProperty('fill', getInputValue($event))"
                    class="control-input"
                  />
                </div>
                
                <div class="flex space-x-2">
                  <button
                    @click="toggleBold"
                    :class="['style-button', { 'active': isBold }]"
                    title="Bold"
                  >
                    B
                  </button>
                  
                  <button
                    @click="toggleItalic"
                    :class="['style-button', { 'active': isItalic }]"
                    title="Italic"
                  >
                    I
                  </button>
                </div>
              </div>
            </div>

            <!-- Image Controls -->
            <div v-if="hasImageObjects" class="control-section">
              <h4 class="section-title">Image Properties</h4>
              
              <div class="space-y-3">
                <div>
                  <label class="control-label">Opacity</label>
                  <input
                    type="range"
                    :value="getCommonProperty('opacity') * 100"
                    @input="updateProperty('opacity', getInputNumberValue($event) / 100)"
                    class="control-input"
                    min="0"
                    max="100"
                  />
                </div>
                
                <button
                  @click="flipHorizontal"
                  class="action-button"
                >
                  Flip Horizontal
                </button>
              </div>
            </div>

            <!-- Shape Controls -->
            <div v-if="hasShapeObjects" class="control-section">
              <h4 class="section-title">Shape Properties</h4>
              
              <div class="space-y-3">
                <div>
                  <label class="control-label">Fill Color</label>
                  <input
                    type="color"
                    :value="getCommonProperty('fill')"
                    @input="updateProperty('fill', getInputValue($event))"
                    class="control-input"
                  />
                </div>
                
                <div>
                  <label class="control-label">Stroke Width</label>
                  <input
                    type="number"
                    :value="getCommonProperty('strokeWidth')"
                    @input="updateProperty('strokeWidth', getInputNumberValue($event))"
                    class="control-input"
                    min="0"
                    max="20"
                  />
                </div>
              </div>
            </div>

            <!-- Common Controls -->
            <div class="control-section">
              <h4 class="section-title">Transform</h4>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="control-label">X</label>
                  <input
                    type="number"
                    :value="Math.round(getCommonProperty('x'))"
                    @input="updateProperty('x', getInputNumberValue($event))"
                    class="control-input"
                  />
                </div>
                
                <div>
                  <label class="control-label">Y</label>
                  <input
                    type="number"
                    :value="Math.round(getCommonProperty('y'))"
                    @input="updateProperty('y', getInputNumberValue($event))"
                    class="control-input"
                  />
                </div>
              </div>
              
              <div class="flex space-x-2 mt-3">
                <button
                  @click="$emit('duplicate', selectedObjects[0].id)"
                  class="action-button"
                >
                  Duplicate
                </button>
                
                <button
                  @click="$emit('delete', selectedObjects[0].id)"
                  class="action-button delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { getInputValue, getInputNumberValue, getInputIntValue } from '@/utils/event-helpers'

// Props
const props = defineProps<{
  selectedObjects: any[]
  canvasContainer?: HTMLElement | null
  zoom?: number
}>()

// Emits
const emit = defineEmits<{
  'update-object': [id: string, updates: any]
  'duplicate': [id: string]
  'delete': [id: string]
  'close': []
}>()

// Refs
const floatingPanel = ref<HTMLElement | null>(null)

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

const panelTitle = computed(() => {
  if (props.selectedObjects.length === 0) return 'Properties'
  if (props.selectedObjects.length === 1) {
    const obj = props.selectedObjects[0]
    return `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} Properties`
  }
  return `${props.selectedObjects.length} Objects Selected`
})

const isBold = computed(() => {
  const fontStyle = getCommonProperty('fontStyle')
  return fontStyle?.includes('bold') || false
})

const isItalic = computed(() => {
  const fontStyle = getCommonProperty('fontStyle')
  return fontStyle?.includes('italic') || false
})

// Watch for selection changes
watch(() => props.selectedObjects, (newSelection) => {
  if (newSelection.length > 0) {
    showPanel()
  } else {
    hidePanel()
  }
}, { immediate: true })

// Methods
function getCommonProperty(property: string): any {
  if (props.selectedObjects.length === 0) return undefined
  
  const firstValue = props.selectedObjects[0][property]
  const allSame = props.selectedObjects.every(obj => obj[property] === firstValue)
  
  return allSame ? firstValue : undefined
}

function updateProperty(property: string, value: any) {
  props.selectedObjects.forEach(obj => {
    emit('update-object', obj.id, { [property]: value })
  })
}

function showPanel() {
  if (props.selectedObjects.length === 0) return

  nextTick(() => {
    if (props.canvasContainer && props.selectedObjects.length > 0) {
      // Simple positioning - place panel to the right of the canvas
      const containerRect = props.canvasContainer.getBoundingClientRect()
      panelX.value = containerRect.right + 20
      panelY.value = containerRect.top + 50
    }
    isVisible.value = true
  })
}

function hidePanel() {
  isVisible.value = false
}

function toggleBold() {
  const currentStyle = getCommonProperty('fontStyle') || 'normal'
  const isBoldNow = currentStyle.includes('bold')
  
  let newStyle = currentStyle.replace('bold', '').trim()
  if (!isBoldNow) {
    newStyle = newStyle === 'normal' ? 'bold' : `${newStyle} bold`.trim()
  }
  if (newStyle === '') newStyle = 'normal'
  
  updateProperty('fontStyle', newStyle)
}

function toggleItalic() {
  const currentStyle = getCommonProperty('fontStyle') || 'normal'
  const isItalicNow = currentStyle.includes('italic')
  
  let newStyle = currentStyle.replace('italic', '').trim()
  if (!isItalicNow) {
    newStyle = newStyle === 'normal' ? 'italic' : `${newStyle} italic`.trim()
  }
  if (newStyle === '') newStyle = 'normal'
  
  updateProperty('fontStyle', newStyle)
}

function flipHorizontal() {
  props.selectedObjects.forEach(obj => {
    const newScaleX = obj.scaleX * -1
    emit('update-object', obj.id, { scaleX: newScaleX })
  })
}

function handleMouseDown(event: MouseEvent) {
  // Simplified - no dragging for now
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Simple click outside handler
function handleClickOutside(event: MouseEvent) {
  if (floatingPanel.value && !floatingPanel.value.contains(event.target as Node)) {
    emit('close')
  }
}

// Event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.floating-properties-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  min-width: 320px;
  max-width: 384px;
}

.panel-content {
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling */
  border-radius: 8px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.panel-body {
  padding: 16px;
  space-y: 16px;
  max-height: 384px;
  overflow-y: auto;
}

.control-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.control-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
}

.control-input {
  width: 100%;
  padding: 6px 8px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s;
}

.control-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.style-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.style-button:hover {
  background: #f3f4f6;
}

.style-button.active {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background: #f3f4f6;
}

.delete-button:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}
</style>
