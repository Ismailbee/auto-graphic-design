<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="share-panel-overlay"
        @click="close"
      ></div>
    </Transition>

    <!-- Panel -->
    <Transition name="scale">
      <div v-if="modelValue" class="share-panel">
        <!-- Header -->
        <div class="panel-header">
          <h2>
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Design
          </h2>
          <button @click="close" class="close-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="panel-content">
          <!-- Social Media Sharing -->
          <div class="form-section">
            <label class="section-label">Share to Social Media</label>
            <div class="social-grid">
              <button
                v-for="platform in socialPlatforms"
                :key="platform.platform"
                :class="['social-btn', platform.platform]"
                @click="shareToSocial(platform.platform)"
                :style="{ '--platform-color': platform.color }"
              >
                <svg class="social-icon" width="24" height="24">
                  <use :href="`#icon-${platform.platform}`"></use>
                </svg>
                <span>{{ platform.label }}</span>
              </button>
            </div>
          </div>

          <!-- Shareable Link -->
          <div class="form-section">
            <label class="section-label">Get Shareable Link</label>
            
            <!-- Permission Selection -->
            <div class="permission-select">
              <label>Permission Level</label>
              <select v-model="sharePermission">
                <option value="view">View Only</option>
                <option value="download">View & Download</option>
                <option value="edit">Can Edit</option>
              </select>
            </div>

            <!-- Expiration -->
            <div class="expiration-select">
              <label>Link Expiration</label>
              <select v-model="expirationOption" @change="updateExpiration">
                <option value="never">Never</option>
                <option value="7days">7 Days</option>
                <option value="30days">30 Days</option>
                <option value="custom">Custom Date</option>
              </select>
              <input
                v-if="expirationOption === 'custom'"
                type="date"
                v-model="customExpirationDate"
                :min="minDate"
                class="date-input"
              />
            </div>

            <!-- Password Protection -->
            <div class="password-option">
              <label class="checkbox-label">
                <input type="checkbox" v-model="usePassword" />
                <span>Password protect link</span>
              </label>
              <input
                v-if="usePassword"
                type="password"
                v-model="sharePassword"
                placeholder="Enter password"
                class="password-input"
              />
            </div>

            <!-- Generate Link Button -->
            <button
              @click="generateLink"
              :disabled="isGeneratingLink"
              class="btn-generate"
            >
              <svg v-if="!isGeneratingLink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <svg v-else class="spinner" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
              </svg>
              {{ isGeneratingLink ? 'Generating...' : 'Generate Link' }}
            </button>

            <!-- Generated Link Display -->
            <div v-if="generatedLink" class="link-display">
              <input
                type="text"
                :value="generatedLink.shareUrl"
                readonly
                class="link-input"
              />
              <button @click="copyLink" class="btn-copy">
                <svg v-if="!linkCopied" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ linkCopied ? 'Copied!' : 'Copy' }}
              </button>
            </div>

            <!-- Link Stats -->
            <div v-if="generatedLink" class="link-stats">
              <div class="stat-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{{ generatedLink.views }} views</span>
              </div>
              <div class="stat-item">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{{ generatedLink.downloads }} downloads</span>
              </div>
            </div>
          </div>

          <!-- Email Sharing -->
          <div class="form-section">
            <label class="section-label">Share via Email</label>
            
            <div class="email-form">
              <input
                type="email"
                v-model="emailRecipients"
                placeholder="recipient@example.com (comma-separated for multiple)"
                class="email-input"
              />
              <textarea
                v-model="emailMessage"
                placeholder="Optional message..."
                rows="3"
                class="email-message"
              ></textarea>
              <button
                @click="sendEmail"
                :disabled="!emailRecipients || isSendingEmail"
                class="btn-send-email"
              >
                <svg v-if="!isSendingEmail" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <svg v-else class="spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
                </svg>
                {{ isSendingEmail ? 'Sending...' : 'Send Email' }}
              </button>
            </div>
          </div>

          <!-- Active Share Links -->
          <div v-if="activeShareLinks.length > 0" class="form-section">
            <label class="section-label">Active Share Links</label>
            <div class="links-list">
              <div
                v-for="link in activeShareLinks"
                :key="link.shareId"
                class="link-item"
              >
                <div class="link-info">
                  <div class="link-url">{{ truncateUrl(link.shareUrl) }}</div>
                  <div class="link-meta">
                    <span class="permission-badge">{{ link.permission }}</span>
                    <span class="link-date">Created {{ formatDate(link.createdAt) }}</span>
                  </div>
                </div>
                <button @click="deleteLink(link.shareId)" class="btn-delete">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </div>
        </div>

        <!-- Footer -->
        <div class="panel-footer">
          <button @click="close" class="btn-close">
            Close
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useExportStore } from '@/stores/export'
import { storeToRefs } from 'pinia'
import { SOCIAL_PLATFORMS } from '@/types/export'
import { shareToSocial as shareToSocialAPI, copyToClipboard, sendEmailShare } from '@/services/api/export-api'
import type { SocialPlatform, SharePermission } from '@/types/export'

const props = defineProps<{
  modelValue: boolean
  projectId: string
  exportUrl?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'link-generated': [link: any]
  'email-sent': []
}>()

const exportStore = useExportStore()
const { activeShareLinks, error } = storeToRefs(exportStore)

