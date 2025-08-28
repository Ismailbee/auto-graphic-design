<template>
  <div class="layers-list">
    <div 
      v-for="(layer, index) in canvasStore.layers" 
      :key="layer.id"
      :class="{ 
        active: index === canvasStore.activeLayerIndex,
        'layer-hidden': !layer.visible
      }"
      class="layer-item"
      @click="setActiveLayer(index)"
    >
      <div class="layer-visibility">
        <button @click.stop="canvasStore.toggleLayerVisibility(index)" title="Toggle Visibility">
          <i :class="layer.visible ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
        </button>
      </div>
      <div class="layer-name">
        <span v-if="!isEditingLayerName || editingLayerIndex !== index">{{ layer.name }}</span>
        <input 
          v-else
          ref="layerNameInput"
          v-model="editLayerName"
          @blur="finishEditingLayerName"
          @keyup.enter="finishEditingLayerName"
          @keyup.esc="cancelEditingLayerName"
        />
      </div>
      <div class="layer-actions">
        <button @click.stop="startEditingLayerName(index)" title="Rename Layer">
          <i class="fas fa-edit"></i>
        </button>
        <button @click.stop="canvasStore.toggleLayerLock(index)" title="Toggle Lock">
          <i :class="layer.locked ? 'fas fa-lock' : 'fas fa-lock-open'"></i>
        </button>
        <button 
          @click.stop="canvasStore.removeLayer(index)" 
          :disabled="canvasStore.layers.length <= 1"
          title="Remove Layer"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useCanvasStore } from '../../../../stores/canvas-konva';

const canvasStore = useCanvasStore();

const isEditingLayerName = ref(false);
const editingLayerIndex = ref(-1);
const editLayerName = ref('');
const layerNameInput = ref(null);

function setActiveLayer(index) {
  canvasStore.activeLayerIndex = index;
  
  if (canvasStore.stageInstance && canvasStore.layers[index]) {
    const layerObjects = canvasStore.layers[index].objects;
    
    // Clear current selection
    canvasStore.clearSelection();
    
    // Find objects in this layer and select them
    const layer = canvasStore.stageInstance.findOne('Layer');
    if (layer) {
      const objects = layer.getChildren(node => {
        return node.id && layerObjects.includes(node.id);
      });
      
      if (objects.length === 1) {
        canvasStore.setActiveObject(objects[0]);
      } else if (objects.length > 1) {
        // For multiple objects, we can select the first one or implement a transformer for multiple selection
        canvasStore.setActiveObject(objects[0]);
      }
      
      layer.draw();
    }
  }
}

function startEditingLayerName(index) {
  isEditingLayerName.value = true;
  editingLayerIndex.value = index;
  editLayerName.value = canvasStore.layers[index].name;
  
  nextTick(() => {
    if (layerNameInput.value) {
      layerNameInput.value.focus();
    }
  });
}

function finishEditingLayerName() {
  if (isEditingLayerName.value && editingLayerIndex.value >= 0) {
    canvasStore.renameLayer(editingLayerIndex.value, editLayerName.value);
    isEditingLayerName.value = false;
    editingLayerIndex.value = -1;
  }
}

function cancelEditingLayerName() {
  isEditingLayerName.value = false;
  editingLayerIndex.value = -1;
}
</script>

<style scoped>
.layers-list {
  padding: 5px 0;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  scrollbar-width: thin;
}

.layers-list::-webkit-scrollbar {
  width: 6px;
}

.layers-list::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.dark-theme .layers-list::-webkit-scrollbar-thumb {
  background-color: #475569;
}

.layer-item {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  cursor: pointer;
  border-left: 3px solid transparent;
}
.layer-item:hover {
  background-color: #f5f5f5;
}
.dark-theme .layer-item:hover {
  background-color: #3d3d3d;
}
.layer-item.active {
  background-color: #f0f0ff;
  border-left: 3px solid #4040ff;
}
.dark-theme .layer-item.active {
  background-color: #3730a3;
  border-left: 3px solid #6366f1;
}
.layer-item.layer-hidden {
  opacity: 0.6;
}
.layer-visibility {
  margin-right: 10px;
}
.layer-visibility button {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
}
.layer-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.layer-name input {
  width: 100%;
  padding: 2px 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.layer-actions {
  display: flex;
  gap: 5px;
}
.layer-actions button {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #999;
  opacity: 0;
  transition: opacity 0.2s;
}
.layer-item:hover .layer-actions button {
  opacity: 1;
}
.layer-actions button:hover {
  color: #666;
}
.layer-actions button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
