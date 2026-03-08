<template>
  <div class="letterhead-chat-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
        <div class="header-title">
          <h1>Letterhead Designer</h1>
        </div>
        <div class="header-right">
          <button @click="goHome" class="home-btn" title="Go to Home">
            <font-awesome-icon :icon="['fas', 'home']" size="lg" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="page-content">
      <!-- Chat Section -->
      <div class="chat-section">
        <LetterHeadChatMessages
          :messages="chatMessages"
          :is-analyzing="isAnalyzing"
          :is-generating-preview="isGeneratingPreview"
          :is-authenticated="isAuthenticated"
          :user-name="userName"
          :tokens="userTokens"
          @action="handleAction"
          @login="handleLogin"
          @suggestion="handleSuggestion"
        />
        <LetterHeadChatInput
          v-model="userInput"
          :disabled="isAnalyzing || isGeneratingPreview"
          @send="sendMessage"
          @upload-logo="handleLogoUpload"
        />
      </div>

      <!-- Preview Section -->
      <div v-if="showPreview" class="preview-section">
        <div class="preview-header">
          <h3>Preview</h3>
          <button @click="closePreview" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="preview-content">
          <img v-if="previewSvg" :src="previewSvg" alt="Letterhead Preview" class="svg-preview" />
          <div v-else class="preview-placeholder">
            <span class="placeholder-icon">📄</span>
            <p>Your letterhead preview will appear here</p>
          </div>
        </div>
        <div class="preview-actions">
          <button @click="downloadLetterHead" class="action-button primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
          <button @click="regeneratePreview" class="action-button secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Regenerate
          </button>
        </div>
      </div>
    </div>

    <!-- Info Panel (Mobile Toggle) -->
    <div v-if="showInfoPanel" class="info-panel">
      <div class="info-header">
        <h3>Current Information</h3>
        <button @click="showInfoPanel = false" class="close-btn">×</button>
      </div>
      <div class="info-content">
        <div v-if="extractedInfo.organizationName" class="info-item">
          <label>Organization:</label>
          <p>{{ extractedInfo.organizationName }}</p>
        </div>
        <div v-if="extractedInfo.registrationNumber" class="info-item">
          <label>RC Number:</label>
          <p>{{ extractedInfo.registrationNumber }}</p>
        </div>
        <div v-if="extractedInfo.headOffice" class="info-item">
          <label>Head Office:</label>
          <p>{{ extractedInfo.headOffice }}</p>
        </div>
        <div v-if="extractedInfo.phones.length" class="info-item">
          <label>Phones:</label>
          <p>{{ extractedInfo.phones.join(', ') }}</p>
        </div>
        <div v-if="extractedInfo.email" class="info-item">
          <label>Email:</label>
          <p>{{ extractedInfo.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
// Lazy load chat components for better performance
const LetterHeadChatMessages = defineAsyncComponent(() => import('@/components/letter-head/LetterHeadChatMessages.vue'))
const LetterHeadChatInput = defineAsyncComponent(() => import('@/components/letter-head/LetterHeadChatInput.vue'))
import { useLetterHeadChat } from '@/composables/useLetterHeadChat'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

// Use the composable
const {
  chatMessages,
  chatInputText: userInput,
  isAnalyzing,
  isGeneratingPreview,
  extractedInfo,
  previewImageUrl,
  showLetterHeadPreview,
  handleSendMessage,
  handleMessageAction,
  initializeChat,
  handleLogoUpload: composableLogoUpload
} = useLetterHeadChat()

// Local state
const previewSvg = computed(() => previewImageUrl.value)
const showPreview = computed(() => showLetterHeadPreview.value)
const showInfoPanel = ref(false)

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => userStore.profile?.displayName || userStore.profile?.email?.split('@')[0] || '')
const userTokens = computed(() => userStore.profile?.tokens || 0)

// Methods
function goBack() {
  // Navigate to home and trigger auto-design modal to open
  router.push({ path: '/home', query: { openAutoDesign: 'true' } })
}

function goHome() {
  router.push('/home')
}

function handleLogin() {
  router.push('/auth/login')
}

function sendMessage() {
  handleSendMessage()
}

function handleSuggestion(suggestion: string) {
  userInput.value = suggestion
  handleSendMessage()
}

function handleLogoUpload(file: File) {
  composableLogoUpload(file)
}

function handleAction(actionType: string) {
  handleMessageAction(actionType)
}

async function generatePreview() {
  handleMessageAction('generate')
}

function regeneratePreview() {
  handleMessageAction('generate')
}

function closePreview() {
  showLetterHeadPreview.value = false
}

async function downloadLetterHead() {
  handleMessageAction('download_svg')
}

// Initialize on mount
onMounted(() => {
  initializeChat()
})
</script>

<style scoped>
.letterhead-chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

/* Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  flex: 1;
  text-align: center;
}

.back-btn,
.home-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.back-btn:hover,
.home-btn:hover {
  background: #f8fafc;
  color: #1e293b;
}

.header-title h1 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Main Content */
.page-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.page-content.with-preview {
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}

/* Chat Section */
.chat-section {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Preview Section */
.preview-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.svg-preview {
  width: 100%;
  max-width: 600px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  display: block;
}

.preview-placeholder {
  text-align: center;
  color: #94a3b8;
}

.placeholder-icon {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
}

.preview-placeholder p {
  font-size: 16px;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-button.secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.action-button.secondary:hover {
  background: #e2e8f0;
}

/* Info Panel */
.info-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.info-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.info-header .close-btn {
  font-size: 24px;
  width: 32px;
  height: 32px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.info-item label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
}

.info-item p {
  font-size: 14px;
  color: #1e293b;
  margin: 0;
}

/* Responsive */
@media (min-width: 1024px) {
  .page-content {
    grid-template-columns: 1fr 500px;
    gap: 20px;
    padding: 20px;
  }
  
  .preview-section {
    display: flex !important;
  }
  
  .info-panel {
    display: none;
  }
}

@media (max-width: 1023px) {
  .preview-section {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    border-radius: 0;
  }
  
  .chat-section {
    border-radius: 0;
  }
}
</style>
