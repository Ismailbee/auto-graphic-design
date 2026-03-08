<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleCancel" class="crop-modal">
    <ion-header>
      <ion-toolbar>
        <ion-title>Crop Image</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleCancel">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="crop-modal-content" :fullscreen="true">
      <!-- Cropper Container -->
      <div class="cropper-container">
        <div v-if="isProcessing" class="loading-overlay">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Processing image...</p>
        </div>

        <!-- Debug: Show if image source is missing -->
        <div v-if="!imageSrc" class="no-image-message">
          <p>⚠️ No image source provided</p>
          <p style="font-size: 12px; color: #666;">imageSrc: {{ imageSrc }}</p>
        </div>

        <img
          v-else
          ref="imageRef"
          :src="imageSrc"
          alt="Image to crop"
          class="crop-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
      </div>

      <!-- Controls -->
      <div class="crop-controls">
        <!-- Aspect Ratio Controls -->
        <div class="control-group">
          <label class="control-label">Aspect Ratio</label>
          <div class="aspect-ratio-buttons">
            <ion-button
              size="small"
              :fill="selectedAspectRatio === undefined ? 'solid' : 'outline'"
              @click="changeAspectRatio(undefined)"
            >
              Free
            </ion-button>
            <ion-button
              size="small"
              :fill="selectedAspectRatio === 1 ? 'solid' : 'outline'"
              @click="changeAspectRatio(1)"
            >
              1:1
            </ion-button>
            <ion-button
              size="small"
              :fill="selectedAspectRatio === 16/9 ? 'solid' : 'outline'"
              @click="changeAspectRatio(16/9)"
            >
              16:9
            </ion-button>
            <ion-button
              size="small"
              :fill="selectedAspectRatio === 4/3 ? 'solid' : 'outline'"
              @click="changeAspectRatio(4/3)"
            >
              4:3
            </ion-button>
          </div>
        </div>

        <!-- Zoom Controls -->
        <div class="control-group">
          <label class="control-label">Zoom</label>
          <div class="zoom-controls">
            <ion-button size="small" @click="handleZoomOut">
              <ion-icon :icon="removeOutline"></ion-icon>
            </ion-button>
            <ion-button size="small" @click="handleZoomIn">
              <ion-icon :icon="addOutline"></ion-icon>
            </ion-button>
          </div>
        </div>

        <!-- Rotation Controls -->
        <div class="control-group">
          <label class="control-label">Rotate</label>
          <div class="rotation-controls">
            <ion-button size="small" @click="handleRotateLeft">
              <ion-icon :icon="arrowUndoOutline"></ion-icon>
              90°
            </ion-button>
            <ion-button size="small" @click="handleRotateRight">
              <ion-icon :icon="arrowRedoOutline"></ion-icon>
              90°
            </ion-button>
          </div>
        </div>

        <!-- Reset Button -->
        <div class="control-group">
          <ion-button size="small" fill="outline" @click="handleReset">
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Reset
          </ion-button>
        </div>
      </div>

      <!-- Image Info -->
      <div v-if="imageInfo" class="image-info">
        <p><strong>Original:</strong> {{ imageInfo.originalWidth }} × {{ imageInfo.originalHeight }}px</p>
        <p><strong>File Size:</strong> {{ imageInfo.fileSize }}</p>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <div class="footer-buttons">
          <ion-button fill="outline" @click="handleCancel">
            Cancel
          </ion-button>
          <ion-button
            fill="solid"
            color="primary"
            @click="handleApplyCrop"
            :disabled="isProcessing || !isInitialized"
          >
            <ion-icon :icon="checkmarkOutline" slot="start"></ion-icon>
            Apply Crop
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import {
  closeOutline,
  checkmarkOutline,
  addOutline,
  removeOutline,
  arrowUndoOutline,
  arrowRedoOutline,
  refreshOutline
} from 'ionicons/icons'
import { useImageCropper } from '@/composables/useImageCropper'

interface Props {
  isOpen: boolean
  imageSrc: string
  imageFile?: File
}

