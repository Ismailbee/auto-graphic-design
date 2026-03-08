<template>
  <div
    :class="[
      'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
      panelOpen ? 'w-64' : 'w-16'
    ]"
  >
    <!-- Sidebar Header -->
    <div class="p-2 border-b border-gray-200 flex items-center justify-between">
      <h2 v-if="panelOpen" class="text-base font-semibold text-gray-800">
        Design Tools
      </h2>
      <button
        @click="togglePanel"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >   
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="panelOpen ? 'M15 19l-7-7 7-7'  : 'M9 5l7 7-7 7'"
          />
        </svg>
      </button>
    </div>

    <!-- Tab Navigation - Always Visible -->
    <div class="border-b border-gray-200">
      <!-- Horizontal Scrolling Tab Navigation (Panel Open) -->
      <div v-if="panelOpen" class="relative group">
        <!-- Left scroll button -->
        <button
          v-if="showLeftShadow"
          @click="scrollLeft"
          class="absolute left-0 top-0 bottom-0 z-20 w-8 bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-r border-gray-200"
          aria-label="Scroll left"
        >
          <font-awesome-icon icon="chevron-left" class="w-4 h-4 text-gray-600" />
        </button>

        <!-- Horizontal scroll container -->
        <div
          ref="tabScrollContainer"
          class="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scroll-smooth"
          :class="{ 'pl-8': showLeftShadow, 'pr-8': showRightShadow }"
          @wheel="handleHorizontalScroll"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="handleTabClick(tab.id)"
            :class="[
              'flex-shrink-0 px-3 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap min-w-max',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
              'flex items-center space-x-1.5',
              localActiveTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            <font-awesome-icon :icon="tab.icon" class="w-3.5 h-3.5" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Right scroll button -->
        <button
          v-if="showRightShadow"
          @click="scrollRight"
          class="absolute right-0 top-0 bottom-0 z-20 w-6 bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-l border-gray-200"
          aria-label="Scroll right"
        >
          <font-awesome-icon icon="chevron-right" class="w-3 h-3 text-gray-600" />
        </button>

        <!-- Scroll indicators/shadows -->
        <div
          v-if="showLeftShadow"
          class="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"
        ></div>
        <div
          v-if="showRightShadow"
          class="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"
        ></div>
      </div>

      <!-- Collapsed Tab Icons -->
      <div v-else class="flex flex-col">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="handleTabClick(tab.id)"
          :class="[
            'collapsed-tab-button px-1 py-2 flex flex-col items-center justify-center gap-0.5 min-h-[60px] w-full',
            localActiveTab === tab.id ? 'active' : ''
          ]"
          :title="tab.label"
        >
          <font-awesome-icon :icon="getTabIcon(tab.id)" class="w-4 h-4 mb-0.5" />
          <span class="collapsed-tab-label text-center px-0.5">{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div v-if="panelOpen" class="flex-1 overflow-y-auto custom-scrollbar">
      <!-- Templates Tab -->
      <div v-if="localActiveTab === 'templates'" class="p-3">
        <!-- SVG Background Section -->
        <div class="mb-4">
          <h3 class="text-xs font-medium text-gray-700 mb-2">SVG Backgrounds</h3>
          <button
            @click="$emit('load-svg-background')"
            class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium text-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Load SVG Background
          </button>
          <p class="text-xs text-gray-500 mt-2 text-center">
            Load your exported SVG as an editable background
          </p>
        </div>

        <h3 class="text-xs font-medium text-gray-700 mb-2">Sample Images</h3>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="asset in assets"
            :key="asset.id"
            @click="$emit('add-image', asset)"
            class="cursor-pointer group"
          >
            <div class="aspect-square rounded-lg overflow-hidden bg-gray-100 group-hover:ring-2 group-hover:ring-primary-500 transition-all">
              <img
                :src="asset.thumbnail"
                :alt="asset.name"
                class="w-full h-full object-cover"
              />
            </div>
            <p class="text-xs text-gray-600 mt-1 truncate">{{ asset.name }}</p>
          </div>
        </div>
      </div>

      <!-- Uploads Tab -->
      <div v-if="localActiveTab === 'uploads'" class="p-4">
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-gray-600 mb-2">Upload your images</p>
          <p class="text-xs text-gray-500">Drag & drop or click to browse</p>
          <input
            type="file"
            accept="image/*"
            multiple
            @change="handleFileUpload"
            class="hidden"
            ref="fileInput"
          />
          <button
            @click="triggerFileInput"
            class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Choose Files
          </button>
        </div>
      </div>

      <!-- Elements Tab -->
      <div v-if="localActiveTab === 'elements'" class="p-4">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Shapes</h3>
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button
            v-for="shape in shapes"
            :key="shape.type"
            @click="$emit('add-shape', shape.type)"
            class="aspect-square border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center group"
          >
            <div :class="shape.class" class="group-hover:scale-110 transition-transform"></div>
          </button>
        </div>

        <h3 class="text-sm font-medium text-gray-700 mb-3">Colors</h3>
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="color in colorPalette.colors"
            :key="color"
            @click="selectColor(color)"
            :style="{ backgroundColor: color }"
            class="aspect-square rounded-lg border-2 border-gray-200 hover:scale-110 transition-transform"
            :title="color"
          ></button>
        </div>
      </div>

      <!-- Text Tab -->
      <div v-if="localActiveTab === 'text'" class="p-4">
        <button
          @click="$emit('add-text')"
          class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center group"
        >
          <svg class="w-8 h-8 text-gray-400 group-hover:text-primary-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p class="text-gray-600 group-hover:text-primary-600">Add Text</p>
        </button>

        <div class="mt-6">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Font Styles</h3>
          <div class="space-y-2">
            <button
              v-for="style in textStyles"
              :key="style.name"
              @click="addStyledText(style)"
              class="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <div :style="style.style" class="truncate">{{ style.name }}</div>
            </button>
          </div>
        </div>
      </div>

      <!-- Background Remover Tab -->
      <div v-if="localActiveTab === 'background'" class="p-4">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Background Remover</h3>

        <!-- API Selection -->
        <div class="mb-4">
          <label class="block text-xs text-gray-600 mb-2">Choose API</label>
          <select
            v-model="backgroundApiType"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="rembg">Free API (RemBG - Open Source)</option>
            <option value="removebg">Paid API (Remove.bg)</option>
          </select>
        </div>

        <!-- Upload Area -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 hover:border-primary-300 transition-colors">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm text-gray-600 mb-2">Upload image to remove background</p>
          <input
            type="file"
            accept="image/*"
            @change="handleBackgroundRemoval"
            class="hidden"
            ref="backgroundFileInput"
          />
          <button
            @click="triggerBackgroundFileInput"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Choose Image
          </button>
        </div>

        <!-- Processing Status -->
        <div v-if="backgroundProcessing" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p class="text-sm text-gray-600">Removing background...</p>
        </div>
      </div>

      <!-- Image Filters Tab -->
      <div v-if="localActiveTab === 'filters'" class="p-4">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Image Filters</h3>

        <div class="space-y-4">
          <!-- Grayscale -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">Grayscale</label>
            <input
              type="range"
              v-model="filters.grayscale"
              min="0"
              max="100"
              class="w-full"
              @input="applyFilters"
            />
            <div class="text-xs text-gray-500 text-center">{{ filters.grayscale }}%</div>
          </div>

          <!-- Sepia -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">Sepia</label>
            <input
              type="range"
              v-model="filters.sepia"
              min="0"
              max="100"
              class="w-full"
              @input="applyFilters"
            />
            <div class="text-xs text-gray-500 text-center">{{ filters.sepia }}%</div>
          </div>

          <!-- Brightness -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">Brightness</label>
            <input
              type="range"
              v-model="filters.brightness"
              min="0"
              max="200"
              class="w-full"
              @input="applyFilters"
            />
            <div class="text-xs text-gray-500 text-center">{{ filters.brightness }}%</div>
          </div>

          <!-- Contrast -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">Contrast</label>
            <input
              type="range"
              v-model="filters.contrast"
              min="0"
              max="200"
              class="w-full"
              @input="applyFilters"
            />
            <div class="text-xs text-gray-500 text-center">{{ filters.contrast }}%</div>
          </div>

          <!-- Reset Button -->
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Crop Tool Tab -->
      <div v-if="localActiveTab === 'crop'" class="p-4">
        <h3 class="text-sm font-medium text-gray-700 mb-3">Image Cropper</h3>

        <div class="space-y-4">
          <!-- Crop Tool Description -->
          <div class="text-center py-8">
            <div class="mb-4">
              <font-awesome-icon icon="crop" class="w-12 h-12 text-gray-400 mx-auto" />
            </div>
            <h4 class="text-lg font-semibold text-gray-700 mb-2">Professional Image Cropper</h4>
            <p class="text-sm text-gray-500 mb-6">
              Upload and crop images with professional tools including aspect ratios, zoom, rotate, and flip controls.
            </p>

            <!-- Open Cropper Button -->
            <button
              @click="openCropperModal"
              class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <font-awesome-icon icon="crop" class="mr-2" />
              Open Image Cropper
            </button>
          </div>

          <!-- Features List -->
          <div class="border-t pt-4">
            <h5 class="text-xs font-medium text-gray-600 mb-3 uppercase tracking-wide">Features</h5>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-center">
                <font-awesome-icon icon="check" class="w-3 h-3 text-green-500 mr-2" />
                Multiple aspect ratios
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="check" class="w-3 h-3 text-green-500 mr-2" />
                Zoom and rotate controls
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="check" class="w-3 h-3 text-green-500 mr-2" />
                Real-time preview
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="check" class="w-3 h-3 text-green-500 mr-2" />
                Full-screen editing
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- QR Code Generator Tab -->
      <div v-if="localActiveTab === 'qrcode'" class="p-4">
        <h3 class="text-sm font-medium text-gray-700 mb-3">QR Code Generator</h3>

        <div class="space-y-4">
          <!-- Input Field -->
          <div>
            <label class="block text-xs text-gray-600 mb-2">Enter URL or text</label>
            <textarea
              v-model="qrCodeText"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="https://example.com or any text..."
            ></textarea>
          </div>

          <!-- Generate Button -->
          <button
            @click="generateQRCode"
            :disabled="!qrCodeText.trim() || qrCodeGenerating"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="qrCodeGenerating">Generating...</span>
            <span v-else>Generate QR Code</span>
          </button>

          <!-- Generated QR Code -->
          <div v-if="generatedQRCode" class="text-center">
            <div class="border border-gray-200 rounded-lg p-4 bg-white">
              <img
                :src="generatedQRCode"
                alt="Generated QR Code"
                class="mx-auto mb-3"
                style="width: 150px; height: 150px;"
              />
              <button
                @click="addQRCodeToCanvas"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add to Canvas
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>

  <!-- Image Cropper Modal -->
  <ImageCropperModal
    :show="showCropperModal"
    :aspect-ratio="undefined"
    :initial-zoom="1"
    :show-preview="true"
    output-format="blob"
    @close="closeCropperModal"
    @cropped="handleModalCroppedImage"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { AssetItem, ColorPalette } from '@/types'
import ImageCropperModal from '@/components/modals/ImageCropperModal.vue'

// Props
const props = defineProps<{
  collapsed?: boolean
  activeTab?: string
  assets: AssetItem[]
  colorPalette: ColorPalette
}>()

// Emits
const emit = defineEmits<{
  'toggle-sidebar': []
  'change-tab': [tab: string]
  'update:activeTab': [tab: string]
  'add-image': [asset: AssetItem]
  'add-text': []
  'add-shape': [shapeType: string]
  'select-color': [color: string]
  'add-styled-text': [style: any]
  'apply-filters': [filters: any]
  'apply-crop': [dimensions: any]
  'add-cropped-image': [imageData: Blob | string]
}>()

// Refs
const fileInput = ref<HTMLInputElement>()
const backgroundFileInput = ref<HTMLInputElement>()
const tabScrollContainer = ref<HTMLElement>()

// Local state management
const localPanelOpen = ref(true)
const localActiveTab = ref(props.activeTab || 'templates')

// Computed for panel state - use prop if provided, otherwise local
const panelOpen = computed({
  get: () => props.collapsed !== undefined ? !props.collapsed : localPanelOpen.value,
  set: (value) => {
    if (props.collapsed === undefined) {
      localPanelOpen.value = value
    }
  }
})

// Watch for prop changes and sync local state
watch(() => props.activeTab, (newTab) => {
  if (newTab && newTab !== localActiveTab.value) {
    localActiveTab.value = newTab
  }
})

// Horizontal scrolling state
const showLeftShadow = ref(false)
const showRightShadow = ref(false)
const touchStartX = ref(0)
const touchStartScrollLeft = ref(0)

// Background Remover State
const backgroundApiType = ref<'rembg' | 'removebg'>('rembg')
const backgroundProcessing = ref(false)

// Image Cropper Modal State
const showCropperModal = ref(false)

// Image Filters State
const filters = ref({
  grayscale: 0,
  sepia: 0,
  brightness: 100,
  contrast: 100
})

// Crop Tool State
const cropDimensions = ref({
  width: 400,
  height: 300
})
const selectedRatio = ref<any>(null)

// QR Code State
const qrCodeText = ref('')
const qrCodeGenerating = ref(false)
const generatedQRCode = ref('')

// Data
const tabs = [
  { id: 'templates', label: 'Templates', icon: 'images' },
  { id: 'uploads', label: 'My media', icon: 'cloud-arrow-up' },
  { id: 'elements', label: 'Elements', icon: 'shapes' },
  { id: 'text', label: 'Text', icon: 'font' },
  { id: 'background', label: 'Background', icon: 'wand-magic-sparkles' },
  { id: 'filters', label: 'Filters', icon: 'palette' },
  { id: 'crop', label: 'Crop', icon: 'crop' },
  { id: 'qrcode', label: 'QR Code', icon: 'qrcode' }
]

const aspectRatios = [
  { name: 'Free', ratio: null },
  { name: '1:1', ratio: 1 },
  { name: '4:3', ratio: 4/3 },
  { name: '16:9', ratio: 16/9 },
  { name: '3:2', ratio: 3/2 },
  { name: '2:3', ratio: 2/3 }
]

// Computed Properties
const canCrop = computed(() => {
  return cropDimensions.value.width > 0 && cropDimensions.value.height > 0
})

// Icon mapping function
function getTabIcon(tabId: string): string {
  const iconMap: Record<string, string> = {
    'templates': 'images',
    'uploads': 'cloud-arrow-up',
    'elements': 'shapes',
    'text': 'font',
    'background': 'wand-magic-sparkles',
    'filters': 'palette',
    'crop': 'crop',
    'qrcode': 'qrcode'
  }
  return iconMap[tabId] || 'question'
}

const shapes = [
  { type: 'rectangle', class: 'w-8 h-6 bg-gray-400 rounded' },
  { type: 'circle', class: 'w-8 h-8 bg-gray-400 rounded-full' },
  { type: 'triangle', class: 'w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-gray-400' },
  { type: 'star', class: 'w-8 h-8 bg-gray-400' }
]

const textStyles = [
  { name: 'Heading 1', style: { fontSize: '24px', fontWeight: 'bold' } },
  { name: 'Heading 2', style: { fontSize: '20px', fontWeight: 'bold' } },
  { name: 'Body Text', style: { fontSize: '16px' } },
  { name: 'Caption', style: { fontSize: '14px', color: '#666' } }
]

// Methods
function togglePanel() {
  // Always emit the toggle event for parent to handle
  emit('toggle-sidebar')

  // Also update local state if no parent control
  if (props.collapsed === undefined) {
    localPanelOpen.value = !localPanelOpen.value
  }
}

function handleTabClick(tabId: string) {
  localActiveTab.value = tabId

  // If panel is closed, open it
  if (!panelOpen.value) {
    if (props.collapsed === undefined) {
      // Local control mode - update local state
      localPanelOpen.value = true
    } else {
      // Parent control mode - emit toggle event
      emit('toggle-sidebar')
    }
  }

  emit('change-tab', tabId)
  emit('update:activeTab', tabId)
}

// File input helper functions
function triggerFileInput() {
  fileInput.value?.click()
}

function triggerBackgroundFileInput() {
  backgroundFileInput.value?.click()
}

// Horizontal scrolling methods
function updateScrollShadows() {
  if (!tabScrollContainer.value) return

  const container = tabScrollContainer.value
  const scrollLeft = container.scrollLeft
  const maxScrollLeft = container.scrollWidth - container.clientWidth

  showLeftShadow.value = scrollLeft > 0
  showRightShadow.value = scrollLeft < maxScrollLeft
}

function handleHorizontalScroll(event: WheelEvent) {
  if (!tabScrollContainer.value) return

  // Prevent vertical scrolling and enable horizontal scrolling with mouse wheel
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    event.preventDefault()
    tabScrollContainer.value.scrollLeft += event.deltaY
    updateScrollShadows()
  }
}

