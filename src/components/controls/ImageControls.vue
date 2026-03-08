<template>
  <div class="image-controls space-y-4">
    <!-- Image Actions Section -->
    <div class="control-section">
      <h4 class="section-title">Image</h4>
      
      <div class="grid grid-cols-2 gap-2">
        <button
          @click="handleReplaceImage"
          class="action-button"
          title="Replace image"
        >
          <PhotoIcon class="w-4 h-4" />
          Replace
        </button>
        
        <button
          @click="handleCropImage"
          class="action-button"
          title="Crop image"
        >
          <ScissorsIcon class="w-4 h-4" />
          Crop
        </button>
      </div>
      
      <!-- Hidden file input for image replacement -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />
    </div>

    <!-- Transform Section -->
    <div class="control-section">
      <h4 class="section-title">Transform</h4>
      
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
    </div>

    <!-- Adjustments Section -->
    <div class="control-section">
      <h4 class="section-title">Adjustments</h4>
      
      <!-- Opacity -->
      <div class="control-group">
        <label class="control-label">Opacity</label>
        <div class="flex items-center space-x-2">
          <input
            type="range"
            :value="commonProperty('opacity') * 100"
            @input="updateProperty('opacity', getInputNumberValue($event) / 100)"
            class="flex-1 slider"
            min="0"
            max="100"
            step="1"
          />
          <span class="w-12 text-xs text-gray-600">
            {{ Math.round(commonProperty('opacity') * 100) }}%
          </span>
        </div>
      </div>

      <!-- Brightness (simulated with opacity for now) -->
      <div class="control-group">
        <label class="control-label">Brightness</label>
        <div class="flex items-center space-x-2">
          <input
            type="range"
            :value="brightness"
            @input="updateBrightness(getInputNumberValue($event))"
            class="flex-1 slider"
            min="0"
            max="200"
            step="1"
          />
          <span class="w-12 text-xs text-gray-600">
            {{ brightness }}%
          </span>
        </div>
      </div>

      <!-- Contrast -->
      <div class="control-group">
        <label class="control-label">Contrast</label>
        <div class="flex items-center space-x-2">
          <input
            type="range"
            :value="contrast"
            @input="updateContrast(getInputNumberValue($event))"
            class="flex-1 slider"
            min="0"
            max="200"
            step="1"
          />
          <span class="w-12 text-xs text-gray-600">
            {{ contrast }}%
          </span>
        </div>
      </div>

      <!-- Saturation -->
      <div class="control-group">
        <label class="control-label">Saturation</label>
        <div class="flex items-center space-x-2">
          <input
            type="range"
            :value="saturation"
            @input="updateSaturation(getInputNumberValue($event))"
            class="flex-1 slider"
            min="0"
            max="200"
            step="1"
          />
          <span class="w-12 text-xs text-gray-600">
            {{ saturation }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="control-section">
      <h4 class="section-title">Filters</h4>
      
      <div class="grid grid-cols-3 gap-2">
        <button
          @click="applyFilter('grayscale')"
          :class="['filter-button', { 'active': currentFilter === 'grayscale' }]"
          title="Grayscale"
        >
          B&W
        </button>
        
        <button
          @click="applyFilter('sepia')"
          :class="['filter-button', { 'active': currentFilter === 'sepia' }]"
          title="Sepia"
        >
          Sepia
        </button>
        
        <button
          @click="applyFilter('blur')"
          :class="['filter-button', { 'active': currentFilter === 'blur' }]"
          title="Blur"
        >
          Blur
        </button>
        
        <button
          @click="applyFilter('invert')"
          :class="['filter-button', { 'active': currentFilter === 'invert' }]"
          title="Invert"
        >
          Invert
        </button>
        
        <button
          @click="applyFilter('vintage')"
          :class="['filter-button', { 'active': currentFilter === 'vintage' }]"
          title="Vintage"
        >
          Vintage
        </button>
        
        <button
          @click="resetFilters"
          class="filter-button"
          title="Reset filters"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Mask & Effects Section -->
    <div class="control-section">
      <h4 class="section-title">Mask & Effects</h4>
      
      <!-- Corner Radius -->
      <div class="control-group">
        <label class="control-label">Corner Radius</label>
        <div class="flex items-center space-x-2">
          <input
            type="range"
            :value="cornerRadius"
            @input="updateCornerRadius(getInputNumberValue($event))"
            class="flex-1 slider"
            min="0"
            max="50"
            step="1"
          />
          <span class="w-12 text-xs text-gray-600">
            {{ cornerRadius }}px
          </span>
        </div>
      </div>

      <!-- Shadow Toggle -->
      <div class="flex items-center justify-between">
        <label class="control-label">Drop Shadow</label>
        <button
          @click="toggleShadow"
          :class="['toggle-button', { 'active': hasShadow }]"
        >
          {{ hasShadow ? 'On' : 'Off' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PhotoIcon, ScissorsIcon, ArrowsRightLeftIcon, ArrowsUpDownIcon } from '@heroicons/vue/24/outline'
import type { ImageObject } from '@/types'
import { getInputNumberValue } from '@/utils/event-helpers'

// Props
const props = defineProps<{
  selectedObjects: ImageObject[]
}>()

// Emits
const emit = defineEmits<{
  'update-object': [{ id: string; updates: Partial<ImageObject> }]
  'replace-image': [id: string, file: File]
  'crop-image': [id: string]
}>()

// Refs
const fileInput = ref<HTMLInputElement | null>(null)

// State for image adjustments (these would ideally be stored in the object)
const brightness = ref(100)
const contrast = ref(100)
const saturation = ref(100)
const cornerRadius = ref(0)
const currentFilter = ref<string | null>(null)
const hasShadow = ref(false)

// Methods
function commonProperty(property: keyof ImageObject): any {
  if (props.selectedObjects.length === 0) return undefined
  
  const firstValue = props.selectedObjects[0][property]
  const allSame = props.selectedObjects.every(obj => obj[property] === firstValue)
  
  return allSame ? firstValue : undefined
}

function updateProperty(property: keyof ImageObject, value: any) {
  props.selectedObjects.forEach(obj => {
    emit('update-object', { id: obj.id, updates: { [property]: value } })
  })
}

function handleReplaceImage() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file && props.selectedObjects.length > 0) {
    // For now, just emit for the first selected object
    emit('replace-image', props.selectedObjects[0].id, file)
  }
  
  // Reset the input
  if (target) target.value = ''
}

