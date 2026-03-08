<template>
  <div class="chat-input-area">
    <div class="input-container">
      <!-- Upload Logo Button -->
      <button @click="handleLogoUpload" class="input-btn upload-btn" title="Upload Logo">
        <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" size="lg" />
      </button>

      <!-- Input -->
      <input
        ref="inputRef"
        v-model="inputText"
        @keydown.enter.prevent="handleSend"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        class="text-input"
      />

      <!-- Send -->
      <button 
        @click="handleSend" 
        class="input-btn send-btn" 
        :disabled="!canSend" 
        :class="{ active: canSend }"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>

    <!-- Hidden file input -->
    <input 
      ref="fileInputRef" 
      type="file" 
      accept="image/*" 
      @change="onFileSelected" 
      style="display: none;"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Props
const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
  (e: 'uploadLogo', file: File): void
}>()

// Refs
const inputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const inputText = ref(props.modelValue)

// Computed
const canSend = computed(() => inputText.value.trim().length > 0 && !props.disabled)

const placeholder = computed(() => {
  return 'Tell me about your organization...'
})

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  inputText.value = newValue
})

// Watch for internal changes
watch(inputText, (newValue) => {
  emit('update:modelValue', newValue)
})

// Methods
function handleSend() {
  if (canSend.value) {
    emit('send')
    inputText.value = ''
  }
}

function handleLogoUpload() {
  fileInputRef.value?.click()
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('uploadLogo', file)
    // Reset input so same file can be selected again
    target.value = ''
  }
}

// Focus input on mount
function focusInput() {
  inputRef.value?.focus()
}

// Expose methods
defineExpose({
  focusInput
})
</script>

<style scoped>
.chat-input-area {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 4px 6px;
  transition: all 0.3s;
}

.input-container:focus-within {
  border-color: #06b6d4;
  background: white;
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
}

.text-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 12px;
  font-size: 15px;
  color: #1e293b;
}

.text-input::placeholder {
  color: #94a3b8;
}

.text-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.input-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #1e293b;
}

.input-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.upload-btn {
  color: #f59e0b;
}

.upload-btn:hover:not(:disabled) {
  background: #fef3c7;
  color: #d97706;
}

.send-btn.active {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  color: white;
}

.send-btn.active:hover {
  background: linear-gradient(135deg, #0891b2 0%, #2563eb 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .chat-input-area {
    padding: 12px 16px;
  }
  
  .text-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>
