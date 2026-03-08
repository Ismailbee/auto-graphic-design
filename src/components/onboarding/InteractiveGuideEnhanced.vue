<template>
  <Teleport to="body">
    <!-- Floating Help Button -->
    <button 
      v-if="!isActive && showHelpButton" 
      @click="toggleHelpMode" 
      class="floating-help-button"
      :class="{ 'help-active': helpModeActive, 'pulse-animation': helpModeActive && isFirstTimeUser }"
      :title="helpModeActive ? 'Help Mode Active - Click to Disable' : 'Click for Help Mode (Press ? key)'"
    >
      <span v-if="!helpModeActive">?</span>
      <span v-else>✓</span>
    </button>
    
    <!-- Help Mode Indicator Banner -->
    <Transition name="slide-down">
      <div v-if="helpModeActive && !isActive" class="help-mode-banner">
        <div class="banner-content">
          <span class="banner-icon">💡</span>
          <span class="banner-text">Help Mode Active - Click on any element to learn more</span>
          <button @click="toggleHelpMode" class="banner-close">✕</button>
        </div>
      </div>
    </Transition>

    <!-- Pointing Hand for New Users -->
    <Transition name="fade">
      <div v-if="helpModeActive && isFirstTimeUser && !isActive && !hasClickedElement" class="pointing-hand">
        <svg class="hand-icon" viewBox="0 0 64 64" width="48" height="48">
          <g transform="translate(0, 0)">
            <!-- Hand pointing -->
            <path d="M25 15 L35 25 L30 30 L35 35 L30 40 L25 45 L20 50 L10 45 L8 40 L10 35 L15 30 L10 25 L15 20 Z" 
                  fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
            <!-- Finger -->
            <path d="M35 25 L40 20 L42 18 L43 20 L41 23 L35 30 Z" 
                  fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
            <!-- Sparkles -->
            <circle cx="48" cy="15" r="2" fill="#FFD700" class="sparkle sparkle-1"/>
            <circle cx="45" cy="10" r="1.5" fill="#FFA500" class="sparkle sparkle-2"/>
            <circle cx="52" cy="12" r="1.5" fill="#FFD700" class="sparkle sparkle-3"/>
          </g>
        </svg>
        <div class="pointing-text">👆 Click anything to learn!</div>
      </div>
    </Transition>

    <!-- Click Explanation Tooltip -->
    <Transition name="tooltip-fade">
      <div v-if="showClickExplanation" class="click-explanation-tooltip" :style="tooltipStyle">
        <div class="tooltip-header">
          <span class="tooltip-icon">💡</span>
          <h4 class="tooltip-title">{{ clickExplanation.title }}</h4>
          <button @click="closeExplanation" class="tooltip-close">×</button>
        </div>
        <div class="tooltip-content">
          <p class="tooltip-description">{{ clickExplanation.description }}</p>
          <div v-if="clickExplanation.example" class="tooltip-example">
            <strong>Example:</strong>
            <code>{{ clickExplanation.example }}</code>
          </div>
          <div v-if="clickExplanation.tips && clickExplanation.tips.length > 0" class="tooltip-tips">
            <strong>💡 Tips:</strong>
            <ul>
              <li v-for="(tip, index) in clickExplanation.tips" :key="index">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="isActive" class="interactive-guide-overlay">
      <!-- Backdrop -->
      <div class="guide-backdrop" @click="handleBackdropClick"></div>

      <!-- Hand Icon -->
      <div 
        class="hand-pointer"
        :class="{ 'animate-bounce': true }"
        :style="{ 
          top: pointerPosition.y + 'px', 
          left: pointerPosition.x + 'px',
          transform: `rotate(${pointerRotation}deg)`
        }"
      >
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 13.5V4.5C8 3.11929 9.11929 2 10.5 2C11.8807 2 13 3.11929 13 4.5V12H14.5V5.5C14.5 4.11929 15.6193 3 17 3C18.3807 3 19.5 4.11929 19.5 5.5V15.5C19.5 19.0899 16.5899 22 13 22C9.41015 22 6.5 19.0899 6.5 15.5V10.5C6.5 9.11929 7.61929 8 9 8C9.46472 8 9.89306 8.12676 10.2676 8.34824" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="white"/>
        </svg>
      </div>

      <!-- Message Box -->
      <div 
        class="guide-message-box"
        :style="{ 
          top: messagePosition.y + 'px', 
          left: messagePosition.x + 'px' 
        }"
      >
        <div class="message-header">
          <span class="step-indicator">Step {{ currentStepIndex + 1 }}/{{ steps.length }}</span>
          <div class="voice-controls">
            <button @click="() => speak(currentStep.message)" class="voice-btn" title="Replay">
              <span>🔁</span>
            </button>
            <button @click="toggleVoice" class="voice-btn" :class="{ 'active': isVoiceEnabled }" title="Toggle Voice">
              <span v-if="isVoiceEnabled">🔊</span>
              <span v-else>🔇</span>
            </button>
          </div>
        </div>
        
        <div class="message-content">
          <p v-html="currentStep.message"></p>
        </div>
        
        <div class="guide-controls">
          <button @click="skipGuide" class="skip-btn">Skip Tutorial</button>
          <button @click="nextStep" class="next-btn">
            {{ isLastStep ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getExplanationForElement, type ElementExplanation } from '@/config/elementExplanations'

interface Step {
  target: string
  message: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = defineProps<{
  steps: Step[]
  startDelay?: number
  showHelpButton?: boolean
}>()

const emit = defineEmits(['complete', 'skip', 'helpModeToggle'])

const isActive = ref(false)
const currentStepIndex = ref(0)
const isVoiceEnabled = ref(true)
const pointerPosition = ref({ x: 0, y: 0 })
const messagePosition = ref({ x: 0, y: 0 })
const pointerRotation = ref(0)

// Help Mode state - Auto-enable for first-time users
const helpModeActive = ref(false)
const showClickExplanation = ref(false)
const clickExplanation = ref<ElementExplanation>({
  title: '',
  description: '',
  example: '',
  tips: []
})
const tooltipStyle = ref({})
const clickTimeout = ref<number | null>(null)
const isFirstTimeUser = ref(false)
const hasClickedElement = ref(false)

const currentStep = computed(() => props.steps[currentStepIndex.value])
const isLastStep = computed(() => currentStepIndex.value === props.steps.length - 1)

// Speech Synthesis - with safe initialization
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
let utterance: SpeechSynthesisUtterance | null = null
const voicesLoaded = ref(false)

// Load voices
const loadVoices = () => {
  return new Promise<void>((resolve) => {
    if (!synth) {
      resolve()
      return
    }
    const voices = synth?.getVoices() || []
    if (voices.length > 0) {
      voicesLoaded.value = true
      resolve()
    } else {
      // Wait for voices to load
      synth?.addEventListener('voiceschanged', () => {
        voicesLoaded.value = true
        resolve()
      }, { once: true })
      
      // Fallback timeout
      setTimeout(() => {
        voicesLoaded.value = true
        resolve()
      }, 1000)
    }
  })
}

const speak = (text: string) => {
  if (!isVoiceEnabled.value || !synth) return
  
  // Check if another component is using speech (e.g., wedding chat)
  // Don't speak if the wedding sticker panel chat is active
  const weddingChatActive = document.querySelector('.wedding-chat-interface')
  if (weddingChatActive) {
    console.log('🔇 InteractiveGuide: Skipping speech - wedding chat is active')
    return
  }
  
  // Cancel any current speech
  synth?.cancel()
  
  // Strip HTML tags from text
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  
  utterance = new SpeechSynthesisUtterance(cleanText)
  utterance.rate = 0.9
  utterance.pitch = 1
  utterance.volume = 1
  
  // Try to select a good voice
  const voices = synth?.getVoices() || []
  if (voices.length > 0) {
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Google') || voice.name.includes('Natural'))
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0]
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
      console.log('🔊 Using voice:', preferredVoice.name)
    }
  }
  
  synth?.speak(utterance)
  console.log('🔊 Speaking:', cleanText.substring(0, 50) + '...')
}