function handleTouchStart(event: TouchEvent) {
  if (!tabScrollContainer.value) return

  touchStartX.value = event.touches[0].clientX
  touchStartScrollLeft.value = tabScrollContainer.value.scrollLeft
}

function handleTouchMove(event: TouchEvent) {
  if (!tabScrollContainer.value) return

  const touchX = event.touches[0].clientX
  const deltaX = touchStartX.value - touchX
  tabScrollContainer.value.scrollLeft = touchStartScrollLeft.value + deltaX
  updateScrollShadows()
}

function handleTouchEnd() {
  updateScrollShadows()
}

// Scroll button methods
function scrollLeft() {
  if (!tabScrollContainer.value) return

  const scrollAmount = 120 // Scroll by 120px
  tabScrollContainer.value.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth'
  })
}

function scrollRight() {
  if (!tabScrollContainer.value) return

  const scrollAmount = 120 // Scroll by 120px
  tabScrollContainer.value.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  })
}

function handleFileUpload(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const asset: AssetItem = {
          id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          type: 'image',
          name: file.name,
          thumbnail: e.target?.result as string,
          url: e.target?.result as string
        }
        emit('add-image', asset)
      }
      reader.readAsDataURL(file)
    })
  }
}

function selectColor(color: string) {
  // Emit color selection event
  emit('select-color', color)
  console.log('Selected color:', color)
}