function handleCropImage() {
  if (props.selectedObjects.length > 0) {
    emit('crop-image', props.selectedObjects[0].id)
  }
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

function updateRotation(degrees: number) {
  const radians = degrees * (Math.PI / 180)
  updateProperty('rotation', radians)
}

function updateBrightness(value: number) {
  brightness.value = value
  // In a real implementation, this would update a filter property on the object
}

function updateContrast(value: number) {
  contrast.value = value
  // In a real implementation, this would update a filter property on the object
}

function updateSaturation(value: number) {
  saturation.value = value
  // In a real implementation, this would update a filter property on the object
}

function updateCornerRadius(value: number) {
  cornerRadius.value = value
  // In a real implementation, this would update a style property on the object
}

function applyFilter(filterType: string) {
  currentFilter.value = currentFilter.value === filterType ? null : filterType
  // In a real implementation, this would update a filter property on the object
}

function resetFilters() {
  currentFilter.value = null
  brightness.value = 100
  contrast.value = 100
  saturation.value = 100
  // Reset all filters on the object
}

function toggleShadow() {
  hasShadow.value = !hasShadow.value
  // In a real implementation, this would update a shadow property on the object
}
</script>

<style scoped>
.image-controls {
  @apply space-y-4;
}

.control-section {
  @apply space-y-3;
}

.section-title {
  @apply text-xs font-semibold text-gray-700 uppercase tracking-wide;
}

.control-group {
  @apply space-y-2;
}

.control-label {
  @apply block text-xs text-gray-600 font-medium;
}

.control-input {
  @apply px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.action-button {
  @apply flex items-center justify-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

.filter-button {
  @apply px-2 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

.filter-button.active {
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
