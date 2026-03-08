<template>
  <section class="generator-section">
    <h2 class="section-title">Create Your Own Mockup</h2>
    <p class="section-subtitle">Upload your design and preview it on different templates</p>

    <div class="mockup-generator">
      <!-- Left: Controls -->
      <div class="controls-panel">
        <div class="controls-section">
          <h3 class="controls-title">Your Designs</h3>
          <div class="design-upload-grid">
            <!-- Front -->
            <div class="upload-slot">
              <label class="upload-label">Front Design</label>
              <div
                class="drop-zone"
                :class="{ 'has-image': !!designFrontPreview }"
                @dragover.prevent
                @dragenter.prevent
                @drop.prevent="onFileDrop($event, 'front')"
              >
                <input
                  id="front-upload"
                  class="file-input"
                  type="file"
                  accept="image/*"
                  @change="onFileChange($event, 'front')"
                />
                <label class="drop-zone-content" for="front-upload">
                  <img v-if="designFrontPreview" :src="designFrontPreview" alt="Front Preview" class="preview-image" />
                  <div v-else class="placeholder">
                    <span>Drop image or click</span>
                  </div>
                </label>
              </div>
              <div v-if="designFrontPreview" class="edit-controls">
                <button type="button" class="btn-link" title="Edit" @click="openEditor('front')">Edit</button>
                <button type="button" class="btn-link danger" title="Remove" @click="clearImage('front')">Remove</button>
              </div>
            </div>

            <!-- Back -->
            <div class="upload-slot">
              <label class="upload-label">Back Design</label>
              <div
                class="drop-zone"
                :class="{ 'has-image': !!designBackPreview }"
                @dragover.prevent
                @dragenter.prevent
                @drop.prevent="onFileDrop($event, 'back')"
              >
                <input
                  id="back-upload"
                  class="file-input"
                  type="file"
                  accept="image/*"
                  @change="onFileChange($event, 'back')"
                />
                <label class="drop-zone-content" for="back-upload">
                  <img v-if="designBackPreview" :src="designBackPreview" alt="Back Preview" class="preview-image" />
                  <div v-else class="placeholder">
                    <span>Drop image or click</span>
                  </div>
                </label>
              </div>
              <div v-if="designBackPreview" class="edit-controls">
                <button type="button" class="btn-link" title="Edit" @click="openEditor('back')">Edit</button>
                <button type="button" class="btn-link danger" title="Remove" @click="clearImage('back')">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <div class="controls-section">
          <h3 class="controls-title">Mockup Templates</h3>
          <div class="template-grid">
            <button
              v-for="template in templates"
              :key="template.name"
              type="button"
              :class="['template-card', { selected: selectedTemplate === template.name }]"
              @click="selectTemplate(template.name)"
            >
              <img :src="template.preview" :alt="template.name" class="template-preview-img" />
              <span class="template-name">{{ template.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="preview-panel">
        <div class="preview-area">
          <div v-if="!selectedTemplate" class="preview-placeholder">
            <p>Select a template to see your mockup</p>
          </div>
          <div v-else class="mockup-display">
            <img :src="getTemplatePreview(selectedTemplate)" class="mockup-bg" alt="Template background" />
            <div class="design-container" :style="getDesignContainerStyle(selectedTemplate)">
              <img v-if="designFrontPreview" :src="designFrontPreview" class="design-overlay" alt="Front design overlay" />
            </div>
          </div>
        </div>
        <div class="preview-actions">
          <button type="button" class="primary" :disabled="!selectedTemplate || !designFrontPreview" @click="downloadMockup">Download Mockup</button>
          <button type="button" class="outline" @click="resetAll">Start Over</button>
        </div>
      </div>
    </div>

    <!-- Editor Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="editorOpen" class="modal-overlay" @click="closeEditor">
          <Transition name="modal-scale">
            <div v-if="editorOpen" class="modal-container" @click.stop>
              <button class="close-button" aria-label="Close editor" @click="closeEditor">×</button>
              <div class="editor-content">
                <h3 class="editor-title">Edit {{ editingSide }} Design</h3>
                <div class="cropper-wrap">
                  <img ref="setCropperImage" :src="currentImage || ''" class="cropper-image" @load="initCropper" />
                </div>
                <div class="editor-actions">
                  <button type="button" @click="rotate">Rotate</button>
                  <button type="button" @click="zoomIn">Zoom In</button>
                  <button type="button" @click="zoomOut">Zoom Out</button>
                  <button type="button" @click="reset">Reset</button>
                  <button type="button" class="primary" @click="saveCrop">Save</button>
                  <button type="button" class="outline" @click="closeEditor">Cancel</button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

type Side = 'front' | 'back'

const designFrontPreview = ref<string | null>(null)
const designBackPreview = ref<string | null>(null)
const selectedTemplate = ref<string | null>(null)

const editorOpen = ref(false)
const editingSide = ref<Side | null>(null)
const currentImage = ref<string | null>(null)
const cropper = ref<Cropper | null>(null)
const cropperImage = ref<HTMLImageElement | null>(null)

function setCropperImage(el: HTMLImageElement | null) {
  cropperImage.value = el
}

const templates = [
  { name: 'T-shirt', preview: 'https://i.imgur.com/2T4V2hA.png', designArea: { top: '25%', left: '30%', width: '40%', height: '50%' } },
  { name: 'Mug', preview: 'https://i.imgur.com/J15tY1h.png', designArea: { top: '30%', left: '25%', width: '50%', height: '40%' } },
  { name: 'Poster', preview: 'https://i.imgur.com/NcaqA2f.png', designArea: { top: '15%', left: '15%', width: '70%', height: '70%' } },
  { name: 'Phone Case', preview: 'https://i.imgur.com/VCEa4G5.png', designArea: { top: '10%', left: '10%', width: '80%', height: '80%' } },
]

function onFileChange(e: Event, side: Side) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) processFile(file, side)
}

