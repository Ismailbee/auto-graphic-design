<template>
  <div class="receipt-chat-panel">
    <div class="chat-interface">
      <!-- Chat Messages -->
      <div ref="chatContainer" class="chat-messages">
        <!-- Welcome Screen -->
        <div v-if="messages.length === 0" class="welcome-screen">
          <div class="welcome-icon">{{ welcomeIcon }}</div>
          <h2 class="welcome-title">{{ welcomeTitle }}</h2>
          <p class="welcome-subtitle">{{ welcomeSubtitle }}</p>
          <button 
            class="start-btn"
            @click="$emit('start')"
          >
            🚀 Let's Begin
          </button>
        </div>

        <!-- Messages -->
        <TransitionGroup v-else name="message" tag="div" class="messages-list">
          <div 
            v-for="msg in messages" 
            :key="msg.id" 
            class="message" 
            :class="msg.sender"
          >
            <!-- Avatar -->
            <div class="message-avatar" v-if="msg.sender === 'ai'">
              <span>🤖</span>
            </div>

            <!-- Message Content -->
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(msg.text)"></div>
              
              <div class="message-time">{{ msg.time }}</div>

              <div v-if="msg.actions && msg.actions.length > 0" class="message-actions">
                <button 
                  v-for="(action, idx) in msg.actions" 
                  :key="idx"
                  :class="['action-btn', action.variant || 'primary']"
                  @click="$emit('action', action.type)"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Analyzing Indicator -->
        <div v-if="isAnalyzing" class="analyzing-indicator">
          <div class="analyzing-dot"></div>
          <div class="analyzing-dot"></div>
          <div class="analyzing-dot"></div>
          <span>Analyzing your information...</span>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input">
        <textarea
          v-model="inputText"
          :placeholder="inputPlaceholder"
          @keydown="handleKeyDown"
          rows="1"
          ref="textareaRef"
        />
        <button @click="sendMessage" class="send-btn" :disabled="!inputText.trim()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

export interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: string
  actions?: { type: string; label: string; variant: 'primary' | 'secondary' | 'danger' }[]
  showColorDropdown?: boolean
}

defineProps<{
  messages: ChatMessage[]
  isAnalyzing?: boolean
  welcomeIcon?: string
  welcomeTitle?: string
  welcomeSubtitle?: string
  inputPlaceholder?: string
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'action', action: string): void
  (e: 'start'): void
}>()

const inputText = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function formatMessage(text: string): string {
  // Convert markdown-like formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function sendMessage() {
  const trimmedValue = inputText.value.trim()
  if (trimmedValue) {
    emit('send', trimmedValue)
    inputText.value = ''
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  }
}

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

defineExpose({ scrollToBottom })
</script>

<style scoped>
.receipt-chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

:global(.dark) .receipt-chat-panel {
  background: #1e293b;
}

.chat-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

/* Welcome Screen */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  min-height: 300px;
}

.welcome-icon {
  font-size: 56px;
  margin-bottom: 20px;
  animation: welcomeFloat 4s ease-in-out infinite;
}

@keyframes welcomeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

:global(.dark) .welcome-title {
  color: #f1f5f9;
}

.welcome-subtitle {
  font-size: 14px;
  color: #64748b;
  max-width: 400px;
  line-height: 1.6;
  margin-bottom: 20px;
}

:global(.dark) .welcome-subtitle {
  color: #94a3b8;
}

.start-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* Messages */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

:global(.dark) .message-avatar {
  background: #334155;
  border-color: #475569;
}

.message-content {
  flex: 1;
  max-width: 75%;
}

.message.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-text {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.message.ai .message-text {
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
}

:global(.dark) .message.ai .message-text {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

.message.user .message-text {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  padding: 0 4px;
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
  align-items: center;
}

/* Color Dropdown in actions row */
.color-dropdown {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  appearance: auto;
}

.color-dropdown:hover {
  background: #e2e8f0;
  border-color: #10b981;
}

.color-dropdown:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

:global(.dark) .color-dropdown {
  background: #475569;
  color: #e2e8f0;
  border-color: #64748b;
}

:global(.dark) .color-dropdown:hover {
  background: #64748b;
  border-color: #10b981;
}

.action-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

:global(.dark) .action-btn.secondary {
  background: #475569;
  color: #e2e8f0;
  border-color: #64748b;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

:global(.dark) .action-btn.secondary:hover {
  background: #64748b;
}

.action-btn.danger {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.action-btn.danger:hover {
  background: #fecaca;
}

/* Analyzing Indicator */
.analyzing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: #64748b;
  font-size: 14px;
}

.analyzing-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: analyzingPulse 1.4s ease-in-out infinite;
}

.analyzing-dot:nth-child(1) { animation-delay: 0s; }
.analyzing-dot:nth-child(2) { animation-delay: 0.2s; }
.analyzing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes analyzingPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Chat Input */
.chat-input {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 10px;
  background: white;
}

:global(.dark) .chat-input {
  background: #1e293b;
  border-color: #334155;
}

.chat-input textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
  background: #f8fafc;
  color: #1e293b;
  font-family: inherit;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  line-height: 1.5;
}

:global(.dark) .chat-input textarea {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.chat-input textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.send-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 16px;
  height: 16px;
}

/* Transitions */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .chat-messages {
    padding: 12px;
  }

  .message-content {
    max-width: 85%;
  }

  .welcome-icon {
    font-size: 48px;
  }

  .welcome-title {
    font-size: 20px;
  }

  .action-btn {
    padding: 8px 14px;
    font-size: 12px;
  }
}
</style>
