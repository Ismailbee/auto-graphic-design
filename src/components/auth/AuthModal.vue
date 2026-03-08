<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isAuthModalOpen" class="auth-modal-overlay" @click.self="closeAuthModal">
        <div class="auth-modal">
          <!-- Close Button -->
          <button class="auth-modal-close" @click="closeAuthModal" aria-label="Close">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Login View -->
          <LoginView v-if="authModalView === 'login'" />

          <!-- Register View -->
          <RegisterView v-else-if="authModalView === 'register'" />

          <!-- Forgot Password View -->
          <ForgotPasswordView v-else-if="authModalView === 'forgot-password'" />

          <!-- Reset Password View -->
          <ResetPasswordView v-else-if="authModalView === 'reset-password'" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const LoginView = defineAsyncComponent(() => import('./LoginView.vue'))
const RegisterView = defineAsyncComponent(() => import('./RegisterView.vue'))
const ForgotPasswordView = defineAsyncComponent(() => import('./ForgotPasswordView.vue'))
const ResetPasswordView = defineAsyncComponent(() => import('./ResetPasswordView.vue'))

const authStore = useAuthStore()
const { isAuthModalOpen, authModalView } = storeToRefs(authStore)
const { closeAuthModal } = authStore

// Prevent body scroll when modal is open
watch(isAuthModalOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  pointer-events: auto;
  /* Changed back to auto to allow clicking on modal */
}

.auth-modal {
  position: relative;
  background: white;
  pointer-events: auto;
  /* Ensure modal content is clickable */
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modal-slide-up 0.3s ease-out;
}

.auth-modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
  z-index: 10;
}

.auth-modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
  transform: rotate(90deg);
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .auth-modal,
.modal-fade-leave-active .auth-modal {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .auth-modal,
.modal-fade-leave-to .auth-modal {
  transform: translateY(20px) scale(0.95);
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Scrollbar */
.auth-modal::-webkit-scrollbar {
  width: 8px;
}

.auth-modal::-webkit-scrollbar-track {
  background: transparent;
}

.auth-modal::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.auth-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>

