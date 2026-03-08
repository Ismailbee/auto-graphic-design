<template>
  <div class="chat-container" ref="chatContainer">
    <!-- Welcome Screen -->
    <div v-if="messages.length === 0 && !isGeneratingPreview" class="welcome-screen">
      <div class="welcome-icon">📄</div>
      <h2 class="welcome-title">Letterhead Designer</h2>
      <p class="welcome-subtitle" v-if="isAuthenticated">
        Hi{{ userName ? `, ${userName}` : '' }}! Create professional letterheads by just telling me about your organization.
      </p>
      <p class="welcome-subtitle" v-else>
        Create professional letterheads with AI. Just describe your organization!
        <br><small class="login-hint">Login to get <strong>100 FREE tokens</strong>!</small>
      </p>
      
      <!-- Login Button -->
      <button v-if="!isAuthenticated" @click="$emit('login')" class="login-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        Login to Start
      </button>
      
      <!-- Token Display -->
      <div v-if="isAuthenticated" class="token-badge">
        <span class="token-icon">💎</span>
        <span class="token-count">{{ tokens }} tokens</span>
      </div>

      <!-- Quick Suggestions -->
      <div class="suggestions">
        <p class="suggestions-label">Try saying:</p>
        <div class="suggestion-chips">
          <button 
            v-for="suggestion in suggestions" 
            :key="suggestion"
            @click="$emit('suggestion', suggestion)"
            class="suggestion-chip"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Messages List -->
    <TransitionGroup v-else name="message" tag="div" class="messages-list">
      <div 
        v-for="msg in messages" 
        :key="msg.id" 
        class="message"
        :class="[msg.sender]"
      >
        <!-- Avatar -->
        <div class="message-avatar" v-if="msg.sender === 'ai'">
          <span>🤖</span>
        </div>

        <!-- Message Content -->
        <div class="message-content">
          <!-- Text Message -->
          <p class="message-text" v-html="formatMessage(msg.text)"></p>
          
          <!-- Action Buttons -->
          <div v-if="msg.actions?.length" class="message-actions">
            <button 
              v-for="action in msg.actions" 
              :key="action.type"
              @click="$emit('action', action.type)"
              class="action-btn"
              :class="action.variant"
            >
              {{ action.label }}
            </button>
          </div>

          <!-- Timestamp -->
          <span class="message-time">{{ msg.time }}</span>
        </div>

        <!-- User Avatar -->
        <div class="message-avatar" v-if="msg.sender === 'user'">
          <span>👤</span>
        </div>
      </div>
    </TransitionGroup>

    <!-- Analyzing Indicator -->
    <div v-if="isAnalyzing" class="analyzing-state">
      <div class="analyzing-animation">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <p class="analyzing-text">Analyzing...</p>
    </div>

    <!-- Generating Preview -->
    <div v-if="isGeneratingPreview" class="generating-state">
      <div class="generating-animation">
        <div class="ring"></div>
        <span class="generating-icon">✨</span>
      </div>
      <p class="generating-text">{{ generatingMessage || 'Creating your letterhead...' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

// Types
export interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: string
  actions?: Array<{ type: string; label: string; variant?: string }>
}

// Props
const props = defineProps<{
  messages: ChatMessage[]
  isAnalyzing?: boolean
  isGeneratingPreview?: boolean
  generatingMessage?: string
  isAuthenticated?: boolean
  userName?: string
  tokens?: number
}>()

// Emits
const emit = defineEmits<{
  (e: 'action', actionType: string): void
  (e: 'login'): void
  (e: 'suggestion', suggestion: string): void
}>()

// Refs
const chatContainer = ref<HTMLDivElement | null>(null)

// Suggestions
const suggestions = [
  "My company is ABC Ltd in Lagos",
  "Organization: XYZ Corp, Office: Abuja",
  "Create letterhead for Tech Solutions"
]

// Format message (convert line breaks to <br>)
function formatMessage(text: string): string {
  return text.replace(/\n/g, '<br>')
}

// Auto-scroll to bottom
watch(() => props.messages.length, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}, { immediate: true })

// Scroll on analyzing state change
watch(() => props.isAnalyzing, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
})

// Expose scroll method
defineExpose({
  scrollToBottom: () => {
    if (chatContainer.value) {
      chatContainer.value.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  }
})
</script>

<style scoped>
.chat-container {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

/* Welcome Screen */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.welcome-subtitle {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  max-width: 500px;
  margin-bottom: 24px;
}

.login-hint {
  color: #10b981;
  font-weight: 600;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
}

.token-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}

/* Suggestions */
.suggestions {
  width: 100%;
  max-width: 600px;
  margin-top: 32px;
}

.suggestions-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 500;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.suggestion-chip {
  padding: 10px 18px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

/* Messages */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.message {
  display: flex;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
}

.message-content {
  max-width: 70%;
  background: white;
  padding: 14px 18px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.message.user .message-content {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
}

.message-text {
  color: #1e293b;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  word-wrap: break-word;
}

.message.user .message-text {
  color: white;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
  display: block;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

/* Message Actions */
.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Analyzing State */
.analyzing-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-top: 16px;
}

.analyzing-animation {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #06b6d4;
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.analyzing-text {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

/* Generating State */
.generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.generating-animation {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.ring {
  width: 80px;
  height: 80px;
  border: 4px solid #e2e8f0;
  border-top-color: #06b6d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.generating-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  animation: pulse 1.5s ease-in-out infinite;
}

.generating-text {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* Transitions */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
