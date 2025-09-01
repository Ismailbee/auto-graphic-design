<template>
  <div class="main-toolbar" :class="{ 'dark-theme': canvasStore.workspaceTheme === 'dark' }">
    <div class="toolbar-section">
      <!-- Selection Tools -->
      <div class="tool-group">
        <button 
          class="tool-btn"
          :class="{ active: canvasStore.activeTool === 'Select' }"
          @click="canvasStore.setActiveTool('Select')"
          title="Select (V)"
        >
          <i class="fas fa-mouse-pointer"></i>
        </button>
        <button 
          class="tool-btn"
          :class="{ active: canvasStore.activeTool === 'Hand' }"
          @click="canvasStore.setActiveTool('Hand')"
          title="Hand Tool (H)"
        >
          <i class="fas fa-hand-paper"></i>
        </button>
      </div>

      <div class="separator"></div>

      <!-- Shape Tools -->
      <div class="tool-group">
        <button 
          class="tool-btn"
          :class="{ active: canvasStore.activeTool === 'Rectangle' }"
          @click="canvasStore.setActiveTool('Rectangle')"
          title="Rectangle (R)"
        >
          <i class="fas fa-square"></i>
        </button>
        <button 
          class="tool-btn"
          :class="{ active: canvasStore.activeTool === 'Circle' }"
          @click="canvasStore.setActiveTool('Circle')"
          title="Circle (C)"
        >
          <i class="fas fa-circle"></i>
        </button>
        <button 
          class="tool-btn"
          :class="{ active: canvasStore.activeTool === 'Line' }"
          @click="canvasStore.setActiveTool('Line')"
          title="Line (L)"
        >
          <i class="fas fa-minus"></i>
        </button>
      </div>

      <div class="separator"></div>

      <!-- Text Tool -->
      <div class="tool-group">
        <button 
          class="tool-btn"
          :class="{ active: canvasStore.activeTool === 'Text' }"
          @click="canvasStore.setActiveTool('Text')"
          title="Text Tool (T)"
        >
          <i class="fas fa-font"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCanvasStore } from '../../../stores/canvas-fabric'

const canvasStore = useCanvasStore()
</script>

<style scoped>
.main-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  min-height: 48px;
}

.dark-theme {
  background: #1f2937;
  border-color: #374151;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-group {
  display: flex;
  gap: 4px;
}

.tool-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.tool-btn.active {
  background: #4f46e5;
  color: white;
}

.dark-theme .tool-btn:hover {
  background: #374151;
  color: #d1d5db;
}

.separator {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 8px;
}

.dark-theme .separator {
  background: #374151;
}
</style>
