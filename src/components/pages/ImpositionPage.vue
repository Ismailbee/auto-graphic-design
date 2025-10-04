<template>
  <ion-page class="imposition-page">
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Smart Imposition Studio</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" @click="resetForm" :disabled="!canReset">
            <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
            Reset
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <section class="hero">
        <h1>Create press-ready layouts in seconds</h1>
        <p>Upload a PDF or high-resolution image, pick an imposition style, and we’ll return a perfectly imposed PDF ready for print.</p>
      </section>

      <ion-grid fixed>
        <ion-row class="content-grid">
          <ion-col size="12" size-md="6" class="stack">
            <ion-card class="upload-card">
              <ion-card-header>
                <ion-card-subtitle>Source file</ion-card-subtitle>
                <ion-card-title>Upload artwork</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div
                  class="drop-zone"
                  :class="{ dragging: isDragging, ready: Boolean(file) }"
                  @dragover.prevent="onDragOver"
                  @dragleave.prevent="onDragLeave"
                  @drop.prevent="onDrop"
                  @click="openFilePicker"
                >
                  <ion-icon :icon="file ? documentOutline : cloudUploadOutline"></ion-icon>
                  <template v-if="file">
                    <h3>{{ file.name }}</h3>
                    <p>{{ formattedFileSize }}</p>
                    <ion-chip color="medium" v-if="fileTypeLabel">{{ fileTypeLabel }}</ion-chip>
                  </template>
                  <template v-else>
                    <h3>Drag & drop or browse</h3>
                    <p>Accepted formats: PDF, PNG, JPG (max 50&nbsp;MB)</p>
                    <ion-button expand="block" size="small" fill="outline">Browse files</ion-button>
                  </template>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  class="sr-only"
                  accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff,.bmp"
                  @change="onFileChange"
                />
                <ion-note color="danger" v-if="fileError" class="message note">{{ fileError }}</ion-note>
                <ion-note color="success" v-if="successMessage" class="message note">{{ successMessage }}</ion-note>
              </ion-card-content>
            </ion-card>

            <ion-card class="settings-card">
              <ion-card-header>
                <ion-card-subtitle>Layout options</ion-card-subtitle>
                <ion-card-title>Configure imposition</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="options-group">
                  <label>Imposition type</label>
                  <ion-segment v-model="selectedType" mode="md">
                    <ion-segment-button
                      v-for="option in impositionTypes"
                      :key="option.value"
                      :value="option.value"
                    >
                      <ion-label>
                        <strong>{{ option.label }}</strong>
                        <small>{{ option.description }}</small>
                      </ion-label>
                    </ion-segment-button>
                  </ion-segment>
                </div>

                <div class="options-grid">
                  <ion-item lines="full">
                    <ion-label>Paper size</ion-label>
                    <ion-select interface="popover" v-model="pageSizeValue" :disabled="customSizeEnabled">
                      <ion-select-option v-for="size in pageSizes" :key="size.value" :value="size.value">
                        {{ size.label }}
                      </ion-select-option>
                    </ion-select>
                  </ion-item>

                  <ion-item lines="full">
                    <ion-label>Duplex</ion-label>
                    <ion-select interface="popover" v-model="duplex">
                      <ion-select-option value="long-edge">Long-edge binding</ion-select-option>
                      <ion-select-option value="short-edge">Short-edge binding</ion-select-option>
                      <ion-select-option value="simplex">Single sided</ion-select-option>
                    </ion-select>
                  </ion-item>

                  <ion-item lines="none">
                    <ion-label>Blank page padding</ion-label>
                    <ion-toggle color="primary" v-model="addBlankPages"></ion-toggle>
                  </ion-item>

                  <ion-item lines="none">
                    <ion-label>Crop marks</ion-label>
                    <ion-toggle color="primary" v-model="addCropMarks"></ion-toggle>
                  </ion-item>
                </div>

                <ion-accordion-group class="advanced">
                  <ion-accordion value="advanced">
                    <ion-item slot="header" color="light">
                      <ion-label>Advanced page size</ion-label>
                    </ion-item>
                    <div slot="content" class="advanced-content">
                      <ion-item lines="full">
                        <ion-label>Use custom size</ion-label>
                        <ion-toggle color="primary" v-model="customSizeEnabled"></ion-toggle>
                      </ion-item>
                      <div class="custom-size" :class="{ disabled: !customSizeEnabled }">
                        <ion-item lines="none">
                          <ion-label position="stacked">Width (pt)</ion-label>
                          <ion-input type="number" min="1" inputmode="decimal" v-model="customWidth" :disabled="!customSizeEnabled"></ion-input>
                        </ion-item>
                        <ion-item lines="none">
                          <ion-label position="stacked">Height (pt)</ion-label>
                          <ion-input type="number" min="1" inputmode="decimal" v-model="customHeight" :disabled="!customSizeEnabled"></ion-input>
                        </ion-item>
                        <ion-note color="medium">Values are in PostScript points (1&nbsp;pt = 1/72 inch).</ion-note>
                      </div>
                    </div>
                  </ion-accordion>
                </ion-accordion-group>

                <ion-button
                  expand="block"
                  size="large"
                  class="submit-btn"
                  :disabled="!canSubmit"
                  @click="submitImposition"
                >
                  <ion-spinner slot="start" v-if="isSubmitting"></ion-spinner>
                  <ion-icon slot="start" :icon="documentOutline" v-else></ion-icon>
                  Generate imposed PDF
                </ion-button>

                <ion-note color="warning" v-if="validationWarning" class="message">{{ validationWarning }}</ion-note>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6" class="stack">
            <ion-card class="preview-card">
              <ion-card-header>
                <ion-card-subtitle>Output</ion-card-subtitle>
                <ion-card-title>Preview & download</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="status" v-if="isSubmitting">
                  <ion-spinner name="lines"></ion-spinner>
                  <p>Processing your file… This can take a moment for larger documents.</p>
                </div>

                <div class="status" v-else-if="errorMessage">
                  <ion-icon :icon="warningOutline" color="danger"></ion-icon>
                  <p>{{ errorMessage }}</p>
                </div>

                <div class="status success" v-else-if="previewUrl">
                  <ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon>
                  <div>
                    <h3>Ready for review</h3>
                    <p>Generated in {{ formattedProcessingTime }}.</p>
                  </div>
                </div>

                <div v-if="previewUrl" class="preview-frame">
                  <iframe :src="previewUrl" title="Imposed preview" referrerpolicy="no-referrer" loading="lazy"></iframe>
                </div>

                <div class="empty-state" v-else-if="!isSubmitting">
                  <ion-icon :icon="documentOutline"></ion-icon>
                  <h3>No output yet</h3>
                  <p>Upload a file and generate an imposition to see the preview here.</p>
                </div>

                <div class="actions" v-if="downloadUrl">
                  <ion-button expand="block" fill="solid" color="primary" :href="downloadUrl" download>
                    <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
                    Download imposed PDF
                  </ion-button>
                  <ion-button expand="block" fill="clear" @click="openPreview" :disabled="!previewUrl">
                    Open in new tab
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { onBeforeUnmount, ref, computed, watch } from 'vue';
import { backendApi } from '@/services/backendApi.js';
import {
  cloudUploadOutline,
  documentOutline,
  downloadOutline,
  refreshOutline,
  checkmarkCircleOutline,
  warningOutline,
} from 'ionicons/icons';

