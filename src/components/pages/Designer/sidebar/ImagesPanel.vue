<template>
  <div v-if="activeTab === 'images'" class="panel">
    <h3>Image Tools</h3>
    
    <div class="upload-section">
      <label for="image-upload" class="upload-label">
        <i class="fas fa-cloud-upload-alt"></i>
        <span>Upload Image</span>
      </label>
      <input 
        id="image-upload" 
        type="file" 
        accept="image/*" 
        class="file-input" 
        @change="handleImageUpload"
      />
    </div>
    
    <div class="tool-section-title">Image Effects</div>
    <div class="image-effects-grid">
      <button 
        v-for="filter in imageFilters" 
        :key="filter.name" 
        class="effect-button"
        @click="handleImageFilter(filter.type, filter.options)"
        :disabled="!isImageSelected"
      >
        <div class="effect-preview" :style="{ background: filter.preview }">
          <i v-if="filter.icon" :class="filter.icon"></i>
        </div>
        <span>{{ filter.name }}</span>
      </button>
    </div>
    
    <div class="tool-section-title">Image Adjustments</div>
    <div class="image-adjustments">
      <div class="adjustment-control" v-for="adj in imageAdjustments" :key="adj.name">
        <div class="adjustment-header">
          <span>{{ adj.name }}</span>
          <button class="reset-button" @click="resetImageAdjustment(adj.type)" :disabled="!isImageSelected">Reset</button>
        </div>
        <input 
          type="range" 
          :min="adj.min" 
          :max="adj.max" 
          :step="adj.step" 
          v-model="adj.value" 
          @input="applyImageAdjustment(adj.type, adj.value)"
          :disabled="!isImageSelected"
        >
        <div class="adjustment-value">{{ adj.value }}</div>
      </div>
    </div>
    
    <div class="tool-section-title">Image Transform</div>
    <div class="image-transform-buttons">
      <button class="transform-button" @click="flipImageHorizontal" :disabled="!isImageSelected">
        <i class="fas fa-arrows-alt-h"></i> Flip H
      </button>
      <button class="transform-button" @click="flipImageVertical" :disabled="!isImageSelected">
        <i class="fas fa-arrows-alt-v"></i> Flip V
      </button>
      <button class="transform-button" @click="rotateImage(-90)" :disabled="!isImageSelected">
        <i class="fas fa-undo"></i> Rotate -90°
      </button>
      <button class="transform-button" @click="rotateImage(90)" :disabled="!isImageSelected">
        <i class="fas fa-redo"></i> Rotate 90°
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import { useCanvasStore } from '../../../../stores/canvas-fabric';
import { useNotification } from '../../../../composables/useNotification';
import { fabric } from 'fabric';

const props = defineProps({
  activeTab: String,
});

const canvasStore = useCanvasStore();
const { showSuccess, showError } = useNotification();

// Check if the selected object is an image
const isImageSelected = computed(() => {
  return canvasStore.activeObject && 
         canvasStore.activeObject.type === 'image';
});

// Image filters configuration
const imageFilters = [
  { name: 'Original', type: 'none', preview: 'linear-gradient(to bottom right, #f0f0f0, #d0d0d0)', icon: 'fas fa-undo-alt' },
  { name: 'Grayscale', type: 'grayscale', preview: 'linear-gradient(to bottom right, #e0e0e0, #a0a0a0)' },
  { name: 'Sepia', type: 'sepia', preview: 'linear-gradient(to bottom right, #e5d2b1, #b59e7b)' },
  { name: 'Blur', type: 'blur', preview: 'linear-gradient(to bottom right, #c6e1f5, #a4c6e2)', options: { blur: 10 } },
  { name: 'Brighten', type: 'brighten', preview: 'linear-gradient(to bottom right, #f5f5f5, #ffffff)', options: { value: 0.1 } },
  { name: 'Emboss', type: 'emboss', preview: 'linear-gradient(to bottom right, #d0d0d0, #a0a0a0)', options: { strength: 0.5 } },
  { name: 'Noise', type: 'noise', preview: 'linear-gradient(to bottom right, #e9e9e9, #c0c0c0)', options: { noise: 0.2 } },
  { name: 'Pixelate', type: 'pixelate', preview: 'linear-gradient(to bottom right, #d5d5d5, #a5a5a5)', options: { pixelSize: 10 } }
];

