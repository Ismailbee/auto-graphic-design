<template>
  <div class="export-panel">
    <div class="panel-header">
      <h3>Export</h3>
      <button @click="showPresets = !showPresets" class="btn-secondary">
        <i class="fas fa-magic"></i>
        Presets
      </button>
    </div>
    
    <!-- Quick Export Presets -->
    <div v-if="showPresets" class="presets-section">
      <h4>Quick Export</h4>
      <div class="presets-grid">
        <button 
          v-for="preset in quickPresets" 
          :key="preset.id"
          @click="applyPreset(preset)"
          class="preset-btn"
        >
          <i :class="preset.icon"></i>
          <span>{{ preset.name }}</span>
          <small>{{ preset.description }}</small>
        </button>
      </div>
    </div>
    
    <!-- Export Configuration -->
    <div class="export-config">
      <!-- Format Selection -->
      <div class="config-section">
        <h4>Format</h4>
        <div class="format-grid">
          <div 
            v-for="format in exportFormats" 
            :key="format.id"
            @click="selectedFormat = format.id"
            :class="['format-option', { active: selectedFormat === format.id }]"
          >
            <div class="format-icon">
              <i :class="getFormatIcon(format.id)"></i>
            </div>
            <div class="format-info">
              <span class="format-name">{{ format.name }}</span>
              <small class="format-desc">{{ format.description }}</small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Size Options -->
      <div class="config-section">
        <h4>Size</h4>
        <div class="size-options">
          <select v-model="selectedSize" @change="onSizeChange" class="size-select">
            <option v-for="size in exportSizes" :key="size.id" :value="size.id">
              {{ size.name }} {{ size.description ? `- ${size.description}` : '' }}
            </option>
          </select>
          
          <!-- Custom Size Inputs -->
          <div v-if="selectedSize === 'custom'" class="custom-size">
            <div class="size-inputs">
              <div class="input-group">
                <label>Width</label>
                <input 
                  type="number" 
                  v-model.number="customWidth" 
                  @input="onCustomSizeChange"
                  class="size-input"
                />
              </div>
              <div class="lock-aspect" @click="lockAspectRatio = !lockAspectRatio">
                <i :class="lockAspectRatio ? 'fas fa-lock' : 'fas fa-unlock'"></i>
              </div>
              <div class="input-group">
                <label>Height</label>
                <input 
                  type="number" 
                  v-model.number="customHeight" 
                  @input="onCustomSizeChange"
                  class="size-input"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Size Preview -->
        <div class="size-preview">
          <span class="preview-dimensions">{{ previewDimensions.width }}×{{ previewDimensions.height }}px</span>
          <span class="preview-ratio">{{ aspectRatio }}</span>
        </div>
      </div>
      
      <!-- Quality Settings -->
      <div v-if="selectedFormatInfo?.id !== 'svg'" class="config-section">
        <h4>Quality</h4>
        <div class="quality-control">
          <input 
            type="range" 
            min="0.5" 
            max="1" 
            step="0.1" 
            v-model.number="quality"
            class="quality-slider"
          />
          <div class="quality-labels">
            <span>{{ Math.round(quality * 100) }}%</span>
            <span class="file-size-estimate">{{ estimatedSize }}</span>
          </div>
        </div>
        
        <div class="quality-presets">
          <button 
            v-for="preset in qualityOptions" 
            :key="preset.value"
            @click="quality = preset.value"
            :class="['quality-preset', { active: quality === preset.value }]"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>
      
      <!-- Advanced Options -->
      <div class="config-section">
        <div class="advanced-toggle" @click="showAdvanced = !showAdvanced">
          <h4>Advanced Options</h4>
          <i :class="showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </div>
        
        <div v-if="showAdvanced" class="advanced-options">
          <div class="option-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="includeBackground" 
                :disabled="selectedFormatInfo?.id === 'jpg'"
              />
              <span>Include Background</span>
            </label>
          </div>
          
          <div class="option-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="embedFonts" />
              <span>Embed Fonts (SVG/PDF)</span>
            </label>
          </div>
          
          <div class="option-group">
            <label>Background Color</label>
            <input 
              type="color" 
              v-model="backgroundColor" 
              :disabled="!includeBackground"
              class="color-input"
            />
          </div>
          
          <div class="option-group">
            <label>Filename</label>
            <input 
              type="text" 
              v-model="filename" 
              placeholder="design"
              class="filename-input"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Export Actions -->
    <div class="export-actions">
      <div class="export-info">
        <div class="info-item">
          <span class="label">Format:</span>
          <span class="value">{{ selectedFormatInfo?.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">Size:</span>
          <span class="value">{{ previewDimensions.width }}×{{ previewDimensions.height }}</span>
        </div>
        <div class="info-item">
          <span class="label">Estimated:</span>
          <span class="value">{{ estimatedSize }}</span>
        </div>
      </div>
      
      <div class="action-buttons">
        <button @click="previewExport" class="btn-secondary">
          <i class="fas fa-eye"></i>
          Preview
        </button>
        <button 
          @click="performExport" 
          :disabled="isExporting"
          class="btn-primary"
        >
          <i v-if="isExporting" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-download"></i>
          {{ isExporting ? 'Exporting...' : 'Export' }}
        </button>
      </div>
    </div>
    
    <!-- Batch Export -->
    <div class="batch-section">
      <div class="batch-toggle" @click="showBatch = !showBatch">
        <h4>Batch Export</h4>
        <i :class="showBatch ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </div>
      
      <div v-if="showBatch" class="batch-options">
        <div class="batch-presets">
          <label class="checkbox-label">
            <input type="checkbox" v-model="batchFormats.png" />
            <span>PNG (High Quality)</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="batchFormats.jpg" />
            <span>JPEG (Web)</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="batchFormats.webp" />
            <span>WebP (Modern)</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="batchFormats.svg" />
            <span>SVG (Vector)</span>
          </label>
        </div>
        
        <button @click="performBatchExport" class="btn-primary batch-btn">
          <i class="fas fa-download"></i>
          Export All Selected
        </button>
      </div>
    </div>
    
    <!-- Export History -->
    <div class="history-section">
      <h4>Recent Exports</h4>
      <div class="history-list">
        <div 
          v-for="exportItem in exportHistory" 
          :key="exportItem.id"
          class="history-item"
        >
          <div class="history-info">
            <span class="history-name">{{ exportItem.filename }}</span>
            <span class="history-meta">{{ exportItem.format }} • {{ exportItem.size }}</span>
          </div>
          <button @click="reExport(exportItem)" class="btn-icon">
            <i class="fas fa-redo"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Preview Modal -->
    <div v-if="showPreview" class="preview-overlay" @click="closePreview">
      <div class="preview-modal" @click.stop>
        <div class="preview-header">
          <h3>Export Preview</h3>
          <button @click="closePreview" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="preview-content">
          <img :src="previewUrl" alt="Export Preview" />
        </div>
        
        <div class="preview-footer">
          <div class="preview-info">
            <span>{{ previewDimensions.width }}×{{ previewDimensions.height }}px</span>
            <span>{{ selectedFormatInfo?.name }}</span>
          </div>
          <button @click="performExport" class="btn-primary">
            Export This
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useExport } from '../../../composables/useExport';
import { useCanvasStore } from '../../../stores/canvas-konva';
import { useNotification } from '../../../composables/useNotification';

const canvasStore = useCanvasStore();
const { 
  exportFormats, 
  exportSizes, 
  qualityOptions,
  isExporting,
  exportCanvas,
  exportMultiple,
  estimateFileSize,
  formatFileSize
} = useExport();

const { showSuccess, showError } = useNotification();

// UI State
const showPresets = ref(false);
const showAdvanced = ref(false);
const showBatch = ref(false);
const showPreview = ref(false);

// Export Configuration
const selectedFormat = ref('png');
const selectedSize = ref('original');
const quality = ref(0.9);
const customWidth = ref(800);
const customHeight = ref(600);
const lockAspectRatio = ref(true);
const includeBackground = ref(true);
const embedFonts = ref(false);
const backgroundColor = ref('#ffffff');
const filename = ref('design');

// Batch Export
const batchFormats = ref({
  png: true,
  jpg: true,
  webp: false,
  svg: false
});

// Preview
const previewUrl = ref('');

// Export History
const exportHistory = ref([]);

// Quick Presets
const quickPresets = [
  {
    id: 'web-optimized',
    name: 'Web',
    description: 'WebP, 1920px',
    icon: 'fas fa-globe',
    config: { format: 'webp', size: 'web', quality: 0.8 }
  },
  {
    id: 'social-media',
    name: 'Social',
    description: 'JPEG, 1080px',
    icon: 'fab fa-instagram',
    config: { format: 'jpg', size: 'social-square', quality: 0.85 }
  },
  {
    id: 'print-ready',
    name: 'Print',
    description: 'PNG, 300 DPI',
    icon: 'fas fa-print',
    config: { format: 'png', size: 'print-300dpi', quality: 1.0 }
  },
  {
    id: 'vector',
    name: 'Vector',
    description: 'SVG, scalable',
    icon: 'fas fa-vector-square',
    config: { format: 'svg', size: 'original' }
  }
];

// Computed Properties
const selectedFormatInfo = computed(() => {
  return exportFormats.find(f => f.id === selectedFormat.value);
});

const selectedSizeInfo = computed(() => {
  return exportSizes.find(s => s.id === selectedSize.value);
});

const previewDimensions = computed(() => {
  if (selectedSize.value === 'custom') {
    return { width: customWidth.value, height: customHeight.value };
  }
  
  const sizeInfo = selectedSizeInfo.value;
  if (sizeInfo.width && sizeInfo.height) {
    return { width: sizeInfo.width, height: sizeInfo.height };
  }
  
  if (sizeInfo.width) {
    const aspectRatio = canvasStore.canvasHeight / canvasStore.canvasWidth;
    return { width: sizeInfo.width, height: Math.round(sizeInfo.width * aspectRatio) };
  }
  
  if (sizeInfo.multiplier) {
    return {
      width: Math.round(canvasStore.canvasWidth * sizeInfo.multiplier),
      height: Math.round(canvasStore.canvasHeight * sizeInfo.multiplier)
    };
  }
  
  return { width: canvasStore.canvasWidth, height: canvasStore.canvasHeight };
});

const aspectRatio = computed(() => {
  const { width, height } = previewDimensions.value;
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
});

const estimatedSize = computed(() => {
  const size = estimateFileSize(
    selectedFormat.value,
    quality.value,
    previewDimensions.value
  );
  return formatFileSize(size);
});

// Watchers
watch(selectedFormat, (newFormat) => {
  const formatInfo = exportFormats.find(f => f.id === newFormat);
  if (formatInfo) {
    quality.value = formatInfo.quality;
    includeBackground.value = !formatInfo.transparent;
  }
});

watch([customWidth, customHeight], () => {
  if (lockAspectRatio.value && selectedSize.value === 'custom') {
    onCustomSizeChange();
  }
});

// Methods
function getFormatIcon(format) {
  const icons = {
    png: 'fas fa-image',
    jpg: 'fas fa-file-image',
    webp: 'fas fa-compress',
    svg: 'fas fa-vector-square',
    pdf: 'fas fa-file-pdf'
  };
  return icons[format] || 'fas fa-file';
}

function onSizeChange() {
  if (selectedSize.value !== 'custom') {
    const sizeInfo = selectedSizeInfo.value;
    if (sizeInfo.width && sizeInfo.height) {
      customWidth.value = sizeInfo.width;
      customHeight.value = sizeInfo.height;
    }
  }
}

function onCustomSizeChange() {
  if (lockAspectRatio.value) {
    const canvasAspectRatio = canvasStore.canvasWidth / canvasStore.canvasHeight;
    // Update height based on width to maintain aspect ratio
    customHeight.value = Math.round(customWidth.value / canvasAspectRatio);
  }
}

function applyPreset(preset) {
  selectedFormat.value = preset.config.format;
  selectedSize.value = preset.config.size;
  if (preset.config.quality !== undefined) {
    quality.value = preset.config.quality;
  }
  showPresets.value = false;
}

async function previewExport() {
  try {
    const config = getExportConfig();
    
    // Generate preview using canvas toDataURL
    const dataUrl = canvasStore.stage.toDataURL({
      mimeType: selectedFormatInfo.value.mimeType,
      quality: quality.value,
      width: Math.min(previewDimensions.value.width, 800),
      height: Math.min(previewDimensions.value.height, 600),
      pixelRatio: 1
    });
    
    previewUrl.value = dataUrl;
    showPreview.value = true;
    
  } catch (error) {
    console.error('Preview error:', error);
    showError('Failed to generate preview');
  }
}

function closePreview() {
  showPreview.value = false;
  previewUrl.value = '';
}

async function performExport() {
  try {
    const config = getExportConfig();
    const result = await exportCanvas(config);
    
    if (result.success) {
      addToHistory(result, config);
      showSuccess(`Exported as ${result.filename}`);
      closePreview();
    }
  } catch (error) {
    console.error('Export error:', error);
    showError('Export failed: ' + error.message);
  }
}

async function performBatchExport() {
  const selectedFormats = Object.entries(batchFormats.value)
    .filter(([_, selected]) => selected)
    .map(([format]) => format);
  
  if (selectedFormats.length === 0) {
    showError('Please select at least one format for batch export');
    return;
  }
  
  try {
    const exports = selectedFormats.map(format => ({
      ...getExportConfig(),
      format,
      filename: `${filename.value}-${format}`
    }));
    
    const results = await exportMultiple(exports);
    const successful = results.filter(r => r.success).length;
    
    if (successful === results.length) {
      showSuccess(`Successfully exported ${successful} files`);
    } else {
      showError(`Exported ${successful} of ${results.length} files`);
    }
    
    // Add successful exports to history
    results.forEach(result => {
      if (result.success) {
        addToHistory(result, result.config);
      }
    });
    
  } catch (error) {
    console.error('Batch export error:', error);
    showError('Batch export failed');
  }
}

function getExportConfig() {
  const config = {
    format: selectedFormat.value,
    quality: quality.value,
    transparent: selectedFormatInfo.value.transparent && !includeBackground.value,
    filename: filename.value || 'design'
  };
  
  if (selectedSize.value === 'custom') {
    config.width = customWidth.value;
    config.height = customHeight.value;
  } else {
    const sizeInfo = selectedSizeInfo.value;
    if (sizeInfo.width) config.width = sizeInfo.width;
    if (sizeInfo.height) config.height = sizeInfo.height;
    if (sizeInfo.multiplier) config.multiplier = sizeInfo.multiplier;
  }
  
  return config;
}

function addToHistory(result, config) {
  const historyItem = {
    id: Date.now(),
    filename: result.filename,
    format: config.format.toUpperCase(),
    size: formatFileSize(result.size),
    dimensions: result.dimensions,
    config: config,
    timestamp: new Date().toISOString()
  };
  
  exportHistory.value.unshift(historyItem);
  
  // Keep only last 10 exports
  if (exportHistory.value.length > 10) {
    exportHistory.value = exportHistory.value.slice(0, 10);
  }
}

async function reExport(historyItem) {
  try {
    const result = await exportCanvas(historyItem.config);
    if (result.success) {
      showSuccess(`Re-exported as ${result.filename}`);
    }
  } catch (error) {
    console.error('Re-export error:', error);
    showError('Re-export failed');
  }
}
</script>

<style scoped>
.export-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  color: #4f46e5;
  border: 1px solid #4f46e5;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #4f46e5;
  color: white;
}