function onFileDrop(e: DragEvent, side: Side) {
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file, side)
}

function processFile(file: File, side: Side) {
  const reader = new FileReader()
  reader.onload = (event) => {
    const result = (event.target as FileReader).result as string
    if (side === 'front') designFrontPreview.value = result
    if (side === 'back') designBackPreview.value = result
  }
  reader.readAsDataURL(file)
}

function clearImage(side: Side) {
  if (side === 'front') designFrontPreview.value = null
  if (side === 'back') designBackPreview.value = null
}

function selectTemplate(name: string) {
  selectedTemplate.value = name
}

function getTemplatePreview(name: string | null): string {
  if (!name) return ''
  return templates.find(t => t.name === name)?.preview || ''
}

function getDesignContainerStyle(name: string | null): Record<string, string> {
  if (!name) return {}
  const template = templates.find(t => t.name === name)
  return template ? template.designArea : {}
}

function openEditor(side: Side) {
  editingSide.value = side
  currentImage.value = side === 'front' ? designFrontPreview.value : designBackPreview.value
  editorOpen.value = true
}

function initCropper() {
  if (cropper.value) cropper.value.destroy()
  if (!cropperImage.value) return
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
  })
}

function rotate() { cropper.value?.rotate(90) }
function zoomIn() { cropper.value?.zoom(0.1) }
function zoomOut() { cropper.value?.zoom(-0.1) }
function reset() { cropper.value?.reset() }

function saveCrop() {
  if (!cropper.value) return
  const canvas = cropper.value.getCroppedCanvas({
    maxWidth: 1024,
    maxHeight: 1024,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  })
  const result = canvas.toDataURL('image/png')
  if (editingSide.value === 'front') designFrontPreview.value = result
  if (editingSide.value === 'back') designBackPreview.value = result
  closeEditor()
}

function closeEditor() {
  if (cropper.value) {
    cropper.value.destroy()
    cropper.value = null
  }
  editorOpen.value = false
}

function downloadMockup() {
  // Lightweight placeholder; can be replaced with compositing logic.
  alert('Mockup download feature coming soon!')
}

function resetAll() {
  designFrontPreview.value = null
  designBackPreview.value = null
  selectedTemplate.value = null
}
</script>

