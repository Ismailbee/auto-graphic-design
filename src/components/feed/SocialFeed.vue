<template>
  <div class="social-feed">
    <!-- Feed Header -->
    <header class="feed-header">
      <div class="header-content">
        <h1 class="feed-title">
          <i class="fas fa-users"></i>
          Community Feed
        </h1>
        <p class="feed-subtitle">Discover amazing designs from our creative community</p>
      </div>
      
      <!-- Create Post Button -->
      <div class="header-actions">
        <PostUpload @posted="handleNewPost" />
      </div>
    </header>
    
    <!-- Feed Content -->
    <main class="feed-content">
      <!-- Loading State -->
      <div v-if="feedStore.loading && posts.length === 0" class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p class="loading-text">Loading amazing posts...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="!feedStore.loading && posts.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-images"></i>
        </div>
        <h3>No posts yet</h3>
        <p>Be the first to share your creative work with the community!</p>
        <PostUpload @posted="handleNewPost" />
      </div>
      
      <!-- Posts List -->
      <div v-else class="posts-container">
        <FeedPost 
          v-for="post in posts" 
          :key="post.id" 
          :post="post"
          class="feed-post-item"
        />
        
        <!-- Load More Button -->
        <div v-if="feedStore.hasMore" class="load-more-container">
          <button 
            @click="loadMorePosts"
            :disabled="feedStore.loading"
            class="load-more-btn"
          >
            <i v-if="feedStore.loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-chevron-down"></i>
            <span>{{ feedStore.loading ? 'Loading...' : 'Load More Posts' }}</span>
          </button>
        </div>
        
        <!-- End of Feed -->
        <div v-else class="end-of-feed">
          <p>You've reached the end! 🎉</p>
          <p class="end-subtitle">Why not create a new post to share with the community?</p>
        </div>
      </div>
    </main>
    
    <!-- Floating Action Button (Mobile) -->
    <div class="fab-container">
      <PostUpload @posted="handleNewPost">
        <template #trigger>
          <button class="fab">
            <i class="fas fa-plus"></i>
          </button>
        </template>
      </PostUpload>
    </div>
    
    <!-- Error Toast -->
    <div v-if="feedStore.error" class="error-toast">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ feedStore.error }}</span>
        <button @click="dismissError" class="error-dismiss">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFeedStore } from '../../stores/feed.js'
import FeedPost from './FeedPost.vue'
import PostUpload from './PostUpload.vue'

const feedStore = useFeedStore()

// Component state
const scrollContainer = ref(null)
const isNearBottom = ref(false)

// Computed properties
const posts = computed(() => feedStore.sortedPosts)

// Methods
async function loadFeed() {
  try {
    await feedStore.loadFeed()
  } catch (error) {
    console.error('Failed to load feed:', error)
  }
}

async function loadMorePosts() {
  try {
    await feedStore.loadMorePosts()
  } catch (error) {
    console.error('Failed to load more posts:', error)
  }
}

function handleNewPost(post) {
  // Scroll to top to show the new post
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function dismissError() {
  feedStore.error = null
}

// Infinite scroll functionality
function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // Check if user is near bottom (within 200px)
  isNearBottom.value = scrollTop + windowHeight >= documentHeight - 200
  
  // Auto-load more posts when near bottom
  if (isNearBottom.value && feedStore.hasMore && !feedStore.loading) {
    loadMorePosts()
  }
}

// Lifecycle hooks
onMounted(() => {
  loadFeed()
  
  // Add scroll listener for infinite scrolling
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.social-feed {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.feed-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px 24px;
  margin-bottom: 32px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.feed-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
}

.feed-title {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.feed-title i {
  font-size: 1.75rem;
}

.feed-subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
}

.header-actions {
  margin-top: 24px;
  position: relative;
  z-index: 1;
}

.feed-content {
  position: relative;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-state h3 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  color: #374151;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 32px 0;
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
}

.posts-container {
  position: relative;
}

.feed-post-item {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.load-more-container {
  text-align: center;
  padding: 32px 20px;
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.load-more-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.end-of-feed {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  margin-top: 24px;
}

.end-of-feed p {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #374151;
  font-weight: 600;
}

.end-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 400;
}

.fab-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 400px;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.error-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #991b1b;
  font-size: 0.875rem;
}

.error-content i:first-child {
  color: #dc2626;
}

.error-dismiss {
  background: none;
  border: none;
  color: #991b1b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
  margin-left: auto;
}

.error-dismiss:hover {
  background: rgba(185, 28, 28, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .social-feed {
    padding: 16px 12px;
  }
  
  .feed-header {
    padding: 24px 20px;
    margin-bottom: 24px;
  }
  
  .feed-title {
    font-size: 1.5rem;
  }
  
  .feed-title i {
    font-size: 1.25rem;
  }
  
  .feed-subtitle {
    font-size: 1rem;
  }
  
  .fab-container {
    bottom: 20px;
    right: 20px;
  }
  
  .error-toast {
    top: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
  
  .empty-state {
    padding: 60px 20px;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
  
  .empty-state h3 {
    font-size: 1.25rem;
  }
  
  .empty-state p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .social-feed {
    padding: 12px 8px;
  }
  
  .feed-header {
    padding: 20px 16px;
    border-radius: 12px;
  }
  
  .feed-title {
    font-size: 1.25rem;
    flex-direction: column;
    gap: 8px;
  }
  
  .loading-container {
    padding: 40px 16px;
  }
  
  .loading-spinner {
    font-size: 2rem;
  }
  
  .load-more-btn {
    padding: 12px 24px;
    font-size: 0.9rem;
  }
}

/* Hide FAB on desktop */
@media (min-width: 769px) {
  .fab-container {
    display: none;
  }
}
</style>