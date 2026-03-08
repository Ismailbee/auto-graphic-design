<template>
  <div class="upload-preview-container">
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Upload/Preview Box -->
    <div
      :class="[
        'upload-preview-box',
        {
          'has-image': hasImage,
          'is-dragging': isDragging,
          'disabled': disabled
        }
      ]"
      @click="handleClick"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- Upload State -->
      <div v-if="!hasImage" class="upload-state">
        <div class="upload-icon-wrapper">
          <div class="upload-icon-bg"></div>
          <div class="upload-icon">
            <svg 
              class="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
        </div>
        <div class="upload-text-content">
          <span class="upload-text">
            {{ uploadText }}
          </span>
          <span v-if="uploadHint" class="upload-hint">
            {{ uploadHint }}
          </span>
        </div>
      </div>

      <!-- Preview State -->
      <div v-else class="preview-state">
        <!-- Remove button -->
        <button
          v-if="showRemoveButton"
          @click.stop="handleRemove"
          class="remove-button"
          :title="removeButtonTitle"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Image preview -->
        <img
          :src="imageSrc"
          :alt="imageAlt"
          class="preview-image"
          :style="imageStyle"
        />

        <!-- Replace overlay (shows on hover if replaceOnClick is true) -->
        <div v-if="replaceOnClick" class="replace-overlay">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span class="replace-text">{{ replaceText }}</span>
        </div>
      </div>
    </div>

    <!-- Optional: Image info below the box -->
    <div v-if="hasImage && showImageInfo" class="image-info">
      <p class="image-name">{{ fileName }}</p>
      <p class="image-size">{{ formatFileSize(fileSize) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'

interface Props {
  // File input props
  accept?: string
  disabled?: boolean
  
  // Upload state props
  uploadText?: string
  uploadHint?: string
  
  // Image props
  modelValue?: File | string | null
  imageSrc?: string
  imageAlt?: string
  imageStyle?: Record<string, string>
  
  // Preview state props
  showRemoveButton?: boolean
  removeButtonTitle?: string
  replaceOnClick?: boolean
  replaceText?: string
  
  // Info display
  showImageInfo?: boolean
  
  // Size and styling
  height?: string
  width?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
  disabled: false,
  uploadText: 'Click to upload',
  uploadHint: '',
  imageAlt: 'Preview',
  showRemoveButton: true,
  removeButtonTitle: 'Remove image',
  replaceOnClick: true,
  replaceText: 'Click to replace',
  showImageInfo: false,
  height: 'h-20',
  width: 'w-full',
  className: ''
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  'change': [file: File | null]
  'remove': []
  'error': [message: string]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

// Computed properties
const hasImage = computed(() => {
  return !!(props.modelValue || props.imageSrc)
})

const fileName = computed(() => {
  if (props.modelValue instanceof File) {
    return props.modelValue.name
  }
  return 'Unknown'
})

const fileSize = computed(() => {
  if (props.modelValue instanceof File) {
    return props.modelValue.size
  }
  return 0
})

// Methods
function handleClick() {
  if (props.disabled) return
  
  if (!hasImage.value || props.replaceOnClick) {
    fileInput.value?.click()
  }
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    handleFile(file)
  }
}

function handleFile(file: File) {
  // Validate file type
  if (props.accept && !isFileTypeAccepted(file, props.accept)) {
    emit('error', `File type not accepted. Expected: ${props.accept}`)
    return
  }
  
  emit('update:modelValue', file)
  emit('change', file)
}

function handleRemove() {
  emit('update:modelValue', null)
  emit('change', null)
  emit('remove')
  
  // Clear file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleDragOver(event: DragEvent) {
  if (props.disabled) return
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  if (props.disabled) return
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

function isFileTypeAccepted(file: File, accept: string): boolean {
  const acceptedTypes = accept.split(',').map(type => type.trim())
  
  return acceptedTypes.some(acceptedType => {
    if (acceptedType.startsWith('.')) {
      // File extension
      return file.name.toLowerCase().endsWith(acceptedType.toLowerCase())
    } else if (acceptedType.includes('/*')) {
      // MIME type with wildcard
      const baseType = acceptedType.split('/')[0]
      return file.type.startsWith(baseType)
    } else {
      // Exact MIME type
      return file.type === acceptedType
    }
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Expose methods
defineExpose({
  triggerFileInput: () => fileInput.value?.click(),
  clearFile: handleRemove
})
</script>

<style scoped>
.upload-preview-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upload-preview-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80px;
}

.dark .upload-preview-box {
  background-color: #1e293b;
  border-color: #4b5563;
}

.upload-preview-box:hover:not(.disabled) {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.upload-preview-box.is-dragging {
  border-color: #3b82f6;
  background-color: #eff6ff;
  transform: scale(1.02);
}

.dark .upload-preview-box.is-dragging {
  background-color: rgba(59, 130, 246, 0.1);
}

.upload-preview-box.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-preview-box.has-image {
  padding: 6px;
}

/* Upload State */
.upload-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.upload-icon-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 50%;
  opacity: 0.1;
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.1); opacity: 0.15; }
}

.upload-icon {
  color: #3b82f6;
  z-index: 1;
  filter: drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3));
  animation: floatIcon 3s ease-in-out infinite;
}

@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.dark .upload-icon {
  color: #60a5fa;
}

.upload-text-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-text {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-align: center;
}

.dark .upload-text {
  color: #cbd5e1;
}

.upload-hint {
  font-size: 10px;
  color: #64748b;
  text-align: center;
  font-weight: 500;
}

.dark .upload-hint {
  color: #94a3b8;
}

/* Preview State */
.preview-state {
  position: relative;
  width: 100%;
  height: 100%;
}

.remove-button {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  padding: 4px;
  transition: background-color 0.2s ease;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  opacity: 0;
  border: none;
  cursor: pointer;
}

.preview-state:hover .remove-button {
  opacity: 1;
}

.remove-button:hover {
  background-color: #dc2626;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
  min-height: 60px;
}

.replace-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 4px;
}

.preview-state:hover .replace-overlay {
  opacity: 1;
}

.replace-text {
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
}

/* Image Info */
.image-info {
  padding: 4px 8px;
  background-color: #f9fafb;
  border-radius: 4px;
  font-size: 12px;
}

.dark .image-info {
  background-color: #1f2937;
}

.image-name {
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .image-name {
  color: white;
}

.image-size {
  color: #6b7280;
}

.dark .image-size {
  color: #9ca3af;
}

/* Size variants */
.upload-preview-box.h-16 {
  min-height: 64px;
}

.upload-preview-box.h-20 {
  min-height: 80px;
}

.upload-preview-box.h-24 {
  min-height: 96px;
}

.upload-preview-box.h-32 {
  min-height: 128px;
}
</style>