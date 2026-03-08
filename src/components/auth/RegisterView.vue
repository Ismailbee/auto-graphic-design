<template>
  <div class="auth-view">
    <!-- Header -->
    <div class="auth-header">
      <div class="auth-icon">
        <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </div>
      <h2 class="auth-title">Create Account</h2>
      <p class="auth-subtitle">Start your design journey today</p>
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

    <!-- Register Form -->
    <form @submit.prevent="handleRegister" class="auth-form">
      <!-- Name Row -->
      <div class="form-row-grid">
        <div class="form-group">
          <label for="firstName" class="form-label">First Name</label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            class="form-input"
            placeholder="John"
            autocomplete="given-name"
          />
        </div>
        <div class="form-group">
          <label for="lastName" class="form-label">Last Name</label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            class="form-input"
            placeholder="Doe"
            autocomplete="family-name"
          />
        </div>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email" class="form-label">Email *</label>
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

      <!-- Username -->
      <div class="form-group">
        <label for="username" class="form-label">Username (optional)</label>
        <input
          id="username"
          v-model="formData.username"
          type="text"
          class="form-input"
          placeholder="johndoe"
          autocomplete="username"
        />
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password" class="form-label">Password *</label>
        <div class="password-input-wrapper">
          <input
            id="password"
            v-model="formData.password"
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
        <!-- Password Strength Indicator -->
        <div v-if="formData.password" class="password-strength">
          <div class="password-strength-bar">
            <div
              class="password-strength-fill"
              :class="passwordStrengthClass"
              :style="{ width: passwordStrengthPercent + '%' }"
            ></div>
          </div>
          <span class="password-strength-text" :class="passwordStrengthClass">
            {{ passwordStrengthText }}
          </span>
        </div>
      </div>

      <!-- Password Requirements -->
      <div class="password-requirements">
        <p class="requirements-title">Password must contain:</p>
        <ul class="requirements-list">
          <li :class="{ valid: hasMinLength }">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            At least 8 characters
          </li>
          <li :class="{ valid: hasUppercase }">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            One uppercase letter
          </li>
          <li :class="{ valid: hasLowercase }">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            One lowercase letter
          </li>
          <li :class="{ valid: hasNumber }">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            One number
          </li>
          <li :class="{ valid: hasSpecialChar }">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            One special character
          </li>
        </ul>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn-primary" :disabled="isFormDisabled || !isPasswordValid">
        <span v-if="!isLoading">{{ isAuthReady ? 'Create Account' : 'Please wait...' }}</span>
        <span v-else class="loading-spinner">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating account...
        </span>
      </button>
    </form>

    <!-- Divider -->
    <div class="divider">
      <span>or</span>
    </div>

    <!-- Login Link -->
    <div class="auth-footer">
      <p>
        Already have an account?
        <button type="button" class="link-button-primary" @click="setAuthModalView('login')">
          Sign in
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { RegisterData } from '@/types/auth'

const authStore = useAuthStore()
const { isLoading, error, isAuthReady } = storeToRefs(authStore)
const { registerUser, setAuthModalView, clearError } = authStore

const formData = ref<RegisterData>({
  email: '',
  password: '',
  username: '',
  firstName: '',
  lastName: ''
})

const showPassword = ref(false)

// Disable form while auth is initializing or during loading
const isFormDisabled = computed(() => !isAuthReady.value || isLoading.value)

// Password validation
const hasMinLength = computed(() => formData.value.password.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(formData.value.password))
const hasLowercase = computed(() => /[a-z]/.test(formData.value.password))
const hasNumber = computed(() => /\d/.test(formData.value.password))
const hasSpecialChar = computed(() => /[@$!%*?&]/.test(formData.value.password))

const isPasswordValid = computed(() => {
  return hasMinLength.value && hasUppercase.value && hasLowercase.value && hasNumber.value && hasSpecialChar.value
})

const passwordStrength = computed(() => {
  let strength = 0
  if (hasMinLength.value) strength++
  if (hasUppercase.value) strength++
  if (hasLowercase.value) strength++
  if (hasNumber.value) strength++
  if (hasSpecialChar.value) strength++
  return strength
})

const passwordStrengthPercent = computed(() => (passwordStrength.value / 5) * 100)

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value <= 2) return 'weak'
  if (passwordStrength.value <= 4) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value <= 2) return 'Weak'
  if (passwordStrength.value <= 4) return 'Medium'
  return 'Strong'
})

async function handleRegister() {
  // Prevent registration if auth not ready
  if (!isAuthReady.value) {
    console.warn('⚠️ Cannot register: Firebase auth not ready yet')
    return
  }

  clearError()
  if (!isPasswordValid.value) {
    return
  }
  try {
    await registerUser(formData.value)
  } catch (err) {
    // Error is handled by store
  }
}
</script>

<style scoped>
@import './auth-styles.css';
</style>

