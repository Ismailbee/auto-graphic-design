<template>
  <div class="designer-view" :class="{ 'dark-theme': canvasStore.isDarkTheme }">
    <AppHeader />
    <AppSidebar />
    <main class="designer-content">
      <CanvaArea />
    </main>
    <RightPanel />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useCanvasStore } from '../stores/canvas-konva'

// Direct imports for better error visibility
import AppHeader from '../components/pages/Designer/AppHeader.vue'
import AppSidebar from '../components/pages/Designer/AppSidebar.vue'
import CanvaArea from '../components/pages/Designer/CanvaArea-Konva.vue'
import RightPanel from '../components/pages/Designer/RightPanel.vue'

// Access the canvas store
const canvasStore = useCanvasStore()

// Watch for stage instance to be ready
watch(() => canvasStore.stageInstance, (newStage) => {
  if (newStage) {
    // Stage is initialized
    console.log('Konva stage is ready');
  }
}, { immediate: true })

onMounted(() => {
  // Set default active tool
  canvasStore.setActiveTool('Select')
})
</script>

<style scoped>
.designer-view {
  height: 100vh;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) var(--right-panel-width, 320px);
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "header header header"
    "sidebar content rightpanel";
  overflow: hidden;
  background-color: #f0f2f5;
  box-sizing: border-box;
}

.dark-theme.designer-view {
  background-color: #1e1e1e;
}

/* Assign components to grid areas */
.designer-view > :deep(.app-header) {
  grid-area: header;
}
.designer-view > :deep(.app-sidebar) {
  grid-area: sidebar;
  position: relative;
  z-index: 10;
  height: 100%;
  overflow-y: auto;
}

.designer-content {
  grid-area: content;
  position: relative;
  overflow: hidden;
  display: flex;
  flex: 1;
  min-height: 500px;
  width: 100%;
  z-index: 1;
}

/* Right panel will handle its own grid area assignment */
</style>