// Image adjustment controls
const imageAdjustments = ref([
  { name: 'Brightness', type: 'brighten', min: -0.5, max: 0.5, step: 0.01, value: 0 },
  { name: 'Contrast', type: 'contrast', min: -50, max: 50, step: 1, value: 0 },
  { name: 'Hue', type: 'hsv', min: 0, max: 360, step: 1, value: 0, property: 'hue' },
  { name: 'Saturation', type: 'hsv', min: -1, max: 1, step: 0.01, value: 0, property: 'saturation' },
  { name: 'Noise', type: 'noise', min: 0, max: 0.5, step: 0.01, value: 0, property: 'noise' },
  { name: 'Pixelate', type: 'pixelate', min: 1, max: 20, step: 1, value: 1, property: 'pixelSize' }
]);

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  
  if (!canvasStore.fabricCanvas) {
    showError('Canvas not initialized');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    fabric.Image.fromURL(e.target.result, (img) => {
      // Get center position of canvas
      const center = canvasStore.fabricCanvas.getCenter();
      
      // Scale image to fit reasonably on canvas
      const maxWidth = 400;
      const maxHeight = 400;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      
      img.set({
        left: center.left,
        top: center.top,
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center'
      });
      
      canvasStore.fabricCanvas.add(img);
      canvasStore.fabricCanvas.setActiveObject(img);
      canvasStore.fabricCanvas.renderAll();
      canvasStore.saveState();
      
      showSuccess('Image added to canvas');
    }, {
      crossOrigin: 'anonymous'
    });
    
    // Reset the file input so the same file can be selected again
    event.target.value = '';
  };
  reader.readAsDataURL(file);
}

// Apply image filter
function handleImageFilter(filterType, options = {}) {
  if (!canvasStore.activeObject || !isImageSelected.value) return;
  
  const activeImg = canvasStore.activeObject;
  
  try {
    // Create filter based on type
    let filter = null;
    
    switch (filterType) {
      case 'grayscale':
        filter = new fabric.Image.filters.Grayscale();
        break;
      case 'sepia':
        filter = new fabric.Image.filters.Sepia();
        break;
      case 'invert':
        filter = new fabric.Image.filters.Invert();
        break;
      case 'brightness':
        filter = new fabric.Image.filters.Brightness({ brightness: options.brightness || 0.3 });
        break;
      case 'contrast':
        filter = new fabric.Image.filters.Contrast({ contrast: options.contrast || 0.3 });
        break;
      case 'blur':
        filter = new fabric.Image.filters.Blur({ blur: options.blur || 0.1 });
        break;
      default:
        showError('Filter not supported');
        return;
    }
    
    if (filter) {
      // Add filter to image
      activeImg.filters = activeImg.filters || [];
      activeImg.filters.push(filter);
      activeImg.applyFilters();
      canvasStore.fabricCanvas.renderAll();
      canvasStore.saveState();
      
      showSuccess(`${filterType} filter applied`);
    }
  } catch (error) {
    console.error('Error applying filter:', error);
    showError('Failed to apply filter');
  }
}

  // Apply image adjustment
  function applyImageAdjustment(adjustmentType, value) {
    if (!canvasStore.activeObject || !isImageSelected.value) return;
    
    const activeImg = canvasStore.activeObject;
    const adjustment = imageAdjustments.value.find(adj => adj.type === adjustmentType);
    if (!adjustment) return;
    
    try {
      let filter = null;
      
      switch (adjustmentType) {
        case 'brightness':
          filter = new fabric.Image.filters.Brightness({ brightness: parseFloat(value) });
          break;
        case 'contrast':
          filter = new fabric.Image.filters.Contrast({ contrast: parseFloat(value) });
          break;
        case 'saturation':
          filter = new fabric.Image.filters.Saturation({ saturation: parseFloat(value) });
          break;
        case 'hue':
          filter = new fabric.Image.filters.HueRotation({ rotation: parseFloat(value) });
          break;
        case 'vibrance':
          filter = new fabric.Image.filters.Vibrance({ vibrance: parseFloat(value) });
          break;
        case 'blur':
          filter = new fabric.Image.filters.Blur({ blur: parseFloat(value) });
          break;
        case 'sharpen':
          // Fabric.js doesn't have a built-in sharpen filter, use a custom convolution
          filter = new fabric.Image.filters.Convolute({
            matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0]
          });
          break;
        default:
          showError('Adjustment not supported');
          return;
      }
      
      if (filter) {
        // Remove existing filters of the same type
        activeImg.filters = activeImg.filters || [];
        activeImg.filters = activeImg.filters.filter(f => f.type !== adjustmentType);
        
        // Add new filter
        activeImg.filters.push(filter);
        activeImg.applyFilters();
        canvasStore.fabricCanvas.renderAll();
        canvasStore.saveState();
      }
    } catch (error) {
      console.error('Error applying adjustment:', error);
      showError('Failed to apply adjustment');
    }
  }

