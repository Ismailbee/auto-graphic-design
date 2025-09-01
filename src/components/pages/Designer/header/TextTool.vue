<!-- 
Copilot Setup: 
This toolbar gives user controls to add objects.
- Buttons: Add Text, Add Shape (rect/circle), Upload Image, Draw Line.
- Trigger actions → update Fabric.js canvas.
- Keep code modular & reusable.
-->

<template>
  <div class="toolbar-group">
    <button
      class="icon-button"
      :class="{ active: activeToolTab === 'text' }"
      @click="toggleToolTab('text')"
      title="Text"
    >
      <i class="fas fa-font"></i>
    </button>
    <div v-if="activeToolTab === 'text'" class="toolbar-dropdown">
      <div class="text-tool-grid">
        <button @click="addText('heading')" class="text-preset-btn">
          <span class="font-bold text-lg">Add a Heading</span>
        </button>
        <button @click="addText('subheading')" class="text-preset-btn">
          <span class="font-semibold text-base">Add a Subheading</span>
        </button>
        <button @click="addText('body')" class="text-preset-btn">
          <span class="text-sm">Add body text</span>
        </button>
      </div>
      <div class="divider"></div>
      <div class="font-family-selector">
        <label for="font-family">Font Family</label>
        <select id="font-family" v-model="selectedFont" @change="changeFontFamily" :disabled="!canvasStore.isObjectSelected || !isText">
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Georgia">Georgia</option>
          <option value="Palatino">Palatino</option>
          <option value="Garamond">Garamond</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Impact">Impact</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCanvasStore } from '../../../../stores/canvas-konva'
import { Konva } from '../../../../lib/konva-init.js'

const canvasStore = useCanvasStore()
const activeToolTab = ref(null)
const selectedFont = ref('Arial')

const isText = computed(() => canvasStore.activeObject && canvasStore.activeObject.className === 'Text')

watch(() => canvasStore.activeObject, (newObj) => {
  if (newObj && newObj.type.includes('text')) {
    selectedFont.value = newObj.fontFamily || 'Arial'
  }
})

function toggleToolTab(tab) {
  activeToolTab.value = activeToolTab.value === tab ? null : tab
}

function addText(type) {
  let text, options
  switch (type) {
    case 'heading':
      text = 'Heading'
      options = { fontSize: 48, fontWeight: 'bold' }
      break
    case 'subheading':
      text = 'Subheading'
      options = { fontSize: 32, fontWeight: 'semibold' }
      break
    case 'body':
    default:
      text = 'Body text'
      options = { fontSize: 16, fontWeight: 'normal' }
      break
  }

  const textNode = new Konva.Text({
    ...options,
    x: 100,
    y: 100,
    text: text,
    fontFamily: 'Arial',
    fill: '#000000',
    draggable: true
  });
  
  const layer = canvasStore.stageInstance.findOne('Layer');
  layer.add(textNode);
  layer.batchDraw();
  
  // Select the new text node
  canvasStore.setActiveObject(textNode);
  activeToolTab.value = null;
}

function changeFontFamily() {
  if (isText.value) {
    canvasStore.updateObjectProperty('fontFamily', selectedFont.value)
  }
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