.presets-section {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.presets-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1f2937;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.preset-btn:hover {
  border-color: #4f46e5;
  transform: translateY(-1px);
}

.preset-btn i {
  font-size: 18px;
  color: #4f46e5;
}

.preset-btn span {
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
}

.preset-btn small {
  font-size: 10px;
  color: #6b7280;
}

.export-config {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.config-section {
  margin-bottom: 24px;
}

.config-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1f2937;
}

.format-grid {
  display: grid;
  gap: 8px;
}

.format-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.format-option:hover,
.format-option.active {
  border-color: #4f46e5;
  background: #f8fafc;
}

.format-option.active {
  background: #eff6ff;
}

.format-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 6px;
  color: #6b7280;
}

.format-option.active .format-icon {
  background: #4f46e5;
  color: white;
}

.format-info {
  flex: 1;
}

.format-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.format-desc {
  display: block;
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.size-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 12px;
}

.custom-size {
  background: #f9fafb;
  border-radius: 6px;
  padding: 12px;
}

.size-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
}

.size-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
}

.lock-aspect {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  margin-top: 16px;
}

.lock-aspect:hover {
  color: #4f46e5;
  border-color: #4f46e5;
}

.size-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.preview-dimensions {
  font-family: monospace;
  font-weight: 500;
}

