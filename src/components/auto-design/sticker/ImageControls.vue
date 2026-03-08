<template>
  <div class="image-controls-panel">
    <!-- Edit Toggle Button -->
    <div v-if="hasImages" class="edit-toggle-section">
      <button @click="$emit('toggle-controls')" class="edit-toggle-btn">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {{ showControls ? 'Hide' : 'Edit' }}
        <svg class="w-3 h-3" :class="{ 'rotate-180': showControls }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <!-- Controls Container (collapsible) -->
    <div v-if="hasImages && showControls" class="image-controls-container">
      <!-- Primary Actions Row -->
      <div class="controls-row">
        <button @click="$emit('change-image')" class="control-btn primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Change Image
        </button>
        
        <button @click="$emit('edit-description')" class="control-btn primary">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Description
        </button>
        
        <button 
          @click="$emit('auto-retouch')" 
          class="control-btn primary"
          :disabled="!selectedImage || isRetouching || selectedImage?.isRetouched"
        >
          <svg v-if="!isRetouching && !selectedImage?.isRetouched" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <svg v-else-if="selectedImage?.isRetouched" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isRetouching ? 'Retouching...' : selectedImage?.isRetouched ? 'Enhanced ✓' : 'Auto Retouch' }}
        </button>
      </div>

      <!-- Image Scale Control -->
      <div v-if="selectedImage" class="image-scale-control">
        <label class="scale-label">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
          <span>Image Size: {{ Math.round((selectedImage.scale || 1.15) * 100) }}%</span>
        </label>
        <input 
          type="range" 
          :value="selectedImage.scale || 1.15"
          @input="handleScaleChange"
          min="0.5" 
          max="2.5" 
          step="0.05"
          class="scale-slider"
        />
        <div class="scale-presets">
          <button @click="$emit('set-scale', 0.8)" class="preset-btn">80%</button>
          <button @click="$emit('set-scale', 1.0)" class="preset-btn">100%</button>
          <button @click="$emit('set-scale', 1.15)" class="preset-btn">115%</button>
          <button @click="$emit('set-scale', 1.5)" class="preset-btn">150%</button>
          <button @click="$emit('set-scale', 2.0)" class="preset-btn">200%</button>
        </div>
      </div>

      <!-- Flip & Crop Controls -->
      <div class="flip-controls-section">
        <button @click="$emit('flip')" class="flip-btn">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Flip</span>
        </button>
        
        <button @click="$emit('crop')" class="crop-btn" :disabled="!selectedImage">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>Crop</span>
        </button>
      </div>
    </div>

    <!-- Background Removal Processing -->
    <div v-if="isRemovingBackground" class="processing-indicator">
      <div class="processing-content">
        <div class="processing-spinner"></div>
        <div class="processing-text">
          <p class="processing-title">Removing background...</p>
          <p class="processing-progress">{{ backgroundRemovalProgress }}%</p>
        </div>
        <button @click="$emit('cancel-bg-removal')" class="cancel-btn">Cancel</button>
      </div>
    </div>

    <!-- Background Removal Error -->
    <div v-if="backgroundRemovalError" class="background-removal-error">
      <div class="error-content">
        <svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="error-text">
          <p class="error-title">Background removal failed</p>
          <p class="error-message">{{ backgroundRemovalError }}</p>
          <p class="error-hint">Using original image instead.</p>
        </div>
        <button @click="$emit('clear-error')" class="error-close-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Types
export interface SVGImage {
  id: string
  scale?: number
  isRetouched?: boolean
  isFlipped?: boolean
}

// Props
defineProps<{
  hasImages: boolean
  showControls: boolean
  selectedImage: SVGImage | null
  isRetouching: boolean
  isRemovingBackground: boolean
  backgroundRemovalProgress: number
  backgroundRemovalError: string | null
}>()

// Emits
const emit = defineEmits<{
  (e: 'toggle-controls'): void
  (e: 'change-image'): void
  (e: 'edit-description'): void
  (e: 'auto-retouch'): void
  (e: 'set-scale', scale: number): void
  (e: 'scale-change', scale: number): void
  (e: 'flip'): void
  (e: 'crop'): void
  (e: 'cancel-bg-removal'): void
  (e: 'clear-error'): void
}>()

// Handlers
function handleScaleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const scale = parseFloat(target.value)
  emit('scale-change', scale)
}
</script>

<style scoped>
.image-controls-panel {
  padding: 0 16px;
}

.edit-toggle-section {
  margin-bottom: 12px;
}

.edit-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-toggle-btn:hover {
  background: #e8e8e8;
}

.edit-toggle-btn svg.rotate-180 {
  transform: rotate(180deg);
}

.image-controls-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.control-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.control-btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scale control */
.image-scale-control {
  margin-bottom: 16px;
}

.scale-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}

.scale-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #ddd;
  border-radius: 3px;
  outline: none;
}

.scale-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.scale-presets {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.preset-btn {
  padding: 4px 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

/* Flip controls */
.flip-controls-section {
  display: flex;
  gap: 8px;
}

.flip-btn,
.crop-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.flip-btn:hover,
.crop-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.crop-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Processing indicator */
.processing-indicator {
  margin-top: 16px;
  padding: 16px;
  background: #e3f2fd;
  border-radius: 12px;
}

.processing-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.processing-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #90caf9;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.processing-text {
  flex: 1;
}

.processing-title {
  font-weight: 500;
  color: #1565c0;
  margin: 0;
}

.processing-progress {
  font-size: 0.85rem;
  color: #1976d2;
  margin: 4px 0 0;
}

.cancel-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #90caf9;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #1976d2;
  cursor: pointer;
}

/* Error */
.background-removal-error {
  margin-top: 16px;
  padding: 16px;
  background: #ffebee;
  border-radius: 12px;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-icon {
  width: 24px;
  height: 24px;
  color: #e53935;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
}

.error-title {
  font-weight: 500;
  color: #c62828;
  margin: 0;
}

.error-message {
  font-size: 0.85rem;
  color: #e53935;
  margin: 4px 0 0;
}

.error-hint {
  font-size: 0.8rem;
  color: #999;
  margin: 4px 0 0;
}

.error-close-btn {
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
}

/* Animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Icon sizes */
.w-4 { width: 1rem; }
.h-4 { height: 1rem; }
.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }
</style>