function addStyledText(style: any) {
  // Emit styled text event
  emit('add-styled-text', style)
  console.log('Add styled text:', style)
}

// Background Remover Methods
async function handleBackgroundRemoval(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  backgroundProcessing.value = true

  try {
    let processedImageUrl: string

    if (backgroundApiType.value === 'rembg') {
      // Use RemBG (Free API simulation)
      processedImageUrl = await processWithRemBG(file)
    } else {
      // Use Remove.bg (Paid API simulation)
      processedImageUrl = await processWithRemoveBG(file)
    }

    // Add processed image to canvas
    emit('add-image', {
      id: Date.now().toString(),
      name: `${file.name}_no_bg`,
      url: processedImageUrl,
      thumbnail: processedImageUrl,
      type: 'image'
    })
  } catch (error) {
    console.error('Background removal failed:', error)
    alert('Background removal failed. Please try again.')
  } finally {
    backgroundProcessing.value = false
  }
}

async function processWithRemBG(file: File): Promise<string> {
  // Simulate RemBG API processing
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      // In a real implementation, you would send this to RemBG API
      // For now, we'll just return the original image
      setTimeout(() => {
        resolve(e.target?.result as string)
      }, 2000) // Simulate processing time
    }
    reader.readAsDataURL(file)
  })
}

