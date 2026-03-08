<template>
  <div v-if="visible" class="avatar-uploader-overlay" @keydown.esc="close">
    <div class="avatar-uploader-modal" role="dialog" aria-modal="true">
      <header class="modal-header">
        <h3>Upload & Crop Photo</h3>
        <button class="close-btn" @click="close">✕</button>
      </header>

      <div class="modal-body">
        <div class="uploader-left">
          <div class="drop-area" @drop.prevent="handleDrop" @dragover.prevent>
            <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" hidden />
            <div v-if="!imageSrc" class="placeholder">
              <p>Drop image here or</p>
              <button @click.prevent="triggerFile">Select file</button>
            </div>

            <div v-else class="crop-area" ref="cropArea" @mousedown.prevent="startDrag" @mouseup="endDrag" @mouseleave="endDrag" @mousemove="onDrag">
              <div class="viewport">
                <img :src="imageSrc" ref="imageEl" :style="imageStyles" draggable="false" />
              </div>
            </div>
          </div>
        </div>

        <div class="uploader-right">
          <label>Zoom</label>
          <input type="range" min="1" max="3" step="0.01" v-model.number="scale" />

          <label>Preview</label>
          <div class="preview">
            <canvas ref="previewCanvas" width="200" height="200"></canvas>
          </div>

          <div class="actions">
            <button class="btn" @click="save" :disabled="!imageSrc">Save</button>
            <button class="btn ghost" @click="close">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const emit = defineEmits(['update:modelValue', 'save'])
const props = defineProps<{ modelValue: boolean }>()
const visible = ref<boolean>(props.modelValue)
watch(() => props.modelValue, v => visible.value = v)

const fileInput = ref<HTMLInputElement | null>(null)
const imageEl = ref<HTMLImageElement | null>(null)
const cropArea = ref<HTMLElement | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)

const imageSrc = ref<string | null>(null)
const scale = ref<number>(1)
const offsetX = ref<number>(0)
const offsetY = ref<number>(0)

let dragging = false
let lastX = 0
let lastY = 0

function triggerFile() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files && input.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    imageSrc.value = String(reader.result)
    // reset transform
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
  }
  reader.readAsDataURL(file)
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    imageSrc.value = String(reader.result)
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
  }
  reader.readAsDataURL(file)
}

function startDrag(e: MouseEvent) {
  dragging = true
  lastX = e.clientX
  lastY = e.clientY
}

function endDrag() {
  dragging = false
}

function onDrag(e: MouseEvent) {
  if (!dragging) return
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY
  offsetX.value += dx
  offsetY.value += dy
}

watch([imageSrc, scale, offsetX, offsetY], () => {
  drawPreview()
})

function drawPreview() {
  const canvas = previewCanvas.value
  const img = imageEl.value
  if (!canvas || !img || !imageSrc.value) return
  const ctx = canvas.getContext('2d')!
  const size = canvas.width
  ctx.clearRect(0, 0, size, size)

  // draw image centered according to offset and scale
  const naturalW = img.naturalWidth
  const naturalH = img.naturalHeight
  const displayW = naturalW * scale.value
  const displayH = naturalH * scale.value

  // compute position such that the viewport (square) shows part of the image
  const centerX = size / 2 - offsetX.value
  const centerY = size / 2 - offsetY.value

  // draw with drawImage using source coords (simple approach: draw entire image scaled to display size then clip)
  // create an offscreen canvas
  const off = document.createElement('canvas')
  off.width = displayW
  off.height = displayH
  const offCtx = off.getContext('2d')!
  offCtx.drawImage(img, 0, 0, displayW, displayH)

  // compute source rect to copy from off canvas into preview
  const srcX = Math.max(0, (displayW / 2) - centerX)
  const srcY = Math.max(0, (displayH / 2) - centerY)
  const srcW = Math.min(displayW - srcX, size)
  const srcH = Math.min(displayH - srcY, size)

  ctx.drawImage(off, srcX, srcY, srcW, srcH, 0, 0, size, size)
}

function save() {
  const canvas = document.createElement('canvas')
  const size = 1024 // produce a reasonably large square avatar
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const img = imageEl.value
  if (!img || !imageSrc.value) return

  const naturalW = img.naturalWidth
  const naturalH = img.naturalHeight
  const displayW = naturalW * scale.value
  const displayH = naturalH * scale.value

  const off = document.createElement('canvas')
  off.width = displayW
  off.height = displayH
  const offCtx = off.getContext('2d')!
  offCtx.drawImage(img, 0, 0, displayW, displayH)

  const srcX = Math.max(0, (displayW / 2) - (size / 2))
  const srcY = Math.max(0, (displayH / 2) - (size / 2))
  const srcW = Math.min(displayW - srcX, size)
  const srcH = Math.min(displayH - srcY, size)

  ctx.drawImage(off, srcX, srcY, srcW, srcH, 0, 0, size, size)

  const dataUrl = canvas.toDataURL('image/png')
  emit('save', dataUrl)
  emit('update:modelValue', false)
  visible.value = false
}

function close() {
  emit('update:modelValue', false)
  visible.value = false
}

onMounted(() => {
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})

const imageStyles = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
  cursor: dragging ? 'grabbing' : 'grab',
  userSelect: 'none' as const
}))
</script>

<style scoped>
.avatar-uploader-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.avatar-uploader-modal {
  width: 820px;
  max-width: 95%;
  background: #0f1724;
  border-radius: 10px;
  color: white;
  overflow: hidden;
}
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.04)}
.modal-body { display:flex; gap:12px; padding:16px }
.uploader-left { flex:1 }
.uploader-right { width:260px }
.drop-area { border:1px dashed rgba(255,255,255,0.06); padding:12px; border-radius:8px; min-height:300px; display:flex; align-items:center; justify-content:center }
.placeholder { text-align:center }
.placeholder button { margin-top:8px }
.crop-area { width:100%; height:100%; display:flex; align-items:center; justify-content:center }
.viewport { width:360px; height:360px; overflow:hidden; background:#111; display:flex; align-items:center; justify-content:center; border-radius:6px }
.viewport img { max-width:none; will-change:transform }
.preview { margin-top:8px; }
.actions { margin-top:12px; display:flex; gap:8px }
.btn { background:#06b6d4; color:#022; padding:8px 12px; border-radius:6px; border:none; cursor:pointer }
.btn.ghost { background:transparent; border:1px solid rgba(255,255,255,0.06); color:white }
.close-btn { background:transparent; border:none; color:white; font-size:18px; cursor:pointer }
</style>