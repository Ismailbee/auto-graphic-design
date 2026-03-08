/**
 * Auth Store Tests
 * Tests for authentication store functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const authStore = useAuthStore()
      
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()
    })
  })

  describe('showAuthModal', () => {
    it('should open auth modal with login mode', () => {
      const authStore = useAuthStore()
      
      authStore.showAuthModal('login')
      
      expect(authStore.authModalOpen).toBe(true)
      expect(authStore.authModalMode).toBe('login')
    })

    it('should open auth modal with register mode', () => {
      const authStore = useAuthStore()
      
      authStore.showAuthModal('register')
      
      expect(authStore.authModalOpen).toBe(true)
      expect(authStore.authModalMode).toBe('register')
    })
  })

  describe('hideAuthModal', () => {
    it('should close auth modal', () => {
      const authStore = useAuthStore()
      
      authStore.showAuthModal('login')
      authStore.hideAuthModal()
      
      expect(authStore.authModalOpen).toBe(false)
    })
  })

  describe('setUser', () => {
    it('should set user data', () => {
      const authStore = useAuthStore()
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        username: 'testuser',
        role: 'user' as const,
        status: 'active' as const,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      authStore.setUser(mockUser)
      
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should clear user when null is passed', () => {
      const authStore = useAuthStore()
      
      authStore.setUser(null)
      
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('showSuccess', () => {
    it('should show success notification', () => {
      const authStore = useAuthStore()
      
      authStore.showSuccess('Test success message')
      
      expect(authStore.successMessage).toBe('Test success message')
      expect(authStore.showSuccessNotification).toBe(true)
    })

    it('should auto-hide success notification after 3 seconds', async () => {
      vi.useFakeTimers()
      const authStore = useAuthStore()
      
      authStore.showSuccess('Test message')
      expect(authStore.showSuccessNotification).toBe(true)
      
      vi.advanceTimersByTime(3000)
      expect(authStore.showSuccessNotification).toBe(false)
      
      vi.useRealTimers()
    })
  })

  describe('Computed Properties', () => {
    it('should compute isAdmin correctly', () => {
      const authStore = useAuthStore()
      
      expect(authStore.isAdmin).toBe(false)
      
      authStore.setUser({
        id: '123',
        email: 'admin@example.com',
        name: 'Admin User',
        username: 'admin',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      expect(authStore.isAdmin).toBe(true)
    })

    it('should compute isModerator correctly', () => {
      const authStore = useAuthStore()
      
      authStore.setUser({
        id: '123',
        email: 'mod@example.com',
        name: 'Moderator User',
        username: 'moderator',
        role: 'moderator',
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      expect(authStore.isModerator).toBe(true)
    })
  })
})

