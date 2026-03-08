<template>
  <div class="h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
    <!-- Header -->
    <header class="flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Title Section -->
          <div class="flex items-center gap-3">
            <button
              class="w-8 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
              title="Go Back"
              @click="$router.go(-1)"
            >
              <svg class="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-slate-900 dark:text-white">
                AI Receipt Generator
              </h1>
              <p class="text-xs text-slate-500 dark:text-slate-400">Chat-powered receipt creation</p>
            </div>
          </div>

          <!-- Mode Toggle -->
          <div class="flex items-center gap-2">
            <button
              @click="switchToFormMode"
              class="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Form Mode
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content - Chat Interface -->
    <main class="flex-1 overflow-hidden">
      <div class="h-full max-w-4xl mx-auto">
        <ChatPanel
          ref="chatPanelRef"
          :messages="chatMessages"
          :is-analyzing="isAnalyzing"
          welcome-icon="🧾"
          welcome-title="AI Receipt Assistant"
          welcome-subtitle="I'll help you create a professional receipt in just a few steps. Click below to get started!"
          input-placeholder="Type your message... (Shift+Enter for new line)"
          @send="handleSendMessage"
          @action="handleAction"
          @start="startConversation"
        />
      </div>
    </main>

    <!-- Logo Cropper Modal -->
    <LogoCropper
      :is-open="showImageCropper"
      :image-url="tempImageUrl"
      @crop="handleCroppedImage"
      @close="handleCropperClose"
    />

    <!-- Hidden file input for logo -->
    <input
      ref="logoInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleLogoUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ChatPanel from '../../components/ChatPanel.vue'
import LogoCropper from '@/components/image/LogoCropper.vue'
import { useReceiptChat, type ExtractedReceiptInfo, type ChatMessage } from '../../composables/useReceiptChat'

const router = useRouter()

// Chat state
const chatMessages = ref<ChatMessage[]>([])
const isAnalyzing = ref(false)
const extractedInfo = ref<ExtractedReceiptInfo>({})
const chatPanelRef = ref<InstanceType<typeof ChatPanel> | null>(null)

// Logo handling
const showImageCropper = ref(false)
const tempImageUrl = ref('')
const logoInput = ref<HTMLInputElement | null>(null)

// Initialize the receipt chat composable
const {
  startConversation: startChat,
  processMessage,
  handleAction: handleChatAction,
  onLogoUploaded
} = useReceiptChat({
  extractedInfo,
  chatMessages,
  isAnalyzing,
  onGenerate: handleGenerate,
  onScrollToBottom: scrollToBottom,
  onUploadLogo: triggerLogoUpload
})

function scrollToBottom() {
  chatPanelRef.value?.scrollToBottom()
}

async function startConversation() {
  await startChat()
}

async function handleSendMessage(message: string) {
  // Add user message to chat
  chatMessages.value.push({
    id: Date.now(),
    text: message,
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
  
  // Process the message
  await processMessage(message)
}

async function handleAction(action: string) {
  await handleChatAction(action)
}

function triggerLogoUpload() {
  logoInput.value?.click()
}

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      tempImageUrl.value = e.target?.result as string
      showImageCropper.value = true
    }
    reader.readAsDataURL(file)
  }
}

function handleCroppedImage(dataUrl: string) {
  extractedInfo.value.logoDataUrl = dataUrl
  showImageCropper.value = false
  onLogoUploaded(dataUrl)
}

function handleCropperClose() {
  showImageCropper.value = false
  tempImageUrl.value = ''
}

function handleGenerate() {
  // Save the extracted data to localStorage for the preview page
  const receiptData = {
    organizationName: extractedInfo.value.organizationName || '',
    organizationSubName: extractedInfo.value.organizationSubName || '',
    headOfficeAddress: extractedInfo.value.headOfficeAddress || '',
    headOfficePhone: extractedInfo.value.headOfficePhone || '',
    branchAddress1: extractedInfo.value.branchAddress1 || '',
    branch1Phone: extractedInfo.value.branch1Phone || '',
    branchAddress2: extractedInfo.value.branchAddress2 || '',
    branch2Phone: extractedInfo.value.branch2Phone || '',
    logoDataUrl: extractedInfo.value.logoDataUrl || '',
    receivedFrom: extractedInfo.value.receivedFrom || '',
    paymentFor: extractedInfo.value.paymentFor || '',
    paymentFor2: extractedInfo.value.paymentFor2 || '',
    naira: extractedInfo.value.naira || 0,
    sumOf: extractedInfo.value.sumOf || '',
    sumOf2: extractedInfo.value.sumOf2 || '',
    date: extractedInfo.value.date || new Date().toLocaleDateString(),
    selectedTemplate: extractedInfo.value.selectedTemplate || 'template3',
    formMode: 'generate',
    fromQuickFill: true
  }
  
  try {
    // Save to both keys so PreviewReceipt can pick it up
    localStorage.setItem('sdp_receipt_chat_data', JSON.stringify(receiptData))
    localStorage.setItem('invoicePreviewData', JSON.stringify(receiptData))
    console.log('✅ Receipt data saved for preview:', receiptData)
    
    // Navigate to preview
    router.push('/preview-receipt')
  } catch (error) {
    console.error('Failed to save receipt data:', error)
    // Show error message in chat
    chatMessages.value.push({
      id: Date.now(),
      text: '❌ Error saving receipt data. Please try again.',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }
}

function switchToFormMode() {
  router.push('/generate-receipt')
}

onMounted(() => {
  // Auto-start conversation if no messages
  if (chatMessages.value.length === 0) {
    // Let user click "Let's Begin" button
  }
})
</script>

<style scoped>
/* Additional styles for smooth animations */
</style>
