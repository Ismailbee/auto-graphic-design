<template>
  <div class="w-80 bg-white border-l border-gray-200 flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-800">Properties</h2>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <div v-if="selectedObjects.length === 0" class="p-4 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
        </svg>
        <p>Select an object to edit its properties</p>
      </div>

      <div v-else class="p-4 space-y-6">
        <!-- Multiple Selection Info -->
        <div v-if="selectedObjects.length > 1" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p class="text-sm text-blue-800">{{ selectedObjects.length }} objects selected</p>
        </div>

        <!-- Position & Size -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-gray-700">Position & Size</h3>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">X</label>
              <input
                type="number"
                :value="commonProperty('x')"
                @input="updateProperty('x', getInputNumberValue($event))"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Y</label>
              <input
                type="number"
                :value="commonProperty('y')"
                @input="updateProperty('y', getInputNumberValue($event))"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Width</label>
              <input
                type="number"
                :value="commonProperty('width')"
                @input="updateProperty('width', Math.max(10, getInputNumberValue($event)))"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="10"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Height</label>
              <input
                type="number"
                :value="commonProperty('height')"
                @input="updateProperty('height', Math.max(10, getInputNumberValue($event)))"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="10"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Rotation (degrees)</label>
            <input
              type="range"
              :value="commonProperty('rotation') * 180 / Math.PI"
              @input="updateProperty('rotation', getInputNumberValue($event) * Math.PI / 180)"
              min="-180"
              max="180"
              class="w-full"
            />
            <div class="text-xs text-gray-500 text-center mt-1">
              {{ Math.round((commonProperty('rotation') || 0) * 180 / Math.PI) }}°
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Opacity</label>
            <input
              type="range"
              :value="commonProperty('opacity')"
              @input="updateProperty('opacity', getInputNumberValue($event))"
              min="0"
              max="1"
              step="0.1"
              class="w-full"
            />
            <div class="text-xs text-gray-500 text-center mt-1">
              {{ Math.round((commonProperty('opacity') || 1) * 100) }}%
            </div>
          </div>
        </div>

        <!-- Text Properties (for text objects) -->
        <div v-if="hasTextObjects" class="space-y-3">
          <h3 class="text-sm font-medium text-gray-700">Text</h3>
          
          <div>
            <label class="block text-xs text-gray-600 mb-1">Font Size</label>
            <input
              type="number"
              :value="commonProperty('fontSize')"
              @input="updateProperty('fontSize', Math.max(8, getInputNumberValue($event)))"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="8"
            />
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Font Family</label>
            <select
              :value="commonProperty('fontFamily')"
              @change="updateProperty('fontFamily', getInputValue($event))"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          <div class="flex space-x-2">
            <button
              @click="toggleFontStyle('bold')"
              :class="[
                'flex-1 px-3 py-2 text-sm border rounded transition-colors',
                isFontStyleActive('bold')
                  ? 'bg-primary-100 border-primary-500 text-primary-700'
                  : 'border-gray-300 hover:bg-gray-50'
              ]"
            >
              <strong>B</strong>
            </button>
            <button
              @click="toggleFontStyle('italic')"
              :class="[
                'flex-1 px-3 py-2 text-sm border rounded transition-colors',
                isFontStyleActive('italic')
                  ? 'bg-primary-100 border-primary-500 text-primary-700'
                  : 'border-gray-300 hover:bg-gray-50'
              ]"
            >
              <em>I</em>
            </button>
            <button
              @click="toggleTextDecoration('underline')"
              :class="[
                'flex-1 px-3 py-2 text-sm border rounded transition-colors',
                isTextDecorationActive('underline')
                  ? 'bg-primary-100 border-primary-500 text-primary-700'
                  : 'border-gray-300 hover:bg-gray-50'
              ]"
            >
              <u>U</u>
            </button>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Text Align</label>
            <div class="flex space-x-1">
              <button
                v-for="align in ['left', 'center', 'right']"
                :key="align"
                @click="updateProperty('align', align)"
                :class="[
                  'flex-1 px-3 py-2 text-sm border rounded transition-colors',
                  commonProperty('align') === align
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ align.charAt(0).toUpperCase() + align.slice(1) }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Text Color</label>
            <div class="flex items-center space-x-2">
              <input
                type="color"
                :value="commonProperty('fill')"
                @input="updateProperty('fill', getInputValue($event))"
                class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                :value="commonProperty('fill')"
                @input="updateProperty('fill', getInputValue($event))"
                class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        <!-- Shape Properties (for shape objects) -->
        <div v-if="hasShapeObjects" class="space-y-3">
          <h3 class="text-sm font-medium text-gray-700">Shape</h3>
          
          <div>
            <label class="block text-xs text-gray-600 mb-1">Fill Color</label>
            <div class="flex items-center space-x-2">
              <input
                type="color"
                :value="commonProperty('fill')"
                @input="updateProperty('fill', getInputValue($event))"
                class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                :value="commonProperty('fill')"
                @input="updateProperty('fill', getInputValue($event))"
                class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Stroke Color</label>
            <div class="flex items-center space-x-2">
              <input
                type="color"
                :value="commonProperty('stroke')"
                @input="updateProperty('stroke', getInputValue($event))"
                class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                :value="commonProperty('stroke')"
                @input="updateProperty('stroke', getInputValue($event))"
                class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="#1d4ed8"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">Stroke Width</label>
            <input
              type="number"
              :value="commonProperty('strokeWidth')"
              @input="updateProperty('strokeWidth', Math.max(0, getInputNumberValue($event)))"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
            />
          </div>
        </div>

        <!-- Color Palette -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-gray-700">Quick Colors</h3>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="color in colorPalette"
              :key="color"
              @click="applyColor(color)"
              :style="{ backgroundColor: color }"
              class="aspect-square rounded border-2 border-gray-200 hover:scale-110 transition-transform"
              :title="color"
            ></button>
          </div>
        </div>

        <!-- Layer Controls -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-gray-700">Layer</h3>
          <div class="flex space-x-2">
            <button
              @click="$emit('bring-forward')"
              class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Bring Forward
            </button>
            <button
              @click="$emit('send-backward')"
              class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Send Backward
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AnyDesignObject } from '@/types'
import { getInputValue, getInputNumberValue } from '@/utils/event-helpers'