// Reset an image adjustment
function resetImageAdjustment(adjustmentType) {
  const adjustment = imageAdjustments.value.find(adj => adj.type === adjustmentType);
  if (!adjustment) return;
  
  // Reset the adjustment value
  adjustment.value = 0;
  
  if (adjustmentType === 'pixelate') {
    adjustment.value = 1;
  }
  
  // Apply with reset value
  applyImageAdjustment(adjustmentType, adjustment.value);
}

// Flip image horizontally
function flipImageHorizontal() {
  if (!canvasStore.activeObject || !isImageSelected.value) return;
  
  const activeImg = canvasStore.activeObject;
  
  // Get current scaleX and flip it
  const currentScaleX = activeImg.scaleX || 1;
  activeImg.set('scaleX', currentScaleX * -1);
  
  canvasStore.fabricCanvas.renderAll();
  canvasStore.saveState();
  
  showSuccess('Image flipped horizontally');
}

// Flip image vertically
function flipImageVertical() {
  if (!canvasStore.activeObject || !isImageSelected.value) return;
  
  const activeImg = canvasStore.activeObject;
  
  // Get current scaleY and flip it
  const currentScaleY = activeImg.scaleY || 1;
  activeImg.set('scaleY', currentScaleY * -1);
  
  canvasStore.fabricCanvas.renderAll();
  canvasStore.saveState();
  
  showSuccess('Image flipped vertically');
}

// Rotate image
function rotateImage(degrees) {
  if (!canvasStore.activeObject || !isImageSelected.value) return;
  
  const activeImg = canvasStore.activeObject;
  
  // Get current rotation and add the new rotation
  const currentAngle = activeImg.angle || 0;
  activeImg.set('angle', currentAngle + degrees);
  
  canvasStore.fabricCanvas.renderAll();
  canvasStore.saveState();
  
  showSuccess(`Image rotated ${degrees}°`);
}
</script>

<style scoped>
.panel {
  padding: 20px;
}

.panel h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background-color: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-label:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.upload-label i {
  font-size: 18px;
  color: #4f46e5;
}

.upload-label span {
  font-size: 14px;
  font-weight: 500;
}

.file-input {
  display: none;
}

.tool-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 24px 0 12px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.image-effects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.effect-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  background: none;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.effect-button:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.effect-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.effect-preview {
  width: 52px;
  height: 52px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.effect-button span {
  font-size: 11px;
  font-weight: 500;
}

.adjustment-control {
  margin-bottom: 12px;
}

.adjustment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.adjustment-header span {
  font-size: 13px;
  font-weight: 500;
}

.reset-button {
  background: none;
  border: none;
  font-size: 12px;
  color: #4f46e5;
  cursor: pointer;
  padding: 2px;
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #9ca3af;
}

.adjustment-value {
  font-size: 12px;
  text-align: right;
  color: #6b7280;
  margin-top: 4px;
}

.image-transform-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.transform-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.transform-button:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.transform-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.transform-button i {
  font-size: 14px;
}

/* Dark theme adjustments */
:global(.dark-theme) .panel h3 {
  color: #e5e7eb;
}

:global(.dark-theme) .tool-section-title {
  border-bottom-color: #374151;
  color: #d1d5db;
}

:global(.dark-theme) .upload-label {
  background-color: #1f2937;
  border-color: #374151;
}

:global(.dark-theme) .upload-label:hover {
  background-color: #374151;
  border-color: #4b5563;
}

:global(.dark-theme) .effect-preview {
  background-color: #111827;
  border-color: #374151;
}

:global(.dark-theme) .effect-button:hover:not(:disabled) {
  background-color: #1f2937;
  border-color: #374151;
}

:global(.dark-theme) .reset-button {
  color: #818cf8;
}

:global(.dark-theme) .adjustment-value {
  color: #9ca3af;
}

:global(.dark-theme) .transform-button {
  background-color: #1f2937;
  border-color: #374151;
  color: #e5e7eb;
}

:global(.dark-theme) .transform-button:hover:not(:disabled) {
  background-color: #374151;
}
</style>
