<template>
  <div class="floating-panel-demo min-h-screen bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Floating Properties Panel Demo
        </h1>
        <p class="text-gray-600">
          Click on any element below to see the floating properties panel in action
        </p>
      </div>

      <!-- Demo Canvas Area -->
      <div class="relative bg-white rounded-lg shadow-lg p-8 min-h-96">
        <div 
          ref="demoCanvas"
          class="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
          @click="handleCanvasClick"
        >
          <!-- Demo Elements -->
          
          <!-- Text Element -->
          <div
            ref="textElement"
            :class="['demo-element', 'text-element', { 'selected': selectedElement?.id === 'text-1' }]"
            :style="{
              position: 'absolute',
              left: '50px',
              top: '50px',
              width: '200px',
              height: '60px'
            }"
            @click="selectElement('text-1', 'text', $event)"
          >
            <div class="text-2xl font-bold text-gray-800">
              Sample Text
            </div>
            <div class="text-sm text-gray-500">
              Click to edit text properties
            </div>
          </div>

          <!-- Image Element -->
          <div
            ref="imageElement"
            :class="['demo-element', 'image-element', { 'selected': selectedElement?.id === 'image-1' }]"
            :style="{
              position: 'absolute',
              left: '300px',
              top: '50px',
              width: '150px',
              height: '150px'
            }"
            @click="selectElement('image-1', 'image', $event)"
          >
            <img 
              src="https://via.placeholder.com/150x150/3b82f6/ffffff?text=Image"
              alt="Demo Image"
              class="w-full h-full object-cover rounded-lg"
            />
          </div>

          <!-- Shape Element -->
          <div
            ref="shapeElement"
            :class="['demo-element', 'shape-element', { 'selected': selectedElement?.id === 'shape-1' }]"
            :style="{
              position: 'absolute',
              left: '100px',
              top: '200px',
              width: '100px',
              height: '100px'
            }"
            @click="selectElement('shape-1', 'shape', $event)"
          >
            <div class="w-full h-full bg-blue-500 rounded-lg border-2 border-blue-700"></div>
          </div>

          <!-- Instructions -->
          <div v-if="!selectedElement" class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-gray-400">
              <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
              </svg>
              <p class="text-lg">Click on any element to see the floating panel</p>
            </div>
          </div>
        </div>

        <!-- Simple Floating Properties Panel -->
        <SimpleFloatingPanel
          v-if="selectedElement"
          :selected-objects="[selectedElement]"
          :canvas-container="demoCanvas"
          :zoom="1"
          @update-object="handleUpdateObject"
          @duplicate="handleDuplicate"
          @delete="handleDelete"
          @close="clearSelection"
        />
      </div>

      <!-- Instructions -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg p-6 shadow">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Text Element</h3>
          <p class="text-gray-600 text-sm">
            Click the text to see typography controls including font family, size, weight, color, and alignment options.
          </p>
        </div>
        
        <div class="bg-white rounded-lg p-6 shadow">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Image Element</h3>
          <p class="text-gray-600 text-sm">
            Click the image to access image-specific controls like replace, crop, filters, and transform options.
          </p>
        </div>
        
        <div class="bg-white rounded-lg p-6 shadow">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Shape Element</h3>
          <p class="text-gray-600 text-sm">
            Click the shape to modify fill color, stroke properties, corner radius, and other shape-specific settings.
          </p>
        </div>
      </div>

      <!-- Features List -->
      <div class="mt-8 bg-white rounded-lg p-6 shadow">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Features Demonstrated</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Smart positioning with collision detection
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Dynamic controls based on element type
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Smooth show/hide animations
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Draggable panel with drag handle
            </li>
          </ul>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Click outside to dismiss
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Keyboard accessible (ESC to close)
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Responsive design with Tailwind CSS
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Professional Canva-like appearance
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SimpleFloatingPanel from './SimpleFloatingPanel.vue'
// Simplified demo without complex type imports

// Refs
const demoCanvas = ref<HTMLElement | null>(null)
const selectedElement = ref<any | null>(null)

// Mock data for demo elements
const mockElements = {
  'text-1': {
    id: 'text-1',
    type: 'text' as const,
    x: 50,
    y: 50,
    width: 200,
    height: 60,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 1,
    text: 'Sample Text',
    fontSize: 24,
    fontFamily: 'Arial',
    fontStyle: 'bold',
    textDecoration: '',
    fill: '#1f2937',
    align: 'left',
    verticalAlign: 'top',
    lineHeight: 1.2,
    letterSpacing: 0
  },
  'image-1': {
    id: 'image-1',
    type: 'image' as const,
    x: 300,
    y: 50,
    width: 150,
    height: 150,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 2,
    src: 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Image'
  },
  'shape-1': {
    id: 'shape-1',
    type: 'shape' as const,
    x: 100,
    y: 200,
    width: 100,
    height: 100,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 3,
    shapeType: 'rectangle' as const,
    fill: '#3b82f6',
    stroke: '#1d4ed8',
    strokeWidth: 2,
    cornerRadius: 8
  }
}

// Methods
function selectElement(id: string, type: string, event: MouseEvent) {
  event.stopPropagation()
  selectedElement.value = mockElements[id as keyof typeof mockElements]
}

function clearSelection() {
  selectedElement.value = null
}

function handleCanvasClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    clearSelection()
  }
}

function handleUpdateObject(id: string, updates: any) {
  console.log('Update object:', id, updates)
  if (selectedElement.value && selectedElement.value.id === id) {
    selectedElement.value = { ...selectedElement.value, ...updates }
  }
}

function handleDuplicate(id: string) {
  console.log('Duplicate:', id)
}

function handleDelete(id: string) {
  console.log('Delete:', id)
  clearSelection()
}
</script>

<style scoped>
.demo-element {
  @apply cursor-pointer transition-all duration-200 hover:opacity-80;
}

.demo-element.selected {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

.text-element {
  @apply p-2;
}

.image-element {
  @apply overflow-hidden;
}

.shape-element {
  @apply flex items-center justify-center;
}
</style>