// Props
const props = defineProps<{
  selectedObjects: AnyDesignObject[]
  colorPalette: string[]
}>()

// Emits
const emit = defineEmits<{
  'update-object': [id: string, updates: Partial<AnyDesignObject>]
  'bring-forward': []
  'send-backward': []
}>()

// Computed
const hasTextObjects = computed(() => 
  props.selectedObjects.some(obj => obj.type === 'text')
)

const hasShapeObjects = computed(() => 
  props.selectedObjects.some(obj => obj.type === 'shape')
)

// Methods
function commonProperty(property: string): any {
  if (props.selectedObjects.length === 0) return undefined
  
  const firstValue = (props.selectedObjects[0] as any)[property]
  const allSame = props.selectedObjects.every(obj => (obj as any)[property] === firstValue)
  
  return allSame ? firstValue : undefined
}

function updateProperty(property: string, value: any) {
  props.selectedObjects.forEach(obj => {
    emit('update-object', obj.id, { [property]: value })
  })
}

function toggleFontStyle(style: 'bold' | 'italic') {
  const currentStyle = commonProperty('fontStyle') || 'normal'
  let newStyle = currentStyle
  
  if (style === 'bold') {
    if (currentStyle.includes('bold')) {
      newStyle = currentStyle.replace('bold', '').trim() || 'normal'
    } else {
      newStyle = currentStyle === 'normal' ? 'bold' : `${currentStyle} bold`
    }
  } else if (style === 'italic') {
    if (currentStyle.includes('italic')) {
      newStyle = currentStyle.replace('italic', '').trim() || 'normal'
    } else {
      newStyle = currentStyle === 'normal' ? 'italic' : `${currentStyle} italic`
    }
  }
  
  updateProperty('fontStyle', newStyle.trim())
}

function isFontStyleActive(style: 'bold' | 'italic'): boolean {
  const currentStyle = commonProperty('fontStyle') || 'normal'
  return currentStyle.includes(style)
}

function toggleTextDecoration(decoration: 'underline') {
  const currentDecoration = commonProperty('textDecoration') || ''
  const newDecoration = currentDecoration.includes(decoration) ? '' : decoration
  updateProperty('textDecoration', newDecoration)
}

function isTextDecorationActive(decoration: 'underline'): boolean {
  const currentDecoration = commonProperty('textDecoration') || ''
  return currentDecoration.includes(decoration)
}

function applyColor(color: string) {
  // Apply color based on object type
  props.selectedObjects.forEach(obj => {
    if (obj.type === 'text') {
      emit('update-object', obj.id, { fill: color })
    } else if (obj.type === 'shape') {
      emit('update-object', obj.id, { fill: color })
    }
  })
}
</script>
