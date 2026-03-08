<template>
  <div class="chat-container" ref="chatContainer">
    <!-- Welcome Screen -->
    <div v-if="messages.length === 0 && !isGeneratingPreview" class="welcome-screen">
      <div class="welcome-icon">💍</div>
      <h2 class="welcome-title">Wedding Sticker Designer</h2>
      <p class="welcome-subtitle" v-if="isAuthenticated">
        Hi{{ userName ? `, ${userName}` : '' }}! Create beautiful wedding stickers with your voice or text.
      </p>
      <p class="welcome-subtitle" v-else>
        Create beautiful wedding stickers with your voice or text.
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
        :class="[msg.sender, { 'with-preview': msg.type === 'preview' }]"
      >
        <!-- Avatar -->
        <div class="message-avatar" v-if="msg.sender === 'ai'">
          <span>🤖</span>
        </div>

        <!-- Message Content -->
        <div class="message-content">
          <!-- Loading State -->
          <div v-if="msg.isLoading" class="message-loading">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>

          <!-- Preview Message -->
          <template v-else-if="msg.type === 'preview'">
            <div class="preview-wrapper" ref="previewContainers">
              <div class="preview-placeholder">
                <!-- SVG preview will be injected here -->
              </div>
              <div class="preview-actions">
                <button @click="$emit('action', { type: 'edit' })" class="preview-btn edit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
                <button @click="$emit('action', { type: 'download' })" class="preview-btn download">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download
                </button>
                <button @click="$emit('action', { type: 'regenerate' })" class="preview-btn regenerate" title="Try a different background">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  New BG
                </button>
              </div>
            </div>
          </template>

          <!-- Text Message -->
          <template v-else>
            <img
              v-if="msg.image"
              :src="msg.image"
              class="message-image"
              alt="Uploaded image"
              loading="lazy"
            />
            <p class="message-text" v-html="formatMessage(msg.text)"></p>
            
            <!-- Action Buttons -->
            <div v-if="msg.actions?.length" class="message-actions">
              <button 
                v-for="action in msg.actions" 
                :key="action.type"
                @click="$emit('action', action)"
                class="action-btn"
                :class="action.variant"
              >
                {{ action.label }}
              </button>
            </div>
          </template>

          <!-- Timestamp -->
          <span class="message-time">{{ msg.time }}</span>
        </div>

        <!-- User Avatar -->
        <div class="message-avatar" v-if="msg.sender === 'user'">
          <span>👤</span>
        </div>
      </div>
    </TransitionGroup>

    <!-- Single Generating Preview Indicator (simplified for mobile performance) -->
    <div v-if="isGeneratingPreview" class="generating-state">
      <div class="simple-spinner"></div>
      <p class="generating-text">{{ generatingMessage || 'Creating your design...' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage } from './types'

// Props
const props = defineProps<{
  messages: ChatMessage[]
  isGeneratingPreview: boolean
  showPreview: boolean
  isAuthenticated: boolean
  userName?: string
  tokens: number
  generatingMessage?: string
}>()

// Emits
defineEmits<{
  (e: 'login'): void
  (e: 'action', action: { type: string; label?: string }): void
  (e: 'suggestion', text: string): void
}>()

// Refs
const chatContainer = ref<HTMLDivElement | null>(null)
const previewContainers = ref<HTMLDivElement[] | HTMLDivElement | null>(null)

// Suggestions
const suggestions = [
  "Pink floral with gold text",
  "Blue elegant minimalist",
  "Classic white with hearts"
]

// Format message text
function formatMessage(text: string): string {
  if (!text) return ''

  const escaped = escapeHtml(text)

  // Very small “markdown” support: **bold** and newlines.
  // Escape first so we never render raw HTML from user/AI messages.
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Get preview containers
function getPreviewContainers(): HTMLDivElement[] {
  if (!previewContainers.value) return []
  return Array.isArray(previewContainers.value) 
    ? previewContainers.value 
    : [previewContainers.value]
}

// Scroll to bottom
function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

// Watch messages and scroll
watch(() => props.messages.length, () => {
  scrollToBottom()
})

// Watch for generating preview to scroll
watch(() => props.isGeneratingPreview, (isGenerating) => {
  if (isGenerating) {
    scrollToBottom()
  }
})

// Expose methods
defineExpose({
  scrollToBottom,
  chatContainer,
  previewContainers,
  getPreviewContainers
})
</script>

<style scoped>
.chat-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, white);
  scroll-behavior: smooth;
}

.message-image {
  display: block;
  width: 100%;
  max-width: 220px;
  height: auto;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  margin-bottom: 8px;
}

/* Welcome Screen */
.welcome-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.welcome-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 320px;
}

.login-hint {
  opacity: 0.8;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.token-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 10px 20px;
  background: var(--bg-tertiary);
  border-radius: 20px;
  font-weight: 500;
  color: var(--text-primary);
}

.token-icon {
  font-size: 1.2rem;
}

/* Suggestions */
.suggestions {
  margin-top: 32px;
  width: 100%;
  max-width: 400px;
}

.suggestions-label {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-bottom: 12px;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.suggestion-chip {
  padding: 8px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
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
  max-width: 85%;
  animation: slideIn 0.3s ease;
}

/* Allow preview messages to be wider */
.message:has(.preview-wrapper) {
  max-width: 95%;
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
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.ai {
  align-self: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message.user .message-content {
  align-items: flex-end;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.message.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.ai .message-text {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  padding: 0 4px;
}

/* Loading Dots */
.message-loading {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
  background: var(--bg-primary);
  border-radius: 18px;
  border: 1px solid var(--border-primary);
}

.message-loading .dot {
  width: 8px;
  height: 8px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}

.message-loading .dot:nth-child(2) { animation-delay: 0.2s; }
.message-loading .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Preview */
.preview-wrapper {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  overflow: hidden;
  max-width: 100%;
  margin: 0 auto;
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn.edit {
  background: var(--color-primary);
  color: white;
}

.preview-btn.download {
  background: var(--color-success);
  color: white;
}

.preview-btn.regenerate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.preview-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.preview-placeholder {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--bg-tertiary);
}

.preview-placeholder :deep(svg) {
  max-width: 100%;
  max-height: 400px;
  height: auto;
  display: block;
  margin: 0 auto;
}

/* Message Actions */
.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-hover);
}

.action-btn.primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Generating State - Simplified for mobile performance */
.generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  gap: 16px;
}

/* Simple CSS-only spinner - GPU accelerated, no JS */
.simple-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--color-primary, #3b82f6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  will-change: transform;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.generating-text {
  font-size: 0.9rem;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  text-align: center;
}

/* Transitions */
.message-enter-active {
  animation: slideIn 0.3s ease;
}

.message-leave-active {
  animation: slideIn 0.3s ease reverse;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .chat-container {
    padding: 20px;
  }
  
  .message {
    max-width: 95%;
    gap: 8px;
  }
  
  .message:has(.preview-wrapper) {
    max-width: 100%;
  }
  
  .message-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }
  
  .message-text {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
  
  .preview-wrapper {
    border-radius: 12px;
  }
  
  .preview-placeholder {
    padding: 12px;
    min-height: 150px;
  }
  
  .preview-placeholder :deep(svg) {
    max-height: 300px;
  }
  
  .preview-actions {
    padding: 10px;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .preview-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
    gap: 4px;
  }
  
  .preview-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .welcome-icon {
    font-size: 48px;
  }
  
  .welcome-title {
    font-size: 1.4rem;
  }
  
  .welcome-subtitle {
    font-size: 0.9rem;
  }
  
  .suggestion-chip {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>