const impositionTypes = [
  {
    value: 'booklet',
    label: 'Booklet',
    description: 'Arrange spreads for saddle-stitch booklets',
  },
  {
    value: '2up',
    label: '2-Up',
    description: 'Place two pages per sheet for duplex printing',
  },
  {
    value: '4up',
    label: '4-Up',
    description: 'Impose four mini pages per sheet',
  },
];

const pageSizes = [
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'A3', label: 'A3 (297 × 420 mm)' },
  { value: 'Letter', label: 'US Letter (8.5 × 11 in)' },
  { value: 'Legal', label: 'US Legal (8.5 × 14 in)' },
  { value: 'Tabloid', label: 'Tabloid (11 × 17 in)' },
];

const fileInput = ref(null);
const file = ref(null);
const isDragging = ref(false);
const fileError = ref('');
const successMessage = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const previewUrl = ref('');
const downloadUrl = ref('');
const processingTime = ref(0);

const selectedType = ref('booklet');
const pageSizeValue = ref('A4');
const duplex = ref('long-edge');
const addBlankPages = ref(true);
const addCropMarks = ref(false);
const customSizeEnabled = ref(false);
const customWidth = ref('');
const customHeight = ref('');

const validationWarning = ref('');

const canSubmit = computed(() => Boolean(file.value) && !isSubmitting.value && !validationWarning.value);
const canReset = computed(() => Boolean(file.value || previewUrl.value || downloadUrl.value || successMessage.value || errorMessage.value));
const fileTypeLabel = computed(() => {
  if (!file.value) return '';
  if (file.value.type.includes('pdf')) return 'PDF';
  if (file.value.type.startsWith('image/')) return 'Image';
  return file.value.type || 'Document';
});

