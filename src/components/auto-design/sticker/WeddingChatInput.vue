<template>
  <div class="chat-input-area">
    <div class="input-container" :class="{ 'listening': isListening }">
      <!-- Attachment -->
      <div class="attachment-wrapper">
        <button @click="toggleUpload" class="input-btn attachment-btn" :class="{ active: showUploadMenu }">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <Transition name="popup">
          <div v-if="showUploadMenu" class="upload-menu">
            <button @click="handleUpload('gallery')" class="upload-option">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Gallery</span>
            </button>
            <button @click="handleUpload('camera')" class="upload-option">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              <span>Camera</span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Input -->
      <input
        ref="inputRef"
        v-model="inputText"
        @keydown.enter.prevent="handleSend"
        type="text"
        :placeholder="placeholder"
        class="text-input"
      />

      <!-- Voice -->
      <button 
        v-if="isSupported"
        @click="toggleVoice"
        class="input-btn voice-btn"
        :class="{ recording: isListening }"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </button>

      <!-- Send -->
      <button @click="handleSend" class="input-btn send-btn" :disabled="!canSend" :class="{ active: canSend }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>

    <div v-if="voiceError" class="voice-error">{{ voiceError }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'

// Props
const props = defineProps<{
  modelValue: string
  showPreview?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
  (e: 'upload', type: string): void
}>()

// Refs
const inputRef = ref<HTMLInputElement | null>(null)
const inputText = ref(props.modelValue)
const showUploadMenu = ref(false)
let speechRecognition: any = null

// Voice state
const isListening = ref(false)
const voiceError = ref<string | null>(null)
const isSupported = typeof window !== 'undefined' && 
  ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

// Computed
const canSend = computed(() => inputText.value.trim().length > 0)

const placeholder = computed(() => {
  if (props.showPreview) return 'Make changes to your design...'
  return 'Describe your wedding sticker...'
})

// Start Voice
function startVoice() {
  if (!isSupported) {
    voiceError.value = 'Speech not supported'
    setTimeout(() => voiceError.value = null, 3000)
    return
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  speechRecognition = new SpeechRecognition()
  speechRecognition.continuous = false
  speechRecognition.interimResults = true
  speechRecognition.lang = 'en-US'

  speechRecognition.onstart = () => {
    isListening.value = true
    voiceError.value = null
  }

  speechRecognition.onresult = (event: any) => {
    let transcript = ''
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript
    }
    inputText.value = transcript
    emit('update:modelValue', transcript)
  }

  speechRecognition.onerror = (event: any) => {
    isListening.value = false
    if (event.error === 'no-speech') {
      voiceError.value = 'No speech detected'
    } else if (event.error === 'not-allowed') {
      voiceError.value = 'Microphone access denied'
    } else {
      voiceError.value = 'Voice error'
    }
    setTimeout(() => voiceError.value = null, 3000)
  }

  speechRecognition.onend = () => {
    isListening.value = false
  }

  speechRecognition.start()
}

// Stop Voice
function stopVoice() {
  if (speechRecognition) {
    speechRecognition.stop()
    speechRecognition = null
  }
  isListening.value = false
}

// Toggle Voice
function toggleVoice() {
  if (isListening.value) {
    stopVoice()
  } else {
    startVoice()
  }
}

// Send
function handleSend() {
  if (!canSend.value) return
  emit('send')
  inputText.value = ''
}

// Upload
function toggleUpload() {
  showUploadMenu.value = !showUploadMenu.value
}

function handleUpload(type: string) {
  showUploadMenu.value = false
  emit('upload', type)
}

// Sync
watch(() => props.modelValue, (val) => {
  if (val !== inputText.value) inputText.value = val
})

watch(inputText, (val) => {
  emit('update:modelValue', val)
})

// Cleanup
onUnmounted(() => {
  stopVoice()
})

// Expose for external use
const voiceInput = { isSupported, isListening, error: voiceError }
defineExpose({ focus: () => inputRef.value?.focus(), voiceInput })
</script>

<style scoped>
.chat-input-area {
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
  background: var(--bg-primary, white);
  border-top: 1px solid var(--border-primary);
  padding: 12px 16px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 28px;
}

.input-container:focus-within { border-color: var(--color-primary); }
.input-container.listening { border-color: #ef4444; }

.attachment-wrapper { position: relative; }

.input-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.input-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.attachment-btn.active { background: var(--color-primary); color: white; transform: rotate(45deg); }

.upload-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  min-width: 150px;
  z-index: 100;
}

.upload-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
}

.upload-option:hover { background: var(--bg-hover); }

.text-input {
  flex: 1;
  padding: 8px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--text-primary);
  min-width: 0;
}

.text-input::placeholder { color: var(--text-tertiary); }

.voice-btn.recording {
  background: #ef4444;
  color: white;
  animation: blink 0.8s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.send-btn { background: var(--bg-tertiary); color: var(--text-tertiary); }
.send-btn.active { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.voice-error {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  text-align: center;
  background: rgba(239,68,68,0.1);
  color: #ef4444;
}

.popup-enter-active, .popup-leave-active { transition: all 0.2s; }
.popup-enter-from, .popup-leave-to { opacity: 0; transform: translateY(10px); }
</style>
