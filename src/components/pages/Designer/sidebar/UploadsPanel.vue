<template>
  <div v-if="activeTab === 'uploads'" class="panel">
    <h3>Media Library</h3>
    
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeUploadsTab = tab.id"
        :class="{ active: activeUploadsTab === tab.id }"
        class="tab-button"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <!-- Upload area -->
    <div v-if="activeUploadsTab === 'upload'" class="upload-section">
      <div class="option-row">
        <label class="toggle">
          <input type="checkbox" v-model="autoRemoveBg" />
          <span>Auto remove background (images)</span>
        </label>
      </div>
      <div 
        class="dropzone"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onFileDrop"
        :class="{ 'active-dropzone': isDragging }"
      >
        <div class="dropzone-content">
          <i class="fas fa-cloud-upload-alt"></i>
          <h4>Drag & Drop Media</h4>
          <p>Drop files here or click to browse</p>
          <button class="upload-btn" @click="triggerFileUpload">
            <i class="fas fa-plus"></i> Select Files
          </button>
        </div>
      </div>
      
      <div class="upload-info">
        <p>Supported formats: PNG, JPG, GIF, SVG, MP4</p>
        <p>Max file size: 10MB</p>
      </div>
    </div>
    
    <!-- My uploads tab -->
    <div v-if="activeUploadsTab === 'myuploads'" class="my-uploads-section">
      <div class="search-filter-bar">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search uploads..." v-model="searchQuery">
        </div>
        
        <div class="filter-dropdown">
          <select v-model="fileTypeFilter">
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        </div>
      </div>
      
      <div v-if="!filteredUploads.length" class="empty-message">
        <i class="fas fa-photo-video"></i>
        <p>No media files found</p>
        <button class="empty-action-btn" @click="activeUploadsTab = 'upload'">
          <i class="fas fa-plus"></i> Upload Files
        </button>
      </div>
      
      <div v-else class="upload-grid">
        <div 
          v-for="(file, index) in filteredUploads" 
          :key="index" 
          class="upload-item"
          draggable="true"
          @dragstart="(e) => onDragStart(e, { type: file.type.startsWith('image/') ? 'image' : 'video', url: file.url, name: file.name })"
          :data-type="file.type.startsWith('image/') ? 'image' : 'video'"
          :data-id="`upload-${index}`"
          @click="addUploadToCanvas(file)"
        >
          <div class="upload-thumbnail">
            <img v-if="file.type.startsWith('image/')" :src="file.url" :alt="file.name" />
            <div v-else class="video-thumbnail">
              <i class="fas fa-play-circle"></i>
            </div>
          </div>
          
          <div class="upload-overlay">
            <button class="action-btn add-btn" @click.stop="addUploadToCanvas(file)" title="Add to canvas">
              <i class="fas fa-plus"></i>
            </button>
            <button class="action-btn edit-btn" @click.stop="editUpload(file, index)" title="Edit">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="action-btn delete-btn" @click.stop="removeUpload(index)" title="Delete">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          
          <div class="upload-info">
            <span class="upload-name">{{ truncateName(file.name, 15) }}</span>
            <span class="upload-date">{{ formatDate(file.date || new Date()) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Stock media tab -->
    <div v-if="activeUploadsTab === 'stock'" class="stock-section">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search stock images..." v-model="stockSearchQuery">
      </div>
      
      <div class="category-pills">
        <button 
          v-for="category in stockCategories" 
          :key="category"
          @click="stockCategory = category"
          :class="{ active: stockCategory === category }"
          class="category-pill"
        >
          {{ category }}
        </button>
      </div>
      
      <div class="stock-grid">
        <div 
          v-for="(item, index) in filteredStockItems" 
          :key="index" 
          class="stock-item"
          draggable="true"
          @dragstart="(e) => onDragStart(e, { type: 'image', url: item.url, name: item.name, id: item.id })"
          @click="addStockItemToCanvas(item)"
        >
          <div class="stock-thumbnail">
            <img :src="item.thumbnail" :alt="item.name">
          </div>
          <div class="stock-overlay">
            <button class="stock-add-btn">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent uploads quick access -->
    <div v-if="activeUploadsTab !== 'upload' && userUploads.length > 0" class="recent-uploads">
      <h4>Recent Uploads</h4>
      <div class="recent-uploads-list">
        <div 
          v-for="(file, index) in recentUploads" 
          :key="index" 
          class="recent-upload-item"
          @click="addUploadToCanvas(file)"
        >
          <img v-if="file.type.startsWith('image/')" :src="file.url" :alt="file.name" />
          <div v-else class="video-icon">
            <i class="fas fa-video"></i>
          </div>
        </div>
      </div>
    </div>
    
    <input 
      type="file" 
      ref="fileInput" 
      @change="handleFileUpload" 
      multiple 
      accept="image/*,video/*" 
      style="display: none;" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps } from 'vue';
import { useCanvasStore } from '../../../../stores/canvas-konva';
import { Konva } from '../../../../lib/konva-init.js';
import { useNotification } from '../../../../composables/useNotification';
import { useImageEditor } from '../../../../composables/useImageEditor';

const props = defineProps({
  activeTab: String,
});

const canvasStore = useCanvasStore();
const notification = useNotification();
const fileInput = ref(null);
const userUploads = ref([]);
const isDragging = ref(false);
const activeUploadsTab = ref('myuploads');
const searchQuery = ref('');
const fileTypeFilter = ref('all');
const stockSearchQuery = ref('');
const stockCategory = ref('All');
const autoRemoveBg = ref(true);
const imageEditor = useImageEditor();

// Mock stock items for demonstration
const stockItems = ref([
  { 
    id: 1, 
    name: 'Abstract Background', 
    thumbnail: '/public/image/audioGraphBackground.png', 
    url: '/public/image/audioGraphBackground.png',
    category: 'Backgrounds'
  },
  { 
    id: 2, 
    name: 'Design Smarter', 
    thumbnail: '/public/image/design smarter.png', 
    url: '/public/image/design smarter.png',
    category: 'Marketing'
  },
  { 
    id: 3, 
    name: 'Logo Auto', 
    thumbnail: '/public/image/logoauto.png', 
    url: '/public/image/logoauto.png',
    category: 'Logos'
  },
  { 
    id: 4, 
    name: 'Business Card Template', 
    thumbnail: '/public/templates/flyer.jpg', 
    url: '/public/templates/flyer.jpg',
    category: 'Templates'
  },
  { 
    id: 5, 
    name: 'Invitation Card', 
    thumbnail: '/public/templates/invitation.jpg', 
    url: '/public/templates/invitation.jpg',
    category: 'Templates'
  },
]);

const tabs = [
  { id: 'myuploads', name: 'My Media' },
  { id: 'upload', name: 'Upload' },
  { id: 'stock', name: 'Stock' }
];

const stockCategories = ['All', 'Backgrounds', 'Marketing', 'Logos', 'Templates', 'Icons'];

// Computed properties
const filteredUploads = computed(() => {
  let filtered = userUploads.value;
  
  // Apply search filter
  if (searchQuery.value) {
    filtered = filtered.filter(file => 
      file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  // Apply file type filter
  if (fileTypeFilter.value !== 'all') {
    filtered = filtered.filter(file => {
      if (fileTypeFilter.value === 'image') {
        return file.type.startsWith('image/');
      } else if (fileTypeFilter.value === 'video') {
        return file.type.startsWith('video/');
      }
      return true;
    });
  }
  
  return filtered;
});

const filteredStockItems = computed(() => {
  let filtered = stockItems.value;
  
  // Apply category filter
  if (stockCategory.value !== 'All') {
    filtered = filtered.filter(item => item.category === stockCategory.value);
  }
  
  // Apply search filter
  if (stockSearchQuery.value) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(stockSearchQuery.value.toLowerCase()) ||
      item.category.toLowerCase().includes(stockSearchQuery.value.toLowerCase())
    );
  }
  
  return filtered;
});

const recentUploads = computed(() => {
  return userUploads.value.slice(0, 5); // Show only the 5 most recent uploads
});

// Methods
function triggerFileUpload() {
  fileInput.value.click();
}

function onFileDrop(event) {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  processFiles(files);
}

function handleFileUpload(event) {
  const files = event.target.files;
  processFiles(files);
}

function processFiles(files) {
  if (files.length === 0) return;
  
  const validFiles = Array.from(files).filter(file => {
    // Check file type
    const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
    // Check file size (10MB limit)
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
    
    if (!isValid) {
      notification.showError('Invalid file type. Please upload images or videos only.');
    }
    
    if (!isValidSize) {
      notification.showError('File too large. Maximum size is 10MB.');
    }
    
    return isValid && isValidSize;
  });
  
  if (validFiles.length === 0) return;
  
  // Process valid files
  validFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const original = e.target.result
      let processed = original
      try {
        if (autoRemoveBg.value && file.type.startsWith('image/')) {
          processed = await imageEditor.removeBackgroundSmart(original, { tolerance: 28 })
        }
      } catch (err) {
        notification.showInfo('Background removal skipped for this image.');
      }
      userUploads.value.unshift({
        name: file.name,
        url: processed,
        originalUrl: original,
        type: file.type,
        size: formatFileSize(file.size),
        date: new Date(),
        removedBg: autoRemoveBg.value
      });
    };
    reader.readAsDataURL(file);
  });
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  
  // Show success notification
  if (validFiles.length === 1) {
    notification.showSuccess('File uploaded successfully!');
  } else {
    notification.showSuccess(`${validFiles.length} files uploaded successfully!`);
  }
  
  // Switch to my uploads tab
  activeUploadsTab.value = 'myuploads';
}

