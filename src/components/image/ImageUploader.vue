<template>
  <div class="image-uploader">
    <div class="uploader-header">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Images ({{ images.length }}/99)
      </h3>
      <button
        v-if="images.length > 0"
        @click="clearAll"
        class="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
      >
        Clear All
      </button>
    </div>

    <!-- Upload Area -->
    <div
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      class="upload-area"
      :class="{ 'dragging': isDragging, 'disabled': images.length >= 99 }"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />

      <div class="upload-content">
        <div class="upload-icon-wrapper">
          <div class="upload-icon-bg"></div>
          <div class="upload-icon-orbit">
            <div class="orbit-dot orbit-dot-1"></div>
            <div class="orbit-dot orbit-dot-2"></div>
            <div class="orbit-dot orbit-dot-3"></div>
          </div>
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div class="upload-text-section">
          <p class="upload-text">
            <span class="upload-primary">Drop your images here</span>
          </p>
          <p class="upload-subtitle">
            or <span class="upload-action">click to browse</span> from your device
          </p>
          <p class="upload-hint">
            Supports <span class="format-highlight">PNG, JPEG, GIF, WEBP</span> up to <strong>10MB</strong> each
          </p>
          <p class="upload-limit">
            Maximum <strong>{{ 99 - images.length }}</strong> more images
          </p>
        </div>
        <div class="supported-formats-compact">
          <span class="format-badge-compact image">PNG</span>
          <span class="format-badge-compact image">JPG</span>
          <span class="format-badge-compact image">GIF</span>
          <span class="format-badge-compact image">WEBP</span>
        </div>
      </div>
    </div>

    <!-- Image Preview Carousel -->
    <div v-if="images.length > 0" class="image-carousel-container">
      <ImagePreviewCarousel
        :images="images"
        @remove="removeImage"
      />
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p class="progress-text">Uploading... {{ uploadProgress }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'
import ImagePreviewCarousel from './ImagePreviewCarousel.vue'

const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)

const images = computed(() => autoDesignStore.uploadedFiles.images)

function triggerFileInput() {
  if (images.value.length >= 99) {
    authStore.showNotification({
      title: 'Maximum Images Reached',
      message: 'You can only upload up to 99 images',
      type: 'error'
    })
    return
  }
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(Array.from(target.files))
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    handleFiles(Array.from(event.dataTransfer.files))
  }
}

function handleFiles(files: File[]) {
  // Filter only image files
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length === 0) {
    authStore.showNotification({
      title: 'Invalid Files',
      message: 'Please select only image files',
      type: 'error'
    })
    return
  }

  // Check file sizes (max 10MB per file)
  const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024)
  if (oversizedFiles.length > 0) {
    authStore.showNotification({
      title: 'Files Too Large',
      message: `${oversizedFiles.length} file(s) exceed 10MB limit`,
      type: 'error'
    })
    return
  }

  // Add images to store
  autoDesignStore.addImages(imageFiles)

  // Simulate upload progress (in Phase 3, this will be real Firebase upload)
  simulateUpload()
}

function simulateUpload() {
  uploading.value = true
  uploadProgress.value = 0

  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      uploading.value = false
      uploadProgress.value = 0
    }
  }, 100)
}

function removeImage(index: number) {
  autoDesignStore.removeImage(index)
}

function clearAll() {
  if (confirm('Are you sure you want to remove all images?')) {
    while (images.value.length > 0) {
      autoDesignStore.removeImage(0)
    }
  }
}
</script>

<style scoped>
.image-uploader {
  @apply space-y-4;
}

.uploader-header {
  @apply flex items-center justify-between;
}

.upload-area {
  position: relative;
  border: 2px dashed #e2e8f0;
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.upload-area::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 22px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6);
  background-size: 300% 300%;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
  animation: gradientRotate 4s ease infinite;
}

.upload-area::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
  z-index: -1;
  transition: all 0.4s ease;
}

@keyframes gradientRotate {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.upload-area:hover:not(.disabled) {
  border-color: transparent;
  transform: translateY(-4px);
  box-shadow: 
    0 0 0 1px rgba(59, 130, 246, 0.1),
    0 4px 8px rgba(59, 130, 246, 0.08),
    0 16px 32px rgba(59, 130, 246, 0.12);
}

.upload-area:hover:not(.disabled)::before {
  opacity: 1;
}

.upload-area:hover:not(.disabled)::after {
  background: linear-gradient(180deg, #ffffff 0%, #eff6ff 50%, #dbeafe 100%);
}

.upload-area.dragging {
  border-color: transparent;
  transform: scale(1.02);
  box-shadow: 
    0 0 0 4px rgba(59, 130, 246, 0.2),
    0 8px 16px rgba(59, 130, 246, 0.15),
    0 32px 64px rgba(59, 130, 246, 0.2);
}

.upload-area.dragging::before {
  opacity: 1;
  animation: gradientRotate 1s ease infinite;
}

.upload-area.dragging::after {
  background: linear-gradient(180deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%);
}

.upload-area.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
}

@keyframes fadeInScale {
  from { 
    opacity: 0; 
    transform: scale(0.9) translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
}

.upload-icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
  border-radius: 50%;
  opacity: 0.1;
  animation: breathe 3s ease-in-out infinite;
}

.upload-icon-orbit {
  position: absolute;
  inset: -15px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6);
  background-clip: padding-box;
  animation: rotate 6s linear infinite;
  opacity: 0.3;
}

.orbit-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
}

.orbit-dot-1 {
  animation: orbitDot 3s ease-in-out infinite;
  animation-delay: 0s;
}

.orbit-dot-2 {
  animation: orbitDot 3s ease-in-out infinite;
  animation-delay: -1s;
}

.orbit-dot-3 {
  animation: orbitDot 3s ease-in-out infinite;
  animation-delay: -2s;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.15); opacity: 0.2; }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes orbitDot {
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.3; transform: translateX(-50%) scale(1.5); }
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #3b82f6;
  z-index: 2;
  filter: drop-shadow(0 4px 16px rgba(59, 130, 246, 0.3));
  animation: floatIcon 4s ease-in-out infinite;
}

@keyframes floatIcon {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(-2deg); }
  75% { transform: translateY(-4px) rotate(2deg); }
}

.upload-text-section {
  text-align: center;
  max-width: 320px;
}

.upload-text {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.upload-primary {
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
}

.upload-subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.upload-action {
  color: #3b82f6;
  font-weight: 600;
}

.upload-hint {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  line-height: 1.4;
}

.format-highlight {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

.upload-limit {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.upload-limit strong {
  color: #3b82f6;
}

.supported-formats-compact {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.format-badge-compact {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.format-badge-compact.image {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #93c5fd;
  color: #1e40af;
}

.format-badge-compact:hover {
  transform: translateY(-1px) scale(1.05);
}

.format-badge-compact.image:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  border-color: #60a5fa;
  color: #1d4ed8;
}

.image-carousel-container {
  @apply mt-4;
}

.upload-progress {
  @apply mt-4;
}

.progress-bar-container {
  @apply w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden;
}

.progress-bar {
  @apply h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300;
}

.progress-text {
  @apply text-xs text-gray-600 dark:text-gray-400 text-center mt-2;
}
</style>

