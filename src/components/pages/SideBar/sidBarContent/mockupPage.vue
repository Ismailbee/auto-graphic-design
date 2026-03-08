<template>
  <ion-page>
    <page-header label="Create a Mockup" />
    <ion-content :fullscreen="true">
      <div class="mockup-generator-page">
        <main class="mockup-workspace">
          <!-- Left Panel: Controls -->
          <div class="controls-panel">
            <div class="controls-section">
              <h2 class="section-title">
                <i class="fas fa-image"></i> Your Designs
              </h2>
              <div class="design-upload-grid">
                <!-- Front Design Upload -->
                <div class="upload-slot">
                  <label class="upload-label">Front Design</label>
                  <div 
                    class="drop-zone" 
                    @dragover.prevent @dragenter.prevent @drop.prevent="onFileDrop($event, 'front')"
                    :class="{ 'has-image': designFrontPreview }"
                  >
                    <input type="file" accept="image/*" @change="onFileChange($event, 'front')" class="file-input" id="front-upload" />
                    <label for="front-upload" class="drop-zone-content">
                      <img v-if="designFrontPreview" :src="designFrontPreview" alt="Front Preview" class="preview-image" />
                      <div v-else class="placeholder">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Drop image or click</span>
                      </div>
                    </label>
                  </div>
                  <div v-if="designFrontPreview" class="edit-controls">
                    <ion-button size="small" fill="clear" @click="openEditor('front')">
                      <i class="fas fa-crop-alt"></i> Edit
                    </ion-button>
                    <ion-button size="small" fill="clear" color="danger" @click="clearImage('front')">
                      <i class="fas fa-trash"></i> Remove
                    </ion-button>
                  </div>
                </div>
                <!-- Back Design Upload -->
                <div class="upload-slot">
                  <label class="upload-label">Back Design</label>
                  <div 
                    class="drop-zone" 
                    @dragover.prevent @dragenter.prevent @drop.prevent="onFileDrop($event, 'back')"
                    :class="{ 'has-image': designBackPreview }"
                  >
                    <input type="file" accept="image/*" @change="onFileChange($event, 'back')" class="file-input" id="back-upload" />
                    <label for="back-upload" class="drop-zone-content">
                      <img v-if="designBackPreview" :src="designBackPreview" alt="Back Preview" class="preview-image" />
                      <div v-else class="placeholder">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Drop image or click</span>
                      </div>
                    </label>
                  </div>
                  <div v-if="designBackPreview" class="edit-controls">
                    <ion-button size="small" fill="clear" @click="openEditor('back')">
                      <i class="fas fa-crop-alt"></i> Edit
                    </ion-button>
                     <ion-button size="small" fill="clear" color="danger" @click="clearImage('back')">
                      <i class="fas fa-trash"></i> Remove
                    </ion-button>
                  </div>
                </div>
              </div>
            </div>

            <div class="controls-section">
              <h2 class="section-title">
                <i class="fas fa-tshirt"></i> Mockup Templates
              </h2>
              <div class="template-grid">
                <div
                  v-for="template in templates"
                  :key="template.name"
                  :class="['template-card', { 'selected': selectedTemplate === template.name }]"
                  @click="selectTemplate(template.name)"
                >
                  <img :src="template.preview" :alt="template.name" class="template-preview-img" />
                  <span class="template-name">{{ template.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel: Preview -->
          <div class="preview-panel">
            <div class="preview-area">
              <div v-if="!selectedTemplate" class="preview-placeholder">
                <i class="fas fa-eye"></i>
                <p>Select a template to see your mockup</p>
              </div>
              <div v-else class="mockup-display">
                <img :src="getTemplatePreview(selectedTemplate)" class="mockup-bg" alt="Template background" />
                <div class="design-container" :style="getDesignContainerStyle(selectedTemplate)">
                  <img v-if="designFrontPreview" :src="designFrontPreview" class="design-overlay" alt="Front design overlay" />
                  <!-- Note: Showing both front and back on top of each other might not be desired. 
                       This example just places front. A more complex UI could have front/back views. -->
                </div>
              </div>
            </div>
            <div class="preview-actions">
              <ion-button color="primary" expand="block" @click="downloadMockup" :disabled="!selectedTemplate || !designFrontPreview">
                <i class="fas fa-download"></i> Download Mockup
              </ion-button>
              <ion-button fill="outline" expand="block" @click="resetAll" class="mt-2">
                <i class="fas fa-sync-alt"></i> Start Over
              </ion-button>
            </div>
          </div>
        </main>
      </div>
    </ion-content>

    <!-- Modal with Cropper -->
    <ion-modal :is-open="editorOpen" @didDismiss="closeEditor" class="editor-modal">
      <div class="editor-content">
        <h2 class="editor-title">Edit {{ editingSide }} Design</h2>
        <div class="cropper-container">
          <img :src="currentImage" class="cropper-image" @load="initCropper" ref="setCropperImage" />
        </div>
        <div class="editor-actions">
          <ion-button @click="rotate"><i class="fas fa-redo"></i></ion-button>
          <ion-button @click="zoomIn"><i class="fas fa-search-plus"></i></ion-button>
          <ion-button @click="zoomOut"><i class="fas fa-search-minus"></i></ion-button>
          <ion-button @click="reset"><i class="fas fa-sync-alt"></i></ion-button>
          <ion-button color="primary" @click="saveCrop">Save</ion-button>
          <ion-button color="light" @click="closeEditor">Cancel</ion-button>
        </div>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script setup>
import { ref, nextTick } from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import pageHeader from "../../../pages/Header/pageHeader.vue";

const designFrontPreview = ref(null);
const designBackPreview = ref(null);
const selectedTemplate = ref(null);

const editorOpen = ref(false);
const editingSide = ref(null);
const currentImage = ref(null);
const cropper = ref(null);
const cropperImage = ref(null);

function setCropperImage(el) {
  cropperImage.value = el;
}

const templates = [
  { name: "T-shirt", preview: "https://i.imgur.com/2T4V2hA.png", designArea: { top: '25%', left: '30%', width: '40%', height: '50%' } },
  { name: "Mug", preview: "https://i.imgur.com/J15tY1h.png", designArea: { top: '30%', left: '25%', width: '50%', height: '40%' } },
  { name: "Poster", preview: "https://i.imgur.com/NcaqA2f.png", designArea: { top: '15%', left: '15%', width: '70%', height: '70%' } },
  { name: "Phone Case", preview: "https://i.imgur.com/VCEa4G5.png", designArea: { top: '10%', left: '10%', width: '80%', height: '80%' } },
];

function onFileChange(e, side) {
  const file = e.target.files[0];
  if (file) {
    processFile(file, side);
  }
}

function onFileDrop(e, side) {
  const file = e.dataTransfer.files[0];
  if (file) {
    processFile(file, side);
  }
}

function processFile(file, side) {
  const reader = new FileReader();
  reader.onload = (event) => {
    if (side === "front") designFrontPreview.value = event.target.result;
    if (side === "back") designBackPreview.value = event.target.result;
  };
  reader.readAsDataURL(file);
}

function clearImage(side) {
  if (side === 'front') designFrontPreview.value = null;
  if (side === 'back') designBackPreview.value = null;
}

function selectTemplate(name) {
  selectedTemplate.value = name;
}

function getTemplatePreview(name) {
  return templates.find(t => t.name === name)?.preview || "";
}

function getDesignContainerStyle(name) {
    const template = templates.find(t => t.name === name);
    return template ? template.designArea : {};
}

function openEditor(side) {
  editingSide.value = side;
  currentImage.value = side === "front" ? designFrontPreview.value : designBackPreview.value;
  editorOpen.value = true;
}

function initCropper() {
  if (cropper.value) cropper.value.destroy();
  if (!cropperImage.value) return;
  cropper.value = new Cropper(cropperImage.value, {
    aspectRatio: NaN,
    viewMode: 1,
    autoCropArea: 0.9,
    responsive: true,
    background: false,
    modal: false,
    guides: false,
    center: false,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
  });
}

function rotate() { cropper.value?.rotate(90); }
function zoomIn() { cropper.value?.zoom(0.1); }
function zoomOut() { cropper.value?.zoom(-0.1); }
function reset() { cropper.value?.reset(); }

function saveCrop() {
  if (cropper.value) {
    const canvas = cropper.value.getCroppedCanvas({
        maxWidth: 1024,
        maxHeight: 1024,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });
    const result = canvas.toDataURL("image/png");
    if (editingSide.value === "front") designFrontPreview.value = result;
    if (editingSide.value === "back") designBackPreview.value = result;
    closeEditor();
  }
}

function closeEditor() {
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }
  editorOpen.value = false;
}

function downloadMockup() {
  alert("Mock-up download feature coming soon!");
}

function resetAll() {
  designFrontPreview.value = null;
  designBackPreview.value = null;
  selectedTemplate.value = null;
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  --secondary-color: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

.mockup-generator-page {
  font-family: 'Inter', sans-serif;
  background-color: var(--secondary-color);
  min-height: 100%;
  padding: 24px;
}

.mockup-workspace {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  overflow: hidden;
}

.controls-panel {
  padding: 24px;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: var(--primary-color);
}

.design-upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.upload-slot {
  display: flex;
  flex-direction: column;
}

.upload-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-align: center;
}

.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.drop-zone:hover {
  border-color: var(--primary-color);
  background-color: #f9f9ff;
}

.drop-zone.has-image {
  border-style: solid;
}

.file-input {
  display: none;
}

.drop-zone-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.placeholder i {
  font-size: 24px;
}

.placeholder span {
  font-size: 12px;
}

.edit-controls {
  display: flex;
  justify-content: space-around;
  margin-top: 8px;
}

.edit-controls ion-button {
  --padding-start: 8px;
  --padding-end: 8px;
  font-size: 12px;
}

.edit-controls i {
  margin-right: 4px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.template-card {
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.template-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.template-card.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.template-preview-img {
  width: 100%;
  height: 80px;
  object-fit: contain;
  margin-bottom: 8px;
  border-radius: 4px;
}

.template-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.preview-panel {
  padding: 24px;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}

.preview-area {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  min-height: 400px;
}

.preview-placeholder {
  text-align: center;
  color: var(--text-secondary);
}

.preview-placeholder i {
  font-size: 48px;
  margin-bottom: 16px;
}

.mockup-display {
  position: relative;
  max-width: 100%;
  max-height: 100%;
}

.mockup-bg {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.design-container {
    position: absolute;
    mix-blend-mode: multiply;
    display: flex;
    align-items: center;
    justify-content: center;
}

.design-overlay {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.preview-actions {
  margin-top: 24px;
}

.preview-actions ion-button {
  --border-radius: 8px;
}

.preview-actions i {
  margin-right: 8px;
}

/* Editor Modal */
.editor-modal {
  --width: 90vw;
  --height: 90vh;
  --max-width: 800px;
  --max-height: 700px;
  --border-radius: 16px;
}

.editor-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.cropper-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--secondary-color);
  border-radius: 8px;
  overflow: hidden;
}

.cropper-image {
  max-width: 100%;
  max-height: 100%;
}

.editor-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.editor-actions ion-button {
  --border-radius: 8px;
}
</style>
