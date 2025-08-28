<template>
  <div class="property-panel" :class="{ 'dark-theme': canvasStore.workspaceTheme === 'dark' }">
    <div class="panel-main-content">
      <PagesPanel />
    </div>
  </div>
</template>

<script setup>
import { useCanvasStore } from '../../../stores/canvas-konva';
import PagesPanel from './propertypanel/PagesPanel.vue';

const canvasStore = useCanvasStore();
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
