<template>
  <div class="panel">
    <h3 class="panel-title">Advanced Image Editor</h3>

    <div v-if="!selectedImage" class="empty">Select an image object to edit</div>

    <div v-else class="controls">
      <div class="group">
        <label>Crop</label>
        <div class="crop-grid">
          <div class="field"><span>X</span><input type="number" v-model.number="crop.x"></div>
          <div class="field"><span>Y</span><input type="number" v-model.number="crop.y"></div>
          <div class="field"><span>W</span><input type="number" v-model.number="crop.width"></div>
          <div class="field"><span>H</span><input type="number" v-model.number="crop.height"></div>
          <button class="apply" @click="applyCrop">Apply Crop</button>
        </div>
      </div>
      <div class="group">
        <label>Presets</label>
        <div class="preset-grid">
          <button v-for="p in presets" :key="p.key" @click="applyPresetToImage(p.key)">{{ p.name }}</button>
        </div>
      </div>

      <div class="group">
        <label>Basic</label>
        <div class="slider">
          <span>Brightness</span>
          <input type="range" min="-1" max="1" step="0.01" v-model.number="state.brightness" @input="applyAdjustmentsDebounced" />
        </div>
        <div class="slider">
          <span>Contrast</span>
          <input type="range" min="-1" max="1" step="0.01" v-model.number="state.contrast" @input="applyAdjustmentsDebounced" />
        </div>
        <div class="slider">
          <span>Saturation</span>
          <input type="range" min="-1" max="1" step="0.01" v-model.number="state.saturation" @input="applyAdjustmentsDebounced" />
        </div>
        <div class="slider">
          <span>Hue</span>
          <input type="range" min="-180" max="180" step="1" v-model.number="state.hue" @input="applyAdjustmentsDebounced" />
        </div>
        <div class="slider">
          <span>Blur</span>
          <input type="range" min="0" max="20" step="0.5" v-model.number="state.blur" @input="applyAdjustmentsDebounced" />
        </div>
        <div class="slider">
          <span>Sepia</span>
          <input type="range" min="0" max="1" step="0.01" v-model.number="state.sepia" @input="applyAdjustmentsDebounced" />
        </div>
        <div class="slider">
          <span>Grayscale</span>
          <input type="range" min="0" max="1" step="0.01" v-model.number="state.grayscale" @input="applyAdjustmentsDebounced" />
        </div>
      </div>

      <div class="group">
        <label>Effects</label>
        <div class="slider">
          <span>Vignette</span>
          <input type="range" min="0" max="1" step="0.01" v-model.number="state.vignette" @input="applyAdjustmentsDebounced" />
        </div>
        <div class="slider">
          <span>Noise</span>
          <input type="range" min="0" max="1" step="0.01" v-model.number="state.noise" @input="applyAdjustmentsDebounced" />
        </div>
      </div>

      <div class="group">
        <label>Transform</label>
        <div class="buttons">
          <button @click="rotate(90)">Rotate 90°</button>
          <button @click="flip('x')">Flip X</button>
          <button @click="flip('y')">Flip Y</button>
          <button @click="resetImage">Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { useCanvasStore } from '@/stores/canvas-konva'
import { useImageEditor } from '@/composables/useImageEditor'

const canvasStore = useCanvasStore()
const { applyAdjustments, applyPreset, updateKonvaImage, transform, resetKonvaImage, crop: cropFn } = useImageEditor()

const presets = [
  { key: 'bw', name: 'B & W' },
  { key: 'vintage', name: 'Vintage' },
  { key: 'cinematic', name: 'Cinematic' },
  { key: 'punch', name: 'Punch' },
  { key: 'matte', name: 'Matte' },
]

const state = reactive({
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sepia: 0,
  grayscale: 0,
  vignette: 0,
  noise: 0,
})

const selectedImage = computed(() => {
  const obj = canvasStore.activeObject
  if (!obj) return null
  // Konva images usually expose getClassName() returning 'Image'
  const className = (typeof obj.getClassName === 'function') ? obj.getClassName() : obj.className || obj.getClass
  return className === 'Image' ? obj : null
})

