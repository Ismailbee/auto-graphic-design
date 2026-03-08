<template>
  <div class="auth-view">
    <!-- Header -->
    <div class="auth-header">
      <div class="auth-icon">
        <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      </div>
      <h2 class="auth-title">Forgot Password?</h2>
      <p class="auth-subtitle">Enter your email to receive a reset link</p>
    </div>

    <!-- Success Message -->
    <div v-if="resetSent" class="auth-success">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p class="font-semibold">Reset link sent!</p>
        <p class="text-sm mt-1">Check your email for the password reset link.</p>
        <!-- Development only: Show token -->
        <div v-if="devResetToken" class="dev-token">
          <p class="text-xs font-semibold mt-2">Development Mode - Reset Token:</p>
          <code class="text-xs">{{ devResetToken }}</code>
          <button type="button" class="copy-token-btn" @click="copyToken">
            Copy Token
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="auth-error">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Forgot Password Form -->
    <form v-if="!resetSent" @submit.prevent="handleForgotPassword" class="auth-form">
      <!-- Email -->
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="form-input"
          placeholder="your@email.com"
          required
          autocomplete="email"
        />
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn-primary" :disabled="isLoading">
        <span v-if="!isLoading">Send Reset Link</span>
        <span v-else class="loading-spinner">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sending...
        </span>
      </button>
    </form>

    <!-- Reset Password Button (if token received) -->
    <div v-if="resetSent && devResetToken" class="mt-4">
      <button type="button" class="btn-secondary" @click="goToResetPassword">
        Enter Reset Token
      </button>
    </div>

    <!-- Divider -->
    <div class="divider">
      <span>or</span>
    </div>

    <!-- Back to Login -->
    <div class="auth-footer">
      <p>
        Remember your password?
        <button type="button" class="link-button-primary" @click="setAuthModalView('login')">
          Sign in
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { isLoading, error, resetToken } = storeToRefs(authStore)
const { requestPasswordReset, setAuthModalView, clearError } = authStore

const email = ref('')
const resetSent = ref(false)
const devResetToken = ref<string | undefined>(undefined)

async function handleForgotPassword() {
  clearError()
  try {
    const token = await requestPasswordReset({ email: email.value })
    resetSent.value = true
    devResetToken.value = token
  } catch (err) {
    // Error is handled by store
  }
}

function goToResetPassword() {
  setAuthModalView('reset-password')
}

async function copyToken() {
  if (devResetToken.value) {
    try {
      await navigator.clipboard.writeText(devResetToken.value)
      alert('Token copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy token:', err)
    }
  }
}
</script>

<style scoped>
@import './auth-styles.css';

.dev-token {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  border: 1px dashed rgba(0, 0, 0, 0.2);
}

.dev-token code {
  display: block;
  margin-top: 4px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  word-break: break-all;
  font-family: 'Courier New', monospace;
}

.copy-token-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-token-btn:hover {
  background: #5568d3;
}

.btn-secondary {
  width: 100%;
  padding: 14px 24px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f7f8ff;
  transform: translateY(-1px);
}
</style>

