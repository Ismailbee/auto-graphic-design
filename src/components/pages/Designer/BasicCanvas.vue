<template>
  <div class="basic-canvas-container">
    <canvas ref="basicCanvas" width="800" height="600" class="basic-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const basicCanvas = ref(null);

onMounted(() => {
  const canvas = basicCanvas.value;
  if (!canvas) {
    console.error("Basic canvas element not found!");
    return;
  }
  
  console.log("Basic canvas found, drawing test content");
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw a simple rectangle
  ctx.fillStyle = '#4f46e5';
  ctx.fillRect(50, 50, 200, 100);
  
  // Draw some text
  ctx.fillStyle = '#000000';
  ctx.font = '24px Arial';
  ctx.fillText('Canvas Test - Can you see this?', 300, 100);
});
</script>

<style scoped>
.basic-canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  padding: 20px;
  border: 5px solid orange;
}

.basic-canvas {
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid purple;
}
</style>
