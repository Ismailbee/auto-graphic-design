<template>
  <ErrorBoundary>
    <div class="app-shell">
      <!-- Splash Screen Loading -->
      <div v-if="showSplash" class="splash-screen">
        <div class="splash-content">
          <div class="splash-logo">
            <ion-icon :icon="sparklesOutline" class="logo-icon"></ion-icon>
          </div>
          <h1 class="splash-title">SmartDesignPro</h1>
          <ion-spinner name="crescent" color="light"></ion-spinner>
          <p class="splash-text">Loading your workspace...</p>
        </div>
      </div>

      <!-- Route Loading Overlay - Shows immediately on navigation -->
      <Transition name="fade-fast">
        <div v-if="isRouteLoading && !showSplash" class="route-loading-overlay">
          <div class="route-loading-content">
            <div class="route-loading-spinner"></div>
            <p class="route-loading-text">{{ loadingMessage }}</p>
          </div>
        </div>
      </Transition>

      <!-- Vue Router View -->
      <router-view v-show="!showSplash" />

      <!-- Global Modals (lazy) -->
      <AuthModal v-if="isAuthModalOpen" />
    

      <!-- Success Notification -->
      <SuccessNotification
        v-if="showSuccessNotification"
        :show="showSuccessNotification"
        :title="successNotificationData.title"
        :message="successNotificationData.message"
        :type="successNotificationData.type"
        :duration="successNotificationData.duration"
        @close="closeNotification"
      />
      
      <!-- Memory Monitor (Development) - Hidden -->
      <!-- <MemoryMonitor v-if="isDevelopment" /> -->
    </div>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth'
import ErrorBoundary from './components/debug/ErrorBoundary.vue'
const AuthModal = defineAsyncComponent(() => import('./components/auth/AuthModal.vue'))
const SuccessNotification = defineAsyncComponent(() => import('./components/notifications/SuccessNotification.vue'))
import { IonSpinner, IonIcon } from '@ionic/vue'
import { sparklesOutline } from 'ionicons/icons'
// import MemoryMonitor from './components/MemoryMonitor.vue'
import { useHardwareBackButton } from './composables/useHardwareBackButton'

const router = useRouter()
const authStore = useAuthStore()
const { showSuccessNotification, successNotificationData, isAuthReady, isAuthModalOpen } = storeToRefs(authStore)
const { closeNotification } = authStore

// Show memory monitor in development
const isDevelopment = import.meta.env.DEV

// Initialize hardware back button handler
useHardwareBackButton()

// Route loading state - shows immediately on navigation
const isRouteLoading = ref(false)
const loadingMessage = ref('Loading...')

// Route loading messages based on destination
const routeLoadingMessages: Record<string, string> = {
  '/auto-design': 'Loading Design Studio...',
  '/invoice': 'Loading Invoice Generator...',
  '/receipt': 'Loading Receipt Generator...',
  '/letterhead': 'Loading Letterhead Designer...',
  '/mockup': 'Loading Mockup Creator...',
  '/imposition': 'Loading Imposition Tool...',
  '/signature': 'Loading Signature Pad...',
  '/scheduling': 'Loading Scheduler...',
  '/tokens-and-plans': 'Loading Plans...',
  '/subscription': 'Loading Subscription...',
  '/settings': 'Loading Settings...',
}

// Navigation guards for route loading
router.beforeEach((to, from, next) => {
  // Skip loading for same route or hash changes
  if (to.path === from.path) {
    next()
    return
  }
  
  // Show loading immediately
  isRouteLoading.value = true
  loadingMessage.value = routeLoadingMessages[to.path] || 'Loading...'
  
  next()
})

router.afterEach(() => {
  // Small delay to ensure component has started rendering
  setTimeout(() => {
    isRouteLoading.value = false
  }, 100)
})

// Also handle errors
router.onError(() => {
  isRouteLoading.value = false
})

// Splash screen - hide once auth is ready (with minimum display time)
const showSplash = ref(true)
const splashStartTime = Date.now()
const MIN_SPLASH_TIME = 1200 // Reduced from 2000ms for faster perceived load

// Watch for auth ready state to hide splash
watch(isAuthReady, (ready) => {
  if (ready) {
    const elapsed = Date.now() - splashStartTime
    const remaining = Math.max(0, MIN_SPLASH_TIME - elapsed)
    setTimeout(() => {
      showSplash.value = false
    }, remaining)
  }
}, { immediate: true })

// Fallback timeout in case auth state never changes
onMounted(() => {
  setTimeout(() => {
    if (showSplash.value) {
      console.warn('Splash timeout reached - forcing hide')
      showSplash.value = false
    }
  }, 5000) // Maximum 5 seconds splash
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-content {
  text-align: center;
  color: white;
}

.splash-logo {
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 80px;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.splash-title {
  font-size: 32px;
  font-weight: 700;
  margin: 20px 0;
  letter-spacing: -1px;
}

.splash-text {
  font-size: 16px;
  opacity: 0.9;
  margin-top: 20px;
}

ion-spinner {
  --color: white;
  width: 48px;
  height: 48px;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Route Loading Overlay */
.route-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

@media (prefers-color-scheme: dark) {
  .route-loading-overlay {
    background: rgba(17, 24, 39, 0.95);
  }
}

.route-loading-content {
  text-align: center;
}

.route-loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@media (prefers-color-scheme: dark) {
  .route-loading-spinner {
    border-color: #374151;
    border-top-color: #818cf8;
  }
}

.route-loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #4b5563;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  .route-loading-text {
    color: #d1d5db;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Fast fade transition for route loading */
.fade-fast-enter-active {
  transition: opacity 0.1s ease-out;
}

.fade-fast-leave-active {
  transition: opacity 0.2s ease-in;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
</style>
