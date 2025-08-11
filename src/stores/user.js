// src/stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    avatar: '', // URL or base64 string
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    phone: '',
    bio: '',
    member: '',
    city: '',
    stateProvince: '',
    country: '',
    social: {
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    joinDate: new Date().toISOString()
  }),

  actions: {
    updateProfile(data) {
      // Ensure we're only updating known keys
      for (const key in data) {
        if (key in this) {
          this[key] = data[key]
        }
      }
    },
    setAvatar(url) {
      this.avatar = url
    }
  },

  getters: {
    profileImageUrl: (state) =>
      state.avatar?.trim() || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  },

  persist: true
})