interface Emits {
  (e: 'close'): void
  (e: 'crop', data: { dataUrl: string; blob: Blob; width: number; height: number }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const imageRef = ref<HTMLImageElement | null>(null)
const selectedAspectRatio = ref<number | undefined>(undefined)
const imageInfo = ref<{ originalWidth: number; originalHeight: number; fileSize: string } | null>(null)

// Debug logging
console.log('🎨 ImageCropModal component loaded')
console.log('🎨 Initial props:', {
  isOpen: props.isOpen,
  imageSrc: props.imageSrc,
  hasImageFile: !!props.imageFile
})

const {
  isInitialized,
  isProcessing,
  cropperError,
  initCropper,
  getCroppedImageData,
  rotate,
  zoomIn,
  zoomOut,
  reset,
  setAspectRatio,
  destroyCropper
} = useImageCropper()

// Watch for modal open/close
watch(() => props.isOpen, async (isOpen) => {
  console.log('🎨 Modal isOpen changed:', isOpen)

  if (isOpen) {
    console.log('🎨 Modal opening, imageSrc:', props.imageSrc)
    await nextTick()
    if (imageRef.value) {
      console.log('🎨 Image ref found, complete:', imageRef.value.complete)
      // Wait for image to load before initializing cropper
      if (imageRef.value.complete) {
        initializeCropper()
      }
    } else {
      console.log('🎨 Image ref not found yet')
    }
  } else {
    console.log('🎨 Modal closing, destroying cropper')
    destroyCropper()
  }
}, { immediate: true })

function handleImageLoad() {
  console.log('🎨 Image loaded, initializing cropper')
  initializeCropper()

  // Get image info
  if (imageRef.value && props.imageFile) {
    imageInfo.value = {
      originalWidth: imageRef.value.naturalWidth,
      originalHeight: imageRef.value.naturalHeight,
      fileSize: formatFileSize(props.imageFile.size)
    }
    console.log('🎨 Image info:', imageInfo.value)
  }
}

function handleImageError(event: Event) {
  console.error('❌ Image failed to load:', event)
  console.error('❌ Image src:', props.imageSrc)
  console.error('❌ Image file:', props.imageFile)
}

function initializeCropper() {
  if (!imageRef.value) return
  
  initCropper(imageRef.value, {
    aspectRatio: selectedAspectRatio.value,
    viewMode: 1,
    autoCropArea: 0.8
  })
}

function changeAspectRatio(ratio: number | undefined) {
  selectedAspectRatio.value = ratio
  setAspectRatio(ratio)
}

function handleZoomIn() {
  zoomIn(0.1)
}

function handleZoomOut() {
  zoomOut(0.1)
}

function handleRotateLeft() {
  rotate(-90)
}

function handleRotateRight() {
  rotate(90)
}

function handleReset() {
  reset()
  selectedAspectRatio.value = undefined
}

async function handleApplyCrop() {
  const croppedData = await getCroppedImageData('image/png', 0.95)
  
  if (croppedData) {
    emit('crop', {
      dataUrl: croppedData.dataUrl,
      blob: croppedData.blob,
      width: croppedData.width,
      height: croppedData.height
    })
    handleCancel()
  }
}

function handleCancel() {
  destroyCropper()
  emit('close')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<style>
/* Import Cropper.js CSS from package */
@import 'cropperjs/dist/cropper.css';
</style>

<style scoped>
/* Custom modal styles */
.crop-modal-content {
  --background: #f5f5f5;
}

.cropper-container {
  position: relative;
  width: 100%;
  height: 60vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling */
}

.crop-image {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.no-image-message {
  color: #fff;
  text-align: center;
  padding: 2rem;
}

.no-image-message p {
  margin: 0.5rem 0;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.loading-overlay p {
  margin-top: 1rem;
  font-size: 1rem;
}

.crop-controls {
  padding: 1rem;
  background: white;
}

.control-group {
  margin-bottom: 1rem;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.aspect-ratio-buttons,
.zoom-controls,
.rotation-controls {
  display: flex;
  gap: 0.5rem;
}

.image-info {
  padding: 1rem;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.image-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #666;
}

.footer-buttons {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  width: 100%;
}
</style>

