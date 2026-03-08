<template>
  <div class="auth-view">
    <!-- Header -->
    <div class="auth-header">
      <div class="auth-logo">
        <div class="logo-gradient">
          <svg class="logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
      </div>
      <h2 class="auth-title">Welcome Back!</h2>
      <p class="auth-subtitle">Sign in to access your design studio</p>
    </div>

    <!-- Auth Initializing Message -->
    <div v-if="!isAuthReady" class="auth-initializing">
      <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Connecting to authentication service...</span>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="auth-error">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="auth-form">
      <!-- Email -->
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          class="form-input"
          placeholder="your@email.com"
          required
          autocomplete="email"
        />
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <div class="password-input-wrapper">
          <input
            id="password"
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
            aria-label="Toggle password visibility"
          >
            <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="form-row">
        <label class="checkbox-label">
          <input v-model="formData.rememberMe" type="checkbox" class="checkbox-input" />
          <span>Remember me</span>
        </label>
        <button type="button" class="link-button" @click="setAuthModalView('forgot-password')">
          Forgot password?
        </button>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn-primary" :disabled="isFormDisabled">
        <span v-if="!isLoading">
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {{ isAuthReady ? 'Sign In' : 'Please wait...' }}
        </span>
        <span v-else class="loading-spinner">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </span>
      </button>

      <!-- Testing Bypass Button (for network issues) -->
      <button type="button" class="btn-secondary" @click="handleTestingBypass" style="margin-top: 8px;">
        🔧 Testing Mode (Bypass Auth)
      </button>
    </form>

    <!-- Divider -->
    <div class="divider">
      <span>OR CONTINUE WITH</span>
    </div>

    <!-- Google Sign In -->
    <button type="button" class="btn-google" @click="handleGoogleSignIn" :disabled="isFormDisabled">
      <svg class="google-icon" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Continue with Google</span>
    </button>

    <!-- Register Link -->
    <div class="auth-footer">
      <p>
        Don't have an account?
        <button type="button" class="link-button-primary" @click="setAuthModalView('register')">
          Create account
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { LoginData } from '@/types/auth'


const authStore = useAuthStore()
const { isLoading, error, isAuthReady } = storeToRefs(authStore)
const { loginUser, setAuthModalView, clearError, bypassAuthForTesting } = authStore

const formData = ref<LoginData>({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)

// Disable form while auth is initializing or during loading
const isFormDisabled = computed(() => !isAuthReady.value || isLoading.value)

async function handleLogin() {
  // Prevent login if auth not ready
  if (!isAuthReady.value) {
    console.warn('⚠️ Cannot login: Firebase auth not ready yet')
    return
  }

  clearError()
  try {
    await loginUser(formData.value)
  } catch (err) {
    // Error is handled by store
  }
}

function handleTestingBypass() {
  console.log('🔧 Using testing bypass due to network issues...')
  bypassAuthForTesting()
}

async function handleGoogleSignIn() {
  // Prevent login if auth not ready
  if (!isAuthReady.value) {
    console.warn('⚠️ Cannot login: Firebase auth not ready yet')
    return
  }

  clearError()
  try {
    await authStore.loginWithGoogle()
  } catch (err) {
    // Error is handled by store
  }
}
</script>

<style scoped>
@import './auth-styles.css';
</style>

