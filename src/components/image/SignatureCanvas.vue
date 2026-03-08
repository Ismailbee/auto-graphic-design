<template>
  <div class="signature-canvas-container">
    <canvas 
      ref="canvas"
      :width="width"
      :height="height"
      class="border border-gray-300 rounded-lg cursor-crosshair"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @touchstart="startDrawing"
      @touchmove="draw"
      @touchend="stopDrawing"
    ></canvas>
    <div class="mt-2 flex justify-between">
      <button @click="clearCanvas" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
        Clear
      </button>
      <button @click="saveSignature" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        Save
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  width: {
    type: Number,
    default: 400
  },
  height: {
    type: Number,
    default: 200
  }
})

const emit = defineEmits(['save'])

const canvas = ref(null)
let context = null
let isDrawing = false
let lastX = 0
let lastY = 0

onMounted(() => {
  context = canvas.value.getContext('2d')
  context.strokeStyle = '#000000'
  context.lineWidth = 2
  context.lineCap = 'round'
})

const startDrawing = (e) => {
  isDrawing = true
  const rect = canvas.value.getBoundingClientRect()
  lastX = e.clientX - rect.left
  lastY = e.clientY - rect.top
}

const draw = (e) => {
  if (!isDrawing) return
  
  const rect = canvas.value.getBoundingClientRect()
  const currentX = e.clientX - rect.left
  const currentY = e.clientY - rect.top
  
  context.beginPath()
  context.moveTo(lastX, lastY)
  context.lineTo(currentX, currentY)
  context.stroke()
  
  lastX = currentX
  lastY = currentY
}

const stopDrawing = () => {
  isDrawing = false
}

const clearCanvas = () => {
  context.clearRect(0, 0, canvas.value.width, canvas.value.height)
}

const saveSignature = () => {
  const dataURL = canvas.value.toDataURL('image/png')
  emit('save', dataURL)
}
</script>