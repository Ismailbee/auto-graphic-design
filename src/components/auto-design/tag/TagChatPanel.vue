<template>
  <div class="tag-template-panel">
    <div class="tag-chat-interface">
      <!-- Chat Messages -->
      <div ref="chatContainer" class="chat-messages">
        <!-- Welcome Screen -->
        <div v-if="messages.length === 0" class="welcome-screen">
          <div class="welcome-icon">🏷️</div>
          <h2 class="welcome-title">Event Tag Designer</h2>
          <p class="welcome-subtitle">
            I'll guide you step-by-step to create your professional event tag. Say hello to begin!
          </p>
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
              <div v-if="msg.type === 'preview'" class="preview-wrapper">
                <div class="preview-content" v-html="msg.text"></div>
                <button class="preview-edit-btn" title="Edit tag" @click.stop="$emit('action', 'edit_tag', msg.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <span>Edit</span>
                </button>
              </div>
              <div v-else class="message-text">{{ msg.text }}</div>
              
              <div class="message-time">{{ msg.time }}</div>

              <div v-if="msg.actions" class="message-actions">
                <button 
                  v-for="(action, idx) in msg.actions" 
                  :key="idx"
                  :class="['action-btn', action.variant || 'primary']"
                  @click="$emit('action', action.type, msg.id)"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Chat Input -->
      <div class="chat-input">
        <textarea
          v-model="inputText"
          placeholder="Type your message... (Shift+Enter for new line)"
          @keydown="handleKeyDown"
          rows="1"
          ref="textareaRef"
        />
        <button @click="sendMessage" class="send-btn">Send</button>
        <button @click="$emit('upload')" class="upload-btn">📎 Upload</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { ChatMessage } from './types'

defineProps<{
  messages: ChatMessage[]
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'upload'): void
  (e: 'action', action: string, messageId: number): void
}>()

const inputText = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
  // Shift+Enter allows new line (default behavior)
}

function sendMessage() {
  const trimmedValue = inputText.value.trim()
  if (trimmedValue) {
    // Preserve line breaks but trim leading/trailing whitespace from each line
    const cleanedMessage = trimmedValue.split('\n').map(line => line.trim()).join('\n')
    emit('send', cleanedMessage)
    inputText.value = ''
    // Reset textarea height
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
.tag-template-panel {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.tag-chat-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
  background: var(--bg-secondary);
}

/* Welcome Screen */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  min-height: 400px;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 24px;
  transform-origin: center;
  animation: welcomeFloat 4.5s ease-in-out infinite;
}

@keyframes welcomeFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .welcome-icon {
    animation: none;
  }
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  max-width: 400px;
  line-height: 1.6;
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
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-text {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;  white-space: pre-wrap;  box-shadow: var(--shadow-sm);
}

.message.ai .message-text {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-bottom-left-radius: 4px;
}

.message.user .message-text {
  background: var(--color-primary);
  color: var(--text-inverse);
  border-bottom-right-radius: 4px;
}

.preview-wrapper {
  position: relative;
  max-width: 360px;
  width: 100%;
}

.preview-content {
  width: 100%;
}

.preview-content :deep(svg) {
  width: 100% !important;
  height: auto !important;
  display: block !important;
}

.preview-edit-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.preview-edit-btn svg {
  width: 14px;
  height: 14px;
}

.preview-wrapper:hover .preview-edit-btn {
  opacity: 1;
}

.preview-edit-btn:hover {
  background: rgba(0, 0, 0, 0.85);
  transform: scale(1.05);
}

/* 
 * NOTE: Do NOT override SVG fill classes (.fil0, .fil1, .fil2, etc.) here!
 * Each tag template (tag1-tag7) has its own color scheme defined in the SVG.
 * Overriding these classes breaks templates other than tag1.
 * The fill colors are properly defined in each SVG's <style> section.
 */

.message-time {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 4px;
  padding: 0 4px;
}

.message.user .message-time {
  text-align: right;
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: var(--color-primary);
  color: var(--text-inverse);
}

.action-btn.primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-primary);
}

.action-btn.secondary:hover {
  background: var(--bg-tertiary);
}

/* Chat Input */
.chat-input {
  padding: 16px;
  border-top: 1px solid var(--border-primary);
  display: flex;
  gap: 8px;
  background: var(--bg-primary);
}

.chat-input textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  resize: vertical;
  min-height: 44px;
  max-height: 200px;
  line-height: 1.5;
}

.chat-input textarea:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.send-btn, .upload-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.send-btn {
  background: var(--color-primary);
  color: var(--text-inverse);
}

.send-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.upload-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.upload-btn:hover {
  background: var(--bg-hover);
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
    padding: 16px;
  }

  .message-content {
    max-width: 85%;
  }

  .welcome-icon {
    font-size: 48px;
  }

  .welcome-title {
    font-size: 24px;
  }
}
</style>
