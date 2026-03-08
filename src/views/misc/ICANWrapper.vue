<template>
  <div class="ican-wrapper">
    <!-- Header -->
    <div class="ican-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack" aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m7-7l-7 7 7 7"/>
          </svg>
        </button>
        <div class="header-info">
          <h1 class="header-title">ICAN Portal</h1>
          <p class="header-subtitle">Secure access to ICAN management system</p>
        </div>
      </div>
      <div class="header-right">
        <div class="security-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span>Secure</span>
        </div>
      </div>
    </div>

    <!-- Loading Screen -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div class="loading-text">
        <h3>Connecting to ICAN Portal</h3>
        <p>Authenticating and establishing secure connection...</p>
      </div>
    </div>

    <!-- Error Screen -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3>Connection Error</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="initializeICANAccess">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6"/>
          <path d="M1 20v-6h6"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
        Try Again
      </button>
    </div>

    <!-- ICAN Application Container -->
    <div v-else class="ican-container">
      <!-- Option 2: Sub-App Wrapper (Recommended) -->
      <div class="ican-app-wrapper">
        <iframe
          ref="icanFrame"
          :src="icanUrl"
          class="ican-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          @load="handleIframeLoad"
          @error="handleIframeError"
        />
      </div>
    </div>

    <!-- Connection Status Bar -->
    <div class="status-bar" :class="{ connected: isConnected }">
      <div class="status-indicator">
        <div class="status-dot" :class="{ active: isConnected }"></div>
        <span class="status-text">
          {{ isConnected ? 'Connected to ICAN Portal' : 'Connecting...' }}
        </span>
      </div>
      <div class="connection-info">
        <span v-if="authStore.user">{{ authStore.user.name || authStore.user.email }}</span>
        <span class="separator">•</span>
        <span>{{ formatTime(new Date()) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ICANSSOService, { type ICANUser, ICANDevHelpers } from '@/views/micro-apps/ican/services/ican-sso.service'

const router = useRouter()
const authStore = useAuthStore()

// State
const isLoading = ref(true)
const isConnected = ref(false)
const error = ref<string | null>(null)
const icanFrame = ref<HTMLIFrameElement | null>(null)
const icanUrl = ref<string>('')

/**
 * Initialize ICAN access with SSO authentication
 */
const initializeICANAccess = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Step 1: Verify user authentication
    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('User not authenticated. Please log in first.')
    }

    // Step 2: Validate ICAN access permission
    const hasAccess = ICANSSOService.validateICANAccess(authStore.user) || 
                     ICANDevHelpers.isDevBypassEnabled()

    if (!hasAccess) {
      throw new Error('You do not have permission to access ICAN Portal. Please contact your administrator.')
    }

    // Step 3: Prepare ICAN user data
    let icanUser: ICANUser

    if (ICANDevHelpers.isDevBypassEnabled()) {
      // Use simulated data for development
      icanUser = ICANDevHelpers.simulateICANAccess(authStore.user)
      console.log('🔓 Using ICAN development bypass')
    } else {
      // Use real user data
      icanUser = {
        user_id: authStore.user.id,
        email: authStore.user.email,
        name: authStore.user.name || authStore.user.email.split('@')[0],
        role: authStore.user.role || 'user',
        branch: (authStore.user as any)?.branch || 'main',
        permissions: (authStore.user as any)?.permissions || ['read']
      }
    }

    // Step 4: Generate ICAN authentication URL
    const authUrl = await ICANSSOService.generateAuthURL(icanUser)
    icanUrl.value = authUrl

    console.log('✅ ICAN access initialized successfully')

  } catch (err: any) {
    console.error('❌ Failed to initialize ICAN access:', err)
    error.value = err.message || 'Failed to connect to ICAN Portal'
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle iframe load event
 */
const handleIframeLoad = () => {
  console.log('✅ ICAN iframe loaded successfully')
  isConnected.value = true
}

/**
 * Handle iframe error
 */
const handleIframeError = (event: Event) => {
  console.error('❌ ICAN iframe failed to load:', event)
  error.value = 'Failed to load ICAN Portal. Please check your connection and try again.'
  isConnected.value = false
}

/**
 * Handle back navigation
 */
const handleBack = () => {
  router.back()
}

/**
 * Format time for display
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Handle messages from ICAN iframe
 */
const handleIframeMessage = (event: MessageEvent) => {
  const message = ICANSSOService.handleICANMessage(event, import.meta.env.DEV ? 'localhost:4000' : 'your-ican-app.com')
  
  if (!message) return

  const { type, data } = message

  switch (type) {
    case 'ICAN_READY':
      console.log('✅ ICAN application ready')
      isConnected.value = true
      break
    
    case 'ICAN_ERROR':
      console.error('❌ ICAN error:', data)
      error.value = data.message || 'An error occurred in ICAN Portal'
      break
    
    case 'ICAN_LOGOUT':
      console.log('🔓 ICAN logout requested')
      router.push('/home')
      break

    case 'ICAN_RESIZE':
      // Handle iframe resize if needed
      console.log('📏 ICAN resize requested:', data)
      break
    
    default:
      console.log('📨 ICAN message:', type, data)
  }
}

// Lifecycle
onMounted(() => {
  initializeICANAccess()
  window.addEventListener('message', handleIframeMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleIframeMessage)
})
</script>

<style scoped>
.ican-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e7f0f7 100%);
}

.ican-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.security-badge svg {
  width: 16px;
  height: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 24px;
}

.loading-spinner {
  position: relative;
}

.spinner {
  width: 64px;
  height: 64px;
  border: 4px solid #e5e7eb;
  border-left-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  text-align: center;
}

.loading-text h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.loading-text p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 24px;
  padding: 48px;
  text-align: center;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: #ef4444;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-container h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.error-container p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  max-width: 400px;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.retry-btn svg {
  width: 18px;
  height: 18px;
}

.ican-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ican-app-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.ican-iframe {
  flex: 1;
  border: none;
  width: 100%;
  background: white;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  transition: all 0.3s ease;
}

.status-dot.active {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.connection-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.separator {
  color: #d1d5db;
}

/* Responsive Design */
@media (max-width: 768px) {
  .ican-header {
    padding: 12px 16px;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 13px;
  }

  .ican-app-wrapper {
    margin: 8px;
  }

  .status-bar {
    padding: 6px 16px;
    font-size: 11px;
  }

  .connection-info {
    display: none; /* Hide on mobile to save space */
  }
}
</style>