.quality-control {
  margin-bottom: 12px;
}

.quality-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  margin-bottom: 8px;
}

.quality-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
}

.quality-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.file-size-estimate {
  font-family: monospace;
}

.quality-presets {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.quality-preset {
  padding: 4px 8px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.quality-preset:hover,
.quality-preset.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.advanced-toggle,
.batch-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 12px;
}

.advanced-toggle h4,
.batch-toggle h4 {
  margin: 0;
}

.advanced-options {
  background: #f9fafb;
  border-radius: 6px;
  padding: 12px;
}

.option-group {
  margin-bottom: 12px;
}

.option-group:last-child {
  margin-bottom: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.color-input {
  width: 100%;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

.filename-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
}

.export-actions {
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  background: #f9fafb;
}

.export-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.label {
  color: #6b7280;
  margin-bottom: 2px;
}

.value {
  color: #1f2937;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.batch-section,
.history-section {
  border-top: 1px solid #e5e7eb;
  padding: 16px;
}

.batch-presets {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.batch-btn {
  width: 100%;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
}

.history-info {
  flex: 1;
}

.history-name {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
}

.history-meta {
  display: block;
  font-size: 10px;
  color: #6b7280;
  margin-top: 2px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  border-radius: 4px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #4f46e5;
}

/* Preview Modal */
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-modal {
  background: white;
  border-radius: 8px;
  max-width: 80vw;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.preview-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.preview-content {
  padding: 16px;
  text-align: center;
  max-height: 60vh;
  overflow: auto;
}

.preview-content img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.preview-info {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}
</style>
