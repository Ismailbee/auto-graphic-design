<template>
  <div class="toolbar-group">
    <button
      class="icon-button"
      :class="{ active: activeToolTab === 'arrange' }"
      @click="toggleToolTab('arrange')"
      title="Arrange"
    >
      <i class="fas fa-layer-group"></i>
    </button>
    <div v-if="activeToolTab === 'arrange'" class="toolbar-dropdown">
      <button @click="arrangeObject('bringToFront')" :disabled="!canvasStore.isObjectSelected">
        <i class="fas fa-level-up-alt"></i> Bring to Front
      </button>
      <button @click="arrangeObject('bringForward')" :disabled="!canvasStore.isObjectSelected">
        <i class="fas fa-arrow-up"></i> Bring Forward
      </button>
      <button @click="arrangeObject('sendBackward')" :disabled="!canvasStore.isObjectSelected">
        <i class="fas fa-arrow-down"></i> Send Backward
      </button>
      <button @click="arrangeObject('sendToBack')" :disabled="!canvasStore.isObjectSelected">
        <i class="fas fa-level-down-alt"></i> Send to Back
      </button>
      <hr />
      <button @click="alignObjects('left')" :disabled="!canvasStore.hasMultipleObjectsSelected">
        <i class="fas fa-align-left"></i> Align Left
      </button>
      <button @click="alignObjects('center')" :disabled="!canvasStore.hasMultipleObjectsSelected">
        <i class="fas fa-align-center"></i> Align Center
      </button>
      <button @click="alignObjects('right')" :disabled="!canvasStore.hasMultipleObjectsSelected">
        <i class="fas fa-align-right"></i> Align Right
      </button>
      <hr />
      <button @click="alignObjects('top')" :disabled="!canvasStore.hasMultipleObjectsSelected">
        <i class="fas fa-align-left fa-rotate-90"></i> Align Top
      </button>
      <button @click="alignObjects('middle')" :disabled="!canvasStore.hasMultipleObjectsSelected">
        <i class="fas fa-align-center fa-rotate-90"></i> Align Middle
      </button>
      <button @click="alignObjects('bottom')" :disabled="!canvasStore.hasMultipleObjectsSelected">
        <i class="fas fa-align-right fa-rotate-90"></i> Align Bottom
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCanvasStore } from '../../../../stores/canvas-konva'

const canvasStore = useCanvasStore()
const activeToolTab = ref(null)

function toggleToolTab(tab) {
  if (activeToolTab.value === tab) {
    activeToolTab.value = null
  } else {
    activeToolTab.value = tab
  }
}

function arrangeObject(action) {
  if (!canvasStore.activeObject) return

  switch (action) {
    case 'bringToFront':
      canvasStore.bringToFront()
      break
    case 'bringForward':
      canvasStore.bringForward()
      break
    case 'sendBackward':
      canvasStore.sendBackward()
      break
    case 'sendToBack':
      canvasStore.sendToBack()
      break
  }

  activeToolTab.value = null
}

function alignObjects(direction) {
  if (!canvasStore.hasMultipleObjectsSelected) return

  canvasStore.alignObjects(direction)
  activeToolTab.value = null
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
