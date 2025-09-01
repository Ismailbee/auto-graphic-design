<template>
  <div class="right-panel">
    <!-- Panel Tabs -->
    <div class="panel-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        :title="tab.name"
      >
        <i :class="tab.icon"></i>
        <span class="tab-label">{{ tab.name }}</span>
      </button>
    </div>
    
    <!-- Panel Content -->
    <div class="panel-content">
      <!-- Properties Panel -->
      <div v-if="activeTab === 'properties'" class="panel-section">
        <PropertyPanel />
      </div>
      
      <!-- Layers Panel -->
      <div v-if="activeTab === 'layers'" class="panel-section">
        <LayerPanel />
      </div>
      
      <!-- Templates Panel -->
      <div v-if="activeTab === 'templates'" class="panel-section">
        <TemplatesPanel />
      </div>
      
      <!-- Colors Panel -->
      <div v-if="activeTab === 'colors'" class="panel-section">
        <ColorPanel />
      </div>
      
      <!-- Export Panel -->
      <div v-if="activeTab === 'export'" class="panel-section">
        <ExportPanel />
      </div>
      
      <!-- History Panel -->
      <div v-if="activeTab === 'history'" class="panel-section">
        <HistoryPanel />
      </div>
    </div>
    
    <!-- Panel Resize Handle -->
    <div 
      class="resize-handle"
      @mousedown="startResize"
      @touchstart="startResize"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useCanvasStore } from '../../../stores/canvas-konva';

// Components
import PropertyPanel from './PropertyPanel.vue';
import LayerPanel from './LayerPanelSimple.vue';
import TemplatesPanel from './TemplatesPanel.vue';
import ColorPanel from './ColorPanel.vue';
import ExportPanel from './ExportPanel.vue';
import HistoryPanel from './HistoryPanel.vue';

const canvasStore = useCanvasStore();

// State
const activeTab = ref('properties');
const panelWidth = ref(320);
const isResizing = ref(false);

// Panel tabs configuration
const tabs = computed(() => [
  {
    id: 'properties',
    name: 'Properties',
    icon: 'fas fa-sliders-h',
    count: canvasStore.selectedObjects?.length || 0
  },
  {
    id: 'layers',
    name: 'Layers',
    icon: 'fas fa-layer-group',
    count: canvasStore.objects?.length || 0
  },
  {
    id: 'templates',
    name: 'Templates',
    icon: 'fas fa-th-large'
  },
  {
    id: 'colors',
    name: 'Colors',
    icon: 'fas fa-palette'
  },
  {
    id: 'export',
    name: 'Export',
    icon: 'fas fa-download'
  },
  {
    id: 'history',
    name: 'History',
    icon: 'fas fa-history',
    count: canvasStore.history?.length || 0
  }
]);

// Auto-switch to properties when objects are selected
const selectedObjects = computed(() => canvasStore.selectedObjects);
const objects = computed(() => canvasStore.objects);

// Watch for selection changes
watch(selectedObjects, (newSelection) => {
  if (newSelection.length > 0 && activeTab.value !== 'properties') {
    // Auto-switch to properties when something is selected
    activeTab.value = 'properties';
  }
});

// Panel resizing
function startResize(event) {
  event.preventDefault();
  isResizing.value = true;
  
  const startX = event.clientX || event.touches[0].clientX;
  const startWidth = panelWidth.value;
  
  function handleResize(e) {
    if (!isResizing.value) return;
    
    const currentX = e.clientX || e.touches[0].clientX;
    const deltaX = startX - currentX;
    const newWidth = Math.max(280, Math.min(500, startWidth + deltaX));
    
    panelWidth.value = newWidth;
    
    // Update CSS custom property
    document.documentElement.style.setProperty('--right-panel-width', `${newWidth}px`);
  }
  
  function stopResize() {
    isResizing.value = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('touchmove', handleResize);
    document.removeEventListener('touchend', stopResize);
  }
  
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.addEventListener('touchmove', handleResize);
  document.addEventListener('touchend', stopResize);
}

// Keyboard shortcuts
function handleKeyboard(event) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case '1':
        event.preventDefault();
        activeTab.value = 'properties';
        break;
      case '2':
        event.preventDefault();
        activeTab.value = 'layers';
        break;
      case '3':
        event.preventDefault();
        activeTab.value = 'templates';
        break;
      case '4':
        event.preventDefault();
        activeTab.value = 'colors';
        break;
      case '5':
        event.preventDefault();
        activeTab.value = 'export';
        break;
      case '6':
        event.preventDefault();
        activeTab.value = 'history';
        break;
    }
  }
}

onMounted(() => {
  // Set initial panel width
  document.documentElement.style.setProperty('--right-panel-width', `${panelWidth.value}px`);
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard);
});
</script>

<style scoped>
.right-panel {
  position: relative;
  width: var(--right-panel-width, 320px);
  height: 100%;
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
  grid-area: rightpanel;
}

.panel-tabs {
  display: flex;
  flex-direction: column;
  width: 60px;
  background: #f8fafc;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.tab-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 60px;
  color: #6b7280;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #4f46e5;
}

.tab-btn.active {
  background: white;
  color: #4f46e5;
  border-right: 2px solid #4f46e5;
}

.tab-btn.active::before {
  content: '';
  position: absolute;
  right: -1px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: white;
}

.tab-btn i {
  font-size: 16px;
  margin-bottom: 4px;
}

.tab-label {
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.tab-btn .count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.tab-btn.active .count {
  background: #4f46e5;
}

.panel-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.panel-section {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  z-index: 20;
}

.resize-handle:hover {
  background: #4f46e5;
}

.resize-handle::before {
  content: '';
  position: absolute;
  left: -2px;
  right: -2px;
  top: 0;
  bottom: 0;
}

/* Panel animations */
.panel-section {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .right-panel {
    width: var(--right-panel-width, 280px);
  }
}

@media (max-width: 768px) {
  .right-panel {
    position: fixed;
    right: 0;
    top: 60px;
    bottom: 0;
    width: 300px;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  }
  
  .right-panel.open {
    transform: translateX(0);
  }
  
  .tab-label {
    display: none;
  }
  
  .tab-btn {
    min-height: 50px;
    padding: 8px;
  }
  
  .panel-tabs {
    width: 50px;
  }
}

/* Dark theme support */
.dark-theme .right-panel {
  background: #1f2937;
  border-left-color: #374151;
}

.dark-theme .panel-tabs {
  background: #111827;
  border-right-color: #374151;
}

.dark-theme .tab-btn {
  color: #9ca3af;
}

.dark-theme .tab-btn:hover {
  background: #374151;
  color: #60a5fa;
}

.dark-theme .tab-btn.active {
  background: #1f2937;
  color: #60a5fa;
  border-right-color: #60a5fa;
}

.dark-theme .resize-handle:hover {
  background: #60a5fa;
}
</style>
