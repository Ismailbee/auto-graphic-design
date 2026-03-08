<template>
  <div class="transform-controls space-y-4">
    <!-- Position Section -->
    <div class="control-section">
      <h4 class="section-title">Position</h4>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="control-group">
          <label class="control-label">X</label>
          <input
            type="number"
            :value="Math.round(commonProperty('x'))"
            @input="updateProperty('x', getInputNumberValue($event))"
            class="control-input"
            step="1"
          />
        </div>
        
        <div class="control-group">
          <label class="control-label">Y</label>
          <input
            type="number"
            :value="Math.round(commonProperty('y'))"
            @input="updateProperty('y', getInputNumberValue($event))"
            class="control-input"
            step="1"
          />
        </div>
      </div>
    </div>

    <!-- Size Section -->
    <div class="control-section">
      <h4 class="section-title">Size</h4>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="control-group">
          <label class="control-label">Width</label>
          <input
            type="number"
            :value="Math.round(commonProperty('width'))"
            @input="updateWidth(getInputNumberValue($event))"
            class="control-input"
            min="1"
            step="1"
          />
        </div>
        
        <div class="control-group">
          <label class="control-label">Height</label>
          <input
            type="number"
            :value="Math.round(commonProperty('height'))"
            @input="updateHeight(getInputNumberValue($event))"
            class="control-input"
            min="1"
            step="1"
          />
        </div>
      </div>

      <!-- Lock Aspect Ratio -->
      <div class="flex items-center space-x-2">
        <button
          @click="toggleAspectRatio"
          :class="['aspect-button', { 'active': aspectRatioLocked }]"
          title="Lock aspect ratio"
        >
          <LockClosedIcon v-if="aspectRatioLocked" class="w-4 h-4" />
          <LockOpenIcon v-else class="w-4 h-4" />
        </button>
        <span class="text-xs text-gray-600">
          {{ aspectRatioLocked ? 'Aspect ratio locked' : 'Aspect ratio unlocked' }}
        </span>
      </div>
    </div>

    <!-- Transform Section -->
    <div class="control-section">
      <h4 class="section-title">Transform</h4>
      
      <!-- Rotation -->
      <div class="control-group">
        <label class="control-label">Rotation</label>
        <div class="flex items-center space-x-2">
          <input
            type="range"
            :value="commonProperty('rotation') * (180 / Math.PI)"
            @input="updateRotation(getInputNumberValue($event))"
            class="flex-1 slider"
            min="0"
            max="360"
            step="1"
          />
          <input
            type="number"
            :value="Math.round(commonProperty('rotation') * (180 / Math.PI))"
            @input="updateRotation(getInputNumberValue($event))"
            class="w-16 control-input"
            min="0"
            max="360"
          />
          <span class="text-xs text-gray-500">°</span>
        </div>
      </div>

      <!-- Flip Buttons -->
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="flipHorizontal"
          class="action-button"
          title="Flip horizontal"
        >
          <ArrowsRightLeftIcon class="w-4 h-4" />
          Flip H
        </button>
        
        <button
          @click="flipVertical"
          class="action-button"
          title="Flip vertical"
        >
          <ArrowsUpDownIcon class="w-4 h-4" />
          Flip V
        </button>
      </div>
    </div>

    <!-- Layer Controls Section -->
    <div class="control-section">
      <h4 class="section-title">Layer</h4>
      
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="bringForward"
          class="action-button"
          title="Bring forward"
        >
          <ChevronUpIcon class="w-4 h-4" />
          Forward
        </button>
        
        <button
          @click="sendBackward"
          class="action-button"
          title="Send backward"
        >
          <ChevronDownIcon class="w-4 h-4" />
          Backward
        </button>
      </div>
    </div>

    <!-- Actions Section -->
    <div class="control-section">
      <h4 class="section-title">Actions</h4>
      
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="duplicate"
          class="action-button"
          title="Duplicate (Ctrl+D)"
        >
          <DocumentDuplicateIcon class="w-4 h-4" />
          Duplicate
        </button>
        
        <button
          @click="deleteObject"
          class="action-button delete-button"
          title="Delete (Delete)"
        >
          <TrashIcon class="w-4 h-4" />
          Delete
        </button>
      </div>

      <!-- Lock Toggle -->
      <div class="flex items-center justify-between">
        <label class="control-label">Lock Object</label>
        <button
          @click="toggleLock"
          :class="['toggle-button', { 'active': commonProperty('locked') }]"
        >
          {{ commonProperty('locked') ? 'Locked' : 'Unlocked' }}
        </button>
      </div>

      <!-- Visibility Toggle -->
      <div class="flex items-center justify-between">
        <label class="control-label">Visible</label>
        <button
          @click="toggleVisibility"
          :class="['toggle-button', { 'active': commonProperty('visible') }]"
        >
          {{ commonProperty('visible') ? 'Visible' : 'Hidden' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  LockClosedIcon, 
  LockOpenIcon, 
  ArrowsRightLeftIcon, 
  ArrowsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import type { AnyDesignObject } from '@/types'
import { getInputNumberValue } from '@/utils/event-helpers'

// Props
const props = defineProps<{
  selectedObjects: AnyDesignObject[]
}>()

// Emits
const emit = defineEmits<{
  'update-object': [{ id: string; updates: Partial<AnyDesignObject> }]
  'duplicate': [id: string]
  'delete': [id: string]
  'bring-forward': [id: string]
  'send-backward': [id: string]
}>()

// State
const aspectRatioLocked = ref(false)
const originalAspectRatio = ref<number | null>(null)

// Methods
function commonProperty(property: keyof AnyDesignObject): any {
  if (props.selectedObjects.length === 0) return undefined
  
  const firstValue = props.selectedObjects[0][property]
  const allSame = props.selectedObjects.every(obj => obj[property] === firstValue)
  
  return allSame ? firstValue : undefined
}

function updateProperty(property: keyof AnyDesignObject, value: any) {
  props.selectedObjects.forEach(obj => {
    emit('update-object', { id: obj.id, updates: { [property]: value } })
  })
}

function updateWidth(newWidth: number) {
  if (aspectRatioLocked.value && originalAspectRatio.value) {
    const newHeight = newWidth / originalAspectRatio.value
    props.selectedObjects.forEach(obj => {
      emit('update-object', { 
        id: obj.id, 
        updates: { 
          width: newWidth, 
          height: newHeight 
        } 
      })
    })
  } else {
    updateProperty('width', newWidth)
  }
}

function updateHeight(newHeight: number) {
  if (aspectRatioLocked.value && originalAspectRatio.value) {
    const newWidth = newHeight * originalAspectRatio.value
    props.selectedObjects.forEach(obj => {
      emit('update-object', { 
        id: obj.id, 
        updates: { 
          width: newWidth, 
          height: newHeight 
        } 
      })
    })
  } else {
    updateProperty('height', newHeight)
  }
}

function toggleAspectRatio() {
  aspectRatioLocked.value = !aspectRatioLocked.value

  if (aspectRatioLocked.value && props.selectedObjects.length > 0) {
    const obj = props.selectedObjects[0]
    // Only calculate aspect ratio if width and height are defined
    if (obj.width && obj.height) {
      originalAspectRatio.value = obj.width / obj.height
    } else {
      originalAspectRatio.value = null
    }
  } else {
    originalAspectRatio.value = null
  }
}

function updateRotation(degrees: number) {
  const radians = degrees * (Math.PI / 180)
  updateProperty('rotation', radians)
}

function flipHorizontal() {
  props.selectedObjects.forEach(obj => {
    const newScaleX = obj.scaleX * -1
    emit('update-object', { id: obj.id, updates: { scaleX: newScaleX } })
  })
}

function flipVertical() {
  props.selectedObjects.forEach(obj => {
    const newScaleY = obj.scaleY * -1
    emit('update-object', { id: obj.id, updates: { scaleY: newScaleY } })
  })
}

function bringForward() {
  props.selectedObjects.forEach(obj => {
    emit('bring-forward', obj.id)
  })
}

function sendBackward() {
  props.selectedObjects.forEach(obj => {
    emit('send-backward', obj.id)
  })
}

function duplicate() {
  props.selectedObjects.forEach(obj => {
    emit('duplicate', obj.id)
  })
}

function deleteObject() {
  props.selectedObjects.forEach(obj => {
    emit('delete', obj.id)
  })
}

function toggleLock() {
  const currentLocked = commonProperty('locked')
  updateProperty('locked', !currentLocked)
}

function toggleVisibility() {
  const currentVisible = commonProperty('visible')
  updateProperty('visible', !currentVisible)
}
</script>

<style scoped>
.transform-controls {
  @apply space-y-4;
}

.control-section {
  @apply space-y-3;
}

.section-title {
  @apply text-xs font-semibold text-gray-700 uppercase tracking-wide;
}

.control-group {
  @apply space-y-1;
}

.control-label {
  @apply block text-xs text-gray-600 font-medium;
}

.control-input {
  @apply w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.action-button {
  @apply flex items-center justify-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

.delete-button {
  @apply hover:bg-red-50 hover:border-red-300 hover:text-red-700;
}

.aspect-button {
  @apply flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

.aspect-button.active {
  @apply bg-blue-100 border-blue-300 text-blue-700;
}

.toggle-button {
  @apply px-3 py-1 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

.toggle-button.active {
  @apply bg-green-100 border-green-300 text-green-700;
}

.slider {
  @apply appearance-none h-2 bg-gray-200 rounded-lg outline-none;
}

.slider::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-blue-500 rounded-full cursor-pointer;
}

.slider::-moz-range-thumb {
  @apply w-4 h-4 bg-blue-500 rounded-full cursor-pointer border-0;
}
</style>
