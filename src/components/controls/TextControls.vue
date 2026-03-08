<template>
  <div class="text-controls space-y-4">
    <!-- Typography Section -->
    <div class="control-section">
      <h4 class="section-title">Typography</h4>
      
      <!-- Font Family & Size Row -->
      <div class="grid grid-cols-2 gap-3">
        <div class="control-group">
          <label class="control-label">Font</label>
          <select
            :value="commonProperty('fontFamily')"
            @change="updateProperty('fontFamily', getInputValue($event))"
            class="control-select"
            aria-label="Font family"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Impact">Impact</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
          </select>
        </div>
        
        <div class="control-group">
          <label class="control-label">Size</label>
          <input
            type="number"
            :value="commonProperty('fontSize')"
            @input="updateProperty('fontSize', Math.max(8, getInputNumberValue($event)))"
            class="control-input"
            min="8"
            max="200"
            aria-label="Font size"
          />
        </div>
      </div>

      <!-- Text Style Buttons -->
      <div class="flex items-center space-x-2">
        <button
          @click="toggleBold"
          :class="['style-button', { 'active': isBold }]"
          title="Bold (Ctrl+B)"
          aria-label="Toggle bold"
        >
          <BoldIcon class="w-4 h-4" />
        </button>
        
        <button
          @click="toggleItalic"
          :class="['style-button', { 'active': isItalic }]"
          title="Italic (Ctrl+I)"
          aria-label="Toggle italic"
        >
          <ItalicIcon class="w-4 h-4" />
        </button>
        
        <button
          @click="toggleUnderline"
          :class="['style-button', { 'active': isUnderline }]"
          title="Underline (Ctrl+U)"
          aria-label="Toggle underline"
        >
          <UnderlineIcon class="w-4 h-4" />
        </button>

        <div class="w-px h-6 bg-gray-300 mx-2"></div>

        <!-- Text Alignment -->
        <button
          @click="updateProperty('align', 'left')"
          :class="['style-button', { 'active': commonProperty('align') === 'left' }]"
          title="Align Left"
          aria-label="Align text left"
        >
          <AlignLeftIcon class="w-4 h-4" />
        </button>
        
        <button
          @click="updateProperty('align', 'center')"
          :class="['style-button', { 'active': commonProperty('align') === 'center' }]"
          title="Align Center"
          aria-label="Align text center"
        >
          <AlignCenterIcon class="w-4 h-4" />
        </button>
        
        <button
          @click="updateProperty('align', 'right')"
          :class="['style-button', { 'active': commonProperty('align') === 'right' }]"
          title="Align Right"
          aria-label="Align text right"
        >
          <AlignRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Color Section -->
    <div class="control-section">
      <h4 class="section-title">Color</h4>
      
      <div class="flex items-center space-x-3">
        <div class="color-picker-wrapper">
          <input
            type="color"
            :value="commonProperty('fill')"
            @input="updateProperty('fill', getInputValue($event))"
            class="color-input"
            title="Text color"
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
          placeholder="#000000"
        />
      </div>
    </div>

    <!-- Spacing Section -->
    <div class="control-section">
      <h4 class="section-title">Spacing</h4>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="control-group">
          <label class="control-label">Line Height</label>
          <input
            type="number"
            :value="commonProperty('lineHeight')"
            @input="updateProperty('lineHeight', Math.max(0.5, getInputNumberValue($event)))"
            class="control-input"
            min="0.5"
            max="3"
            step="0.1"
          />
        </div>
        
        <div class="control-group">
          <label class="control-label">Letter Spacing</label>
          <input
            type="number"
            :value="commonProperty('letterSpacing')"
            @input="updateProperty('letterSpacing', getInputNumberValue($event))"
            class="control-input"
            min="-5"
            max="20"
            step="0.5"
          />
        </div>
      </div>
    </div>

    <!-- Text Transform Section -->
    <div class="control-section">
      <h4 class="section-title">Transform</h4>
      
      <div class="flex space-x-2">
        <button
          @click="toggleUppercase"
          :class="['transform-button', { 'active': isUppercase }]"
          title="Uppercase"
        >
          AA
        </button>
        
        <button
          @click="toggleLowercase"
          :class="['transform-button', { 'active': isLowercase }]"
          title="Lowercase"
        >
          aa
        </button>
        
        <button
          @click="toggleCapitalize"
          :class="['transform-button', { 'active': isCapitalize }]"
          title="Capitalize"
        >
          Aa
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { TextObject } from '@/types'
import { getInputValue, getInputNumberValue } from '@/utils/event-helpers'

