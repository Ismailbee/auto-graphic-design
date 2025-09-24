<template>
  <article class="feed-post">
    <!-- Post Header -->
    <header class="post-header">
      <div class="author-info">
        <img 
          :src="post.author.avatar" 
          :alt="post.author.fullName"
          class="author-avatar"
          loading="lazy"
        />
        <div class="author-details">
          <h4 class="author-name">{{ post.author.fullName }}</h4>
          <p class="author-username">@{{ post.author.username }}</p>
        </div>
      </div>
      
      <div class="post-meta">
        <time :datetime="post.createdAt" class="post-time">
          {{ formatTime(post.createdAt) }}
        </time>
        <button class="post-menu-btn" @click="showPostMenu = !showPostMenu">
          <i class="fas fa-ellipsis-h"></i>
        </button>
        
        <!-- Post Menu Dropdown -->
        <div v-if="showPostMenu" class="post-menu" @click.stop>
          <button @click="handleShare" class="menu-item">
            <i class="fas fa-share"></i>
            Share
          </button>
          <button @click="reportPost" class="menu-item">
            <i class="fas fa-flag"></i>
            Report
          </button>
        </div>
      </div>
    </header>
    
    <!-- Post Caption -->
    <div v-if="post.content.caption" class="post-caption">
      <p>{{ post.content.caption }}</p>
    </div>
    
    <!-- Post Media -->
    <div v-if="post.content.mediaUrl" class="post-media">
      <!-- Image Media -->
      <img 
        v-if="post.content.mediaType === 'image'"
        :src="post.content.mediaUrl" 
        :alt="post.content.caption || 'Post image'"
        class="post-image"
        loading="lazy"
        @click="openFullscreen"
      />
      
      <!-- Video Media -->
      <div v-else-if="post.content.mediaType === 'video'" class="video-container">
        <video 
          ref="videoElement"
          :src="post.content.mediaUrl"
          class="post-video"
          :poster="post.content.thumbnail"
          preload="metadata"
          @play="handleVideoPlay"
          @pause="handleVideoPause"
          @loadedmetadata="handleVideoLoaded"
        >
          Your browser does not support the video tag.
        </video>
        
        <!-- Video Controls Overlay -->
        <div class="video-controls" @click="toggleVideoPlay">
          <button class="play-pause-btn" :class="{ playing: isVideoPlaying }">
            <i :class="isVideoPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
          </button>
        </div>
        
        <!-- Video Progress -->
        <div v-if="showVideoProgress" class="video-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: videoProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Post Actions -->
    <footer class="post-actions">
      <div class="action-buttons">
        <!-- Like Button -->
        <button 
          @click="handleLike" 
          class="action-btn like-btn"
          :class="{ liked: isLiked }"
        >
          <i :class="isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
          <span>{{ post.engagement.likes || 0 }}</span>
        </button>
        
        <!-- Comment Button -->
        <button @click="toggleComments" class="action-btn comment-btn">
          <i class="far fa-comment"></i>
          <span>{{ post.engagement.comments || 0 }}</span>
        </button>
        
        <!-- Share Button -->
        <button @click="handleShare" class="action-btn share-btn">
          <i class="far fa-share-square"></i>
          <span>{{ post.engagement.shares || 0 }}</span>
        </button>
      </div>
      
      <!-- Liked By Section -->
      <div v-if="post.engagement.likes > 0" class="liked-by">
        <p>
          <span v-if="isLiked && post.engagement.likes === 1">You liked this</span>
          <span v-else-if="isLiked">You and {{ post.engagement.likes - 1 }} others</span>
          <span v-else>{{ post.engagement.likes }} {{ post.engagement.likes === 1 ? 'person likes' : 'people like' }} this</span>
        </p>
      </div>
    </footer>
    
    <!-- Comments Section -->
    <div v-if="showComments" class="comments-section">
      <!-- Comments List -->
      <div v-if="post.comments && post.comments.length > 0" class="comments-list">
        <div 
          v-for="comment in post.comments" 
          :key="comment.id" 
          class="comment-item"
        >
          <img 
            :src="comment.author.avatar" 
            :alt="comment.author.fullName"
            class="comment-avatar"
          />
          <div class="comment-content">
            <div class="comment-bubble">
              <strong>{{ comment.author.fullName }}</strong>
              <p>{{ comment.text }}</p>
            </div>
            <time class="comment-time">{{ formatTime(comment.createdAt) }}</time>
          </div>
        </div>
      </div>
      
      <!-- Add Comment Form -->
      <form @submit.prevent="handleAddComment" class="add-comment-form">
        <img 
          :src="currentUserAvatar" 
          alt="Your avatar"
          class="comment-avatar"
        />
        <div class="comment-input-wrapper">
          <input 
            v-model="newComment"
            type="text" 
            placeholder="Write a comment..."
            class="comment-input"
            maxlength="200"
          />
          <button 
            type="submit" 
            :disabled="!newComment.trim()"
            class="send-comment-btn"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
    
    <!-- Fullscreen Media Modal -->
    <div v-if="showFullscreen" class="fullscreen-modal" @click="closeFullscreen">
      <div class="fullscreen-content">
        <button @click="closeFullscreen" class="fullscreen-close">
          <i class="fas fa-times"></i>
        </button>
        <img 
          :src="post.content.mediaUrl" 
          :alt="post.content.caption"
          class="fullscreen-image"
        />
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFeedStore } from '../../stores/feed.js'
import { useUserStore } from '../../stores/user.js'
import { useNotification } from '../../composables/useNotification.js'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const feedStore = useFeedStore()
const userStore = useUserStore()
const { showSuccess, showError } = useNotification()

