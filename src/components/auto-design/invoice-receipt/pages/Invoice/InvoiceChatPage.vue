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
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-slate-900 dark:text-white">
                AI Invoice Generator
              </h1>
              <p class="text-xs text-slate-500 dark:text-slate-400">Chat-powered invoice creation</p>
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

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden flex">
      <!-- Chat Interface (Left/Main) -->
      <div class="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <ChatPanel
          ref="chatPanelRef"
          :messages="chatMessages"
          :is-analyzing="isAnalyzing"
          welcome-icon="🧾"
          welcome-title="AI Invoice Assistant"
          welcome-subtitle="I'll help you create a professional invoice with itemized details. Click below to get started!"
          input-placeholder="Type your message... (Shift+Enter for new line)"
          @send="handleSendMessage"
          @action="handleAction"
          @start="startConversation"
        />
      </div>
    </main>

    <!-- Items Form Modal (shows when user says YES to items) -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showItemsForm" 
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click.self="showItemsForm = false"
        >
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-white">Invoice Items</h2>
                    <p class="text-sm text-white/70">Add your products or services</p>
                  </div>
                </div>
                <button 
                  @click="finishAddingItems"
                  class="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Done ✓
                </button>
              </div>
            </div>

            <!-- Items List -->
            <div class="p-6 max-h-[60vh] overflow-y-auto">
              <div class="space-y-4">
                <div 
                  v-for="(item, index) in items" 
                  :key="item.id"
                  class="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 relative"
                >
                  <!-- Delete Button -->
                  <button
                    v-if="items.length > 1"
                    @click="removeItem(item.id)"
                    class="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors p-1"
                    title="Remove item"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 pr-8">
                    <!-- Quantity -->
                    <div>
                      <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Quantity
                      </label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="1"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>

                    <!-- Rate/Price -->
                    <div>
                      <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Rate (₦)
                      </label>
                      <input
                        v-model.number="item.price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>

                    <!-- Tax (optional) -->
                    <div v-if="taxEnabled">
                      <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Tax (%)
                      </label>
                      <input
                        v-model.number="item.tax"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>

                    <!-- Amount (calculated) -->
                    <div>
                      <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Amount
                      </label>
                      <div class="w-full px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold">
                        ₦{{ getItemAmount(item).toLocaleString() }}
                      </div>
                    </div>

                    <!-- Description -->
                    <div class="sm:col-span-4">
                      <label class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Description
                      </label>
                      <textarea
                        v-model="item.description"
                        placeholder="Enter item/service description"
                        rows="2"
                        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-600 text-slate-900 dark:text-white resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Item Button -->
              <button
                @click="addItem"
                :disabled="items.length >= MAX_ITEMS"
                class="mt-4 w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Another Item
              </button>

              <!-- Tax Toggle -->
              <div class="mt-4 flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="taxEnabled" 
                    class="rounded border-gray-300 cursor-pointer accent-blue-600 w-4 h-4"
                  />
                  <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable Tax</span>
                </label>
                
                <div v-if="taxEnabled" class="flex items-center gap-2 flex-1">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tax Rate:
                  </label>
                  <input
                    v-model.number="taxRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    class="w-20 px-3 py-1.5 border border-slate-300 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-600 text-slate-900 dark:text-white text-center"
                  />
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">%</span>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-t border-slate-200 dark:border-slate-600">
              <div class="flex items-center justify-between">
                <div class="text-sm text-slate-600 dark:text-slate-400">
                  {{ items.length }} item{{ items.length > 1 ? 's' : '' }} added
                </div>
                <div class="text-right">
                  <div class="text-sm text-slate-600 dark:text-slate-400">Total Amount</div>
                  <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₦{{ grandTotal.toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ChatPanel from '../../components/ChatPanel.vue'
import LogoCropper from '@/components/image/LogoCropper.vue'
import { useInvoiceChat, type ExtractedInvoiceInfo, type ChatMessage, type InvoiceItem } from '../../composables/useInvoiceChat'

const router = useRouter()

// Chat state
const chatMessages = ref<ChatMessage[]>([])
const isAnalyzing = ref(false)
const extractedInfo = ref<ExtractedInvoiceInfo>({})
const chatPanelRef = ref<InstanceType<typeof ChatPanel> | null>(null)

// Items state - THIS IS THE KEY FEATURE
const showItemsForm = ref(false)
const MAX_ITEMS = 20
const items = ref<InvoiceItem[]>([
  { id: 1, description: '', quantity: 1, price: 0, tax: 0 }
])
const taxEnabled = ref(false)
const taxRate = ref(7.5)

// Logo handling
const showImageCropper = ref(false)
const tempImageUrl = ref('')
const logoInput = ref<HTMLInputElement | null>(null)

// Initialize the invoice chat composable
const {
  startConversation: startChat,
  processMessage,
  handleAction: handleChatAction,
  onLogoUploaded,
  onItemsUpdated
} = useInvoiceChat({
  extractedInfo,
  chatMessages,
  isAnalyzing,
  showItemsForm, // Pass the ref to control visibility
  onGenerate: handleGenerate,
  onScrollToBottom: scrollToBottom,
  onUploadLogo: triggerLogoUpload,
  onOpenEditModal: () => {}
})

// Computed values for items
function getItemAmount(item: InvoiceItem): number {
  const subtotal = item.quantity * item.price
  if (taxEnabled.value && item.tax > 0) {
    return subtotal + (subtotal * item.tax / 100)
  }
  return subtotal
}

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.quantity * item.price), 0)
})

