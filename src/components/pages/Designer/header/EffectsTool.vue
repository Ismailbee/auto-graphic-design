<template>
  <div class="toolbar-group">
    <button
      class="icon-button"
      :class="{ active: activeToolTab === 'effects' }"
      @click="toggleToolTab('effects')"
      title="Effects"
    >
      <i class="fas fa-magic"></i>
    </button>
    <div v-if="activeToolTab === 'effects'" class="toolbar-dropdown">
      <div class="effect-group">
        <h4>Filters</h4>
        <div class="effect-buttons">
          <button @click="applyFilter('blur')" :disabled="!canvasStore.isObjectSelected">
            <i class="fas fa-tint"></i> Blur
          </button>
          <button @click="applyFilter('grayscale')" :disabled="!canvasStore.isObjectSelected">
            <i class="fas fa-adjust"></i> Grayscale
          </button>
          <button @click="applyFilter('sepia')" :disabled="!canvasStore.isObjectSelected">
            <i class="fas fa-image"></i> Sepia
          </button>
        </div>
      </div>
      <div class="effect-group">
        <h4>Shadow</h4>
        <div class="shadow-controls">
          <label>Offset X</label>
          <input type="range" min="-20" max="20" v-model="shadowOffsetX" @input="updateShadow">
          <label>Offset Y</label>
          <input type="range" min="-20" max="20" v-model="shadowOffsetY" @input="updateShadow">
          <label>Blur</label>
          <input type="range" min="0" max="20" v-model="shadowBlur" @input="updateShadow">
          <div class="color-picker">
            <label>Color</label>
            <input type="color" v-model="shadowColor" @input="updateShadow">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCanvasStore } from '../../../../stores/canvas-konva'

const canvasStore = useCanvasStore()
const activeToolTab = ref(null)

const shadowOffsetX = ref(5)
const shadowOffsetY = ref(5)
const shadowBlur = ref(10)
const shadowColor = ref('#000000')

function toggleToolTab(tab) {
  if (activeToolTab.value === tab) {
    activeToolTab.value = null
  } else {
    activeToolTab.value = tab
  }
}

function applyFilter(filterType) {
  if (!canvasStore.activeObject) return

  canvasStore.applyFilter(canvasStore.activeObject, filterType)
  activeToolTab.value = null
}

function updateShadow() {
  if (!canvasStore.activeObject) return

  canvasStore.applyObjectShadow(
    canvasStore.activeObject,
    {
      offsetX: Number(shadowOffsetX.value),
      offsetY: Number(shadowOffsetY.value),
      blur: Number(shadowBlur.value),
      color: shadowColor.value
    }
  )
}
</script>

<style scoped>
/* Using styles from AppHeader.vue for now */
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}
.icon-button {
  background: transparent;
  border: none;
  font-size: 1rem;
  color: var(--text-light-secondary);
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.toolbar-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.07);
  width: 240px;
  padding: 8px;
  z-index: 10;
  animation: fadeIn 0.2s ease-out;
}
</style>
