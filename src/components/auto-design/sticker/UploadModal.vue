<template>
  <div class="upload-modal-overlay" @click="$emit('close')">
    <div class="upload-modal-container" @click.stop>
      <button class="upload-modal-close" @click="$emit('close')">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="upload-modal-content">
        <!-- Icon -->
        <div class="upload-modal-icon">
          <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <!-- Title -->
        <h2 class="upload-modal-title">Upload Your Picture</h2>
        <p class="upload-modal-description">
          Upload a photo for your wedding sticker.
        </p>

        <!-- Background Removal Toggle -->
        <div class="background-removal-toggle">
          <label class="toggle-label">
            <input
              type="checkbox"
              :checked="autoRemoveBackground"
              @change="$emit('update:auto-remove-background', ($event.target as HTMLInputElement).checked)"
              class="toggle-checkbox"
            />
            <span class="toggle-text">Remove background automatically</span>
          </label>
          <p class="toggle-hint">Uses AI to remove backgrounds (may take a few seconds)</p>
        </div>

        <!-- Processing State -->
        <div v-if="isProcessing" class="upload-modal-processing">
          <div class="processing-spinner-wrapper">
            <div class="processing-spinner-large"></div>
          </div>
          <p class="processing-status-text">{{ statusText || 'Processing...' }}</p>
          <div class="processing-progress-bar">
            <div class="processing-progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="processing-progress-text">{{ progress }}%</p>
        </div>

        <!-- Upload Button -->
        <div v-if="!isProcessing && !success" class="upload-modal-actions">
          <button class="upload-modal-btn" @click="triggerFileInput">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose Photo
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            class="hidden"
            @change="handleFileSelect"
          />
        </div>

        <!-- Success Message -->
        <div v-if="success" class="upload-modal-success">
          <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Image uploaded successfully!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props
const props = defineProps<{
  autoRemoveBackground?: boolean
  isProcessing?: boolean
  progress?: number
  statusText?: string
  success?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'file-select', event: Event): void
  (e: 'update:auto-remove-background', value: boolean): void
}>()

// Refs
const fileInput = ref<HTMLInputElement | null>(null)

// Trigger file input
function triggerFileInput() {
  fileInput.value?.click()
}

// Handle file selection - pass event to parent
function handleFileSelect(event: Event) {
  emit('file-select', event)
}
</script>

<style scoped>
.upload-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.upload-modal-container {
  background: white;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  position: relative;
  padding: 32px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.upload-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.upload-modal-close:hover {
  background: #e8e8e8;
  color: #333;
}

.upload-modal-content {
  text-align: center;
}

.upload-modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.upload-modal-icon svg {
  color: #667eea;
}

.upload-modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.upload-modal-description {
  color: #666;
  margin: 0 0 24px;
}

/* Background removal toggle */
.background-removal-toggle {
  margin-bottom: 20px;
  background: #f3f4f6;
  padding: 12px;
  border-radius: 8px;
  text-align: left;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.toggle-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

.toggle-text {
  font-weight: 500;
  color: #374151;
}

.toggle-hint {
  margin-top: 4px;
  margin-left: 28px;
  font-size: 0.85rem;
  color: #6b7280;
}

/* Processing state */
.upload-modal-processing {
  padding: 20px 0;
}

.processing-spinner-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.processing-spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.processing-status-text {
  font-weight: 500;
  color: #333;
  margin: 0 0 12px;
}

.processing-progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.processing-progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.processing-progress-text {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

/* Upload button */
.upload-modal-actions {
  margin-top: 8px;
}

.upload-modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.hidden {
  display: none;
}

/* Success state */
.upload-modal-success {
  padding: 20px 0;
  color: #10b981;
}

.upload-modal-success svg {
  margin: 0 auto 12px;
}

.upload-modal-success p {
  font-weight: 500;
  margin: 0;
}

/* Icon sizes */
.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }
.w-6 { width: 1.5rem; }
.h-6 { height: 1.5rem; }
.w-12 { width: 3rem; }
.h-12 { height: 3rem; }
.w-16 { width: 4rem; }
.h-16 { height: 4rem; }
</style>