const sharePermission = ref<SharePermission>('view')
const expirationOption = ref('never')
const customExpirationDate = ref('')
const usePassword = ref(false)
const sharePassword = ref('')
const isGeneratingLink = ref(false)
const generatedLink = ref<any>(null)
const linkCopied = ref(false)

const emailRecipients = ref('')
const emailMessage = ref('')
const isSendingEmail = ref(false)

const socialPlatforms = computed(() => Object.values(SOCIAL_PLATFORMS))

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

onMounted(() => {
  exportStore.loadShareLinks(props.projectId)
})

function updateExpiration() {
  const now = new Date()
  switch (expirationOption.value) {
    case '7days':
      const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      exportStore.setShareExpiration(sevenDays)
      break
    case '30days':
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      exportStore.setShareExpiration(thirtyDays)
      break
    case 'never':
      exportStore.setShareExpiration(null)
      break
  }
}

async function generateLink() {
  isGeneratingLink.value = true
  try {
    exportStore.setSharePermission(sharePermission.value)
    exportStore.setSharePassword(usePassword.value ? sharePassword.value : '')
    
    const link = await exportStore.generateShareLink(props.projectId)
    if (link) {
      generatedLink.value = link
      emit('link-generated', link)
    }
  } finally {
    isGeneratingLink.value = false
  }
}

async function copyLink() {
  if (!generatedLink.value) return
  
  try {
    await copyToClipboard(generatedLink.value.shareUrl)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

async function shareToSocial(platform: SocialPlatform) {
  if (!props.exportUrl) {
    alert('Please export your design first')
    return
  }

  try {
    await shareToSocialAPI({
      platform,
      imageUrl: props.exportUrl,
      caption: 'Check out my design!',
      url: generatedLink.value?.shareUrl || window.location.href,
    })
  } catch (err) {
    console.error('Share failed:', err)
  }
}

async function sendEmail() {
  isSendingEmail.value = true
  try {
    const recipients = emailRecipients.value.split(',').map(e => e.trim())
    await sendEmailShare({
      recipients,
      message: emailMessage.value,
      attachmentUrl: props.exportUrl,
      projectName: 'My Design',
    })
    
    emit('email-sent')
    emailRecipients.value = ''
    emailMessage.value = ''
  } catch (err) {
    console.error('Email send failed:', err)
  } finally {
    isSendingEmail.value = false
  }
}

async function deleteLink(shareId: string) {
  if (confirm('Are you sure you want to revoke this share link?')) {
    await exportStore.deleteShareLink(shareId)
  }
}

function truncateUrl(url: string): string {
  if (url.length > 40) {
    return url.substring(0, 37) + '...'
  }
  return url
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString()
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* Overlay */
.share-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  pointer-events: auto;
  /* Changed to auto to allow modal interaction */
}

/* Panel */
.share-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 560px;
  max-height: 85vh;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in share panel */
}

/* Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.panel-header .icon {
  width: 24px;
  height: 24px;
  color: #8b5cf6;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

/* Content */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-label {
  display: block;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* Social Grid */
.social-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.social-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: var(--platform-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-icon {
  width: 28px;
  height: 28px;
  color: var(--platform-color);
}

/* Permission & Expiration */
.permission-select,
.expiration-select {
  margin-bottom: 16px;
}

.permission-select label,
.expiration-select label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.permission-select select,
.expiration-select select {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.date-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 14px;
  margin-top: 12px;
}

/* Password Option */
.password-option {
  margin-bottom: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label span {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.password-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 14px;
}

/* Generate Button */
.btn-generate {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: #8b5cf6;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generate:hover:not(:disabled) {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-generate svg {
  width: 18px;
  height: 18px;
}

/* Link Display */
.link-display {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.link-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 13px;
  font-family: monospace;
  color: #374151;
}

.btn-copy {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid #10b981;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: rgba(16, 185, 129, 0.2);
}

.btn-copy svg {
  width: 16px;
  height: 16px;
}

/* Link Stats */
.link-stats {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding: 12px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.stat-item svg {
  width: 16px;
  height: 16px;
  color: #8b5cf6;
}

/* Email Form */
.email-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.email-input,
.email-message {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
}

.email-message {
  resize: vertical;
  min-height: 80px;
}

.btn-send-email {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: #3b82f6;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-send-email:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-send-email:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-send-email svg {
  width: 18px;
  height: 18px;
}

/* Links List */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.link-info {
  flex: 1;
}

.link-url {
  font-size: 13px;
  font-family: monospace;
  color: #374151;
  margin-bottom: 6px;
}

.link-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.permission-badge {
  padding: 2px 8px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 4px;
  font-weight: 600;
  color: #8b5cf6;
  text-transform: capitalize;
}

.btn-delete {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

.btn-delete svg {
  width: 18px;
  height: 18px;
  color: #dc2626;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  margin-top: 16px;
  font-size: 13px;
  color: #dc2626;
}

.error-message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Footer */
.panel-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-close {
  width: 100%;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Spinner */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease-out;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

/* Hide Scrollbar */
.panel-content::-webkit-scrollbar {
  display: none;
  width: 0px;
}

.panel-content::-webkit-scrollbar-track {
  display: none;
}

.panel-content::-webkit-scrollbar-thumb {
  display: none;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  display: none;
}
</style>