function addUploadToCanvas(file) {
  if (!canvasStore.stageInstance) return;
  
  if (file.type.startsWith('image/')) {
    // Create a new Image object
    const imageObj = new Image();
    imageObj.onload = () => {
      const center = {
        x: canvasStore.stageInstance.width() / 2,
        y: canvasStore.stageInstance.height() / 2
      };
      
      // Create a new Konva image
      const konvaImg = new Konva.Image({
        image: imageObj,
        x: center.x,
        y: center.y,
        offsetX: imageObj.width / 2,
        offsetY: imageObj.height / 2,
        draggable: true,
        id: `image-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });
      
      // Scale image to reasonable size if needed
      const maxSize = 400;
      if (imageObj.width > maxSize || imageObj.height > maxSize) {
        const scale = Math.min(maxSize / imageObj.width, maxSize / imageObj.height);
        konvaImg.scaleX(scale);
        konvaImg.scaleY(scale);
      }
      
      // Add the image to the canvas
      canvasStore.addObjectToCanvas(konvaImg);
      notification.showSuccess('Image added to canvas');
    };
    
    // Set the source to start loading
    imageObj.src = file.url;
  } else if (file.type.startsWith('video/')) {
    // For demonstration - in a real app, this would handle video elements
    notification.showInfo('Video support coming soon!');
  }
}

function addStockItemToCanvas(item) {
  // Create a new Image object
  const imageObj = new Image();
  imageObj.onload = () => {
    const center = {
      x: canvasStore.stageInstance.width() / 2,
      y: canvasStore.stageInstance.height() / 2
    };
    
    // Create a new Konva image
    const konvaImg = new Konva.Image({
      image: imageObj,
      x: center.x,
      y: center.y,
      offsetX: imageObj.width / 2,
      offsetY: imageObj.height / 2,
      draggable: true,
      id: `stock-${item.id}-${Date.now()}`
    });
    
    // Scale image to reasonable size if needed
    const maxSize = 400;
    if (imageObj.width > maxSize || imageObj.height > maxSize) {
      const scale = Math.min(maxSize / imageObj.width, maxSize / imageObj.height);
      konvaImg.scaleX(scale);
      konvaImg.scaleY(scale);
    }
    
    // Add the image to the canvas
    canvasStore.addObjectToCanvas(konvaImg);
    notification.showSuccess('Stock item added to canvas');
  };
  
  // Set the source to start loading
  imageObj.src = item.url;
}

function onDragStart(event, payload) {
  try {
    const data = {
      type: payload.type || 'image',
      options: {
        src: payload.url,
        name: payload.name,
        id: payload.id
      }
    };
    event.dataTransfer.setData('application/json', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'copy';
  } catch (e) {
    // ignore
  }
}

function removeUpload(index) {
  if (confirm('Are you sure you want to delete this file?')) {
    userUploads.value.splice(index, 1);
    notification.showSuccess('File deleted successfully');
  }
}

function editUpload(file, index) {
  // For now, just add to canvas as a placeholder for more advanced editing
  addUploadToCanvas(file);
  notification.showInfo('Advanced editing coming soon!');
}

function truncateName(name, length = 20) {
  if (name.length <= length) return name;
  return name.substring(0, length - 3) + '...';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

// Initialize mock data
onMounted(() => {
  // Add some mock uploads
  userUploads.value = [
    {
      name: 'template-flyer.jpg',
      url: '/public/templates/flyer.jpg',
      type: 'image/jpeg',
      size: '120 KB',
      date: new Date('2023-05-10')
    },
    {
      name: 'invitation.jpg',
      url: '/public/templates/invitation.jpg',
      type: 'image/jpeg',
      size: '85 KB',
      date: new Date('2023-05-15')
    },
    {
      name: 'logo.png',
      url: '/public/image/logoauto.png',
      type: 'image/png',
      size: '45 KB',
      date: new Date('2023-05-20')
    }
  ];
});
</script>

<style scoped>
.panel {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  color: #1f2937;
}

.dark-theme .panel {
  color: #f3f4f6;
}

.panel h3, .panel h4 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.dark-theme .tabs {
  border-bottom-color: #374151;
}

.tab-button {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.dark-theme .tab-button {
  color: #9ca3af;
}

.tab-button:hover {
  color: #4f46e5;
}

.dark-theme .tab-button:hover {
  color: #6366f1;
}

.tab-button.active {
  color: #4f46e5;
}

.dark-theme .tab-button.active {
  color: #6366f1;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 20%;
  right: 20%;
  height: 2px;
  background-color: #4f46e5;
  border-radius: 1px;
}

.dark-theme .tab-button.active::after {
  background-color: #6366f1;
}

/* Upload section */
.dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
  margin-bottom: 16px;
}

.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}
.dark-theme .toggle { color: #9ca3af; }

.dark-theme .dropzone {
  border-color: #4b5563;
}

.dropzone:hover, .dropzone.active-dropzone {
  border-color: #4f46e5;
  background-color: rgba(79, 70, 229, 0.05);
}

.dark-theme .dropzone:hover, 
.dark-theme .dropzone.active-dropzone {
  border-color: #6366f1;
  background-color: rgba(99, 102, 241, 0.05);
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dropzone-content i {
  font-size: 36px;
  color: #4f46e5;
  margin-bottom: 16px;
}

.dark-theme .dropzone-content i {
  color: #6366f1;
}

.dropzone-content h4 {
  margin-bottom: 8px;
  font-size: 16px;
}

.dropzone-content p {
  margin-bottom: 16px;
  color: #6b7280;
}

.dark-theme .dropzone-content p {
  color: #9ca3af;
}

.upload-btn {
  padding: 10px 20px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
}

.upload-info {
  text-align: center;
  margin-top: 16px;
  font-size: 12px;
  color: #6b7280;
}

.dark-theme .upload-info {
  color: #9ca3af;
}

.upload-info p {
  margin: 4px 0;
}

/* Search and filter bar */
.search-filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-bar {
  flex: 1;
  position: relative;
}

.search-bar i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.search-bar input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.dark-theme .search-bar input {
  background-color: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.search-bar input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.filter-dropdown select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-theme .filter-dropdown select {
  background-color: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.filter-dropdown select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

/* Upload grid */
.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.upload-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-theme .upload-item {
  background-color: #374151;
  border-color: #4b5563;
}

.upload-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-color: #4f46e5;
}

.dark-theme .upload-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  border-color: #6366f1;
}

.upload-thumbnail {
  position: relative;
  padding-top: 100%; /* 1:1 aspect ratio */
  overflow: hidden;
}

.upload-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.upload-item:hover .upload-thumbnail img {
  transform: scale(1.05);
}

.video-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-theme .video-thumbnail {
  background-color: #4b5563;
}

.video-thumbnail i {
  font-size: 36px;
  color: #4f46e5;
}

.dark-theme .video-thumbnail i {
  color: #6366f1;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.upload-item:hover .upload-overlay {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: scale(1.1);
}

.add-btn {
  background-color: #4f46e5;
}

.add-btn:hover {
  background-color: #4338ca;
}

.edit-btn {
  background-color: #3b82f6;
}

.edit-btn:hover {
  background-color: #2563eb;
}

.delete-btn {
  background-color: #ef4444;
}

.delete-btn:hover {
  background-color: #dc2626;
}

.upload-info {
  padding: 8px 12px;
  background-color: #f3f4f6;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.dark-theme .upload-info {
  background-color: #1f2937;
  border-top-color: #4b5563;
}

.upload-name {
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark-theme .upload-name {
  color: #f3f4f6;
}

.upload-date {
  font-size: 10px;
  color: #6b7280;
}

.dark-theme .upload-date {
  color: #9ca3af;
}

/* Empty message */
.empty-message {
  text-align: center;
  padding: 40px 20px;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  margin-bottom: 24px;
}

.dark-theme .empty-message {
  border-color: #4b5563;
}

.empty-message i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.dark-theme .empty-message i {
  color: #6b7280;
}

.empty-message p {
  margin-bottom: 16px;
  color: #6b7280;
}

.dark-theme .empty-message p {
  color: #9ca3af;
}

.empty-action-btn {
  padding: 10px 20px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.empty-action-btn:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

/* Stock section */
.category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.category-pill {
  padding: 6px 12px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 12px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.dark-theme .category-pill {
  background-color: #374151;
  border-color: #4b5563;
  color: #d1d5db;
}

.category-pill:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.dark-theme .category-pill:hover {
  background-color: #4b5563;
  color: #f9fafb;
}

.category-pill.active {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.dark-theme .category-pill.active {
  background-color: #6366f1;
  border-color: #6366f1;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.stock-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.stock-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stock-thumbnail {
  position: relative;
  padding-top: 100%; /* 1:1 aspect ratio */
}

.stock-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.stock-item:hover .stock-overlay {
  opacity: 1;
}

.stock-add-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4f46e5;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.stock-add-btn:hover {
  background-color: #4338ca;
  transform: scale(1.1);
}

/* Recent uploads */
.recent-uploads {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.dark-theme .recent-uploads {
  border-top-color: #4b5563;
}

.recent-uploads h4 {
  margin-bottom: 12px;
  font-size: 16px;
}

.recent-uploads-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
}

.recent-uploads-list::-webkit-scrollbar {
  height: 6px;
}

.recent-uploads-list::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.dark-theme .recent-uploads-list::-webkit-scrollbar-track {
  background: #374151;
}

.recent-uploads-list::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.dark-theme .recent-uploads-list::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

.recent-upload-item {
  flex: 0 0 60px;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.dark-theme .recent-upload-item {
  border-color: #4b5563;
}

.recent-upload-item:hover {
  transform: translateY(-2px);
  border-color: #4f46e5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dark-theme .recent-upload-item:hover {
  border-color: #6366f1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.recent-upload-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-icon {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-theme .video-icon {
  background-color: #4b5563;
}

.video-icon i {
  font-size: 24px;
  color: #4f46e5;
}

.dark-theme .video-icon i {
  color: #6366f1;
}
</style>
