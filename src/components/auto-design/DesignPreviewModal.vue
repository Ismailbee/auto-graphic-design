<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue && project" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Design Preview</h2>
              <p class="modal-subtitle">{{ project.category }}</p>
            </div>
            <button @click="close" class="close-button">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Preview Image -->
          <div class="preview-section">
            <div class="preview-container">
              <!-- Debug info -->
              <div v-if="project.design.previewUrl" class="mb-2 text-xs text-gray-500">
                Preview URL: {{ project.design.previewUrl }}
              </div>

              <img
                v-if="project.design.previewUrl"
                :src="project.design.previewUrl"
                :alt="`${project.category} design`"
                class="preview-image"
                @error="handleImageError"
                @load="handleImageLoad"
              />
              <div v-else class="preview-placeholder">
                <svg class="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-gray-500 mt-4">No preview available</p>
              </div>
            </div>

            <!-- Design Info -->
            <div class="design-info">
              <div class="info-item">
                <span class="info-label">Dimensions:</span>
                <span class="info-value">
                  {{ project.design.dimensions.width }} × {{ project.design.dimensions.height }}px
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">DPI:</span>
                <span class="info-value">{{ project.design.dimensions.dpi }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="status-badge" :class="statusClass">
                  {{ project.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions-section">
            <div class="action-buttons">
              <!-- Download Dropdown -->
              <div class="download-dropdown">
                <button @click="toggleDownloadMenu" class="action-button primary">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                  <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <Transition name="dropdown-fade">
                  <div v-if="showDownloadMenu" class="dropdown-menu">
                    <button @click="handleDownload('png')" class="dropdown-item">
                      <span>PNG</span>
                      <span class="text-xs text-gray-500">High quality</span>
                    </button>
                    <button @click="handleDownload('jpeg')" class="dropdown-item">
                      <span>JPEG</span>
                      <span class="text-xs text-gray-500">Smaller size</span>
                    </button>
                    <button @click="handleDownload('pdf')" class="dropdown-item">
                      <span>PDF</span>
                      <span class="text-xs text-gray-500">Print ready</span>
                    </button>
                  </div>
                </Transition>
              </div>

              <!-- Send to Editor -->
              <button @click="handleSendToEditor" class="action-button secondary">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Send to Editor
              </button>

              <!-- Retouch -->
              <button @click="handleRetouch" class="action-button secondary">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Retouch
              </button>

              <!-- Create More -->
              <button @click="handleCreateMore" class="action-button secondary">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Create More
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AutoDesignProject } from '@/types/auto-design'

interface Props {
  modelValue: boolean
  project: AutoDesignProject | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'download', format: 'png' | 'jpeg' | 'pdf'): void
  (e: 'sendToEditor'): void
  (e: 'retouch'): void
  (e: 'createMore'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showDownloadMenu = ref(false)

const statusClass = computed(() => {
  if (!props.project) return ''
  
  switch (props.project.status) {
    case 'completed':
      return 'status-completed'
    case 'processing':
      return 'status-processing'
    case 'failed':
      return 'status-failed'
    default:
      return 'status-draft'
  }
})

function close() {
  emit('update:modelValue', false)
  showDownloadMenu.value = false
}

function toggleDownloadMenu() {
  showDownloadMenu.value = !showDownloadMenu.value
}

function handleDownload(format: 'png' | 'jpeg' | 'pdf') {
  emit('download', format)
  showDownloadMenu.value = false
}

function handleSendToEditor() {
  emit('sendToEditor')
  close()
}

function handleRetouch() {
  emit('retouch')
  close()
}

function handleCreateMore() {
  emit('createMore')
  close()
}

function handleImageError(event: Event) {
  console.error('❌ Image failed to load:', props.project?.design.previewUrl)
  console.error('Error event:', event)
}

function handleImageLoad() {
  console.log('✅ Image loaded successfully:', props.project?.design.previewUrl)
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col;
}

.modal-header {
  @apply flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.modal-subtitle {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize;
}

.close-button {
  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors;
}

.preview-section {
  @apply flex-1 overflow-y-auto p-6;
}

.preview-container {
  @apply bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden mb-6 flex items-center justify-center min-h-[400px];
}

.preview-image {
  @apply max-w-full max-h-[600px] object-contain;
}

.preview-placeholder {
  @apply flex flex-col items-center justify-center py-20;
}

.design-info {
  @apply grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4;
}

.info-item {
  @apply flex flex-col;
}

.info-label {
  @apply text-xs text-gray-600 dark:text-gray-400 mb-1;
}

.info-value {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.status-badge {
  @apply inline-block px-3 py-1 rounded-full text-xs font-medium capitalize;
}

.status-completed {
  @apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400;
}

.status-processing {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400;
}

.status-failed {
  @apply bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400;
}

.status-draft {
  @apply bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400;
}

.actions-section {
  @apply border-t border-gray-200 dark:border-gray-700 p-6;
}

.action-buttons {
  @apply flex flex-wrap gap-3;
}

.action-button {
  @apply flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200;
}

.action-button.primary {
  @apply bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl;
}

.action-button.secondary {
  @apply bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600;
}

.download-dropdown {
  @apply relative;
}

.dropdown-menu {
  @apply absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px] z-10;
}

.dropdown-item {
  @apply w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  @apply transition-opacity duration-200;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  @apply opacity-0;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  @apply transition-all duration-150;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  @apply opacity-0 transform scale-95;
}
</style>

