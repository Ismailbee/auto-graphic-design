<template>
  <div v-if="activeTab === 'animations'" class="panel">
    <h3>Animations</h3>
    
    <div class="animation-info" v-if="!canvasStore.isObjectSelected">
      <i class="fas fa-info-circle"></i>
      <p>Select an object to apply animations</p>
    </div>
    
    <template v-else>
      <div class="animation-type-select">
        <div class="tool-section-title">Animation Type</div>
        <select v-model="selectedAnimation" class="animation-select">
          <option v-for="anim in animationTypes" :key="anim.type" :value="anim.type">
            {{ anim.name }}
          </option>
        </select>
      </div>
      
      <div class="animation-properties">
        <div class="tool-section-title">Animation Properties</div>
        
        <div class="animation-property">
          <label>Duration (seconds)</label>
          <input type="number" v-model="animationDuration" min="0.1" max="10" step="0.1">
        </div>
        
        <div class="animation-property">
          <label>Delay (seconds)</label>
          <input type="number" v-model="animationDelay" min="0" max="5" step="0.1">
        </div>
        
        <div class="animation-property">
          <label>Easing</label>
          <select v-model="animationEasing">
            <option value="linear">Linear</option>
            <option value="easeInOut">Ease In Out</option>
            <option value="easeIn">Ease In</option>
            <option value="easeOut">Ease Out</option>
            <option value="bounce">Bounce</option>
            <option value="elastic">Elastic</option>
          </select>
        </div>
        
        <div class="animation-property">
          <label>Repeat</label>
          <select v-model="animationRepeat">
            <option value="0">None</option>
            <option value="1">Once</option>
            <option value="2">Twice</option>
            <option value="3">Three times</option>
            <option value="infinite">Infinite</option>
          </select>
        </div>
        
        <button class="apply-animation-btn" @click="applyAnimation">
          <i class="fas fa-play"></i> Apply Animation
        </button>
        
        <button class="preview-animation-btn" @click="previewAnimation">
          <i class="fas fa-eye"></i> Preview
        </button>
        
        <button class="remove-animation-btn" @click="removeAnimation">
          <i class="fas fa-trash-alt"></i> Remove Animation
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import { useCanvasStore } from '../../../../stores/canvas-konva';
import { Konva } from '../../../../lib/konva-init.js';

const props = defineProps({
  activeTab: String,
});

const canvasStore = useCanvasStore();

const animationTypes = [
  { name: 'Fade In', type: 'fadeIn' },
  { name: 'Fade Out', type: 'fadeOut' },
  { name: 'Slide In', type: 'slideIn' },
  { name: 'Slide Out', type: 'slideOut' },
  { name: 'Scale Up', type: 'scaleUp' },
  { name: 'Scale Down', type: 'scaleDown' },
  { name: 'Rotate', type: 'rotate' },
  { name: 'Bounce', type: 'bounce' },
  { name: 'Pulse', type: 'pulse' },
  { name: 'Flip', type: 'flip' }
];

const selectedAnimation = ref('fadeIn');
const animationDuration = ref(1);
const animationDelay = ref(0);
const animationEasing = ref('easeInOut');
const animationRepeat = ref('0');

function applyAnimation() {
  if (!canvasStore.activeObject) return;
  
  const obj = canvasStore.activeObject;
  
  obj.animation = {
    type: selectedAnimation.value,
    duration: animationDuration.value,
    delay: animationDelay.value,
    easing: animationEasing.value,
    repeat: animationRepeat.value
  };
  
  // Use Konva setters
  if (typeof obj.setAttrs === 'function') {
    obj.setAttrs({ stroke: '#4f46e5', strokeWidth: 2, dash: [5, 5] });
  }
  
  if (canvasStore.layerInstance) canvasStore.layerInstance.draw();
  canvasStore.saveState();
}

function previewAnimation() {
  if (!canvasStore.activeObject) return;
  
  const obj = canvasStore.activeObject;
  
  const originalState = {
    x: typeof obj.x === 'function' ? obj.x() : (obj.x || 0),
    y: typeof obj.y === 'function' ? obj.y() : (obj.y || 0),
    scaleX: typeof obj.scaleX === 'function' ? obj.scaleX() : (obj.scaleX || 1),
    scaleY: typeof obj.scaleY === 'function' ? obj.scaleY() : (obj.scaleY || 1),
    opacity: typeof obj.opacity === 'function' ? obj.opacity() : (obj.opacity || 1),
    rotation: typeof obj.rotation === 'function' ? obj.rotation() : (obj.rotation || 0)
  };
  
  switch(selectedAnimation.value) {
    case 'fadeIn':
      if (typeof obj.opacity === 'function') obj.opacity(0); else obj.setAttrs?.({ opacity: 0 });
      animate(obj, { opacity: originalState.opacity });
      break;
    case 'fadeOut':
      animate(obj, { opacity: 0 }, () => {
        if (typeof obj.setAttrs === 'function') obj.setAttrs({ opacity: originalState.opacity });
      });
      break;
    case 'slideIn':
      // Compute object width taking scale into account
      const objWidth = (typeof obj.width === 'function' ? obj.width() * (obj.scaleX ? obj.scaleX() : 1) : (obj.width || 0) * (obj.scaleX || 1));
      if (typeof obj.x === 'function') obj.x(-objWidth); else obj.setAttrs?.({ x: -objWidth });
      animate(obj, { x: originalState.x });
      break;
    case 'scaleUp':
      if (typeof obj.scaleX === 'function') { obj.scaleX(0.1); obj.scaleY(0.1); } else obj.setAttrs?.({ scaleX:0.1, scaleY:0.1 });
      animate(obj, { scaleX: originalState.scaleX, scaleY: originalState.scaleY });
      break;
    case 'rotate':
      animate(obj, { rotation: (typeof obj.rotation === 'function' ? obj.rotation() : (obj.rotation || 0)) + 360 });
      break;
  }
}

function removeAnimation() {
  if (!canvasStore.activeObject) return;
  
  const obj = canvasStore.activeObject;
  
  delete obj.animation;
  
  if (typeof obj.setAttrs === 'function') obj.setAttrs({ stroke: null, strokeWidth: 0, dash: [] });
  if (canvasStore.layerInstance) canvasStore.layerInstance.draw();
  canvasStore.saveState();
}

function animate(obj, properties, onComplete) {
  // For Konva, we need to use the Konva.Tween class for animations
  const tween = new Konva.Tween({
    node: obj,
    duration: animationDuration.value,
    easing: Konva.Easings[animationEasing.value] || Konva.Easings.EaseInOut,
    onFinish: onComplete,
    ...properties
  });
  
  tween.play();
}
</script>

<style scoped>
/* Styles are inherited from AppSidebar.vue */
.panel {
  padding: 20px;
}
.animation-info {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 40px 20px;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
}
.animation-info i {
  font-size: 40px;
  margin-bottom: 16px;
  color: #d1d5db;
}
.tool-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 24px 0 12px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}
.animation-select, .animation-property select, .animation-property input {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  margin-bottom: 12px;
}
.animation-property {
  margin-bottom: 12px;
}
.animation-property label {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
}
.apply-animation-btn, .preview-animation-btn, .remove-animation-btn {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.apply-animation-btn {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}
</style>
