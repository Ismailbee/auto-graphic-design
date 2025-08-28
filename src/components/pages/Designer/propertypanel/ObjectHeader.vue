<template>
  <div class="panel-header">
    <h3>{{ objectTypeLabel }}</h3>
    <div class="action-buttons">
      <button @click="canvasStore.duplicateSelectedObject" class="action-button" title="Duplicate">
        <i class="fas fa-copy"></i>
      </button>
      <button @click="canvasStore.deleteSelectedObject" class="action-button" title="Delete">
        <i class="fas fa-trash"></i>
      </button>
      <button @click="toggleLockObject" class="action-button" :title="isObjectLocked ? 'Unlock' : 'Lock'">
        <i :class="isObjectLocked ? 'fas fa-lock' : 'fas fa-lock-open'"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import { useCanvasStore } from '../../../../stores/canvas-konva';

const props = defineProps({
  object: Object,
});

const canvasStore = useCanvasStore();

const objectTypeLabel = computed(() => {
  if (!props.object) return 'Unknown';
  const type = props.object.type;
  switch(type) {
    case 'rect': return 'Rectangle';
    case 'circle': return 'Circle';
    case 'triangle': return 'Triangle';
    case 'path': return 'Path';
    case 'i-text': return 'Text';
    case 'image': return 'Image';
    case 'line': return 'Line';
    case 'polygon': return 'Polygon';
    case 'group': return 'Group';
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
});

const isObjectLocked = computed(() => {
  if (!props.object) return false;
  return props.object.lockMovementX && props.object.lockMovementY;
});

function toggleLockObject() {
  if (!canvasStore.canvasInstance || !props.object) return;
  canvasStore.toggleObjectLock(props.object);
}
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}
.dark-theme .panel-header {
  border-bottom: 1px solid #3d3d3d;
}
.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.action-buttons {
  display: flex;
  gap: 5px;
}
.action-button {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dark-theme .action-button {
  color: #aaa;
}
.action-button:hover {
  background-color: #f5f5f5;
}
.dark-theme .action-button:hover {
  background-color: #3d3d3d;
}
</style>
