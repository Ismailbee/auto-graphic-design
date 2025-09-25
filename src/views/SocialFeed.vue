<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Social Feed</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openUploadModal">
            <ion-icon :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="social-feed-container">
        <!-- Quick Post Section -->
        <div class="quick-post-section bg-white p-4 mb-4 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <img 
              :src="currentUser.avatar" 
              :alt="currentUser.username"
              class="w-10 h-10 rounded-full object-cover"
            />
            <button 
              @click="openUploadModal"
              class="flex-1 bg-gray-100 rounded-full px-4 py-2 text-left text-gray-500 hover:bg-gray-200 transition-colors"
            >
              What's on your mind?
            </button>
          </div>
          
          <div class="flex gap-4">
            <button 
              @click="openUploadModal('image')"
              class="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
            >
              <ion-icon :icon="imageOutline"></ion-icon>
              Photo
            </button>
            <button 
              @click="openUploadModal('video')"
              class="flex items-center gap-2 text-sm text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
            >
              <ion-icon :icon="videocamOutline"></ion-icon>
              Video
            </button>
          </div>
        </div>

        <!-- Posts Feed -->
        <div class="posts-feed">
          <div 
            v-for="post in allPosts" 
            :key="post.id"
            class="post-card bg-white mb-4 shadow-sm rounded-lg overflow-hidden"
          >
            <!-- Post Header -->
            <div class="post-header flex items-center justify-between p-4 pb-3">
              <div class="flex items-center gap-3">
                <img 
                  :src="post.avatar" 
                  :alt="post.username"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 class="font-semibold text-sm">{{ post.username }}</h4>
                  <p class="text-xs text-gray-500">{{ formatTimeAgo(post.timestamp) }}</p>
                </div>
              </div>
              
              <ion-button fill="clear" size="small" v-if="post.userId === currentUser.id">
                <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
              </ion-button>
            </div>

            <!-- Post Content -->
            <div class="post-content">
              <p class="px-4 pb-3 text-sm" v-if="post.content">{{ post.content }}</p>
              
              <!-- Media Content -->
              <div class="post-media" v-if="post.mediaUrl">
                <img 
                  v-if="post.mediaType === 'image'"
                  :src="post.mediaUrl" 
                  :alt="post.content"
                  class="w-full max-h-96 object-cover"
                  loading="lazy"
                />
                
                <video 
                  v-else-if="post.mediaType === 'video'"
                  ref="videoElements"
                  :src="post.mediaUrl"
                  class="w-full max-h-96 object-cover"
                  controls
                  preload="metadata"
                  @play="onVideoPlay"
                  @pause="onVideoPause"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <!-- Post Actions -->
            <div class="post-actions p-4 pt-3 border-t border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-600">{{ post.likes }} likes</span>
                  <span class="text-sm text-gray-600">{{ post.comments }} comments</span>
                  <span class="text-sm text-gray-600">{{ post.shares }} shares</span>
                </div>
              </div>
              
              <div class="flex items-center justify-around">
                <button 
                  @click="toggleLike(post.id)"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  :class="post.isLiked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-50'"
                >
                  <ion-icon :icon="post.isLiked ? heart : heartOutline"></ion-icon>
                  <span class="text-sm">Like</span>
                </button>
                
                <button 
                  @click="openCommentModal(post.id)"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ion-icon :icon="chatbubbleOutline"></ion-icon>
                  <span class="text-sm">Comment</span>
                </button>
                
                <button 
                  @click="sharePost(post.id)"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ion-icon :icon="shareOutline"></ion-icon>
                  <span class="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div class="text-center py-6" v-if="!loading && allPosts.length > 0">
            <ion-button fill="outline" @click="loadMorePosts">
              Load More Posts
            </ion-button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <ion-spinner></ion-spinner>
            <p class="mt-2 text-gray-600">Loading posts...</p>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && allPosts.length === 0" class="text-center py-12">
            <ion-icon :icon="peopleOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">No posts yet</h3>
            <p class="text-gray-500 mb-4">Be the first to share something!</p>
            <ion-button @click="openUploadModal">Create Post</ion-button>
          </div>
        </div>
      </div>

      <!-- Upload Modal -->
      <ion-modal :is-open="showUploadModal" @didDismiss="closeUploadModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Create Post</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeUploadModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <ion-content class="p-4">
          <div class="upload-form space-y-4">
            <div class="flex items-center gap-3 mb-4">
              <img 
                :src="currentUser.avatar" 
                :alt="currentUser.username"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 class="font-semibold">{{ currentUser.username }}</h4>
                <p class="text-sm text-gray-500">Posting to feed</p>
              </div>
            </div>

            <ion-textarea
              v-model="newPost.content"
              placeholder="What's on your mind?"
              rows="4"
              maxlength="500"
              counter="true"
            ></ion-textarea>

            <!-- Media Upload -->
            <div 
              class="media-upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
            >
              <div v-if="!newPost.mediaUrl">
                <ion-icon :icon="cloudUploadOutline" class="text-4xl text-gray-400 mb-2"></ion-icon>
                <p class="text-gray-600 mb-2">Drag and drop media here</p>
                <input 
                  type="file" 
                  ref="fileInput"
                  @change="handleFileSelect"
                  accept="image/*,video/*"
                  class="hidden"
                />
                <ion-button fill="outline" @click="$refs.fileInput.click()">
                  Choose File
                </ion-button>
              </div>
              
              <div v-else class="relative">
                <img 
                  v-if="newPost.mediaType === 'image'"
                  :src="newPost.mediaUrl"
                  class="max-h-48 mx-auto rounded-lg"
                />
                <video 
                  v-else-if="newPost.mediaType === 'video'"
                  :src="newPost.mediaUrl"
                  class="max-h-48 mx-auto rounded-lg"
                  controls
                ></video>
                
                <button 
                  @click="removeMedia"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <ion-icon :icon="closeOutline" class="text-sm"></ion-icon>
                </button>
              </div>
            </div>

            <div class="flex gap-3">
              <ion-button expand="block" @click="submitPost" :disabled="!canSubmit">
                <ion-spinner v-if="submitting" slot="start"></ion-spinner>
                {{ submitting ? 'Posting...' : 'Post' }}
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonSpinner, IonModal, IonTextarea
} from '@ionic/vue'
import { 
  addOutline, imageOutline, videocamOutline, ellipsisVerticalOutline,
  heart, heartOutline, chatbubbleOutline, shareOutline, peopleOutline,
  closeOutline, cloudUploadOutline
} from 'ionicons/icons'
import { useSocialMediaStore } from '../stores/socialMedia.js'