async function processWithRemoveBG(file: File): Promise<string> {
  // Simulate Remove.bg API processing
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      // In a real implementation, you would send this to Remove.bg API
      // For now, we'll just return the original image
      setTimeout(() => {
        resolve(e.target?.result as string)
      }, 3000) // Simulate processing time
    }
    reader.readAsDataURL(file)
  })
}

// Image Filters Methods
function applyFilters() {
  // This would apply filters to selected image objects
  console.log('Applying filters:', filters.value)
  // In a real implementation, you would emit an event to apply filters to selected objects
  emit('apply-filters', filters.value)
}

function resetFilters() {
  filters.value = {
    grayscale: 0,
    sepia: 0,
    brightness: 100,
    contrast: 100
  }
  applyFilters()
}

// Crop Tool Methods
function setCropRatio(ratio: any) {
  selectedRatio.value = ratio
  if (ratio.ratio) {
    // Calculate dimensions based on ratio
    const baseWidth = 400
    cropDimensions.value = {
      width: baseWidth,
      height: Math.round(baseWidth / ratio.ratio)
    }
  }
}

function applyCrop() {
  if (!canCrop.value) return

  console.log('Applying crop:', cropDimensions.value)
  // In a real implementation, you would emit an event to crop selected objects
  emit('apply-crop', cropDimensions.value)
}

