<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>My Gallery</h2>
        <button class="close-button" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'recent' }"
          @click="activeTab = 'recent'"
        >
          Recent Images
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'upload' }"
          @click="activeTab = 'upload'"
        >
          Upload
        </button>
      </div>
      
      <div class="modal-content">
        <!-- Recent Images -->
        <div v-if="activeTab === 'recent'" class="gallery-grid">
          <div v-if="images.length === 0" class="empty-state">
            <i class="fas fa-images"></i>
            <p>No images yet. Upload some to get started!</p>
          </div>
          
          <div 
            v-for="(image, index) in images" 
            :key="index" 
            class="gallery-item"
            @click="selectImage(image.url)"
          >
            <div class="image-preview">
              <img :src="image.url" :alt="image.name" />
            </div>
            <div class="image-info">
              <span class="image-name">{{ image.name }}</span>
              <span class="image-date">{{ formatDate(image.date) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Upload Form -->
        <div v-if="activeTab === 'upload'" class="upload-container">
          <div 
            class="upload-dropzone"
            :class="{ 'drag-over': isDragging }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              multiple
              class="file-input" 
              @change="handleFileSelect"
            />
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Drag images here or click to browse</p>
            <span class="upload-hint">JPG, PNG, SVG, WEBP (max 5MB)</span>
          </div>
          
          <div v-if="uploadingFiles.length > 0" class="upload-progress">
            <div v-for="(file, index) in uploadingFiles" :key="index" class="upload-item">
              <div class="upload-item-name">{{ file.name }}</div>
              <div class="upload-item-progress">
                <div class="progress-bar" :style="{ width: file.progress + '%' }"></div>
              </div>
              <div class="upload-item-status">{{ file.progress }}%</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="cancel-button" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'select-image']);

// State
const activeTab = ref('recent');
const fileInput = ref(null);
const isDragging = ref(false);
const uploadingFiles = ref([]);

// Sample images - in a real app, these would come from a backend service
// For this demo, we'll provide some sample data
const images = ref([
  {
    name: 'Abstract Background',
    url: '/image/abstract-pattern.jpg',
    date: new Date(2023, 5, 15)
  },
  {
    name: 'Landscape Photo',
    url: '/image/landscape.jpg',
    date: new Date(2023, 6, 20)
  },
  {
    name: 'Product Photography',
    url: '/image/product.jpg',
    date: new Date(2023, 7, 3)
  },
  {
    name: 'Logo Design',
    url: '/image/logo.png',
    date: new Date(2023, 7, 10)
  },
  {
    name: 'Company Banner',
    url: '/image/banner.jpg',
    date: new Date(2023, 8, 1)
  }
]);

// Methods
function closeModal() {
  emit('close');
}

function selectImage(url) {
  emit('select-image', url);
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

function triggerFileInput() {
  fileInput.value.click();
}

function handleDragOver(e) {
  isDragging.value = true;
}

function handleDragLeave(e) {
  isDragging.value = false;
}

function handleDrop(e) {
  isDragging.value = false;
  
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files);
  }
}

function handleFileSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    handleFiles(e.target.files);
  }
}

function handleFiles(files) {
  uploadingFiles.value = [];
  
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    
    const reader = new FileReader();
    const uploadItem = {
      name: file.name,
      size: file.size,
      progress: 0
    };
    
    uploadingFiles.value.push(uploadItem);
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        uploadItem.progress = Math.round((e.loaded / e.total) * 100);
      }
    };
    
    reader.onload = (e) => {
      uploadItem.progress = 100;
      
      // Add to gallery
      setTimeout(() => {
        images.value.unshift({
          name: file.name,
          url: e.target.result,
          date: new Date()
        });
        
        // Remove from uploading list
        uploadingFiles.value = uploadingFiles.value.filter(item => item !== uploadItem);
        
        // Switch to recent tab
        activeTab.value = 'recent';
      }, 500);
    };
    
    reader.readAsDataURL(file);
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background-color: white;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 18px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-tabs {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-button.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.tab-button:hover:not(.active) {
  color: #111827;
}

.modal-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.gallery-item {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.gallery-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.image-preview {
  height: 150px;
  overflow: hidden;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.image-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-date {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f9fafb;
}

.upload-dropzone:hover, .upload-dropzone.drag-over {
  border-color: #4f46e5;
  background-color: #eef2ff;
}

.upload-dropzone i {
  font-size: 48px;
  color: #6b7280;
  margin-bottom: 16px;
}

.upload-dropzone p {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}

.upload-hint {
  font-size: 14px;
  color: #6b7280;
}

.file-input {
  display: none;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-item {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
}

.upload-item-name {
  grid-column: 1;
  grid-row: 1;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.upload-item-status {
  grid-column: 2;
  grid-row: 1;
  font-size: 14px;
  color: #6b7280;
  text-align: right;
}

.upload-item-progress {
  grid-column: 1 / -1;
  grid-row: 2;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4f46e5;
  transition: width 0.3s ease;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.cancel-button {
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
