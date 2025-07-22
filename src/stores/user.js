// src/stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    avatar: 'https://i.pravatar.cc/150',
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    phone: '',
    bio: '',
    social: {
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    joinDate: new Date().toISOString()
  }),

  actions: {
    updateProfile(data) {
      Object.assign(this, data)
    }
  },

  persist: true
})