// Component state
const showComments = ref(false)
const showPostMenu = ref(false)
const showFullscreen = ref(false)
const newComment = ref('')

// Video state
const videoElement = ref(null)
const isVideoPlaying = ref(false)
const showVideoProgress = ref(false)
const videoProgress = ref(0)
const intersectionObserver = ref(null)

// Computed properties
const isLiked = computed(() => {
  return props.post.engagement.likedBy?.includes('current-user') || false
})

const currentUserAvatar = computed(() => {
  return userStore.profileImageUrl
})

// Methods
function formatTime(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now - date) / 1000)
  
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  
  return date.toLocaleDateString()
}

async function handleLike() {
  try {
    await feedStore.toggleLike(props.post.id)
  } catch (error) {
    showError('Failed to update like')
  }
}

function toggleComments() {
  showComments.value = !showComments.value
}

async function handleAddComment() {
  if (!newComment.value.trim()) return
  
  try {
    await feedStore.addComment(props.post.id, newComment.value.trim())
    newComment.value = ''
    showSuccess('Comment added!')
  } catch (error) {
    showError('Failed to add comment')
  }
}

async function handleShare() {
  try {
    await feedStore.sharePost(props.post.id)
    
    // Try native sharing if available
    if (navigator.share) {
      await navigator.share({
        title: `${props.post.author.fullName}'s post`,
        text: props.post.content.caption,
        url: window.location.href + `#post-${props.post.id}`
      })
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href + `#post-${props.post.id}`)
      showSuccess('Link copied to clipboard!')
    }
  } catch (error) {
    console.warn('Sharing failed:', error)
    showSuccess('Post shared!')
  }
  
  showPostMenu.value = false
}

function reportPost() {
  showSuccess('Post reported. Thank you for keeping our community safe.')
  showPostMenu.value = false
}

function openFullscreen() {
  if (props.post.content.mediaType === 'image') {
    showFullscreen.value = true
  }
}

function closeFullscreen() {
  showFullscreen.value = false
}

// Video methods
function toggleVideoPlay() {
  if (!videoElement.value) return
  
  if (videoElement.value.paused) {
    videoElement.value.play()
  } else {
    videoElement.value.pause()
  }
}

