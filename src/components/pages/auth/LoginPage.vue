<template>
  <ion-page>
    <ion-content>
      <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-contrast px-4 py-12">
        <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div class="flex flex-col items-center mb-6">
            <img src="/image/logoauto.png" alt="Golden Printer Logo" class="w-20 h-20 rounded-full mb-2 shadow" />
            <h1 class="text-2xl font-bold text-primary mb-1">Sign In to Golden Printer</h1>
            <p class="text-gray-500 text-sm">Welcome back! Please login to your account.</p>
          </div>
          <form @submit.prevent="handleLogin" class="space-y-5">
            <ion-item lines="none" class="rounded-lg bg-gray-50">
              <ion-label position="floating">Email</ion-label>
              <ion-input v-model="email" type="email" required autocomplete="username" />
            </ion-item>
            <ion-item lines="none" class="rounded-lg bg-gray-50">
              <ion-label position="floating">Password</ion-label>
              <ion-input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
              />
              <ion-icon
                slot="end"
                :icon="showPassword ? 'eye-off-outline' : 'eye-outline'"
                class="cursor-pointer text-xl text-gray-400"
                @click="showPassword = !showPassword"
              />
            </ion-item>
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" v-model="rememberMe" class="accent-primary" />
                Remember me
              </label>
              <a href="/forgot-password" class="text-xs text-contrast hover:underline">Forgot password?</a>
            </div>
            <ion-button
              expand="block"
              color="primary"
              type="submit"
              :disabled="loading"
              class="mt-2"
            >
              <ion-spinner v-if="loading" name="crescent" class="mr-2" />
              Login
            </ion-button>
          </form>
          <div v-if="error" class="text-red-600 text-sm mt-3 text-center">{{ error }}</div>
          <div class="mt-6 text-center text-sm text-gray-600">
            Don't have an account?
            <a href="/signup" class="text-contrast font-semibold hover:underline">Sign Up</a>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue'
import { useIonRouter } from '@ionic/vue'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')
const ionRouter = useIonRouter()

async function handleLogin() {
  error.value = ''
  loading.value = true

  // Simulate API call (replace with your real authentication logic)
  await new Promise(resolve => setTimeout(resolve, 1200))

  // Example: hardcoded user for demo
  if (email.value === 'user@example.com' && password.value === 'password123') {
    // Optionally store token or user info here
    if (rememberMe.value) {
      localStorage.setItem('user', email.value)
    }
    ionRouter.push('/home')
  } else {
    error.value = 'Invalid email or password'
  }
  loading.value = false
}
</script>

<style scoped>
.bg-primary {
  background-color: #502800;
}
.bg-contrast {
  background-color: #BA6900;
}
</style>