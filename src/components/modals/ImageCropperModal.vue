<template>
  <Modal
    :show="show"
    :show-close-button="true"
    :close-on-overlay-click="false"
    :close-on-escape="true"
    container-class="image-cropper-modal-container"
    @close="handleClose"
  >
    <div class="cropper-modal-content">
      <!-- Modal Header -->
      <div class="cropper-modal-header">
        <h2 class="cropper-modal-title">
          <font-awesome-icon icon="crop" class="title-icon" />
          Image Cropper
        </h2>
        <p class="cropper-modal-subtitle">
          Upload and crop your image with professional tools
        </p>
      </div>

      <!-- ImageCropper Component -->
      <div class="cropper-modal-body">
        <ImageCropper
          :aspect-ratio="aspectRatio"
          :initial-zoom="initialZoom"
          :show-preview="showPreview"
          :output-format="outputFormat"
          @cropped="handleCropped"
        />
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'
import ImageCropper from './ImageCropper.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  aspectRatio: {
    type: Number,
    default: NaN
  },
  initialZoom: {
    type: Number,
    default: 1
  },
  showPreview: {
    type: Boolean,
    default: true
  },
  outputFormat: {
    type: String,
    default: 'blob',
    validator: (value) => ['blob', 'base64'].includes(value)
  }
})

// Emits
const emit = defineEmits(['close', 'cropped'])

// Methods
const handleClose = () => {
  emit('close')
}

const handleCropped = (imageData) => {
  emit('cropped', imageData)
  // Auto-close modal after successful crop
  emit('close')
}
</script>

<style scoped>
.image-cropper-modal-container {
  max-width: 90vw;
  max-height: 85vh;
  width: 1000px;
  height: 650px;
}

.cropper-modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.cropper-modal-header {
  padding: 16px 24px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cropper-modal-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: white;
}

.title-icon {
  font-size: 22px;
}

.cropper-modal-subtitle {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

.cropper-modal-body {
  flex: 1;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling */
  display: flex;
  flex-direction: column;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .image-cropper-modal-container {
    width: 85vw;
    height: 80vh;
  }

  .cropper-modal-header {
    padding: 16px 20px 10px;
  }

  .cropper-modal-title {
    font-size: 18px;
  }

  .title-icon {
    font-size: 20px;
  }
}

@media (max-width: 768px) {
  .image-cropper-modal-container {
    width: 95vw;
    height: 90vh;
  }
  
  .cropper-modal-header {
    padding: 16px 20px 10px;
  }
  
  .cropper-modal-title {
    font-size: 18px;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 20px;
  }
  
  .cropper-modal-subtitle {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .image-cropper-modal-container {
    width: 98vw;
    height: 95vh;
  }
  
  .cropper-modal-header {
    padding: 12px 16px 8px;
  }
  
  .cropper-modal-title {
    font-size: 16px;
    gap: 6px;
  }
  
  .title-icon {
    font-size: 18px;
  }
  
  .cropper-modal-subtitle {
    font-size: 12px;
  }
}
</style>
