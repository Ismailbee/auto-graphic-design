<template>
  <div class="shape-controls space-y-4">
    <!-- Fill Section -->
    <div class="control-section">
      <h4 class="section-title">Fill</h4>
      
      <div class="flex items-center space-x-3">
        <div class="color-picker-wrapper">
          <input
            type="color"
            :value="commonProperty('fill')"
            @input="updateProperty('fill', getInputValue($event))"
            class="color-input"
            title="Fill color"
          />
          <div 
            class="color-preview"
            :style="{ backgroundColor: commonProperty('fill') }"
          ></div>
        </div>
        
        <input
          type="text"
          :value="commonProperty('fill')"
          @input="updateProperty('fill', getInputValue($event))"
          class="control-input flex-1"
          placeholder="#3b82f6"
        />
      </div>

      <!-- Fill Opacity -->
      <div class="control-group">
        <label class="control-label">Fill Opacity</label>
        <div class="flex items-center space-x-2">
          <input
            type="range"
            :value="fillOpacity"
            @input="updateFillOpacity(getInputNumberValue($event))"
            class="flex-1 slider"
            min="0"
            max="100"
            step="1"
          />
          <span class="w-12 text-xs text-gray-600">
            {{ fillOpacity }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Stroke Section -->
    <div class="control-section">
      <h4 class="section-title">Stroke</h4>
      
      <!-- Stroke Color -->
      <div class="flex items-center space-x-3">
        <div class="color-picker-wrapper">
          <input
            type="color"
            :value="commonProperty('stroke')"
            @input="updateProperty('stroke', getInputValue($event))"
            class="color-input"
            title="Stroke color"
          />
          <div 
            class="color-preview"
            :style="{ backgroundColor: commonProperty('stroke') }"
          ></div>
        </div>
        
        <input
          type="text"
          :value="commonProperty('stroke')"
          @input="updateProperty('stroke', getInputValue($event))"
          class="control-input flex-1"
          placeholder="#1d4ed8"
        />
      </div>

      <!-- Stroke Width -->
      <div class="control-group">
        <label class="control-label">Stroke Width</label>
        <div class="flex items-center space-x-2">
          <input
            type="range"
            :value="commonProperty('strokeWidth')"
            @input="updateProperty('strokeWidth', getInputNumberValue($event))"
            class="flex-1 slider"
            min="0"
            max="20"
            step="0.5"
          />
          <input
            type="number"
            :value="commonProperty('strokeWidth')"
            @input="updateProperty('strokeWidth', Math.max(0, getInputNumberValue($event)))"
            class="w-16 control-input"
            min="0"
            max="20"
            step="0.5"
          />
          <span class="text-xs text-gray-500">px</span>
        </div>
      </div>

      <!-- Stroke Style -->
      <div class="control-group">
        <label class="control-label">Stroke Style</label>
        <select
          :value="strokeStyle"
          @change="updateStrokeStyle(getInputValue($event))"
          class="control-select"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>
    </div>

    <!-- Shape Properties Section -->
    <div class="control-section">
      <h4 class="section-title">Shape</h4>
      
      <!-- Corner Radius (for rectangles) -->
      <div v-if="hasRectangles" class="control-group">
        <label class="control-label">Corner Radius</label>
        <div class="flex items-center space-x-2">
          <input
            type="range"
            :value="commonProperty('cornerRadius') || 0"
            @input="updateProperty('cornerRadius', getInputNumberValue($event))"
            class="flex-1 slider"
            min="0"
            max="50"
            step="1"
          />
          <input
            type="number"
            :value="commonProperty('cornerRadius') || 0"
            @input="updateProperty('cornerRadius', Math.max(0, getInputNumberValue($event)))"
            class="w-16 control-input"
            min="0"
            max="50"
          />
          <span class="text-xs text-gray-500">px</span>
        </div>
      </div>

      <!-- Shape Type Selector -->
      <div class="control-group">
        <label class="control-label">Shape Type</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            @click="updateProperty('shapeType', 'rectangle')"
            :class="['shape-button', { 'active': commonProperty('shapeType') === 'rectangle' }]"
            title="Rectangle"
          >
            <div class="w-4 h-3 bg-current rounded-sm"></div>
            Rectangle
          </button>
          
          <button
            @click="updateProperty('shapeType', 'circle')"
            :class="['shape-button', { 'active': commonProperty('shapeType') === 'circle' }]"
            title="Circle"
          >
            <div class="w-4 h-4 bg-current rounded-full"></div>
            Circle
          </button>
          
          <button
            @click="updateProperty('shapeType', 'triangle')"
            :class="['shape-button', { 'active': commonProperty('shapeType') === 'triangle' }]"
            title="Triangle"
          >
            <div class="triangle-icon"></div>
            Triangle
          </button>
          
          <button
            @click="updateProperty('shapeType', 'star')"
            :class="['shape-button', { 'active': commonProperty('shapeType') === 'star' }]"
            title="Star"
          >
            <StarIcon class="w-4 h-4" />
            Star
          </button>
        </div>
      </div>
    </div>

    <!-- Effects Section -->
    <div class="control-section">
      <h4 class="section-title">Effects</h4>
      
      <!-- Blend Mode -->
      <div class="control-group">
        <label class="control-label">Blend Mode</label>
        <select
          :value="blendMode"
          @change="updateBlendMode(getInputValue($event))"
          class="control-select"
        >
          <option value="normal">Normal</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="overlay">Overlay</option>
          <option value="darken">Darken</option>
          <option value="lighten">Lighten</option>
          <option value="color-dodge">Color Dodge</option>
          <option value="color-burn">Color Burn</option>
          <option value="hard-light">Hard Light</option>
          <option value="soft-light">Soft Light</option>
          <option value="difference">Difference</option>
          <option value="exclusion">Exclusion</option>
        </select>
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
    </div>

    <!-- Lock Aspect Ratio -->
    <div class="control-section">
      <div class="flex items-center justify-between">
        <label class="control-label">Lock Aspect Ratio</label>
        <button
          @click="toggleAspectRatio"
          :class="['toggle-button', { 'active': aspectRatioLocked }]"
        >
          {{ aspectRatioLocked ? 'Locked' : 'Unlocked' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { StarIcon } from '@heroicons/vue/24/outline'
import type { ShapeObject } from '@/types'
import { getInputValue, getInputNumberValue } from '@/utils/event-helpers'

// Props
const props = defineProps<{
  selectedObjects: ShapeObject[]
}>()

// Emits
const emit = defineEmits<{
  'update-object': [{ id: string; updates: Partial<ShapeObject> }]
}>()

// State
const fillOpacity = ref(100)
const strokeStyle = ref('solid')
const blendMode = ref('normal')
const hasShadow = ref(false)
const aspectRatioLocked = ref(false)

// Computed
const hasRectangles = computed(() => 
  props.selectedObjects.some(obj => obj.shapeType === 'rectangle')
)

// Methods
function commonProperty(property: keyof ShapeObject): any {
  if (props.selectedObjects.length === 0) return undefined
  
  const firstValue = props.selectedObjects[0][property]
  const allSame = props.selectedObjects.every(obj => obj[property] === firstValue)
  
  return allSame ? firstValue : undefined
}

function updateProperty(property: keyof ShapeObject, value: any) {
  props.selectedObjects.forEach(obj => {
    emit('update-object', { id: obj.id, updates: { [property]: value } })
  })
}

function updateFillOpacity(value: number) {
  fillOpacity.value = value
  // In a real implementation, this would update the fill color with alpha
}

function updateStrokeStyle(value: string) {
  strokeStyle.value = value
  // In a real implementation, this would update a strokeDashArray property
}

function updateBlendMode(value: string) {
  blendMode.value = value
  // In a real implementation, this would update a blendMode property on the object
}

function toggleShadow() {
  hasShadow.value = !hasShadow.value
  // In a real implementation, this would update a shadow property on the object
}

function toggleAspectRatio() {
  aspectRatioLocked.value = !aspectRatioLocked.value
  // In a real implementation, this would affect how the object is resized
}
</script>

<style scoped>
.shape-controls {
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

.control-select {
  @apply w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white;
}

.color-picker-wrapper {
  @apply relative;
}

.color-input {
  @apply w-8 h-8 border-0 rounded-md cursor-pointer opacity-0 absolute inset-0;
}

.color-preview {
  @apply w-8 h-8 border border-gray-300 rounded-md cursor-pointer;
}

.shape-button {
  @apply flex flex-col items-center justify-center space-y-1 p-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

.shape-button.active {
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

.triangle-icon {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 10px solid currentColor;
}
</style>