// Icons (using simple SVG icons for now, can be replaced with Heroicons)
const BoldIcon = { template: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>' }
const ItalicIcon = { template: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>' }
const UnderlineIcon = { template: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>' }
const AlignLeftIcon = { template: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>' }
const AlignCenterIcon = { template: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>' }
const AlignRightIcon = { template: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>' }

// Props
const props = defineProps<{
  selectedObjects: TextObject[]
}>()

// Emits
const emit = defineEmits<{
  'update-object': [{ id: string; updates: Partial<TextObject> }]
}>()

// Computed properties for text styles
const isBold = computed(() => {
  const fontStyle = commonProperty('fontStyle')
  return fontStyle?.includes('bold') || false
})

const isItalic = computed(() => {
  const fontStyle = commonProperty('fontStyle')
  return fontStyle?.includes('italic') || false
})

const isUnderline = computed(() => {
  const textDecoration = commonProperty('textDecoration')
  return textDecoration?.includes('underline') || false
})

const isUppercase = computed(() => {
  // This would need to be tracked in the text object
  return false // Placeholder
})

const isLowercase = computed(() => {
  return false // Placeholder
})

const isCapitalize = computed(() => {
  return false // Placeholder
})

// Methods
function commonProperty(property: keyof TextObject): any {
  if (props.selectedObjects.length === 0) return undefined
  
  const firstValue = props.selectedObjects[0][property]
  const allSame = props.selectedObjects.every(obj => obj[property] === firstValue)
  
  return allSame ? firstValue : undefined
}

function updateProperty(property: keyof TextObject, value: any) {
  props.selectedObjects.forEach(obj => {
    emit('update-object', { id: obj.id, updates: { [property]: value } })
  })
}

function toggleBold() {
  const currentStyle = commonProperty('fontStyle') || 'normal'
  const isBoldNow = currentStyle.includes('bold')
  
  let newStyle = currentStyle.replace('bold', '').trim()
  if (!isBoldNow) {
    newStyle = newStyle === 'normal' ? 'bold' : `${newStyle} bold`.trim()
  }
  if (newStyle === '') newStyle = 'normal'
  
  updateProperty('fontStyle', newStyle)
}

function toggleItalic() {
  const currentStyle = commonProperty('fontStyle') || 'normal'
  const isItalicNow = currentStyle.includes('italic')
  
  let newStyle = currentStyle.replace('italic', '').trim()
  if (!isItalicNow) {
    newStyle = newStyle === 'normal' ? 'italic' : `${newStyle} italic`.trim()
  }
  if (newStyle === '') newStyle = 'normal'
  
  updateProperty('fontStyle', newStyle)
}

function toggleUnderline() {
  const currentDecoration = commonProperty('textDecoration') || ''
  const isUnderlineNow = currentDecoration.includes('underline')
  
  const newDecoration = isUnderlineNow ? '' : 'underline'
  updateProperty('textDecoration', newDecoration)
}

function toggleUppercase() {
  // Implementation would depend on how text transform is stored
  // For now, this is a placeholder
}

function toggleLowercase() {
  // Implementation would depend on how text transform is stored
  // For now, this is a placeholder
}

function toggleCapitalize() {
  // Implementation would depend on how text transform is stored
  // For now, this is a placeholder
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault()
        toggleBold()
        break
      case 'i':
        event.preventDefault()
        toggleItalic()
        break
      case 'u':
        event.preventDefault()
        toggleUnderline()
        break
    }
  }
}

// Add keyboard event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.text-controls {
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

.control-select {
  @apply w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white;
}

.style-button {
  @apply flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

.style-button.active {
  @apply bg-blue-100 border-blue-300 text-blue-700;
}

.transform-button {
  @apply px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

.transform-button.active {
  @apply bg-blue-100 border-blue-300 text-blue-700;
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
</style>
