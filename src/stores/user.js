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
    gender: '',        // ✅ added
    language: '',      // ✅ added
    dob: '',           // ✅ added (format: YYYY-MM-DD)
    cards: [],         // ✅ store payment methods here
    social: {
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    joinDate: new Date().toISOString()
  }),

  actions: {
    updateProfile(data) {
      // Only update known keys
      for (const key in data) {
        if (key in this) {
          this[key] = data[key]
        }
      }
    },

    setAvatar(url) {
      this.avatar = url
    },

    // ✅ Save a new payment method
    savePaymentMethod(newCard) {
      this.cards.push({ ...newCard })
    },

    // ✅ Optional: remove a card
    removePaymentMethod(index) {
      this.cards.splice(index, 1)
    }
  },

  getters: {
    profileImageUrl: (state) =>
      state.avatar?.trim() || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',

    fullLocation: (state) =>
      [state.city, state.stateProvince, state.country].filter(Boolean).join(', '),

    formattedDob: (state) =>
      state.dob ? new Date(state.dob).toLocaleDateString() : ''
  },

  persist: true
})
