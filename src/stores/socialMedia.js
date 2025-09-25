import { defineStore } from 'pinia'
import { socialMediaPosts } from '../data/mockData.js'

export const useSocialMediaStore = defineStore('socialMedia', {
  state: () => ({
    posts: [...socialMediaPosts],
    userPosts: [], // Posts by current user
    currentUser: {
      id: 1,
      username: 'currentUser',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'
    }
  }),

  getters: {
    allPosts: (state) => {
      return [...state.posts, ...state.userPosts].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
    },

    getUserPosts: (state) => (userId) => {
      return state.allPosts.filter(post => post.userId === userId)
    }
  },

  actions: {
    createPost(postData) {
      const newPost = {
        id: Date.now(),
        userId: this.currentUser.id,
        username: this.currentUser.username,
        avatar: this.currentUser.avatar,
        content: postData.content,
        mediaUrl: postData.mediaUrl,
        mediaType: postData.mediaType,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false
      }
      
      this.userPosts.unshift(newPost)
      return newPost
    },

    toggleLike(postId) {
      const post = this.posts.find(p => p.id === postId) || 
                   this.userPosts.find(p => p.id === postId)
      
      if (post) {
        post.isLiked = !post.isLiked
        post.likes += post.isLiked ? 1 : -1
      }
    },

    addComment(postId, comment) {
      const post = this.posts.find(p => p.id === postId) || 
                   this.userPosts.find(p => p.id === postId)
      
      if (post) {
        post.comments += 1
        // In a real app, you'd store the actual comment
      }
    },

    sharePost(postId) {
      const post = this.posts.find(p => p.id === postId) || 
                   this.userPosts.find(p => p.id === postId)
      
      if (post) {
        post.shares += 1
      }
    },

    deletePost(postId) {
      const index = this.userPosts.findIndex(p => p.id === postId)
      if (index !== -1) {
        this.userPosts.splice(index, 1)
      }
    }
  },

  persist: true
})