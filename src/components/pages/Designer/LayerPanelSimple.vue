<template>
  <div class="layer-panel">
    <div class="panel-header">
      <h3>Layers</h3>
      <div class="header-actions">
        <button @click="addLayer" class="btn-primary">
          <i class="fas fa-plus"></i>
          Add
        </button>
      </div>
    </div>
    
    <!-- Layer Controls -->
    <div class="layer-controls">
      <div class="control-row">
        <button @click="duplicateLayer" :disabled="!activeLayer" class="btn-secondary">
          <i class="fas fa-copy"></i>
          Duplicate
        </button>
        <button @click="deleteLayer" :disabled="layers.length <= 1" class="btn-secondary">
          <i class="fas fa-trash"></i>
          Delete
        </button>
      </div>
    </div>
    
    <!-- Layers List -->
    <div class="layers-list">
      <div 
        v-for="(layer, index) in layers" 
        :key="layer.id"
        class="layer-item" 
        :class="{ 
          active: activeLayerIndex === index,
          locked: layer.locked,
          hidden: !layer.visible 
        }"
        @click="selectLayer(index)"
      >
        <div class="layer-visibility" @click.stop="toggleLayerVisibility(index)">
          <i :class="layer.visible ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
        </div>
        
        <div class="layer-content">
          <div class="layer-name">
            {{ layer.name }}
          </div>
          <div class="layer-info">
            {{ getLayerObjectCount(layer) }} objects
          </div>
        </div>
        
        <div class="layer-actions">
          <button 
            @click.stop="toggleLayerLock(index)" 
            class="btn-icon-small"
            :title="layer.locked ? 'Unlock Layer' : 'Lock Layer'"
          >
            <i :class="layer.locked ? 'fas fa-lock' : 'fas fa-unlock'"></i>
          </button>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="layers.length === 0" class="empty-state">
        <i class="fas fa-layer-group"></i>
        <h4>No Layers</h4>
        <p>Add a layer to get started</p>
        <button @click="addLayer" class="btn-primary">
          <i class="fas fa-plus"></i>
          Add First Layer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCanvasStore } from '../../../stores/canvas-konva';

const canvasStore = useCanvasStore();

// Computed properties
const layers = computed(() => canvasStore.layers || []);
const activeLayerIndex = computed(() => canvasStore.activeLayerIndex || 0);
const activeLayer = computed(() => layers.value[activeLayerIndex.value]);

// Layer management functions
function addLayer() {
  const newLayer = {
    id: `layer-${Date.now()}`,
    name: `Layer ${layers.value.length + 1}`,
    visible: true,
    locked: false,
    opacity: 100,
    objects: []
  };
  
  canvasStore.layers.push(newLayer);
  canvasStore.activeLayerIndex = layers.value.length - 1;
}

function selectLayer(index) {
  canvasStore.activeLayerIndex = index;
}

function toggleLayerVisibility(index) {
  const layer = layers.value[index];
  layer.visible = !layer.visible;
  
  // Update objects visibility
  layer.objects.forEach(objectId => {
    const object = canvasStore.layerInstance?.findOne(`#${objectId}`);
    if (object) {
      object.visible(layer.visible);
    }
  });
  
  canvasStore.layerInstance?.batchDraw();
}

function toggleLayerLock(index) {
  const layer = layers.value[index];
  layer.locked = !layer.locked;
  
  // Update objects draggable state
  layer.objects.forEach(objectId => {
    const object = canvasStore.layerInstance?.findOne(`#${objectId}`);
    if (object) {
      object.draggable(!layer.locked);
    }
  });
}

function getLayerObjectCount(layer) {
  return layer.objects ? layer.objects.length : 0;
}

function duplicateLayer() {
  if (!activeLayer.value) return;
  
  const layerCopy = {
    ...activeLayer.value,
    id: `layer-${Date.now()}`,
    name: `${activeLayer.value.name} Copy`,
    objects: []
  };
  
  canvasStore.layers.push(layerCopy);
  canvasStore.activeLayerIndex = layers.value.length - 1;
}

function deleteLayer() {
  if (layers.value.length <= 1) return;
  
  const layerToDelete = activeLayer.value;
  if (layerToDelete) {
    // Remove all objects in the layer
    layerToDelete.objects.forEach(objectId => {
      const object = canvasStore.layerInstance?.findOne(`#${objectId}`);
      if (object) object.destroy();
    });
    
    canvasStore.layers.splice(activeLayerIndex.value, 1);
    canvasStore.activeLayerIndex = Math.min(activeLayerIndex.value, layers.value.length - 1);
    canvasStore.layerInstance?.batchDraw();
  }
}
</script>

<style scoped>
.layer-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #4338ca;
}

.layer-controls {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.control-row {
  display: flex;
  gap: 8px;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  color: #4f46e5;
  border-color: #4f46e5;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.layers-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.layer-item:hover {
  background: #f8fafc;
}

.layer-item.active {
  background: #eff6ff;
  border: 1px solid #3b82f6;
}

.layer-item.locked {
  opacity: 0.7;
}

.layer-item.hidden {
  opacity: 0.5;
}

.layer-visibility {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
}

.layer-visibility:hover {
  color: #4f46e5;
}

.layer-content {
  flex: 1;
  min-width: 0;
}

.layer-name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.layer-info {
  font-size: 11px;
  color: #6b7280;
}

.layer-actions {
  display: flex;
  gap: 4px;
}

.btn-icon-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 10px;
}

.btn-icon-small:hover {
  background: #f3f4f6;
  color: #4f46e5;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.empty-state p {
  font-size: 14px;
  margin: 0 0 16px 0;
}
</style>
