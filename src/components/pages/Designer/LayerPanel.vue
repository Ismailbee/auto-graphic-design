<template>
  <div class="layer-panel">
    <div class="panel-header">
      <h3>Layers</h3>
      <div class="layer-controls">
        <button @click="addLayer" class="btn-icon" title="Add Layer">
          <i class="fas fa-plus"></i>
        </button>
        <button @click="duplicateLayer" class="btn-icon" title="Duplicate Layer" :disabled="!activeLayer">
          <i class="fas fa-copy"></i>
        </button>
        <button @click="deleteLayer" class="btn-icon danger" title="Delete Layer" :disabled="layers.length <= 1">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <div class="layers-list" ref="layersList">
      <draggable 
        v-model="layers" 
        group="layers" 
        handle=".layer-handle"
        @change="onLayerReorder"
        item-key="id"
      >
        <template #item="{ element: layer, index }">
          <div 
            :key="layer.id"
            class="layer-item" 
            :class="{ 
              active: activeLayerIndex === index,
              locked: layer.locked,
              hidden: !layer.visible 
            }"
            @click="selectLayer(index)"
          >
            <div class="layer-handle">
              <i class="fas fa-grip-vertical"></i>
            </div>
            
            <div class="layer-visibility" @click.stop="toggleLayerVisibility(index)">
              <i :class="layer.visible ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </div>
            
            <div class="layer-content">
              <div class="layer-name" v-if="!layer.editing" @dblclick="startEditLayerName(index)">
                {{ layer.name }}
              </div>
              <input 
                v-else
                v-model="layer.name"
                @blur="finishEditLayerName(index)"
                @keyup.enter="finishEditLayerName(index)"
                @keyup.escape="cancelEditLayerName(index)"
                class="layer-name-input"
                ref="layerNameInput"
              />
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
              
              <div class="layer-opacity">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model="layer.opacity"
                  @input="updateLayerOpacity(index, $event.target.value)"
                  class="opacity-slider"
                />
                <span class="opacity-value">{{ layer.opacity }}%</span>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    
    <div class="layer-effects" v-if="activeLayer">
      <h4>Layer Effects</h4>
      <div class="effect-controls">
        <div class="control-group">
          <label>Blend Mode</label>
          <select v-model="activeLayer.blendMode" @change="updateLayerBlendMode">
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="soft-light">Soft Light</option>
            <option value="hard-light">Hard Light</option>
            <option value="color-dodge">Color Dodge</option>
            <option value="color-burn">Color Burn</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
            <option value="difference">Difference</option>
            <option value="exclusion">Exclusion</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useCanvasStore } from '../../../stores/canvas-konva';
import draggable from 'vuedraggable';

const canvasStore = useCanvasStore();
const layersList = ref(null);
const layerNameInput = ref(null);

const layers = computed({
  get: () => canvasStore.layers,
  set: (value) => {
    canvasStore.layers = value;
  }
});

const activeLayerIndex = computed(() => canvasStore.activeLayerIndex);
const activeLayer = computed(() => canvasStore.activeLayer);

function addLayer() {
  const newLayer = {
    id: `layer-${Date.now()}`,
    name: `Layer ${layers.value.length + 1}`,
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    objects: [],
    editing: false,
    originalName: ''
  };
  
  canvasStore.layers.push(newLayer);
  canvasStore.activeLayerIndex = canvasStore.layers.length - 1;
}

function duplicateLayer() {
  if (!activeLayer.value) return;
  
  const layerCopy = {
    ...activeLayer.value,
    id: `layer-${Date.now()}`,
    name: `${activeLayer.value.name} Copy`,
    objects: [...activeLayer.value.objects] // Copy object references
  };
  
  const currentIndex = activeLayerIndex.value;
  canvasStore.layers.splice(currentIndex + 1, 0, layerCopy);
  canvasStore.activeLayerIndex = currentIndex + 1;
  
  // Duplicate objects in the layer
  duplicateLayerObjects(layerCopy);
}

function deleteLayer() {
  if (layers.value.length <= 1) return;
  
  const layerToDelete = activeLayer.value;
  if (layerToDelete) {
    // Remove all objects in the layer
    layerToDelete.objects.forEach(objectId => {
      const object = canvasStore.layerInstance.findOne(`#${objectId}`);
      if (object) object.destroy();
    });
    
    canvasStore.layers.splice(activeLayerIndex.value, 1);
    canvasStore.activeLayerIndex = Math.min(activeLayerIndex.value, layers.value.length - 1);
    canvasStore.layerInstance.batchDraw();
  }
}

function selectLayer(index) {
  canvasStore.activeLayerIndex = index;
}

function toggleLayerVisibility(index) {
  const layer = layers.value[index];
  layer.visible = !layer.visible;
  
  // Update visibility of all objects in the layer
  layer.objects.forEach(objectId => {
    const object = canvasStore.layerInstance.findOne(`#${objectId}`);
    if (object) {
      object.visible(layer.visible);
    }
  });
  
  canvasStore.layerInstance.batchDraw();
}

function toggleLayerLock(index) {
  const layer = layers.value[index];
  layer.locked = !layer.locked;
  
  // Update draggable state of all objects in the layer
  layer.objects.forEach(objectId => {
    const object = canvasStore.layerInstance.findOne(`#${objectId}`);
    if (object) {
      object.draggable(!layer.locked);
      object.listening(!layer.locked);
    }
  });
}

