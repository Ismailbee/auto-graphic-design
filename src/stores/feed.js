// src/stores/feed.js
import { defineStore } from 'pinia'
import { useUserStore } from './user.js'

export const useFeedStore = defineStore('feed', {
  state: () => ({
    posts: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
    // Mock data for development
    mockPosts: [
      {
        id: '1',
        author: {
          id: 'user1',
          username: 'johndoe',
          fullName: 'John Doe',
          avatar: 'https://i.pravatar.cc/100?u=john'
        },
        content: {
          caption: 'Just finished this amazing design! What do you think? 🎨✨',
          mediaType: 'image',
          mediaUrl: 'https://picsum.photos/seed/design1/600/400',
          thumbnail: 'https://picsum.photos/seed/design1/300/200'
        },
        engagement: {
          likes: 42,
          comments: 8,
          shares: 3,
          likedBy: []
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        author: {
          id: 'user2',
          username: 'designerpro',
          fullName: 'Sarah Wilson',
          avatar: 'https://i.pravatar.cc/100?u=sarah'
        },
        content: {
          caption: 'Quick tutorial on color theory! Hope this helps fellow designers 🌈',
          mediaType: 'video',
          mediaUrl: 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
          thumbnail: 'https://picsum.photos/seed/video1/600/400'
        },
        engagement: {
          likes: 128,
          comments: 23,
          shares: 15,
          likedBy: []
        },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        author: {
          id: 'user3',
          username: 'creativemind',
          fullName: 'Alex Johnson',
          avatar: 'https://i.pravatar.cc/100?u=alex'
        },
        content: {
          caption: 'Logo design process from sketch to final product 🚀',
          mediaType: 'image',
          mediaUrl: 'https://picsum.photos/seed/logo1/600/600',
          thumbnail: 'https://picsum.photos/seed/logo1/300/300'
        },
        engagement: {
          likes: 89,
          comments: 12,
          shares: 7,
          likedBy: []
        },
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      }
    ]
  }),

  actions: {
    async loadFeed() {
      this.loading = true
      this.error = null
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // For now, use mock data. In production, this would be an API call
        this.posts = [...this.mockPosts]
        this.loading = false
      } catch (error) {
        this.error = error.message
        this.loading = false
      }
    },

    async loadMorePosts() {
      if (!this.hasMore || this.loading) return
      
      this.loading = true
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Generate more mock posts
        const morePosts = Array.from({ length: 3 }, (_, i) => ({
          id: `${this.posts.length + i + 1}`,
          author: {
            id: `user${this.posts.length + i + 1}`,
            username: `user${this.posts.length + i + 1}`,
            fullName: `User ${this.posts.length + i + 1}`,
            avatar: `https://i.pravatar.cc/100?u=user${this.posts.length + i + 1}`
          },
          content: {
            caption: `This is post number ${this.posts.length + i + 1} 📸`,
            mediaType: Math.random() > 0.5 ? 'image' : 'video',
            mediaUrl: Math.random() > 0.5 
              ? `https://picsum.photos/seed/post${this.posts.length + i}/600/400`
              : 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
            thumbnail: `https://picsum.photos/seed/post${this.posts.length + i}/300/200`
          },
          engagement: {
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 20),
            shares: Math.floor(Math.random() * 10),
            likedBy: []
          },
          createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        }))
        
        this.posts.push(...morePosts)
        this.page++
        
        // Simulate end of feed
        if (this.page > 3) {
          this.hasMore = false
        }
        
        this.loading = false
      } catch (error) {
        this.error = error.message
        this.loading = false
      }
    },

    async createPost({ caption, mediaFile, mediaType }) {
      try {
        const userStore = useUserStore()
        
        // In production, upload media file to server first
        let mediaUrl = ''
        if (mediaFile) {
          // For now, create a local URL. In production, upload to server
          mediaUrl = URL.createObjectURL(mediaFile)
        }
        
        const newPost = {
          id: Date.now().toString(),
          author: {
            id: 'current-user',
            username: userStore.username,
            fullName: userStore.fullName,
            avatar: userStore.profileImageUrl
          },
          content: {
            caption,
            mediaType,
            mediaUrl,
            thumbnail: mediaUrl // In production, generate thumbnail
          },
          engagement: {
            likes: 0,
            comments: 0,
            shares: 0,
            likedBy: []
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Add to beginning of posts array
        this.posts.unshift(newPost)
        
        return newPost
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async toggleLike(postId) {
      const userStore = useUserStore()
      const post = this.posts.find(p => p.id === postId)
      
      if (!post) return
      
      const userId = 'current-user' // In production, get from auth
      const hasLiked = post.engagement.likedBy.includes(userId)
      
      if (hasLiked) {
        post.engagement.likes--
        post.engagement.likedBy = post.engagement.likedBy.filter(id => id !== userId)
      } else {
        post.engagement.likes++
        post.engagement.likedBy.push(userId)
      }
      
      // In production, sync with server
      return !hasLiked
    },

    async addComment(postId, commentText) {
      const userStore = useUserStore()
      const post = this.posts.find(p => p.id === postId)
      
      if (!post) return
      
      // Initialize comments array if it doesn't exist
      if (!post.comments) {
        post.comments = []
      }
      
      const newComment = {
        id: Date.now().toString(),
        author: {
          id: 'current-user',
          username: userStore.username,
          fullName: userStore.fullName,
          avatar: userStore.profileImageUrl
        },
        text: commentText,
        createdAt: new Date().toISOString()
      }
      
      post.comments.push(newComment)
      post.engagement.comments++
      
      // In production, sync with server
      return newComment
    },

    async sharePost(postId) {
      const post = this.posts.find(p => p.id === postId)
      
      if (!post) return
      
      post.engagement.shares++
      
      // In production, handle actual sharing logic
      return true
    },

    getUserPosts(userId) {
      return this.posts.filter(post => post.author.id === userId)
    },

    getPost(postId) {
      return this.posts.find(post => post.id === postId)
    }
  },

  getters: {
    sortedPosts: (state) => {
      return [...state.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },

    currentUserPosts: (state) => {
      return state.posts.filter(post => post.author.id === 'current-user')
    },

    postsCount: (state) => state.posts.length,

    totalLikes: (state) => {
      return state.posts.reduce((total, post) => total + (post.engagement?.likes || 0), 0)
    }
  },

  persist: {
    key: 'feed-store',
    storage: localStorage,
    paths: ['posts'] // Only persist posts, not loading states
  }
})