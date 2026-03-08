/**
 * Authentication Store
 * Now using Firebase Authentication
 * Supports offline mode for mobile apps
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  User,
  RegisterData,
  LoginData,
  PasswordResetRequest,
  AuthModalView
} from '@/types/auth'
import * as firebaseAuth from '@/services/firebase/firebase-auth'
import { API_CONFIG, FEATURES, OFFLINE_USER, isNativePlatform } from '@/config/environment'
// import router from '@/router' - Removed to avoid circular dependency

const USER_KEY = 'user'

// 🔧 DEV MODE: Optional bypass for local testing only.
// Enable explicitly with VITE_DEV_BYPASS_AUTH=true
const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

// 📱 OFFLINE MODE: Controlled by env/feature flags (do not force just because it's native)
const USE_OFFLINE_MODE = API_CONFIG.OFFLINE_MODE || !FEATURES.FIREBASE_AUTH_ENABLED

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const authInitialized = ref(false) // Track if Firebase auth has initialized

  // Auth ready state - true once Firebase auth has resolved initial state
  const isAuthReady = ref(false)

  // Auth Modal State
  const isAuthModalOpen = ref(false)
  const authModalView = ref<AuthModalView>('login')

  // Success Notification State
  const showSuccessNotification = ref(false)
  const successNotificationData = ref({
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
    duration: 5000
  })

  // Password Reset State
  const resetToken = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const accessToken = computed(() => user.value?.id || null) // Firebase uses UID as token
  const userDisplayName = computed(() => {
    if (!user.value) return ''
    if (user.value.name) return user.value.name
    if (user.value.firstName && user.value.lastName) {
      return `${user.value.firstName} ${user.value.lastName}`
    }
    return user.value.username || user.value.email
  })

  // Actions

  /**
   * Demo/Testing bypass function for network issues
   */
  const bypassAuthForTesting = () => {
    console.log('🔓 Bypassing authentication for testing...')
    
    const demoUser: User = {
      id: 'demo-user-123',
      username: 'demo_user',
      email: 'demo@example.com',
      name: 'Demo User',
      firstName: 'Demo',
      lastName: 'User',
      isVerified: true,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    user.value = demoUser
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser))
    
    // Set authenticated member data for invoices
    const memberData = {
      name: 'Demo User',
      branch: 'Main Branch',
      role: 'Member'
    };
    localStorage.setItem('authenticatedMember', JSON.stringify(memberData));
    
    closeAuthModal()
    
    console.log('✅ Demo user logged in successfully for testing')
    return demoUser
  }

  /**
   * Initialize auth - Listen to Firebase auth state changes
   */
  function initAuth() {
    console.log('🔧 Initializing auth...')

    // 📱 OFFLINE MODE: Auto-login for mobile/offline use
    if (USE_OFFLINE_MODE) {
      console.log('📱 OFFLINE MODE: Running without Firebase authentication')
      console.log('📱 Platform:', isNativePlatform() ? 'Native (Mobile)' : 'Web')

      const offlineUser: User = {
        id: OFFLINE_USER.id,
        email: OFFLINE_USER.email,
        username: 'user',
        name: OFFLINE_USER.displayName,
        firstName: 'User',
        lastName: '',
        role: 'user',
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      user.value = offlineUser
      localStorage.setItem(USER_KEY, JSON.stringify(offlineUser))

      // Set authenticated member
      const memberData = {
        name: OFFLINE_USER.displayName,
        branch: 'Local',
        role: 'User'
      }
      localStorage.setItem('authenticatedMember', JSON.stringify(memberData))

      // Mark auth as ready
      isAuthReady.value = true

      console.log('✅ Offline mode active - user:', offlineUser.email)
      return
    }

    // 🔧 DEV MODE: Auto-login bypass
    if (DEV_BYPASS_AUTH) {
      console.log('🚀 DEV MODE: Authentication bypassed - auto-login enabled')
      console.log('⚠️ Remember to set DEV_BYPASS_AUTH = false before production!')

      const devUser: User = {
        id: 'dev-user-123',
        email: 'developer@test.com',
        username: 'developer',
        name: 'Dev User',
        firstName: 'Dev',
        lastName: 'User',
        role: 'admin', // Admin role for full access
        status: 'active',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      user.value = devUser
      localStorage.setItem(USER_KEY, JSON.stringify(devUser))

      // Set authenticated member
      const memberData = {
        name: 'Dev User',
        branch: 'Main Branch',
        role: 'Admin'
      }
      localStorage.setItem('authenticatedMember', JSON.stringify(memberData))

      // Mark auth as ready in dev mode
      isAuthReady.value = true

      console.log('✅ Auto-logged in as:', devUser.email)
      return
    }

    // Normal Firebase auth flow
    // Set up Firebase auth state listener
    let authCallbackFired = false

    firebaseAuth.onAuthChange((firebaseUser) => {
      console.log('🔔 Firebase auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')
      authCallbackFired = true

      if (firebaseUser) {
        user.value = firebaseUser
        localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))
        console.log('✅ User authenticated:', firebaseUser.email)

        // Set authenticated member for Invoice/Receipt/Signature pages
        // Extract name from email or display name
        const userName = firebaseUser.displayName ||
                        firebaseUser.email?.split('@')[0] ||
                        'User';

        // TODO: In future, fetch branch and role from user profile database
        const memberData = {
          name: userName.charAt(0).toUpperCase() + userName.slice(1), // Capitalize first letter
          branch: 'Main Branch', // Default branch - should be fetched from database
          role: 'Member' // Default role - should be fetched from database
        };

        localStorage.setItem('authenticatedMember', JSON.stringify(memberData));
        console.log('✅ Authenticated member set:', memberData);

      } else {
        // Only clear if we don't have a valid saved user (to prevent logout on page refresh)
        const savedUser = localStorage.getItem(USER_KEY)
        if (!savedUser) {
          user.value = null
          localStorage.removeItem(USER_KEY)
          localStorage.removeItem('authenticatedMember')
          console.log('🔓 User logged out')
        }
      }

      // Mark auth as initialized after first state change
      if (!authInitialized.value) {
        authInitialized.value = true
        console.log('✅ Auth initialization complete')
      }

      // Mark auth as ready after first state change
      isAuthReady.value = true
    })

    console.log('⏳ Waiting for Firebase auth state...')

    // Fallback timeout: If Firebase doesn't respond within 3 seconds, mark auth as ready anyway
    // This prevents the splash screen from getting stuck
    setTimeout(() => {
      if (!authCallbackFired) {
        console.warn('⚠️ Firebase auth callback did not fire within 3 seconds, marking auth as ready')
        isAuthReady.value = true
        // IMPORTANT: Also set authInitialized to true so router guards don't get stuck waiting
        if (!authInitialized.value) {
          authInitialized.value = true
          console.warn('⚠️ Auth initialized via timeout fallback')
        }
      }
    }, 3000)
  }

  /**
   * Clear auth data
   */
  function clearAuth() {
    console.log('🧹 Clearing auth data...')
    user.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('authenticatedMember')
    console.log('✅ Auth data cleared')
  }

  /**
   * Force logout and clear all auth data
   */
  function forceLogout() {
    console.log('🚪 Force logout - clearing all data...')
    user.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('authenticatedMember')
    sessionStorage.clear()
    console.log('✅ All auth data cleared')
  }

  /**
   * Register new user with Firebase
   */
  async function registerUser(data: RegisterData): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      console.log('📝 Auth store: Starting registration...')
      const firebaseUser = await firebaseAuth.registerWithEmail(data)
      console.log('✅ Auth store: Registration successful')

      user.value = firebaseUser
      localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))

      // Close modal first
      closeAuthModal()

      console.log('✅ Auth store: Registration complete')

      // Redirect to home page after successful registration (using Vue Router)
      console.log('🔄 Redirecting to home page...')
      const router = (await import('@/router')).default
      await router.replace('/home')
    } catch (err: any) {
      console.error('❌ Auth store: Registration failed:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login user with Firebase
   */
  async function loginUser(data: LoginData): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      console.log('🔐 Auth store: Starting login...')
      const firebaseUser = await firebaseAuth.loginWithEmail(data)
      console.log('✅ Auth store: Login successful')

      user.value = firebaseUser
      localStorage.setItem(USER_KEY, JSON.stringify(firebaseUser))

      // Close modal first
      closeAuthModal()

      console.log('✅ Auth store: Login complete')

      // Check if there's an intended route to redirect to (using Vue Router)
      const intendedRoute = sessionStorage.getItem('intendedRoute')
      const router = (await import('@/router')).default
      
      if (intendedRoute) {
        console.log('🔄 Redirecting to intended route:', intendedRoute)
        sessionStorage.removeItem('intendedRoute')
        await router.replace(intendedRoute)
      } else {
        // Redirect to home page after successful login
        console.log('🔄 Redirecting to home page...')
        await router.replace('/home')
      }
    } catch (err: any) {
      console.error('❌ Auth store: Login failed:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  async function logoutUser(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await firebaseAuth.logout()
      console.log('✅ Logged out successfully')
    } catch (err: any) {
      console.error('Logout error:', err)
      error.value = err.message
    } finally {
      clearAuth()
      isLoading.value = false

      // Redirect to login page after logout
      try {
        const router = (await import('@/router')).default
        console.log('🔄 Redirecting to login page...')
        await router.replace('/login')
      } catch (navErr) {
        console.error('Navigation error after logout:', navErr)
        // Fallback: use window.location
        window.location.href = '/login'
      }
    }
  }

  /**
   * Login with Google - Single, unified implementation
   */
  async function loginWithGoogle(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const userData = await firebaseAuth.loginWithGoogle()
      user.value = userData
      localStorage.setItem(USER_KEY, JSON.stringify(userData))

      // Set authenticated member
      const memberData = {
        name: userData.name || userData.email?.split('@')[0] || 'User',
        branch: 'Main Branch',
        role: userData.role || 'Member'
      }
      localStorage.setItem('authenticatedMember', JSON.stringify(memberData))

      closeAuthModal()

      // Redirect to home using Vue Router (faster than full page reload)
      console.log('🔄 Redirecting to home page...')
      const router = (await import('@/router')).default
      await router.replace('/home')
    } catch (err: any) {
      console.error('Google login error:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user's avatar (profile picture)
   * Accepts data URL or remote URL and updates both Firebase Auth and Firestore
   */
  async function updateAvatar(photoDataUrl: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const updatedUser = await firebaseAuth.updateUserAvatar(photoDataUrl)
      user.value = updatedUser
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      showNotification({ title: 'Profile updated', message: 'Profile picture updated', type: 'success' })
    } catch (err: any) {
      console.error('updateAvatar error:', err)
      error.value = err.message || 'Failed to update avatar'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Request password reset
   */
  async function requestPasswordReset(data: PasswordResetRequest): Promise<string | undefined> {
    isLoading.value = true
    error.value = null

    try {
      await firebaseAuth.resetPassword(data.email)
      // Firebase sends email automatically
      return undefined
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Confirm password reset (placeholder - Firebase handles this via email link)
   */
  async function confirmPasswordReset(data: { token: string; newPassword: string }): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Firebase handles password reset via email link, not token
      // This is a placeholder for compatibility with the UI
      console.log('Password reset confirmation requested with token:', data.token)
      throw new Error('Password reset is handled via email link. Please check your email.')
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Open auth modal
   */
  function openAuthModal(view: AuthModalView = 'login') {
    authModalView.value = view
    isAuthModalOpen.value = true
    error.value = null
  }

  /**
   * Close auth modal
   */
  function closeAuthModal() {
    isAuthModalOpen.value = false
    error.value = null
  }

  /**
   * Set auth modal view
   */
  function setAuthModalView(view: AuthModalView) {
    authModalView.value = view
    error.value = null
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null
  }

  /**
   * Show success notification - DISABLED for cleaner mobile UX
   * Notifications are disabled to reduce visual clutter on mobile devices
   */
  function showNotification(data: { title: string; message: string; type: 'success' | 'error' | 'info'; duration?: number }) {
    // Notifications disabled - only log to console for debugging
    console.log(`[${data.type.toUpperCase()}] ${data.title}: ${data.message}`)
    // Uncomment below to re-enable notifications:
    // successNotificationData.value = {
    //   ...data,
    //   duration: typeof data.duration === 'number' ? data.duration : 5000
    // }
    // showSuccessNotification.value = true
  }

  /**
   * Close success notification
   */
  function closeNotification() {
    showSuccessNotification.value = false
  }

  /**
   * Check if user has password provider linked
   */
  async function hasPasswordProvider(): Promise<boolean> {
    try {
      return await firebaseAuth.hasPasswordProvider()
    } catch (err) {
      console.error('Error checking password provider:', err)
      return false
    }
  }

  /**
   * Check if user has Google provider linked
   */
  async function hasGoogleProvider(): Promise<boolean> {
    try {
      return await firebaseAuth.hasGoogleProvider()
    } catch (err) {
      console.error('Error checking Google provider:', err)
      return false
    }
  }

  /**
   * Link email/password to existing Google account
   */
  async function linkEmailPassword(password: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      await firebaseAuth.linkEmailPassword(password)
      showNotification({
        title: 'Success! 🎉',
        message: 'Password has been added to your account. You can now login with email/password.',
        type: 'success'
      })
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to link password'
      showNotification({
        title: 'Error',
        message: error.value || 'Failed to link password',
        type: 'error'
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Initialize on store creation
  console.log('🔧 Auth store created, initializing auth...')
  // Use setTimeout to defer initialization slightly to ensure other plugins are ready
  setTimeout(() => {
    try {
      initAuth()
      console.log('✅ Auth initialization started')
    } catch (err) {
      console.error('❌ Failed to initialize auth:', err)
      // Mark auth as ready anyway to prevent splash screen from getting stuck
      isAuthReady.value = true
    }
  }, 0)

  return {
    // State
    user,
    accessToken,
    isLoading,
    error,
    isAuthReady,
    isAuthModalOpen,
    authModalView,
    showSuccessNotification,
    successNotificationData,
    resetToken,

    // Computed
    isAuthenticated,
    userDisplayName,

    // Actions
    initAuth,
    bypassAuthForTesting, // For testing when network issues occur
    registerUser,
    loginUser,
    loginWithGoogle,
    logoutUser,
    forceLogout,
    requestPasswordReset,
    confirmPasswordReset,
    openAuthModal,
    closeAuthModal,
    setAuthModalView,
    clearError,
    showNotification,
    closeNotification,
    updateAvatar,
    // Account linking
    hasPasswordProvider,
    hasGoogleProvider,
    linkEmailPassword
  }
})