const toggleVoice = () => {
  isVoiceEnabled.value = !isVoiceEnabled.value
  if (!isVoiceEnabled.value && synth) {
    synth?.cancel()
  } else {
    speak(currentStep.value.message)
  }
}

const updatePositions = () => {
  if (!isActive.value) return

  const targetEl = document.querySelector(currentStep.value.target)
  if (!targetEl) {
    console.warn(`Target element not found: ${currentStep.value.target}`)
    return
  }

  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const rect = targetEl.getBoundingClientRect()
  const position = currentStep.value.position || 'bottom'
  
  let ptrX = rect.left + rect.width / 2
  let ptrY = rect.top + rect.height / 2
  let msgX = rect.left
  let msgY = rect.bottom + 20
  let rotation = 0

  switch (position) {
    case 'top':
      ptrX = rect.left + rect.width / 2 - 30
      ptrY = rect.top - 70
      msgX = rect.left
      msgY = rect.top - 180
      rotation = 180
      break
    case 'bottom':
      ptrX = rect.left + rect.width / 2 - 30
      ptrY = rect.bottom + 10
      msgX = rect.left
      msgY = rect.bottom + 80
      rotation = 0
      break
    case 'left':
      ptrX = rect.left - 70
      ptrY = rect.top + rect.height / 2 - 30
      msgX = rect.left - 320
      msgY = rect.top
      rotation = 90
      break
    case 'right':
      ptrX = rect.right + 10
      ptrY = rect.top + rect.height / 2 - 30
      msgX = rect.right + 80
      msgY = rect.top
      rotation = -90
      break
  }

  const msgWidth = 300
  const msgHeight = 150
  const padding = 20

  if (msgX + msgWidth > window.innerWidth) msgX = window.innerWidth - msgWidth - padding
  if (msgX < padding) msgX = padding
  if (msgY + msgHeight > window.innerHeight) msgY = window.innerHeight - msgHeight - padding
  if (msgY < padding) msgY = padding

  pointerPosition.value = { x: ptrX, y: ptrY }
  messagePosition.value = { x: msgX, y: msgY }
  pointerRotation.value = rotation
}