// Handle cropped image from ImageCropper component
function handleCroppedImage(imageData: Blob | string) {
  console.log('Received cropped image:', imageData)

  // Emit the cropped image to the parent component (DesignEditor)
  emit('add-cropped-image', imageData)

  // Optionally, you could also create an AssetItem and emit it as add-image
  if (imageData instanceof Blob) {
    const url = URL.createObjectURL(imageData)
    const assetItem: AssetItem = {
      id: `cropped-${Date.now()}`,
      name: `Cropped Image ${Date.now()}`,
      url: url,
      thumbnail: url,
      type: 'image'
    }
    emit('add-image', assetItem)
  }
}

// Image Cropper Modal Methods
function openCropperModal() {
  showCropperModal.value = true
}

function closeCropperModal() {
  showCropperModal.value = false
}

function handleModalCroppedImage(imageData: Blob | string) {
  // Handle the cropped image the same way as before
  handleCroppedImage(imageData)
  // Modal will auto-close after cropping
}

// QR Code Methods
async function generateQRCode() {
  if (!qrCodeText.value.trim()) return

  qrCodeGenerating.value = true

  try {
    // Use a free QR code API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText.value)}`
    generatedQRCode.value = qrApiUrl
  } catch (error) {
    console.error('QR Code generation failed:', error)
    alert('QR Code generation failed. Please try again.')
  } finally {
    qrCodeGenerating.value = false
  }
}

