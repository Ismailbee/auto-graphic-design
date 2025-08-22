<template>
  <ion-page>
    <page-header label="Mock-ups" />
    <ion-content>
      <div class="bg-secondary min-h-screen w-full px-6 pb-24 sm:px-24 py-10">
        <div class="mx-auto max-w-4xl bg-white rounded-2xl shadow-lg p-8">
          <h1 class="text-3xl font-extrabold text-primary mb-6 text-center">Create a Mock-up</h1>
          <p class="text-gray-700 mb-8 text-center">
            Instantly generate professional mock-ups for your designs. Upload your artwork, choose a template, and preview your design in real-world scenarios!
          </p>

          <!-- Upload Design -->
          <div class="mb-8">
            <label class="block font-semibold mb-2 text-primary">Upload Your Design</label>
            <input type="file" accept="image/*" @change="onFileChange" class="block w-full text-gray-700 border rounded p-2" />
            <div v-if="designPreview" class="mt-4 flex justify-center">
              <img :src="designPreview" alt="Design Preview" class="max-h-48 rounded shadow" />
            </div>
          </div>

          <!-- Choose Mock-up Template -->
          <div class="mb-8">
            <label class="block font-semibold mb-2 text-primary">Choose a Mock-up Template</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div
                v-for="template in templates"
                :key="template.name"
                :class="['border rounded-lg p-2 cursor-pointer flex flex-col items-center transition', selectedTemplate === template.name ? 'border-primary ring-2 ring-primary' : 'hover:border-contrast']"
                @click="selectTemplate(template.name)"
              >
                <img :src="template.preview" :alt="template.name" class="h-24 mb-2 rounded" />
                <span class="text-sm font-medium">{{ template.name }}</span>
              </div>
            </div>
          </div>

          <!-- Preview & Actions -->
          <div v-if="designPreview && selectedTemplate" class="mb-8">
            <label class="block font-semibold mb-2 text-primary">Mock-up Preview</label>
            <div class="flex justify-center items-center bg-gray-100 rounded-lg p-6">
              <!-- Simulated mock-up: overlay design on template background -->
              <div class="relative w-64 h-64 flex items-center justify-center">
                <img :src="getTemplatePreview(selectedTemplate)" class="absolute w-full h-full object-cover rounded-lg" />
                <img :src="designPreview" class="relative z-10 w-40 h-40 object-contain rounded shadow-lg opacity-90" style="mix-blend-mode: multiply;" />
              </div>
            </div>
            <div class="flex justify-center gap-4 mt-4">
              <ion-button color="primary" @click="downloadMockup">Download Mock-up</ion-button>
              <ion-button color="contrast" fill="outline" @click="resetAll">Start Over</ion-button>
            </div>
          </div>

          <!-- Help Section -->
          <div class="mt-12 bg-contrast/10 rounded-lg p-6 text-primary">
            <h2 class="text-xl font-bold mb-2">Need Help?</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>Upload a high-resolution PNG or JPG design for best results.</li>
              <li>Click on a template to preview your design in different scenarios (e.g., T-shirt, mug, poster).</li>
              <li>Download your mock-up and use it for presentations, portfolios, or marketing.</li>
              <li>If you need more templates, <a href="/contactPage" class="text-contrast underline">contact support</a>.</li>
            </ul>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import pageHeader from "../../../pages/Header/pageHeader.vue";

const designPreview = ref(null)
const selectedTemplate = ref(null)

// Example mock-up templates (replace preview URLs with your own assets)
const templates = [
  {
    name: "T-shirt",
    preview: "https://mockup-assets.s3.amazonaws.com/tshirt-mockup.png"
  },
  {
    name: "Mug",
    preview: "https://mockup-assets.s3.amazonaws.com/mug-mockup.png"
  },
  {
    name: "Poster",
    preview: "https://mockup-assets.s3.amazonaws.com/poster-mockup.png"
  }
]

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      designPreview.value = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

function selectTemplate(name) {
  selectedTemplate.value = name
}

function getTemplatePreview(name) {
  const template = templates.find(t => t.name === name)
  return template ? template.preview : ''
}

function downloadMockup() {
  // This is a placeholder for actual mock-up export logic.
  alert('Mock-up download feature coming soon!')
}

function resetAll() {
  designPreview.value = null
  selectedTemplate.value = null
}
</script>

<style scoped>
.bg-secondary {
  background-color: #f8f9fa;
}
.text-primary {
  color: #502800;
}
</style>