const nextStep = () => {
  if (isLastStep.value) {
    completeGuide()
  } else {
    currentStepIndex.value++
  }
}

const skipGuide = () => {
  isActive.value = false
  if (synth) synth.cancel()
  localStorage.setItem('hasSeenGuide', 'true')
  
  // After skipping the guide, still auto-enable help mode for first-time users
  if (isFirstTimeUser.value) {
    setTimeout(() => {
      helpModeActive.value = true
      speak('Help mode is now active. Click on any element to learn more about it. You can disable help mode anytime by pressing the question mark button.')
    }, 500)
  }
  
  emit('skip')
}

const completeGuide = () => {
  isActive.value = false
  if (synth) synth.cancel()
  localStorage.setItem('hasSeenGuide', 'true')
  
  // After completing the guide, auto-enable help mode for first-time users
  if (isFirstTimeUser.value) {
    setTimeout(() => {
      helpModeActive.value = true
      speak('Help mode is now active. Click on any element to learn more about it. You can disable help mode anytime by pressing the question mark button or the question key.')
    }, 1000)
  }
  
  emit('complete')
}

const startGuide = async () => {
  const hasSeen = localStorage.getItem('hasSeenGuide')
  
  // Check if first time user
  if (!hasSeen) {
    isFirstTimeUser.value = true
  }
  
  if (hasSeen) return

  // Load voices first
  await loadVoices()

  setTimeout(() => {
    isActive.value = true
    setTimeout(() => {
      updatePositions()
      speak(currentStep.value.message)
    }, 100)
  }, props.startDelay || 1000)
}

// Help Mode Functions
const toggleHelpMode = () => {
  helpModeActive.value = !helpModeActive.value
  emit('helpModeToggle', helpModeActive.value)
  
  if (helpModeActive.value) {
    speak('Help mode activated. Click on any element to learn more about it.')
  } else {
    speak('Help mode deactivated.')
    showClickExplanation.value = false
  }
}

const handleElementClick = (event: MouseEvent) => {
  if (!helpModeActive.value) return
  
  const target = event.target as HTMLElement
  const explanation = getExplanationForElement(target)
  
  if (explanation) {
    event.preventDefault()
    event.stopPropagation()
    
    // Mark that user has clicked an element (hide pointing hand)
    if (isFirstTimeUser.value && !hasClickedElement.value) {
      hasClickedElement.value = true
    }
    
    clickExplanation.value = explanation
    showClickExplanation.value = true
    
    // Position tooltip near clicked element
    const rect = target.getBoundingClientRect()
    tooltipStyle.value = {
      top: `${rect.bottom + 10}px`,
      left: `${Math.min(rect.left, window.innerWidth - 400)}px`,
      maxWidth: '400px'
    }
    
    // Speak explanation
    if (isVoiceEnabled.value) {
      const fullText = `${explanation.title}. ${explanation.description}${explanation.example ? `. Example: ${explanation.example}` : ''}`
      speak(fullText)
    }
    
    // Auto-close after 15 seconds
    if (clickTimeout.value) clearTimeout(clickTimeout.value)
    clickTimeout.value = window.setTimeout(() => {
      showClickExplanation.value = false
    }, 15000)
  }
}

const closeExplanation = () => {
  showClickExplanation.value = false
  if (clickTimeout.value) {
    clearTimeout(clickTimeout.value)
    clickTimeout.value = null
  }
}

const handleBackdropClick = () => {
  // Backdrop click does nothing during guide
}

// Keyboard shortcuts
const handleKeyPress = (event: KeyboardEvent) => {
  // Toggle help mode with '?' key
  if (event.key === '?' && !isActive.value) {
    event.preventDefault()
    toggleHelpMode()
  }
  
  // Close explanation with Escape
  if (event.key === 'Escape' && showClickExplanation.value) {
    closeExplanation()
  }
}