const formattedFileSize = computed(() => {
  if (!file.value) return '';
  const size = file.value.size;
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${size} bytes`;
});

const formattedProcessingTime = computed(() => {
  if (!processingTime.value) return '';
  if (processingTime.value < 1000) {
    return `${processingTime.value} ms`;
  }
  return `${(processingTime.value / 1000).toFixed(1)} seconds`;
});

watch(customSizeEnabled, (enabled) => {
  if (enabled) {
    validationWarning.value = validateCustomSize();
  } else {
    customWidth.value = '';
    customHeight.value = '';
    validationWarning.value = '';
  }
});

watch([customWidth, customHeight], () => {
  if (customSizeEnabled.value) {
    validationWarning.value = validateCustomSize();
  }
});

function openFilePicker() {
  fileInput.value?.click();
}

function onDragOver() {
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function onDrop(event) {
  isDragging.value = false;
  if (event.dataTransfer?.files?.length) {
    updateFile(event.dataTransfer.files[0]);
  }
}

function onFileChange(event) {
  const target = event.target;
  if (target?.files?.length) {
    updateFile(target.files[0]);
    target.value = '';
  }
}

function updateFile(selectedFile) {
  fileError.value = '';
  successMessage.value = '';
  errorMessage.value = '';

  if (!selectedFile) {
    file.value = null;
    return;
  }

  if (selectedFile.size > 50 * 1024 * 1024) {
    fileError.value = 'File exceeds the 50 MB limit. Please upload a smaller document.';
    file.value = null;
    return;
  }

  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/tiff', 'image/bmp'];
  if (!allowed.includes(selectedFile.type.toLowerCase())) {
    fileError.value = 'Unsupported file type. Upload PDF or high-resolution image formats.';
    file.value = null;
    return;
  }

  file.value = selectedFile;
}

function validateCustomSize() {
  if (!customSizeEnabled.value) return '';
  if (!customWidth.value || !customHeight.value) {
    return 'Enter both width and height to use a custom page size.';
  }
  if (Number(customWidth.value) <= 0 || Number(customHeight.value) <= 0) {
    return 'Width and height must be positive numbers.';
  }
  return '';
}

async function submitImposition() {
  if (!file.value || !canSubmit.value) return;

  const customSizeError = validateCustomSize();
  if (customSizeError) {
    validationWarning.value = customSizeError;
    return;
  }

  const formData = new FormData();
  formData.append('file', file.value);
  formData.append('type', selectedType.value);
  formData.append('duplex', duplex.value);
  formData.append('addBlankPages', addBlankPages.value ? 'true' : 'false');
  formData.append('addCropMarks', addCropMarks.value ? 'true' : 'false');

  if (customSizeEnabled.value) {
    formData.append('pageSize', 'custom');
    formData.append('customWidth', customWidth.value);
    formData.append('customHeight', customHeight.value);
  } else {
    formData.append('pageSize', pageSizeValue.value);
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const start = performance.now();

  try {
    const blob = await backendApi.impose(formData);
    processingTime.value = Math.round(performance.now() - start);

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }

    const objectUrl = URL.createObjectURL(blob);
    previewUrl.value = objectUrl;
    downloadUrl.value = objectUrl;
    successMessage.value = 'Imposition complete. Preview generated below.';
  } catch (error) {
    console.error('Error applying imposition:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate imposed PDF.';
    errorMessage.value = message;
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  file.value = null;
  fileError.value = '';
  successMessage.value = '';
  errorMessage.value = '';
  isSubmitting.value = false;
  customSizeEnabled.value = false;
  customWidth.value = '';
  customHeight.value = '';
  selectedType.value = 'booklet';
  pageSizeValue.value = 'A4';
  duplex.value = 'long-edge';
  addBlankPages.value = true;
  addCropMarks.value = false;
  processingTime.value = 0;
  validationWarning.value = '';

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  downloadUrl.value = '';
}

function openPreview() {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank', 'noopener');
  }
}

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<style scoped>
.imposition-page ion-content {
  --background: #f7f8fd;
}

.hero {
  padding: 2rem 1.5rem 1rem;
  text-align: center;
}

.hero h1 {
  font-size: clamp(1.8rem, 2.4vw, 2.4rem);
  margin-bottom: 0.5rem;
  color: #1a1b2f;
}

.hero p {
  max-width: 720px;
  margin: 0 auto;
  line-height: 1.6;
  color: #5f6173;
}

.content-grid {
  align-items: stretch;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.upload-card,
.settings-card,
.preview-card {
  border-radius: 20px;
  box-shadow: 0 18px 45px rgba(23, 34, 71, 0.08);
  overflow: hidden;
}

.upload-card ion-card-content,
.settings-card ion-card-content,
.preview-card ion-card-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.drop-zone {
  border: 2px dashed rgba(88, 101, 242, 0.35);
  border-radius: 16px;
  padding: 2.25rem 1.5rem;
  text-align: center;
  background: #fff;
  transition: all 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.drop-zone ion-icon {
  font-size: 2rem;
  color: #5865f2;
}

.drop-zone h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1a1b2f;
}

.drop-zone p {
  margin: 0;
  color: #6b6f80;
}

.drop-zone.dragging {
  border-color: #5865f2;
  background: rgba(88, 101, 242, 0.08);
}

.drop-zone.ready {
  border-color: rgba(27, 197, 189, 0.6);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.options-group label {
  font-weight: 600;
  color: #44465f;
}

ion-segment {
  --background: #f0f2ff;
  border-radius: 12px;
  padding: 0.25rem;
}

ion-segment-button {
  --color-checked: #fff;
  --background-checked: #5865f2;
  min-height: 64px;
  border-radius: 10px;
  align-items: flex-start;
  text-align: left;
}

ion-segment-button ion-label {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.95rem;
}

ion-segment-button small {
  font-size: 0.75rem;
  opacity: 0.65;
}

.options-grid {
  display: grid;
  gap: 0.75rem;
}

.custom-size {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.custom-size.disabled {
  opacity: 0.55;
}

.advanced-content {
  padding: 0.75rem 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.submit-btn {
  margin-top: 0.25rem;
}

.message {
  display: block;
  margin-top: -0.5rem;
}

.message.note {
  margin-top: 0.75rem;
}

.preview-card {
  min-height: 100%;
}

.status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: rgba(88, 101, 242, 0.08);
  color: #1a1b2f;
}

.status.success {
  background: rgba(45, 206, 137, 0.12);
}

.status ion-icon {
  font-size: 1.5rem;
}

.preview-frame {
  margin-top: 1rem;
  border-radius: 12px;
  overflow: hidden;
  background: #1a1b2f;
  min-height: 420px;
  border: 1px solid rgba(23, 34, 71, 0.1);
}

.preview-frame iframe {
  width: 100%;
  height: 480px;
  border: none;
  background: #fff;
}

.empty-state {
  margin-top: 1rem;
  text-align: center;
  color: #6b6f80;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-state ion-icon {
  font-size: 2.8rem;
  color: rgba(88, 101, 242, 0.4);
}

.actions {
  margin-top: 1.5rem;
  display: grid;
  gap: 0.75rem;
}

@media (max-width: 991px) {
  .hero {
    padding-top: 1.5rem;
  }

  .preview-frame iframe {
    height: 360px;
  }
}

@media (max-width: 575px) {
  .drop-zone {
    padding: 1.75rem 1rem;
  }

  ion-segment-button {
    min-height: 72px;
  }
}
</style>