// Crop state (initialize from selected image on change)
const crop = reactive({ x: 0, y: 0, width: 0, height: 0 })

watch(selectedImage, (img) => {
  if (!img) return
  try {
    // Konva stores the underlying image element on image() (function) or element
    const el = (typeof img.image === 'function') ? img.image() : img.element
    const iw = el?.naturalWidth || el?.width || (typeof img.width === 'function' ? img.width() : img.width) || 0
    const ih = el?.naturalHeight || el?.height || (typeof img.height === 'function' ? img.height() : img.height) || 0
    crop.x = 0
    crop.y = 0
    crop.width = Math.round(iw)
    crop.height = Math.round(ih)
  } catch (err) {
    // defensive: always reset crop on any unexpected error
    crop.x = 0; crop.y = 0; crop.width = 0; crop.height = 0
  }
}, { immediate: true })

function debounce(fn, delay = 250) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}

function getImageSrcFromKonva(imgNode) {
  if (!imgNode) return null
  const el = (typeof imgNode.image === 'function') ? imgNode.image() : imgNode.element
  // also support data stored directly on node.attrs?.src for some flows
  return el?.src || imgNode?.attrs?.src || null
}

const applyAdjustmentsDebounced = debounce(async () => {
  if (!selectedImage.value) return
  const src = getImageSrcFromKonva(selectedImage.value)
  if (!src) return
  const out = await applyAdjustments(src, { ...state })
  await updateKonvaImage(selectedImage.value, out)
  if (canvasStore.stageInstance) {
    canvasStore.layerInstance.draw()
    canvasStore.saveState()
  }
}, 200)

async function applyPresetToImage(key) {
  if (!selectedImage.value) return
  const src = getImageSrcFromKonva(selectedImage.value)
  if (!src) return
  const out = await applyPreset(src, key)
  await updateKonvaImage(selectedImage.value, out)
  if (canvasStore.stageInstance) {
    canvasStore.layerInstance.draw()
    canvasStore.saveState()
  }
}

async function rotate(deg) {
  if (!selectedImage.value) return
  const src = getImageSrcFromKonva(selectedImage.value)
  if (!src) return
  const out = await transform(src, { rotate: deg })
  await updateKonvaImage(selectedImage.value, out)
  if (canvasStore.stageInstance) {
    canvasStore.layerInstance.draw()
    canvasStore.saveState()
  }
}

async function flip(axis) {
  if (!selectedImage.value) return
  const src = getImageSrcFromKonva(selectedImage.value)
  if (!src) return
  const out = await transform(src, { flipX: axis === 'x', flipY: axis === 'y' })
  await updateKonvaImage(selectedImage.value, out)
  if (canvasStore.stageInstance) {
    canvasStore.layerInstance.draw()
    canvasStore.saveState()
  }
}

async function resetImage() {
  if (!selectedImage.value) return
  await resetKonvaImage(selectedImage.value)
  if (canvasStore.stageInstance) {
    canvasStore.layerInstance.draw()
    canvasStore.saveState()
  }
}

async function applyCrop() {
  if (!selectedImage.value) return
  const src = getImageSrcFromKonva(selectedImage.value)
  if (!src) return
  const out = await cropFn(src, { x: crop.x, y: crop.y, width: crop.width, height: crop.height })
  await updateKonvaImage(selectedImage.value, out)
  if (canvasStore.stageInstance) {
    canvasStore.layerInstance.draw()
    canvasStore.saveState()
  }
}
</script>

<style scoped>
.panel { padding: 12px; }
.panel-title { font-weight: 600; margin-bottom: 10px; }
.empty { color: #888; font-size: 0.9rem; }
.group { margin-top: 14px; }
.slider { display: grid; grid-template-columns: 110px 1fr; align-items: center; gap: 8px; margin: 8px 0; }
.preset-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
button { padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; }
button:hover { border-color: #bbb; }
.buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.crop-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; align-items: end; }
.crop-grid .field { display: grid; grid-template-columns: 1fr 2fr; gap: 6px; align-items: center; }
.crop-grid .apply { grid-column: span 4; }
</style>
