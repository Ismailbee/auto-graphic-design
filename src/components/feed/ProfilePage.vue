<template>
  <div class="profile-page">
    <!-- Profile Header -->
    <header class="profile-header">
      <div class="profile-banner">
        <div class="banner-overlay"></div>
      </div>
      
      <div class="profile-info">
        <div class="avatar-section">
          <img 
            :src="userStore.profileImageUrl" 
            :alt="userStore.fullName"
            class="profile-avatar"
          />
          <button v-if="isOwnProfile" @click="editProfile" class="edit-avatar-btn">
            <i class="fas fa-camera"></i>
          </button>
        </div>
        
        <div class="user-details">
          <h1 class="user-name">{{ userStore.fullName }}</h1>
          <p class="username">@{{ userStore.username }}</p>
          <p v-if="userStore.bio" class="user-bio">{{ userStore.bio }}</p>
          
          <!-- User Stats -->
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-number">{{ userPosts.length }}</span>
              <span class="stat-label">Posts</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ totalLikes }}</span>
              <span class="stat-label">Likes</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ followersCount }}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ followingCount }}</span>
              <span class="stat-label">Following</span>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="profile-actions">
            <button v-if="isOwnProfile" @click="editProfile" class="btn-primary">
              <i class="fas fa-edit"></i>
              Edit Profile
            </button>
            <button v-else @click="toggleFollow" class="btn-follow" :class="{ following: isFollowing }">
              <i :class="isFollowing ? 'fas fa-user-check' : 'fas fa-user-plus'"></i>
              {{ isFollowing ? 'Following' : 'Follow' }}
            </button>
            
            <button @click="shareProfile" class="btn-secondary">
              <i class="fas fa-share"></i>
              Share
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Content Tabs -->
    <nav class="content-tabs">
      <button 
        @click="activeTab = 'posts'" 
        class="tab-btn"
        :class="{ active: activeTab === 'posts' }"
      >
        <i class="fas fa-th-large"></i>
        Posts
      </button>
      <button 
        @click="activeTab = 'liked'" 
        class="tab-btn"
        :class="{ active: activeTab === 'liked' }"
        v-if="isOwnProfile"
      >
        <i class="fas fa-heart"></i>
        Liked
      </button>
      <button 
        @click="activeTab = 'saved'" 
        class="tab-btn"
        :class="{ active: activeTab === 'saved' }"
        v-if="isOwnProfile"
      >
        <i class="fas fa-bookmark"></i>
        Saved
      </button>
    </nav>
    
    <!-- Content Grid -->
    <main class="profile-content">
      <!-- Posts Tab -->
      <div v-if="activeTab === 'posts'" class="content-section">
        <div v-if="userPosts.length === 0" class="empty-content">
          <div class="empty-icon">
            <i class="fas fa-images"></i>
          </div>
          <h3>{{ isOwnProfile ? 'No posts yet' : 'No posts to show' }}</h3>
          <p v-if="isOwnProfile">Share your creative work with the community!</p>
          <p v-else>This user hasn't shared any posts yet.</p>
          <PostUpload v-if="isOwnProfile" @posted="handleNewPost" />
        </div>
        
        <div v-else class="posts-grid">
          <div 
            v-for="post in userPosts" 
            :key="post.id" 
            class="post-thumbnail"
            @click="openPostDetail(post)"
          >
            <!-- Image Post -->
            <img 
              v-if="post.content.mediaType === 'image'"
              :src="post.content.thumbnail || post.content.mediaUrl" 
              :alt="post.content.caption"
              class="thumbnail-image"
              loading="lazy"
            />
            
            <!-- Video Post -->
            <div v-else class="video-thumbnail">
              <img 
                :src="post.content.thumbnail" 
                :alt="post.content.caption"
                class="thumbnail-image"
                loading="lazy"
              />
              <div class="video-overlay">
                <i class="fas fa-play"></i>
              </div>
            </div>
            
            <!-- Post Overlay Info -->
            <div class="post-overlay">
              <div class="overlay-stats">
                <span class="stat">
                  <i class="fas fa-heart"></i>
                  {{ post.engagement.likes }}
                </span>
                <span class="stat">
                  <i class="fas fa-comment"></i>
                  {{ post.engagement.comments }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Liked Tab -->
      <div v-if="activeTab === 'liked'" class="content-section">
        <div class="coming-soon">
          <i class="fas fa-heart"></i>
          <h3>Liked Posts</h3>
          <p>Your liked posts will appear here</p>
        </div>
      </div>
      
      <!-- Saved Tab -->
      <div v-if="activeTab === 'saved'" class="content-section">
        <div class="coming-soon">
          <i class="fas fa-bookmark"></i>
          <h3>Saved Posts</h3>
          <p>Your saved posts will appear here</p>
        </div>
      </div>
    </main>
    
    <!-- Post Detail Modal -->
    <div v-if="selectedPost" class="post-modal" @click="closePostDetail">
      <div class="modal-content" @click.stop>
        <button @click="closePostDetail" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        <FeedPost :post="selectedPost" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user.js'
import { useFeedStore } from '../../stores/feed.js'
import { useNotification } from '../../composables/useNotification.js'
import FeedPost from './FeedPost.vue'
import PostUpload from './PostUpload.vue'

const props = defineProps({
  userId: {
    type: String,
    default: 'current-user'
  }
})

const router = useRouter()
const userStore = useUserStore()
const feedStore = useFeedStore()
const { showSuccess, showError } = useNotification()

// Component state
const activeTab = ref('posts')
const selectedPost = ref(null)
const isFollowing = ref(false)
const followersCount = ref(156)
const followingCount = ref(89)

// Computed properties
const isOwnProfile = computed(() => props.userId === 'current-user')

const userPosts = computed(() => {
  if (isOwnProfile.value) {
    return feedStore.currentUserPosts
  }
  return feedStore.getUserPosts(props.userId)
})

const totalLikes = computed(() => {
  return userPosts.value.reduce((total, post) => total + (post.engagement?.likes || 0), 0)
})

// Methods
function editProfile() {
  router.push('/edit-profile')
}

async function toggleFollow() {
  try {
    isFollowing.value = !isFollowing.value
    
    if (isFollowing.value) {
      followersCount.value++
      showSuccess('Following user!')
    } else {
      followersCount.value--
      showSuccess('Unfollowed user')
    }
    
    // In production, sync with server
  } catch (error) {
    showError('Failed to update follow status')
    isFollowing.value = !isFollowing.value
  }
}

async function shareProfile() {
  try {
    const profileUrl = `${window.location.origin}/profile/${props.userId}`
    
    if (navigator.share) {
      await navigator.share({
        title: `${userStore.fullName}'s Profile`,
        text: `Check out ${userStore.fullName}'s creative work!`,
        url: profileUrl
      })
    } else {
      await navigator.clipboard.writeText(profileUrl)
      showSuccess('Profile link copied to clipboard!')
    }
  } catch (error) {
    console.warn('Sharing failed:', error)
  }
}

function openPostDetail(post) {
  selectedPost.value = post
  document.body.style.overflow = 'hidden'
}

function closePostDetail() {
  selectedPost.value = null
  document.body.style.overflow = 'auto'
}

function handleNewPost(post) {
  showSuccess('Post created successfully!')
}

// Lifecycle
onMounted(() => {
  // Load user profile data if needed
  if (!isOwnProfile.value) {
    // In production, fetch user profile data
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 935px;
  margin: 0 auto;
  padding: 0 20px;
}

.profile-header {
  margin-bottom: 32px;
}

.profile-banner {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  margin-bottom: -60px;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.2"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
}

.profile-info {
  background: white;
  border-radius: 16px;
  padding: 80px 32px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.avatar-section {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.edit-avatar-btn:hover {
  background: #5a67d8;
  transform: scale(1.1);
}

.user-details {
  text-align: center;
  padding-top: 20px;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.username {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #6b7280;
  font-weight: 500;
}

.user-bio {
  margin: 0 0 24px 0;
  font-size: 1rem;
  color: #374151;
  line-height: 1.6;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 32px;
  padding: 24px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-primary,
.btn-follow,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.9rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-follow {
  background: #10b981;
  color: white;
}

.btn-follow:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-follow.following {
  background: #6b7280;
}

.btn-follow.following:hover {
  background: #ef4444;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.content-tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 32px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  position: relative;
  transition: color 0.2s ease;
}

.tab-btn:hover {
  color: #374151;
}

.tab-btn.active {
  color: #667eea;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

.profile-content {
  margin-bottom: 32px;
}

.empty-content {
  text-align: center;
  padding: 80px 20px;
  background: #f9fafb;
  border-radius: 16px;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-content h3 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  color: #374151;
  font-weight: 600;
}

.empty-content p {
  margin: 0 0 32px 0;
  color: #6b7280;
  font-size: 1.1rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.post-thumbnail {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease;
}

.post-thumbnail:hover {
  transform: scale(1.02);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.post-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.post-thumbnail:hover .post-overlay {
  opacity: 1;
}

.overlay-stats {
  display: flex;
  gap: 16px;
  color: white;
  font-weight: 600;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.coming-soon {
  text-align: center;
  padding: 80px 20px;
  background: #f9fafb;
  border-radius: 16px;
}

.coming-soon i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 16px;
}

.coming-soon h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: #374151;
}

.coming-soon p {
  margin: 0;
  color: #6b7280;
}

.post-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  position: relative;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
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
  z-index: 10;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-page {
    padding: 0 16px;
  }
  
  .profile-banner {
    height: 150px;
    margin-bottom: -50px;
  }
  
  .profile-info {
    padding: 70px 24px 24px;
  }
  
  .profile-avatar {
    width: 100px;
    height: 100px;
  }
  
  .avatar-section {
    top: -50px;
  }
  
  .user-name {
    font-size: 1.5rem;
  }
  
  .user-stats {
    gap: 24px;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .profile-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary,
  .btn-follow,
  .btn-secondary {
    width: 100%;
    max-width: 200px;
  }
  
  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .profile-info {
    padding: 60px 16px 16px;
  }
  
  .user-stats {
    gap: 16px;
    padding: 16px 0;
  }
  
  .stat-number {
    font-size: 1.1rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .content-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    padding: 12px 16px;
    font-size: 0.875rem;
  }
  
  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
}
</style>