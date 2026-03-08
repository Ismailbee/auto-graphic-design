<template>
  <Teleport to="body">
    <Transition name="notification-fade">
      <div v-if="show" class="notification-container">
        <div class="notification-card" :class="type">
          <!-- Success Icon with Animation -->
          <div class="icon-wrapper">
            <div class="icon-circle">
              <svg v-if="type === 'success'" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="type === 'error'" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg v-else class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Message -->
          <div class="message-wrapper">
            <h3 class="message-title">{{ title }}</h3>
            <p class="message-text">{{ message }}</p>
          </div>

          <!-- Close Button -->
          <button class="close-button" @click="close" aria-label="Close">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Progress Bar -->
          <div class="progress-bar" :style="{ width: progressWidth + '%' }"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  show: boolean
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 5000
})

const emit = defineEmits<{
  close: []
}>()

const progressWidth = ref(100)
let progressInterval: number | null = null

function close() {
  emit('close')
  if (progressInterval) {
    clearInterval(progressInterval)
  }
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    // Reset progress
    progressWidth.value = 100
    
    // Start progress animation
    const steps = 50
    const stepDuration = props.duration / steps
    let currentStep = 0
    
    if (progressInterval) {
      clearInterval(progressInterval)
    }
    
    progressInterval = window.setInterval(() => {
      currentStep++
      progressWidth.value = 100 - (currentStep / steps) * 100
      
      if (currentStep >= steps) {
        if (progressInterval) {
          clearInterval(progressInterval)
        }
        close()
      }
    }, stepDuration)
  } else {
    if (progressInterval) {
      clearInterval(progressInterval)
    }
  }
})
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 99999;
  pointer-events: none;
}

.notification-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 360px;
  max-width: 480px;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05);
  pointer-events: auto;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling */
  animation: slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-card.success {
  border-left: 4px solid #10b981;
}

.notification-card.error {
  border-left: 4px solid #ef4444;
}

.notification-card.info {
  border-left: 4px solid #3b82f6;
}

.icon-wrapper {
  flex-shrink: 0;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-card.success .icon-circle {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.notification-card.error .icon-circle {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.notification-card.info .icon-circle {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.icon {
  width: 28px;
  height: 28px;
  color: white;
  stroke-width: 2.5;
}

.message-wrapper {
  flex: 1;
  padding-top: 4px;
}

.message-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.message-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.close-button {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #4b5563;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  transition: width 0.1s linear;
}

.notification-card.success .progress-bar {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.notification-card.error .progress-bar {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.notification-card.info .progress-bar {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

/* Animations */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.notification-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-fade-leave-active {
  transition: all 0.3s ease-out;
}

.notification-fade-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-fade-leave-to {
  opacity: 0;
  transform: translateX(50%) scale(0.9);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .notification-container {
    top: 16px;
    right: 16px;
    left: 16px;
  }

  .notification-card {
    min-width: auto;
    width: 100%;
  }
}
</style>