function addQRCodeToCanvas() {
  if (!generatedQRCode.value) return

  emit('add-image', {
    id: Date.now().toString(),
    name: 'QR Code',
    url: generatedQRCode.value,
    thumbnail: generatedQRCode.value,
    type: 'image'
  })

  // Reset QR code state
  qrCodeText.value = ''
  generatedQRCode.value = ''
}

// Lifecycle hooks for horizontal scrolling
onMounted(() => {
  nextTick(() => {
    if (tabScrollContainer.value) {
      // Add scroll event listener
      tabScrollContainer.value.addEventListener('scroll', updateScrollShadows)
      // Initialize shadow indicators
      updateScrollShadows()
    }
  })
})

onUnmounted(() => {
  if (tabScrollContainer.value) {
    tabScrollContainer.value.removeEventListener('scroll', updateScrollShadows)
  }
})

// Watch for panel state changes to update shadows
watch(panelOpen, () => {
  nextTick(() => {
    updateScrollShadows()
  })
})
</script>

<style scoped>
/* Custom scrollbar styling for horizontal tab navigation */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  display: none;
  height: 0px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  display: none;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  display: none;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  display: none;
}

/* Ensure hidden scrollbar for all screen sizes */
.scrollbar-thin {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* Smooth scrolling behavior */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Crop tab container */
.crop-tab-container {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}

/* Enhanced collapsed tab styling */
.collapsed-tab-button {
  transition: all 0.2s ease;
  border-radius: 0;
  position: relative;
}

.collapsed-tab-button:hover {
  background-color: #f3f4f6;
  transform: translateX(2px);
}

.collapsed-tab-button.active {
  background-color: #eff6ff;
  color: #2563eb;
  border-right: 3px solid #2563eb;
}

.collapsed-tab-button.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background-color: #2563eb;
  border-radius: 0 2px 2px 0;
}

.collapsed-tab-label {
  font-size: 9px;
  line-height: 1.1;
  font-weight: 500;
  letter-spacing: 0.02em;
  word-break: break-word;
  hyphens: auto;
}
</style>
