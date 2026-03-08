<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="export-panel-overlay"
        @click="close"
      ></div>
    </Transition>

    <!-- Panel -->
    <Transition name="scale">
      <div v-if="modelValue" class="export-panel">
        <!-- Header -->
        <div class="panel-header">
          <h2>
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Design
          </h2>
          <button @click="close" class="close-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="panel-content">
          <!-- Format Selection -->
          <div class="form-section">
            <label class="section-label">File Format</label>
            <div class="format-grid">
              <button
                v-for="format in availableFormats"
                :key="format.format"
                :class="['format-btn', { active: selectedFormat === format.format }]"
                @click="exportStore.setFormat(format.format)"
              >
                <svg class="format-icon" width="24" height="24">
                  <use :href="`#icon-${format.format}`"></use>
                </svg>
                <span class="format-label">{{ format.label }}</span>
                <span class="format-desc">{{ format.description }}</span>
              </button>
            </div>
          </div>

          <!-- Resolution Settings -->
          <div class="form-section">
            <label class="section-label">Resolution</label>
            <div class="resolution-tabs">
              <button
                v-for="preset in resolutionPresets"
                :key="preset.preset"
                :class="['tab-btn', { active: selectedResolution === preset.preset }]"
                @click="exportStore.setResolution(preset.preset)"
              >
                {{ preset.label }}
              </button>
            </div>

            <!-- Custom Dimensions -->
            <div v-if="selectedResolution === 'custom'" class="custom-dimensions">
              <div class="dimension-input">
                <label>Width (px)</label>
                <input
                  type="number"
                  v-model.number="customWidth"
                  @change="updateCustomDimensions"
                  min="1"
                  max="8000"
                />
              </div>
              <span class="dimension-separator">×</span>
              <div class="dimension-input">
                <label>Height (px)</label>
                <input
                  type="number"
                  v-model.number="customHeight"
                  @change="updateCustomDimensions"
                  min="1"
                  max="8000"
                />
              </div>
            </div>

            <!-- DPI Selector (for print formats) -->
            <div v-if="selectedFormat === 'pdf' || selectedFormat === 'jpeg'" class="dpi-selector">
              <label>DPI (Print Quality)</label>
              <select v-model.number="selectedDpi">
                <option :value="72">72 DPI (Screen)</option>
                <option :value="150">150 DPI (Good)</option>
                <option :value="300">300 DPI (Print)</option>
                <option :value="600">600 DPI (High Quality)</option>
              </select>
            </div>
          </div>

          <!-- Background Options -->
          <div class="form-section">
            <label class="section-label">Background</label>
            <div class="background-options">
              <label class="radio-option">
                <input
                  type="radio"
                  value="canvas"
                  v-model="selectedBackground"
                  @change="updateBackground"
                />
                <span>Canvas Background</span>
              </label>
              <label
                v-if="formatConfig?.supportsTransparency"
                class="radio-option"
              >
                <input
                  type="radio"
                  value="transparent"
                  v-model="selectedBackground"
                  @change="updateBackground"
                />
                <span>Transparent</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  value="solid"
                  v-model="selectedBackground"
                  @change="updateBackground"
                />
                <span>Solid Color</span>
              </label>
            </div>

            <!-- Color Picker -->
            <div v-if="selectedBackground === 'solid'" class="color-picker">
              <input
                type="color"
                v-model="backgroundColor"
                @change="updateBackground"
              />
              <input
                type="text"
                v-model="backgroundColor"
                @change="updateBackground"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <!-- Quality Slider (JPEG only) -->
          <div v-if="formatConfig?.supportsQuality" class="form-section">
            <label class="section-label">
              Quality: {{ Math.round(quality * 100) }}%
            </label>
            <input
              type="range"
              v-model.number="quality"
              min="0.1"
              max="1.0"
              step="0.1"
              class="quality-slider"
            />
            <div class="quality-labels">
              <span>Lower file size</span>
              <span>Higher quality</span>
            </div>
          </div>

          <!-- Advanced Options (Collapsible) -->
          <div class="form-section">
            <button
              @click="showAdvanced = !showAdvanced"
              class="advanced-toggle"
            >
              <svg
                :class="['toggle-icon', { rotated: showAdvanced }]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              Advanced Options
            </button>

            <Transition name="expand">
              <div v-if="showAdvanced" class="advanced-options">
                <label v-if="selectedFormat === 'pdf'" class="checkbox-option">
                  <input type="checkbox" v-model="includeBleed" />
                  <span>Include bleed/crop marks</span>
                </label>
                <label v-if="selectedFormat === 'pdf' || selectedFormat === 'svg'" class="checkbox-option">
                  <input type="checkbox" v-model="embedFonts" />
                  <span>Embed fonts</span>
                </label>
              </div>
            </Transition>
          </div>

          <!-- File Size Estimate -->
          <div class="file-info">
            <div class="info-row">
              <span class="info-label">Estimated size:</span>
              <span class="info-value">{{ estimatedSize }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Dimensions:</span>
              <span class="info-value">{{ exportDimensions }}</span>
            </div>
          </div>

          <!-- Export Progress -->
          <div v-if="hasActiveExport" class="export-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${exportProgress?.progress || 0}%` }"
              ></div>
            </div>
            <p class="progress-text">{{ exportProgress?.message || 'Processing...' }}</p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </div>
        </div>

        <!-- Footer -->
        <div class="panel-footer">
          <button @click="close" class="btn-secondary">
            Cancel
          </button>
          <button
            @click="handleExport"
            :disabled="!canExport"
            class="btn-primary"
          >
            <svg v-if="!hasActiveExport" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <svg v-else class="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
            </svg>
            {{ hasActiveExport ? 'Exporting...' : 'Export Now' }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useExportStore } from '@/stores/export'
import { storeToRefs } from 'pinia'
import { EXPORT_FORMATS, RESOLUTION_PRESETS, getFormatConfig } from '@/types/export'
import { estimateFileSize, formatFileSize } from '@/services/export/export-utils'
import type { ExportFormat, BackgroundType } from '@/types/export'

const props = defineProps<{
  modelValue: boolean
  projectId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'export-complete': [result: any]
}>()

const exportStore = useExportStore()
const {
  selectedFormat,
  selectedResolution,
  customWidth,
  customHeight,
  selectedDpi,
  selectedBackground,
  backgroundColor,
  quality,
  transparent,
  includeBleed,
  embedFonts,
  hasActiveExport,
  canExport,
  exportProgress,
  error,
  currentExport,
} = storeToRefs(exportStore)

const showAdvanced = ref(false)

const availableFormats = computed(() => {
  return Object.values(EXPORT_FORMATS).filter(f => 
    ['jpeg', 'png', 'pdf', 'svg'].includes(f.format)
  )
})

const resolutionPresets = computed(() => {
  return Object.values(RESOLUTION_PRESETS)
})

const formatConfig = computed(() => {
  return getFormatConfig(selectedFormat.value)
})

const exportDimensions = computed(() => {
  if (selectedResolution.value === 'custom') {
    return `${customWidth.value} × ${customHeight.value} px`
  }
  const preset = RESOLUTION_PRESETS[selectedResolution.value]
  return `${preset.width} × ${preset.height} px`
})

const estimatedSize = computed(() => {
  const width = selectedResolution.value === 'custom' 
    ? customWidth.value 
    : RESOLUTION_PRESETS[selectedResolution.value].width
  const height = selectedResolution.value === 'custom'
    ? customHeight.value
    : RESOLUTION_PRESETS[selectedResolution.value].height
  
  const bytes = estimateFileSize(width, height, selectedFormat.value, quality.value)
  return formatFileSize(bytes)
})

function updateCustomDimensions() {
  exportStore.setCustomDimensions(customWidth.value, customHeight.value)
}

function updateBackground() {
  exportStore.setBackground(selectedBackground.value as BackgroundType, backgroundColor.value)
}

async function handleExport() {
  const result = await exportStore.startExport(props.projectId)
  
  if (result && result.status === 'complete') {
    emit('export-complete', result)
    // Auto-download if URL is available
    if (result.downloadUrl) {
      await exportStore.downloadCurrentExport()
    }
  }
}

function close() {
  emit('update:modelValue', false)
}

// Watch for export completion
watch(currentExport, (newExport) => {
  if (newExport && newExport.status === 'complete') {
    emit('export-complete', newExport)
  }
})
</script>

<style scoped>
/* Overlay */
.export-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  pointer-events: auto;
  /* Changed to auto to allow modal interaction */
}