function updateLayerOpacity(index, opacity) {
  const layer = layers.value[index];
  layer.opacity = opacity;
  
  // Update opacity of all objects in the layer
  const opacityValue = opacity / 100;
  layer.objects.forEach(objectId => {
    const object = canvasStore.layerInstance.findOne(`#${objectId}`);
    if (object) {
      object.opacity(opacityValue);
    }
  });
  
  canvasStore.layerInstance.batchDraw();
}

function updateLayerBlendMode() {
  if (!activeLayer.value) return;
  
  // Apply blend mode to all objects in the layer
  activeLayer.value.objects.forEach(objectId => {
    const object = canvasStore.layerInstance.findOne(`#${objectId}`);
    if (object) {
      object.globalCompositeOperation(activeLayer.value.blendMode);
    }
  });
  
  canvasStore.layerInstance.batchDraw();
}

// Drag and drop state
const draggedIndex = ref(-1);

const onLayerReorder = (event) => {
  console.log('Layer reorder event:', event);
  
  if (event.moved) {
    const { oldIndex, newIndex } = event.moved;
    
    // Update the active layer index if needed
    if (activeLayerIndex.value === oldIndex) {
      activeLayerIndex.value = newIndex;
    } else if (activeLayerIndex.value > oldIndex && activeLayerIndex.value <= newIndex) {
      activeLayerIndex.value--;
    } else if (activeLayerIndex.value < oldIndex && activeLayerIndex.value >= newIndex) {
      activeLayerIndex.value++;
    }
    
    // Update the layer order in the canvas
    updateCanvasLayerOrder();
    
    // Save the new layer order
    canvasStore.saveCanvasState();
  }
};

const updateCanvasLayerOrder = () => {
  // Update layer order in Konva
  layers.value.forEach((layer, index) => {
    layer.objects.forEach(objectId => {
      const object = canvasStore.layerInstance.findOne(`#${objectId}`);
      if (object) {
        object.zIndex(index * 1000); // Give each layer a range of z-indices
      }
    });
  });
  
  canvasStore.layerInstance.batchDraw();
};

function startEditLayerName(index) {
  const layer = layers.value[index];
  layer.originalName = layer.name;
  layer.editing = true;
  
  nextTick(() => {
    if (layerNameInput.value && layerNameInput.value[0]) {
      layerNameInput.value[0].focus();
      layerNameInput.value[0].select();
    }
  });
}

function finishEditLayerName(index) {
  const layer = layers.value[index];
  layer.editing = false;
  
  if (!layer.name.trim()) {
    layer.name = layer.originalName;
  }
}

function cancelEditLayerName(index) {
  const layer = layers.value[index];
  layer.name = layer.originalName;
  layer.editing = false;
}

function getLayerObjectCount(layer) {
  return layer.objects.length;
}

function duplicateLayerObjects(layer) {
  const newObjectIds = [];
  
  layer.objects.forEach(objectId => {
    const originalObject = canvasStore.layerInstance.findOne(`#${objectId}`);
    if (originalObject) {
      const clonedObject = originalObject.clone({
        id: `object-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: originalObject.x() + 10,
        y: originalObject.y() + 10
      });
      
      canvasStore.layerInstance.add(clonedObject);
      newObjectIds.push(clonedObject.id());
    }
  });
  
  layer.objects = newObjectIds;
  canvasStore.layerInstance.batchDraw();
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

.dark-theme .layer-panel {
  background: #1f2937;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dark-theme .panel-header {
  background: #111827;
  border-color: #374151;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.dark-theme .panel-header h3 {
  color: #f9fafb;
}

.layer-controls {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-icon.danger:hover:not(:disabled) {
  background: #fef2f2;
  color: #dc2626;
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
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.layer-item:hover {
  background: #f3f4f6;
}

.layer-item.active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.layer-item.locked {
  opacity: 0.7;
}

.layer-item.hidden {
  opacity: 0.5;
}

.dark-theme .layer-item:hover {
  background: #374151;
}

.dark-theme .layer-item.active {
  background: #1e3a8a;
  border-color: #3b82f6;
}

.layer-handle {
  color: #9ca3af;
  cursor: grab;
}

.layer-handle:active {
  cursor: grabbing;
}

.layer-visibility {
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.layer-visibility:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.layer-content {
  flex: 1;
  min-width: 0;
}

.layer-name {
  font-weight: 500;
  font-size: 14px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark-theme .layer-name {
  color: #f9fafb;
}

.layer-name-input {
  width: 100%;
  padding: 2px 4px;
  border: 1px solid #3b82f6;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 500;
  background: white;
  outline: none;
}

.layer-info {
  font-size: 12px;
  color: #6b7280;
}

.layer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon-small {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 3px;
  background: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-small:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.layer-opacity {
  display: flex;
  align-items: center;
  gap: 4px;
}

.opacity-slider {
  width: 60px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.opacity-value {
  font-size: 10px;
  color: #6b7280;
  min-width: 30px;
}

.layer-effects {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dark-theme .layer-effects {
  background: #111827;
  border-color: #374151;
}

.layer-effects h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.dark-theme .layer-effects h4 {
  color: #f9fafb;
}

.control-group {
  margin-bottom: 12px;
}

.control-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
}

.control-group select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 13px;
}

/* Drag and drop styles */
.layer-item[draggable="true"] {
  cursor: move;
}

.layer-item:hover .layer-handle {
  color: #4f46e5;
}

.layer-item.drag-over {
  border-top: 2px solid #4f46e5;
}

.layers-container {
  position: relative;
}
</style>
