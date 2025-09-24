<template>
  <div class="post-upload-container">
    <!-- Upload Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Post</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Media Upload Area -->
          <div class="upload-area" 
               :class="{ 'has-media': previewUrl, 'dragging': isDragging }"
               @drop="handleDrop"
               @dragover="handleDragOver"
               @dragleave="handleDragLeave"
               @click="triggerFileInput">
            
            <div v-if="!previewUrl" class="upload-prompt">
              <i class="fas fa-cloud-upload-alt upload-icon"></i>
              <h4>Upload Photo or Video</h4>
              <p>Drag and drop or click to select</p>
              <p class="file-types">Supports: JPG, PNG, GIF, MP4, MOV</p>
            </div>
            
            <!-- Media Preview -->
            <div v-else class="media-preview">
              <button @click.stop="removeMedia" class="remove-media-btn">
                <i class="fas fa-times"></i>
              </button>
              
              <img v-if="mediaType === 'image'" 
                   :src="previewUrl" 
                   alt="Preview" 
                   class="preview-image" />
              
              <video v-else-if="mediaType === 'video'" 
                     :src="previewUrl" 
                     controls 
                     class="preview-video"
                     @loadedmetadata="handleVideoLoaded">
              </video>
            </div>
          </div>
          
          <!-- Caption Input -->
          <div class="caption-section">
            <div class="caption-header">
              <i class="fas fa-edit"></i>
              <label>Write a caption</label>
            </div>
            <textarea 
              v-model="caption"
              placeholder="What's on your mind? Share your design story..."
              rows="4"
              maxlength="500"
              class="caption-input"
            ></textarea>
            <div class="caption-counter">{{ caption.length }}/500</div>
          </div>
          
          <!-- Upload Progress -->
          <div v-if="uploading" class="upload-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <p class="progress-text">Uploading... {{ uploadProgress }}%</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">Cancel</button>
          <button @click="handleSubmit" 
                  :disabled="!canSubmit || uploading" 
                  class="btn-post">
            <i v-if="uploading" class="fas fa-spinner fa-spin"></i>
            <span>{{ uploading ? 'Posting...' : 'Share Post' }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Upload Trigger Button -->
    <slot name="trigger">
      <button @click="openModal" class="upload-trigger-btn">
        <i class="fas fa-plus"></i>
        <span>Create Post</span>
      </button>
    </slot>
    
    <!-- Hidden File Input -->
    <input 
      ref="fileInput"
      type="file" 
      accept="image/*,video/*" 
      @change="handleFileSelect"
      style="display: none;"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFeedStore } from '../../stores/feed.js'
import { useNotification } from '../../composables/useNotification.js'

const emit = defineEmits(['posted'])

const feedStore = useFeedStore()
const { showSuccess, showError } = useNotification()

// Modal state
const showModal = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)

// Media state
const selectedFile = ref(null)
const previewUrl = ref('')
const mediaType = ref('')
const isDragging = ref(false)

// Form state
const caption = ref('')
const fileInput = ref(null)

// Computed properties
const canSubmit = computed(() => {
  return (selectedFile.value || caption.value.trim()) && !uploading.value
})

// Methods
function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function resetForm() {
  selectedFile.value = null
  previewUrl.value = ''
  mediaType.value = ''
  caption.value = ''
  uploading.value = false
  uploadProgress.value = 0
  isDragging.value = false
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

function handleDrop(event) {
  event.preventDefault()
  isDragging.value = false
  
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

function handleDragOver(event) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(event) {
  event.preventDefault()
  isDragging.value = false
}

function processFile(file) {
  // Validate file type
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
  
  if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
    showError('Please select a valid image or video file')
    return
  }
  
  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    showError('File size must be less than 10MB')
    return
  }
  
  selectedFile.value = file
  mediaType.value = validImageTypes.includes(file.type) ? 'image' : 'video'
  
  // Create preview URL
  previewUrl.value = URL.createObjectURL(file)
}

function removeMedia() {
  selectedFile.value = null
  previewUrl.value = ''
  mediaType.value = ''
}

function handleVideoLoaded(event) {
  // Optional: Handle video metadata loading
  console.log('Video loaded:', event.target.duration)
}

async function handleSubmit() {
  if (!canSubmit.value) return
  
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 90) {
        clearInterval(progressInterval)
      }
    }, 100)
    
    // Create the post
    const newPost = await feedStore.createPost({
      caption: caption.value.trim(),
      mediaFile: selectedFile.value,
      mediaType: mediaType.value
    })
    
    // Complete progress
    uploadProgress.value = 100
    
    showSuccess('Post shared successfully!')
    emit('posted', newPost)
    
    // Close modal after short delay
    setTimeout(() => {
      closeModal()
    }, 500)
    
  } catch (error) {
    console.error('Error creating post:', error)
    showError('Failed to share post. Please try again.')
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.post-upload-container {
  position: relative;
}

.upload-trigger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.upload-trigger-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  margin-bottom: 24px;
}

.upload-area:hover,
.upload-area.dragging {
  border-color: #667eea;
  background: #f8faff;
}

.upload-area.has-media {
  padding: 0;
  background: transparent;
  border: none;
}

.upload-prompt .upload-icon {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 16px;
}

.upload-prompt h4 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.upload-prompt p {
  margin: 0 0 4px 0;
  color: #6b7280;
}

.file-types {
  font-size: 0.875rem;
  color: #9ca3af;
}

.media-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.remove-media-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.remove-media-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.preview-image,
.preview-video {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
}

.caption-section {
  margin-bottom: 24px;
}

.caption-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.caption-header i {
  color: #667eea;
}

.caption-header label {
  font-weight: 600;
  color: #374151;
}

.caption-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease;
}

.caption-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.caption-counter {
  text-align: right;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 4px;
}

.upload-progress {
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-post {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 1rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-post {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-post:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-post:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .upload-area {
    padding: 30px 15px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-post {
    width: 100%;
  }
}
</style>