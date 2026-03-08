<template>
  <div class="generating-preview-container">
    <div class="generating-content">
      <!-- Loading Animation -->
      <div class="loading-animation">
        <div class="spinner-ring">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
        </div>
        <div class="magic-icon">
          <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
      </div>
      
      <!-- Status Message -->
      <div class="status-container">
        <h3 class="status-title">Creating Your Design</h3>
        <p class="status-message">{{ currentStep }}</p>
        
        <!-- Progress Bar -->
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <span class="progress-text">{{ progressPercent }}%</span>
        </div>
      </div>
      
      <!-- Design Details Preview -->
      <div v-if="designDetails" class="design-details-preview">
        <div v-if="designDetails.names && designDetails.names.length > 0" class="detail-item">
          <span class="detail-label">Names:</span>
          <span class="detail-value">{{ designDetails.names.join(' & ') }}</span>
        </div>
        <div v-if="designDetails.date" class="detail-item">
          <span class="detail-label">Date:</span>
          <span class="detail-value">{{ designDetails.date }}</span>
        </div>
        <div v-if="designDetails.category" class="detail-item">
          <span class="detail-label">Style:</span>
          <span class="detail-value">{{ designDetails.category }}</span>
        </div>
      </div>
      
      <!-- Tips -->
      <div class="generating-tips">
        <p class="tip-text">
          <svg class="tip-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ currentTip }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps<{
  progressPercent: number
  designDetails?: {
    names?: string[]
    date?: string
    category?: string
  }
}>()

// Steps based on progress
const currentStep = computed(() => {
  if (props.progressPercent < 20) return 'Analyzing your preferences...'
  if (props.progressPercent < 40) return 'Selecting the perfect template...'
  if (props.progressPercent < 60) return 'Applying colors and styles...'
  if (props.progressPercent < 80) return 'Adding your personalized details...'
  return 'Finalizing your design...'
})

// Rotating tips
const tips = [
  'Your design will be saved automatically',
  'You can edit any element after generation',
  'Try different categories for more options',
  'Voice commands make designing faster',
  'Upload photos to personalize your design'
]

const currentTipIndex = ref(0)
const currentTip = computed(() => tips[currentTipIndex.value])

let tipInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  tipInterval = setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % tips.length
  }, 4000)
})

onUnmounted(() => {
  if (tipInterval) {
    clearInterval(tipInterval)
  }
})
</script>

<style scoped>
.generating-preview-container {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.generating-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px;
  max-width: 400px;
  text-align: center;
}

/* Loading Animation */
.loading-animation {
  position: relative;
  width: 120px;
  height: 120px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
}

.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
}

.ring-1 {
  border-top-color: #667eea;
  animation: spin 1.5s linear infinite;
}

.ring-2 {
  inset: 10px;
  border-right-color: #764ba2;
  animation: spin 2s linear infinite reverse;
}

.ring-3 {
  inset: 20px;
  border-bottom-color: #f093fb;
  animation: spin 2.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.magic-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

.magic-icon svg {
  width: 48px;
  height: 48px;
  color: #667eea;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Status */
.status-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.status-message {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

/* Progress Bar */
.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 300px;
  margin-top: 8px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
  min-width: 40px;
}

/* Design Details Preview */
.design-details-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 12px;
  border: 1px solid #e0e5ff;
  width: 100%;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.detail-label {
  font-size: 0.875rem;
  color: #666;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

/* Tips */
.generating-tips {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fff9e6;
  border-radius: 8px;
  border: 1px solid #ffe066;
}

.tip-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #856404;
  margin: 0;
}

.tip-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Icon sizes */
.w-12 { width: 3rem; }
.h-12 { height: 3rem; }
</style>
