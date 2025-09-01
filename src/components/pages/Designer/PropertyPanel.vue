<template>
  <div class="property-panel" :class="{ 'dark-theme': canvasStore.workspaceTheme === 'dark' }">
    <div class="panel-main-content">
      <!-- Text properties when a text node is selected; otherwise show Pages panel -->
      <TextPropsPanel
        v-if="selectedIsText"
        :object="textUIProps"
        @update-property="onUpdateTextProp"
        @toggle-text-style="onToggleTextStyle"
      />
      <PagesPanel v-else />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCanvasStore } from '../../../stores/canvas-fabric'
import PagesPanel from './propertypanel/PagesPanel.vue'
import TextPropsPanel from './propertypanel/TextPanel.vue'
// Export tools live in the header; this panel focuses on pages and object properties.

const canvasStore = useCanvasStore()

// Detect if selected object is a Fabric.js text object
const selectedIsText = computed(() => {
  const obj = canvasStore.activeObject
  return !!obj && (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox')
})

// Map current Fabric.js text attributes to the TextPropsPanel's expected shape
const textUIProps = computed(() => {
  const obj = canvasStore.activeObject
  if (!obj || !selectedIsText.value) return null

  return {
    // Fabric.js text object properties
    type: 'text',
    fontFamily: obj.fontFamily || 'Arial',
    fontSize: obj.fontSize || 20,
    fontWeight: obj.fontWeight || 'normal',
    fontStyle: obj.fontStyle || 'normal',
    underline: obj.underline || false,
    linethrough: obj.linethrough || false,
    textAlign: obj.textAlign || 'left',
    charSpacing: obj.charSpacing || 0,
    lineHeight: obj.lineHeight || 1.16,
    fill: obj.fill || '#000000',
    backgroundColor: obj.textBackgroundColor || 'transparent',
    hasTextBackground: !!obj.textBackgroundColor,
    hasShadow: !!obj.shadow,
    textDecoration: obj.textDecoration || '',
    textCase: 'none',
    stroke: obj.stroke || '#000000',
    strokeWidth: obj.strokeWidth || 0,
    text: obj.text || ''
  }
})

function onUpdateTextProp(prop, value) {
  const obj = canvasStore.activeObject
  if (!obj || !selectedIsText.value) return
  
  // Direct property mapping for Fabric.js
  const map = {
    textAlign: 'textAlign',
    charSpacing: 'charSpacing',
    backgroundColor: 'textBackgroundColor'
  }
  const key = map[prop] || prop
  
  obj.set(key, value)
  canvasStore.fabricCanvas.renderAll()
  canvasStore.saveState()
}

function onToggleTextStyle(prop, value) {
  const obj = canvasStore.activeObject
  if (!obj || !selectedIsText.value) return

  if (prop === 'fontWeight') {
    obj.set('fontWeight', value)
  } else if (prop === 'fontStyle') {
    obj.set('fontStyle', value)
  } else if (prop === 'underline') {
    obj.set('underline', value)
  } else if (prop === 'linethrough') {
    obj.set('linethrough', value)
  }
  
  canvasStore.fabricCanvas.renderAll()
  canvasStore.saveState()
}
</script>

<style scoped>
.property-panel {
  width: 300px;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: width 0.3s ease;
  z-index: 10;
  box-sizing: border-box;
}

.panel-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 100%;
}

.property-panel.dark-theme {
  background-color: #2d2d2d;
  border-left: 1px solid #444;
  color: #e0e0e0;
}
</style>
