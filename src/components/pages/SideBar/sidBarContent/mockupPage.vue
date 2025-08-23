<template>
  <ion-page>
    <page-header label="Mock-ups" />
    <ion-content>
      <div class="bg-secondary min-h-screen w-full px-6 pb-24 sm:px-24 py-10">
        <div class="mx-auto max-w-5xl bg-white rounded-2xl shadow-lg p-8">
          <h1 class="text-3xl font-extrabold text-primary mb-6 text-center">Create a Mock-up</h1>
          <p class="text-gray-700 mb-8 text-center">
            Upload your front & back designs, edit (crop/rotate/scale), then apply them to a template!
          </p>

          <!-- Upload Front -->
          <div class="mb-8">
            <label class="block font-semibold mb-2 text-primary">Upload Front Design</label>
            <input type="file" accept="image/*" @change="onFileChange($event, 'front')" class="block w-full border rounded p-2" />
            <div v-if="designFrontPreview" class="mt-4 flex flex-col items-center">
              <img :src="designFrontPreview" alt="Front Preview" class="max-h-48 rounded shadow mb-3" />
              <ion-button color="contrast" fill="outline" @click="openEditor('front')">Edit Front</ion-button>
            </div>
          </div>

          <!-- Upload Back -->
          <div class="mb-8">
            <label class="block font-semibold mb-2 text-primary">Upload Back Design</label>
            <input type="file" accept="image/*" @change="onFileChange($event, 'back')" class="block w-full border rounded p-2" />
            <div v-if="designBackPreview" class="mt-4 flex flex-col items-center">
              <img :src="designBackPreview" alt="Back Preview" class="max-h-48 rounded shadow mb-3" />
              <ion-button color="contrast" fill="outline" @click="openEditor('back')">Edit Back</ion-button>
            </div>
          </div>

          <!-- Templates -->
          <div class="mb-8">
            <label class="block font-semibold mb-2 text-primary">Choose a Mock-up Template</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div
                v-for="template in templates"
                :key="template.name"
                :class="['border rounded-lg p-2 cursor-pointer flex flex-col items-center transition',
                  selectedTemplate === template.name ? 'border-primary ring-2 ring-primary' : 'hover:border-contrast']"
                @click="selectTemplate(template.name)"
              >
                <img :src="template.preview" :alt="template.name" class="h-24 mb-2 rounded" />
                <span class="text-sm font-medium">{{ template.name }}</span>
              </div>
            </div>
          </div>

          <!-- Mockup Preview -->
          <div v-if="(designFrontPreview || designBackPreview) && selectedTemplate" class="mb-8">
            <label class="block font-semibold mb-2 text-primary">Mock-up Preview</label>
            <div class="flex justify-center items-center bg-gray-100 rounded-lg p-6">
              <div class="relative w-64 h-64 flex items-center justify-center">
                <img :src="getTemplatePreview(selectedTemplate)" class="absolute w-full h-full object-cover rounded-lg" />
                <img v-if="designFrontPreview" :src="designFrontPreview" class="relative z-10 w-28 h-28 object-contain rounded shadow-lg opacity-90" style="mix-blend-mode: multiply;" />
                <img v-if="designBackPreview" :src="designBackPreview" class="relative z-10 w-28 h-28 object-contain rounded shadow-lg opacity-90" style="mix-blend-mode: multiply;" />
              </div>
            </div>
            <div class="flex justify-center gap-4 mt-4">
              <ion-button color="primary" @click="downloadMockup">Download Mock-up</ion-button>
              <ion-button color="contrast" fill="outline" @click="resetAll">Start Over</ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Modal with Cropper -->
    <ion-modal :is-open="editorOpen" @didDismiss="closeEditor">
      <div class="p-4 bg-white h-full flex flex-col">
        <h2 class="text-lg font-bold text-primary mb-4">Edit {{ editingSide }} Design</h2>
        <div class="flex-1 flex justify-center items-center">
          <!-- bind ref correctly -->
        <img :src="currentImage" class="max-h-96" @load="initCropper" ref="setCropperImage" />
      </div>
        <div class="flex justify-around mt-4 flex-wrap gap-2">
          <ion-button @click="rotate">Rotate</ion-button>
          <ion-button @click="zoomIn">Zoom In</ion-button>
          <ion-button @click="zoomOut">Zoom Out</ion-button>
          <ion-button @click="reset">Reset</ion-button>
          <ion-button color="primary" @click="saveCrop">Save</ion-button>
          <ion-button color="contrast" fill="outline" @click="closeEditor">Cancel</ion-button>
        </div>
      </div>
    </ion-modal>

    
  </ion-page>
</template>

<script setup>
import { ref, nextTick } from "vue"
import Cropper from "cropperjs"
import "cropperjs/dist/cropper.css"
import pageHeader from "../../../pages/Header/pageHeader.vue"

const designFrontPreview = ref(null)
const designBackPreview = ref(null)
const selectedTemplate = ref(null)

const editorOpen = ref(false)
const editingSide = ref(null)
const currentImage = ref(null)
const cropper = ref(null)
const cropperImage = ref(null)

function setCropperImage(el) {
  cropperImage.value = el
}

const templates = [
  { name: "T-shirt", preview: "https://mockup-assets.s3.amazonaws.com/tshirt-mockup.png" },
  { name: "Mug", preview: "https://mockup-assets.s3.amazonaws.com/mug-mockup.png" },
  { name: "Poster", preview: "https://mockup-assets.s3.amazonaws.com/poster-mockup.png" }
]

function onFileChange(e, side) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (side === "front") designFrontPreview.value = event.target.result
      if (side === "back") designBackPreview.value = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

function selectTemplate(name) {
  selectedTemplate.value = name
}
function getTemplatePreview(name) {
  return templates.find(t => t.name === name)?.preview || ""
}

function openEditor(side) {
  editingSide.value = side
  currentImage.value = side === "front" ? designFrontPreview.value : designBackPreview.value
  editorOpen.value = true

  nextTick(() => {
    if (cropper.value) cropper.value.destroy()
    cropper.value = new Cropper(cropperImage.value, {
      aspectRatio: NaN,
      viewMode: 1,
      autoCropArea: 1,
    })
  })
}

// ✅ initialize Cropper only after image loads
function initCropper() {
  if (cropper.value) cropper.value.destroy()
  cropper.value = new Cropper(cropperImage.value, {
    aspectRatio: NaN,
    viewMode: 1,
    autoCropArea: 1,
  })
}

function rotate() { cropper.value?.rotate(90) }
function zoomIn() { cropper.value?.zoom(0.1) }
function zoomOut() { cropper.value?.zoom(-0.1) }
function reset() { cropper.value?.reset() }

function saveCrop() {
  if (cropper.value) {
    const canvas = cropper.value.getCroppedCanvas()
    const result = canvas.toDataURL("image/png")
    if (editingSide.value === "front") designFrontPreview.value = result
    if (editingSide.value === "back") designBackPreview.value = result
    closeEditor()
  }
}

function closeEditor() {
  cropper.value?.destroy()
  cropper.value = null
  editorOpen.value = false
}

function downloadMockup() {
  alert("Mock-up download feature coming soon!")
}
function resetAll() {
  designFrontPreview.value = null
  designBackPreview.value = null
  selectedTemplate.value = null
}
</script>

<style scoped>
.bg-secondary { background-color: #f8f9fa; }
.text-primary { color: #502800; }
</style>
