<template>
  <div class="property-section">
    <div class="section-title">Layers</div>
    <div class="layer-controls">
      <button @click="moveUp" title="Move Up">
        <i class="fas fa-arrow-up"></i>
      </button>
      <button @click="moveDown" title="Move Down">
        <i class="fas fa-arrow-down"></i>
      </button>
      <button @click="bringToFront" title="Bring to Front">
        <i class="fas fa-angle-double-up"></i>
      </button>
      <button @click="sendToBack" title="Send to Back">
        <i class="fas fa-angle-double-down"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['move-up', 'move-down', 'bring-to-front', 'send-to-back']);

function moveUp() {
  emit('move-up');
}

function moveDown() {
  emit('move-down');
}

function bringToFront() {
  emit('bring-to-front');
}

function sendToBack() {
  emit('send-to-back');
}
</script>

<style scoped>
@import './propertyPanelStyles.css';

.layer-controls {
  display: flex;
  justify-content: space-around;
}
.layer-controls button {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  font-size: 16px;
  color: #555;
}
.layer-controls button:hover {
  background-color: #f0f0f0;
}

.dark-theme .layer-controls button {
  border-color: #555;
  color: #e0e0e0;
}

.dark-theme .layer-controls button:hover {
  background-color: #3d3d3d;
}
</style>