<style scoped>
.generator-section {
  margin: 64px 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  text-align: center;
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 24px 0;
}

.mockup-generator {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.controls-panel { padding: 24px; border-right: 1px solid var(--border-primary); }
.controls-section { margin-bottom: 24px; }
.controls-title { font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }

.design-upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.upload-slot { display: flex; flex-direction: column; }
.upload-label { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 8px; text-align: center; }

.drop-zone { border: 2px dashed var(--border-primary); border-radius: 8px; aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; overflow: hidden; transition: all .2s ease; }
.drop-zone:hover { border-color: var(--color-primary); background: var(--bg-tertiary); }
.drop-zone.has-image { border-style: solid; }
.file-input { display: none; }
.drop-zone-content { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.preview-image { width: 100%; height: 100%; object-fit: cover; }
.placeholder { color: var(--text-secondary); font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; }

.edit-controls { display: flex; justify-content: space-around; margin-top: 8px; }
.btn-link { background: transparent; border: none; color: var(--color-primary); cursor: pointer; font-weight: 600; }
.btn-link.danger { color: var(--color-error); }

.controls-title + .template-grid { margin-top: 8px; }
.template-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.template-card { border: 2px solid var(--border-primary); border-radius: 8px; padding: 8px; cursor: pointer; background: white; transition: all .2s ease; text-align: center; }
.template-card:hover { border-color: var(--color-primary); transform: translateY(-2px); }
.template-card.selected { border-color: var(--color-primary); box-shadow: 0 0 0 2px var(--color-primary-light); }
.template-preview-img { width: 100%; height: 80px; object-fit: contain; margin-bottom: 8px; }
.template-name { font-size: 12px; font-weight: 500; color: var(--text-primary); }

.preview-panel { padding: 24px; display: flex; flex-direction: column; background: var(--bg-secondary); }
.preview-area { flex: 1; display: flex; align-items: center; justify-content: center; background: white; border-radius: 8px; border: 1px solid var(--border-primary); min-height: 400px; }
.preview-placeholder { color: var(--text-secondary); text-align: center; }
.mockup-display { position: relative; max-width: 100%; max-height: 100%; }
.mockup-bg { max-width: 100%; max-height: 500px; object-fit: contain; }
.design-container { position: absolute; display: flex; align-items: center; justify-content: center; mix-blend-mode: multiply; }
.design-overlay { width: 100%; height: 100%; object-fit: contain; }

.preview-actions { margin-top: 16px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.preview-actions .primary { background: var(--color-primary); color: white; border: none; padding: 12px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.preview-actions .primary:hover { background: var(--color-primary-hover); }
.preview-actions .outline { background: white; color: var(--color-primary); border: 2px solid var(--color-primary); padding: 12px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.preview-actions .outline:hover { background: var(--color-primary-light); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
.modal-container { background: white; border-radius: 16px; width: min(900px, 96vw); max-height: 90vh; overflow: hidden; position: relative; box-shadow: var(--shadow-xl); }
.close-button { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(0,0,0,.05); cursor: pointer; }
.close-button:hover { background: rgba(0,0,0,.1); }
.editor-content { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.editor-title { margin: 0; font-weight: 600; color: var(--text-primary); text-align: center; }
.cropper-wrap { min-height: 300px; max-height: 60vh; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); border-radius: 8px; overflow: hidden; }
.cropper-image { max-width: 100%; max-height: 100%; }
.editor-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.editor-actions button { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-primary); background: white; cursor: pointer; }
.editor-actions .primary { border: none; background: var(--color-primary); color: white; }
.editor-actions .outline { background: white; color: var(--text-primary); }

/* Animations */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-scale-enter-active { transition: transform .25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity .25s ease; }
.modal-scale-leave-active { transition: transform .2s ease, opacity .2s ease; }
.modal-scale-enter-from { transform: scale(.95); opacity: 0; }
.modal-scale-leave-to { transform: scale(.98); opacity: 0; }

@media (max-width: 900px) {
  .mockup-generator { grid-template-columns: 1fr; }
  .controls-panel { border-right: none; border-bottom: 1px solid var(--border-primary); }
}
</style>
