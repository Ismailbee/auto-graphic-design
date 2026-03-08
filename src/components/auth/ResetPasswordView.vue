<template>
  <div class="auth-view">
    <!-- Header -->
    <div class="auth-header">
      <div class="auth-icon">
        <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 class="auth-title">Reset Password</h2>
      <p class="auth-subtitle">Enter your reset token and new password</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="auth-error">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Reset Password Form -->
    <form @submit.prevent="handleResetPassword" class="auth-form">
      <!-- Reset Token -->
      <div class="form-group">
        <label for="token" class="form-label">Reset Token</label>
        <input
          id="token"
          v-model="formData.token"
          type="text"
          class="form-input"
          placeholder="Enter the reset token from your email"
          required
        />
      </div>

      <!-- New Password -->
      <div class="form-group">
        <label for="newPassword" class="form-label">New Password</label>
        <div class="password-input-wrapper">
          <input
            id="newPassword"
            v-model="formData.newPassword"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="Min. 8 characters"
            required
            autocomplete="new-password"
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

      <!-- Confirm Password -->
      <div class="form-group">
        <label for="confirmPassword" class="form-label">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          class="form-input"
          placeholder="Re-enter your password"
          required
          autocomplete="new-password"
        />
        <p v-if="confirmPassword && !passwordsMatch" class="error-text">
          Passwords do not match
        </p>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn-primary" :disabled="isLoading || !passwordsMatch || !formData.newPassword">
        <span v-if="!isLoading">Reset Password</span>
        <span v-else class="loading-spinner">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Resetting...
        </span>
      </button>
    </form>

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
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { PasswordResetConfirm } from '@/types/auth'

const authStore = useAuthStore()
const { isLoading, error, resetToken } = storeToRefs(authStore)
const { confirmPasswordReset, setAuthModalView, clearError } = authStore

const formData = ref<PasswordResetConfirm>({
  token: '',
  newPassword: ''
})

const confirmPassword = ref('')
const showPassword = ref(false)

const passwordsMatch = computed(() => {
  return formData.value.newPassword === confirmPassword.value
})

// Pre-fill token if available from store
onMounted(() => {
  if (resetToken.value) {
    formData.value.token = resetToken.value
  }
})

async function handleResetPassword() {
  clearError()
  if (!passwordsMatch.value) {
    return
  }
  try {
    await confirmPasswordReset(formData.value)
    // Success - modal will switch to login view
  } catch (err) {
    // Error is handled by store
  }
}
</script>

<style scoped>
@import './auth-styles.css';

.error-text {
  margin-top: 6px;
  font-size: 13px;
  color: #ef4444;
}
</style>