/* Panel */
.export-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 520px;
  max-height: 85vh;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in export panel */
}

/* Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.panel-header .icon {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

/* Content */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* Format Grid */
.format-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.format-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.format-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(59, 130, 246, 0.3);
}

.format-btn.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.format-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  color: #3b82f6;
}

.format-label {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.format-desc {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
}

/* Resolution Tabs */
.resolution-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.7);
}

.tab-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

/* Custom Dimensions */
.custom-dimensions {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.dimension-input {
  flex: 1;
}

.dimension-input label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.dimension-input input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 14px;
}

.dimension-separator {
  padding-bottom: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #9ca3af;
}

/* DPI Selector */
.dpi-selector {
  margin-top: 16px;
}

.dpi-selector label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.dpi-selector select {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

/* Background Options */
.background-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-option:hover {
  background: rgba(255, 255, 255, 0.7);
}

.radio-option input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.radio-option span {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* Color Picker */
.color-picker {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.color-picker input[type="color"] {
  width: 60px;
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  cursor: pointer;
}

.color-picker input[type="text"] {
  flex: 1;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 14px;
  font-family: monospace;
}

/* Quality Slider */
.quality-slider {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.quality-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

.quality-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.quality-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: #6b7280;
}

/* Advanced Options */
.advanced-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.advanced-toggle:hover {
  background: rgba(255, 255, 255, 0.7);
}

.toggle-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.advanced-options {
  margin-top: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
}

.checkbox-option:last-child {
  margin-bottom: 0;
}

.checkbox-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-option span {
  font-size: 14px;
  color: #374151;
}

/* File Info */
.file-info {
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  margin-top: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 13px;
  color: #6b7280;
}

.info-value {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

/* Export Progress */
.export-progress {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in progress bar */
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  margin-top: 16px;
  font-size: 13px;
  color: #dc2626;
}

.error-message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Footer */
.panel-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary,
.btn-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary svg,
.btn-secondary svg {
  width: 18px;
  height: 18px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease-out;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling during transitions */
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
  opacity: 1;
}

/* Scrollbar */
.panel-content::-webkit-scrollbar {
  width: 8px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>