const taxAmount = computed(() => {
  if (!taxEnabled.value) return 0
  return subtotal.value * (taxRate.value / 100)
})

const grandTotal = computed(() => {
  return subtotal.value + taxAmount.value
})

// Item management
function addItem() {
  if (items.value.length < MAX_ITEMS) {
    items.value.push({
      id: Date.now(),
      description: '',
      quantity: 1,
      price: 0,
      tax: 0
    })
  }
}

function removeItem(id: number) {
  if (items.value.length > 1) {
    items.value = items.value.filter(item => item.id !== id)
  }
}

function finishAddingItems() {
  // Update extracted info with items
  extractedInfo.value.items = [...items.value]
  extractedInfo.value.taxEnabled = taxEnabled.value
  extractedInfo.value.taxRate = taxRate.value
  
  // Notify composable
  onItemsUpdated(items.value)
  
  // Close modal and continue chat
  showItemsForm.value = false
  handleChatAction('done_items')
}

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
  const invoiceData = {
    organizationName: extractedInfo.value.organizationName || '',
    organizationSubName: extractedInfo.value.organizationSubName || '',
    headOfficeAddress: extractedInfo.value.headOfficeAddress || '',
    headOfficePhone: extractedInfo.value.headOfficePhone || '',
    branchAddress1: extractedInfo.value.branchAddress1 || '',
    branch1Phone: extractedInfo.value.branch1Phone || '',
    branchAddress2: extractedInfo.value.branchAddress2 || '',
    branch2Phone: extractedInfo.value.branch2Phone || '',
    logoDataUrl: extractedInfo.value.logoDataUrl || '',
    customerName: extractedInfo.value.customerName || '',
    customerAddress: extractedInfo.value.customerAddress || '',
    lpo: extractedInfo.value.lpo || '',
    date: extractedInfo.value.date || new Date().toLocaleDateString(),
    items: items.value,
    taxEnabled: taxEnabled.value,
    taxRate: taxRate.value,
    subtotal: subtotal.value,
    taxAmount: taxAmount.value,
    grandTotal: grandTotal.value,
    selectedTemplate: extractedInfo.value.selectedTemplate || 'template1'
  }
  
  try {
    localStorage.setItem('sdp_invoice_chat_data', JSON.stringify(invoiceData))
    // Also save to invoicePreviewData for PreviewInvoice to pick up the selectedTemplate
    const previewData = {
      ...invoiceData,
      formMode: 'generate',
      fromQuickFill: true,
      selectedTemplate: invoiceData.selectedTemplate
    }
    localStorage.setItem('invoicePreviewData', JSON.stringify(previewData))
    console.log('✅ Invoice data saved for preview:', invoiceData)
    
    // Navigate to preview
    router.push('/preview-invoice')
  } catch (error) {
    console.error('Failed to save invoice data:', error)
    // Show error message in chat
    chatMessages.value.push({
      id: Date.now(),
      text: '❌ Error saving invoice data. Please try again.',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }
}

function switchToFormMode() {
  router.push('/generate-invoice')
}

onMounted(() => {
  // Let user click "Let's Begin" button
})
</script>

<style scoped>
/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9) translateY(20px);
}
</style>