const socialStore = useSocialMediaStore()

// Reactive state
const showUploadModal = ref(false)
const loading = ref(false)
const submitting = ref(false)
const newPost = ref({
  content: '',
  mediaUrl: '',
  mediaType: ''
})
const fileInput = ref(null)
const videoElements = ref([])

// Computed properties
const allPosts = computed(() => socialStore.allPosts)
const currentUser = computed(() => socialStore.currentUser)

const canSubmit = computed(() => {
  return newPost.value.content.trim() || newPost.value.mediaUrl
})

// Methods
const openUploadModal = (mediaType = '') => {
  showUploadModal.value = true
  if (mediaType) {
    // Auto-trigger file input for specific media type
    setTimeout(() => {
      if (fileInput.value) {
        fileInput.value.accept = mediaType === 'image' ? 'image/*' : 'video/*'
        fileInput.value.click()
      }
    }, 100)
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  resetNewPost()
}

const resetNewPost = () => {
  newPost.value = {
    content: '',
    mediaUrl: '',
    mediaType: ''
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file) => {
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    alert('Please select an image or video file')
    return
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    alert('File size must be less than 10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    newPost.value.mediaUrl = e.target.result
    newPost.value.mediaType = file.type.startsWith('image/') ? 'image' : 'video'
  }
  reader.readAsDataURL(file)
}

const removeMedia = () => {
  newPost.value.mediaUrl = ''
  newPost.value.mediaType = ''
}

const submitPost = async () => {
  if (!canSubmit.value) return
  
  submitting.value = true
  
  try {
    await socialStore.createPost(newPost.value)
    closeUploadModal()
  } catch (error) {
    console.error('Error creating post:', error)
    alert('Failed to create post. Please try again.')
  } finally {
    submitting.value = false
  }
}

const toggleLike = (postId) => {
  socialStore.toggleLike(postId)
}

const openCommentModal = (postId) => {
  // In a real app, this would open a comment modal
  const comment = prompt('Add a comment:')
  if (comment) {
    socialStore.addComment(postId, comment)
  }
}

const sharePost = (postId) => {
  socialStore.sharePost(postId)
  alert('Post shared!')
}

const loadMorePosts = () => {
  // In a real app, this would load more posts from the API
  console.log('Loading more posts...')
}

const formatTimeAgo = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now - time) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  
  return time.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric'
  })
}

const onVideoPlay = (event) => {
  // Pause other videos when one starts playing
  videoElements.value.forEach(video => {
    if (video !== event.target && !video.paused) {
      video.pause()
    }
  })
}

const onVideoPause = (event) => {
  // Video paused - could implement analytics here
}

onMounted(() => {
  loading.value = true
  
  // Simulate loading delay
  setTimeout(() => {
    loading.value = false
  }, 800)
})
</script>

<style scoped>
.social-feed-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.post-card {
  border: 1px solid #e5e7eb;
}

.media-upload-area {
  transition: border-color 0.3s ease;
}

.media-upload-area:hover {
  border-color: #6366f1;
}

.hidden {
  display: none;
}

/* Video lazy loading optimization */
video {
  background-color: #f3f4f6;
}

/* Smooth transitions for interactive elements */
button {
  transition: all 0.2s ease;
}

.quick-post-section {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}
</style>