watch(currentStepIndex, () => {
  setTimeout(() => {
    updatePositions()
    speak(currentStep.value.message)
  }, 500)
})

onMounted(async () => {
  // Load voices on mount
  await loadVoices()
  
  startGuide()
  window.addEventListener('resize', updatePositions)
  window.addEventListener('scroll', updatePositions)
  window.addEventListener('click', handleElementClick, true)
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  if (synth) synth.cancel()
  window.removeEventListener('resize', updatePositions)
  window.removeEventListener('scroll', updatePositions)
  window.removeEventListener('click', handleElementClick, true)
  window.removeEventListener('keydown', handleKeyPress)
  
  if (clickTimeout.value) {
    clearTimeout(clickTimeout.value)
  }
})
</script>

<style scoped>
/* Floating Help Button */
.floating-help-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-help-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5);
}

.floating-help-button.help-active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.floating-help-button.pulse-animation {
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7),
                0 8px 24px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(16, 185, 129, 0),
                0 8px 24px rgba(16, 185, 129, 0.4);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0),
                0 8px 24px rgba(16, 185, 129, 0.4);
  }
}

/* Help Mode Banner */
.help-mode-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 12px 20px;
  z-index: 9997;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.banner-icon {
  font-size: 20px;
  animation: bounce-icon 2s ease-in-out infinite;
}

@keyframes bounce-icon {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.banner-text {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.banner-close {
  position: absolute;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.banner-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Pointing Hand Animation */
.pointing-hand {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9996;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: float-hand 3s ease-in-out infinite;
  pointer-events: none;
}

.hand-icon {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: point-hand 1.5s ease-in-out infinite;
}

.pointing-text {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.4);
  white-space: nowrap;
  animation: pulse-text 2s ease-in-out infinite;
}

@keyframes float-hand {
  0%, 100% {
    transform: translate(-50%, -50%);
  }
  50% {
    transform: translate(-50%, -55%);
  }
}

@keyframes point-hand {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-10deg) scale(1.05);
  }
  75% {
    transform: rotate(10deg) scale(1.05);
  }
}

@keyframes pulse-text {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.sparkle {
  animation: sparkle-twinkle 1.5s ease-in-out infinite;
}

.sparkle-1 {
  animation-delay: 0s;
}

.sparkle-2 {
  animation-delay: 0.3s;
}

.sparkle-3 {
  animation-delay: 0.6s;
}

@keyframes sparkle-twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.5);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Click Explanation Tooltip */
.click-explanation-tooltip {
  position: fixed;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 10002;
  max-width: 450px;
  pointer-events: auto;
  border: 2px solid #6366f1;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border-radius: 14px 14px 0 0;
}

.tooltip-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.tooltip-title {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.tooltip-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.tooltip-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.tooltip-content {
  padding: 20px;
}

.tooltip-description {
  margin: 0 0 16px 0;
  color: #374151;
  font-size: 15px;
  line-height: 1.6;
}

.tooltip-example {
  background: #f9fafb;
  border-left: 4px solid #6366f1;
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: 8px;
}

.tooltip-example strong {
  display: block;
  color: #6366f1;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tooltip-example code {
  display: block;
  background: white;
  padding: 10px 12px;
  border-radius: 6px;
  color: #1f2937;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.tooltip-tips {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.tooltip-tips strong {
  display: block;
  color: #f59e0b;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tooltip-tips ul {
  margin: 0;
  padding-left: 20px;
}

.tooltip-tips li {
  color: #78350f;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 6px;
}

.tooltip-tips li:last-child {
  margin-bottom: 0;
}

/* Tooltip Fade Animation */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.interactive-guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  pointer-events: none;
}

.guide-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

.hand-pointer {
  position: absolute;
  width: 60px;
  height: 60px;
  z-index: 100001;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(var(--rotation)); }
  50% { transform: translateY(-10px) rotate(var(--rotation)); }
}

.guide-message-box {
  position: absolute;
  width: 300px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 100001;
  pointer-events: auto;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  border: 2px solid #6366f1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.step-indicator {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.voice-controls {
  display: flex;
  gap: 4px;
  align-items: center;
}

.voice-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 6px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.voice-btn:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

.message-content p {
  margin: 0 0 20px 0;
  color: #1f2937;
  font-size: 1rem;
  line-height: 1.5;
}

.guide-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skip-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.skip-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.next-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
}

.next-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px rgba(99, 102, 241, 0.4);
}

.next-btn:active {
  transform: translateY(0);
}
</style>