function handleVideoPlay() {
  isVideoPlaying.value = true
  showVideoProgress.value = true
  updateVideoProgress()
}

function handleVideoPause() {
  isVideoPlaying.value = false
}

function handleVideoLoaded() {
  // Video metadata loaded
}

function updateVideoProgress() {
  if (!videoElement.value || videoElement.value.paused) return
  
  const progress = (videoElement.value.currentTime / videoElement.value.duration) * 100
  videoProgress.value = progress
  
  if (progress < 100) {
    requestAnimationFrame(updateVideoProgress)
  }
}

// Lazy loading for videos
function setupIntersectionObserver() {
  if (!videoElement.value) return
  
  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Auto-play video when in view (muted)
          if (videoElement.value) {
            videoElement.value.muted = true
            videoElement.value.play().catch(() => {
              // Auto-play failed, that's ok
            })
          }
        } else {
          // Pause video when out of view
          if (videoElement.value && !videoElement.value.paused) {
            videoElement.value.pause()
          }
        }
      })
    },
    { threshold: 0.5 }
  )
  
  intersectionObserver.value.observe(videoElement.value)
}

// Lifecycle
onMounted(() => {
  if (props.post.content.mediaType === 'video') {
    setupIntersectionObserver()
  }
  
  // Close menus when clicking outside
  document.addEventListener('click', () => {
    showPostMenu.value = false
  })
})

onUnmounted(() => {
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }
})
</script>

<style scoped>
.feed-post {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.feed-post:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.author-details {
  flex: 1;
}

.author-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.author-username {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.2;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.post-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.post-menu-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.post-menu-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.post-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 120px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.875rem;
}

.menu-item:hover {
  background: #f3f4f6;
}

.post-caption {
  padding: 0 20px 16px;
}

.post-caption p {
  margin: 0;
  line-height: 1.6;
  color: #374151;
}

.post-media {
  position: relative;
}

.post-image {
  width: 100%;
  max-height: 600px;
  object-fit: cover;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.post-image:hover {
  opacity: 0.95;
}

.video-container {
  position: relative;
  background: #000;
}

.post-video {
  width: 100%;
  max-height: 600px;
  object-fit: cover;
}

.video-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.video-container:hover .video-controls {
  opacity: 1;
}

.play-pause-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-pause-btn:hover {
  background: white;
  transform: scale(1.1);
}

.video-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.progress-bar {
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
}

.progress-fill {
  height: 100%;
  background: #667eea;
  transition: width 0.1s ease;
}

.post-actions {
  padding: 16px 20px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.like-btn.liked {
  color: #ef4444;
}

.like-btn.liked:hover {
  color: #dc2626;
  background: #fee2e2;
}

.comment-btn:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.share-btn:hover {
  color: #10b981;
  background: #ecfdf5;
}

.liked-by {
  margin-bottom: 8px;
}

.liked-by p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.comments-section {
  border-top: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.comments-list {
  margin-bottom: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-bubble {
  background: #f3f4f6;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 4px;
}

.comment-bubble strong {
  font-size: 0.875rem;
  color: #374151;
}

.comment-bubble p {
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
}

.comment-time {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-left: 16px;
}

.add-comment-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 20px;
  padding: 8px 16px;
}

.comment-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #374151;
}

.comment-input::placeholder {
  color: #9ca3af;
}

.send-comment-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  transition: color 0.2s ease;
}

.send-comment-btn:hover:not(:disabled) {
  color: #5a67d8;
}

.send-comment-btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.fullscreen-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.fullscreen-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.fullscreen-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Responsive */
@media (max-width: 640px) {
  .post-header,
  .post-caption,
  .post-actions,
  .comments-section {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .action-buttons {
    gap: 16px;
  }
  
  .action-btn {
    padding: 6px 8px;
    font-size: 0.8rem;
  }
  
  .author-avatar {
    width: 40px;
    height: 40px;
  }
  
  .author-name {
    font-size: 0.9rem;
  }
  
  .author-username {
    font-size: 0.8rem;
  }
}
</style>