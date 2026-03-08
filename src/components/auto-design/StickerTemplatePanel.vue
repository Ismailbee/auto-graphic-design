<template>
  <div class="sticker-page-wrapper" :class="{ 'wedding-active': selectedCategory === 'wedding' }">
  <div class="sticker-template-panel">
    <!-- FORM VIEW (Wedding is the only category) -->
    <div class="form-view">
      <!-- Header - Using extracted PanelHeader component -->
      <PanelHeader
        title="Sticker Template"
        :is-voice-enabled="isVoiceEnabled"
        @back="goBack"
        @help="showChatHelp"
        @toggle-voice="toggleVoice"
      />



        <!-- Category Selection Grid - Using extracted CategorySelector component -->
        <CategorySelector
          v-if="!selectedCategory"
          :categories="categories"
          @select="selectCategory"
        />

        <!-- Category Pills Removed -->

        <!-- Form Section (Wedding is the only category) -->
        <div class="form-section wedding-mode" v-if="selectedCategory">
          <!-- Wedding Chat Interface -->
          <div class="wedding-chat-interface">
            
            <!-- Chat Messages Component -->
            <WeddingChatMessages
          ref="weddingChatMessagesRef"
          :messages="chatMessages"
          :is-analyzing="isAnalyzing"
          :is-generating-preview="isGeneratingPreview"
          :show-preview="showWeddingStickerPreview"
          :generating-message="generatingMessage"
          :is-authenticated="authStore.isAuthenticated"
          :user-name="userStore.user?.name?.split(' ')[0]"
          :tokens="userStore.user?.tokens ?? 0"
          @login="authStore.openAuthModal('login')"
          @action="handleMessageAction"
          @menu-action="handlePreviewMenuAction"
        />

        <!-- Chat Input -->
        <WeddingChatInput
          v-model="chatInputText"
          :show-preview="showWeddingStickerPreview"
          @send="handleGenerateFromChat"
          @upload="triggerImageUpload"
        />
      </div>

          <!-- Hidden Wedding Preview Container (for SVG manipulation) -->
          <div v-if="showWeddingStickerPreview" class="wedding-preview-container" ref="weddingPreviewContainer" style="position: absolute; left: -9999px; top: -9999px; visibility: hidden; pointer-events: none;">
            <!-- SVG will be loaded here for manipulation -->
          </div>

          <!-- Edit Modal for Wedding Sticker -->
          <div v-if="showWeddingStickerPreview && showEditModal" class="wedding-preview-section">
            <label class="form-label">Edit Your Design</label>
            
            <!-- Image Controls Component -->
            <ImageControls
              :hasImages="svgImageManager.images.value.length > 0"
              :showControls="showImageControls"
              :selectedImage="selectedSVGImage"
              :isRetouching="isRetouching"
              :isRemovingBackground="isRemovingBackground"
              :backgroundRemovalProgress="backgroundRemovalProgress"
              :backgroundRemovalError="backgroundRemovalError"
              @toggle-controls="showImageControls = !showImageControls"
              @change-image="showUploadModal = true"
              @edit-description="openEditModal"
              @auto-retouch="autoRetouchImage"
              @set-scale="setImageScale"
              @scale-change="handleImageScaleChange"
              @flip="flipImage"
              @crop="retouchImage"
              @cancel-bg-removal="cancelBackgroundRemoval"
              @clear-error="backgroundRemovalError = null"
            />

            <!-- Error Message -->
            <div v-if="svgImageManager.uploadError.value" class="upload-error">
            {{ svgImageManager.uploadError.value }}
          </div>

          <!-- Export Buttons Component -->
          <ExportButtons 
            v-if="svgImageManager.images.value.length > 0 || formData.description"
            @export="(format) => exportWeddingSticker(format)"
          />
        </div>
      </div>

      <!-- Hidden file input for chat upload -->
      <input
        ref="preGeneratedImageInput"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        class="hidden"
        @change="handlePreGeneratedImageSelect"
      />
    </div>

    <!-- Image Crop Modal -->
    <ImageCropModal
      :is-open="showCropModal"
      :image-src="cropImageSrc"
      :image-file="cropImageFile || undefined"
      @close="handleCropModalClose"
      @crop="handleCropComplete"
    />

    <!-- Upload Modal - Using extracted component -->
    <UploadModal
      v-if="showUploadModal"
      :is-processing="uploadModalProcessing"
      :progress="uploadModalProgress"
      :status-text="uploadModalStatusText"
      :success="uploadModalSuccess"
      :auto-remove-background="autoRemoveBackground"
      @close="closeUploadModal"
      @update:auto-remove-background="(val) => autoRemoveBackground = val"
      @file-select="handleModalFileSelect"
    />

    <!-- Edit Description Modal - Using extracted component -->
    <EditDescriptionModal
      v-if="showEditModal"
      :description="formData.description"
      :validation-warnings="validationWarnings"
      :extracted-info="editModalExtractedInfo"
      @update:description="(val) => { formData.description = val; handleDescriptionInput() }"
      @save="handleEditModalSave"
      @close="closeEditModal"
    />
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch, defineAsyncComponent, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'
import { useDebounceFn } from '@vueuse/core'
import { ai } from '@/services/ai/ai.service'

// Import styles from external CSS file
import './sticker/styles/StickerTemplatePanel.css'

// Lazy load heavy animation library
const Vue3Lottie = defineAsyncComponent(() => 
  import('vue3-lottie').then(m => m.Vue3Lottie)
)

// TTS lazy-loading now handled by useSpeechToText composable

// Import composables that remain in global location
import { useBackgroundRemoval } from '@/composables/useBackgroundRemoval'
import { useImageRetouch } from '@/composables/useImageRetouch'
import { getBackgroundRefsCached } from '@/services/background-catalog.service'

// Lazy load heavy components for better performance
const ImageCropModal = defineAsyncComponent(() => import('@/components/modals/ImageCropModal.vue'))

// Lazy load sticker sub-components
const PanelHeader = defineAsyncComponent(() => import('./sticker/PanelHeader.vue'))
const CategorySelector = defineAsyncComponent(() => import('./sticker/CategorySelector.vue'))
const WeddingChatMessages = defineAsyncComponent(() => import('./sticker/WeddingChatMessages.vue'))
const WeddingChatInput = defineAsyncComponent(() => import('./sticker/WeddingChatInput.vue'))
const ImageControls = defineAsyncComponent(() => import('./sticker/ImageControls.vue'))
const UploadModal = defineAsyncComponent(() => import('./sticker/UploadModal.vue'))
const EditDescriptionModal = defineAsyncComponent(() => import('./sticker/EditDescriptionModal.vue'))
const GeneratingPreview = defineAsyncComponent(() => import('./sticker/GeneratingPreview.vue'))
const ExportButtons = defineAsyncComponent(() => import('./sticker/ExportButtons.vue'))
const SvgPreview = defineAsyncComponent(() => import('./sticker/SvgPreview.vue'))

// Import types only (no runtime cost)
import type { ChatMessage, Category, ExtractedInfo } from './sticker'

// Import sticker composables (all sticker-specific composables now centralized here)
import {
  // Moved from @/composables (sticker-only usage)
  useWeddingStickerUpdater,
  useSVGImageManager,
  useSVGExport,
  useDynamicSVG,
  useSVGTextReplacement,
  useTextExtraction,
  useAiChatResponses,
  useStickerExport,
  // Title library and flourish
  useTitleLibrary,
  useFlourishSystem,
  useBackgroundManager,
  // Extraction utilities
  extractNamesFromResponse,
  extractDateFromText,
  extractCourtesyFromText,
  extractSizeFromText,
  extractNamesFromBrackets,
  parseAllInOneMessage,
  capitalizeWords,
  escapeRegExp,
  // AI Response Helper
  aiResponseHelper,
  // Title detection
  titlePatterns,
  titlePhraseMap,
  isPotentialTitle,
  extractTitleFromText,
  // Local extraction
  extractWeddingDetails,
  hasWeddingDetails,
  // Wedding chat composable
  useWeddingChat,
  // Speech-to-Text composable
  useSpeechToText,
  // SVG Draggable composable
  useSVGDraggable,
  // SVG Image Updater composable
  useSVGImageUpdater,
  // Wedding Preview Generation composable
  useWeddingPreviewGeneration,
  // Image Upload Flow composable
  useImageUploadFlow,
  // Wedding State composable
  useWeddingState,
} from './sticker/composables'

// Import SVG utility functions (extracted for file size reduction)
import { 
  makeSVGImageDraggable as makeSVGImageDraggableUtil,
  updateSVGWithImages as updateSVGWithImagesUtil,
  handleSizeChange as handleSizeChangeUtil
} from './sticker/utils/svgUtils'

// Import image utility functions (extracted for file size reduction)
import {
  handleImageScaleChangeUtil,
  setImageScaleUtil,
  flipImageUtil,
  autoRetouchImageUtil,
  updateSelectedImagePropertyUtil,
  handlePreGenerationCropUtil,
  handlePostGenerationCropUtil,
  type CropCompleteData
} from './sticker/utils/imageUtils'

// Import chat utility functions (extracted for file size reduction)
import {
  trackImageUploadUtil,
  buildWeddingChatContextForAIUtil,
  buildWeddingChatTranscriptForAIUtil,
  parseSizeToInchesUtil,
  syncWeddingDescriptionFromStateUtil,
  type ChatMessage as ChatMessageType
} from './sticker/utils/chatUtils'

// Import form utility functions (extracted for file size reduction)
import {
  updateDateAndCourtesyUtil,
  generateValidationWarnings,
  applyCustomHeadingUtil,
  applyHeadingFontUtil,
  COURTESY_KEYWORDS
} from './sticker/utils/formUtils'

// Import preview generation utilities (extracted for file size reduction)
import {
  GENERATING_MESSAGES,
  startGeneratingMessages,
  stopGeneratingMessages,
  hasConfirmedWeddingSize as hasConfirmedWeddingSizeUtil,
  promptForWeddingSize as promptForWeddingSizeUtil,
  parseSizeToInches,
  setWeddingSize as setWeddingSizeUtil,
  generateWeddingPreviewUtil,
  handleGenerateMoreUtil,
  handleGenerateNewUtil,
  type GenerationContext
} from './sticker/utils/previewUtils'

// Import template utilities (extracted for file size reduction)
import {
  loadWeddingStickerTemplateUtil,
  processDescriptionInputUtil,
  applyCustomHeadingAndFont,
  resetTitleRenderCache,
  type TemplateContext
} from './sticker/utils/templateUtils'

// Import export utilities
import { exportWeddingStickerUtil, type ExportContext } from './sticker/utils/exportUtils'

const router = useRouter()
const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const { updateStickerText, getSVGElements, extractNames } = useWeddingStickerUpdater()
const { applyRetouch } = useImageRetouch()
const { calculateDimensions, resizeSVG, validateForExport, PRINT_DPI, SCREEN_DPI } = useDynamicSVG()

// ========================================
// WEDDING STATE - Using composable (replaces ~200 lines of inline state)
// ========================================
const {
  // Category & View
  showMenu,
  selectedCategory,
  categories,
  
  // Preview State
  showWeddingStickerPreview,
  isGeneratingPreview,
  generatingStep,
  isDescriptionVisible,
  showEditModal,
  generatingMessage,
  isGeneratingNewBackground,
  
  // Token Tracking
  hasDesignBeenGenerated,
  TOKEN_COST_GENERATE_DESIGN,
  TOKEN_COST_EDIT_TEXT,
  TOKEN_COST_CHANGE_BACKGROUND,
  
  // Form Data
  formData,
  
  // Chat State
  chatInputText,
  chatMessages,
  isAnalyzing,
  accumulatedDescription,
  
  // Wizard Step State
  awaitingPictureDecision,
  awaitingSizeDecision,
  pictureStepComplete,
  sizeStepComplete,
  awaitingBackgroundRemovalDecision,
  awaitingImageUpdateConfirmation,
  backgroundRemovalAlreadyHandled,
  
  // Image State
  pendingImageFile,
  uploadedImages,
  lastUploadedImage,
  awaitingImageChoice,
  awaitingNameInput,
  nameExtractionAttempts,
  preGeneratedImageFile,
  preGeneratedImagePreview,
  
  // Heading/Title State
  awaitingHeadingInput,
  awaitingFontChoice,
  customHeading,
  selectedHeadingFont,
  headingStepComplete,
  awaitingTitleConfirmation,
  pendingTitle,
  
  // Extracted Info
  extractedInfo,
  
  // Asked Questions
  askedQuestions,
  
  // Post-generation Update State
  awaitingDateChange,
  awaitingCourtesyChange,
  pendingDateUpdate,
  pendingCourtesyUpdate,
  awaitingCourtesyInput,
  pendingCourtesyText,
  
  // Crop Modal State
  showCropModal,
  cropImageSrc,
  cropImageFile,
  isPreGenerationCrop,
  
  // Upload Modal State
  showUploadModal,
  uploadModalProcessing,
  uploadModalProgress,
  uploadModalStatusText,
  uploadModalSuccess,
  
  // Background Removal State
  autoRemoveBackground,
  backgroundRemovalError,
  
  // Image Controls
  showImageControls,
  isRetouching,
  showUploadOptions,
  
  // Animation
  loadingAnimation,
  
  // DOM Refs
  preGeneratedImageInput,
  
  // Utility Methods
  resetAskedQuestions,
  resetWeddingState: resetWeddingStateFromComposable
} = useWeddingState()

// Load animation on mount
fetch('/animations/loading-circle.json')
  .then(res => res.json())
  .then(data => { loadingAnimation.value = data })
  .catch(() => { /* Fallback handled in template */ })

// ========================================
// TITLE LIBRARY - Using composable
// ========================================
const {
  TITLE_LIBRARY,
  findMatchingTitle,
  renderSvgToPng,
  replaceTitleWithImage,
  restoreTitleTextElements,
  updateTitleColor,
  clearTitleImageCache,
} = useTitleLibrary()

// Shared ref for tracking current background (used by flourish system)
const currentBackgroundFileName = ref<string>('')

// ========================================
// FLOURISH SYSTEM - Using composable
// ========================================
const {
  AVAILABLE_FLOURISHES,
  DEFAULT_FLOURISH_CONFIG: FLOURISH_CONFIG,
  getRandomFlourish,
  getFlourishColorForBackground,
  insertFlourishAboveNames,
  updateFlourishColor,
  removeFlourish,
} = useFlourishSystem(currentBackgroundFileName)

// Validation Warnings
const validationWarnings = ref<string[]>([])

function updateValidationWarnings(data: any) {
  validationWarnings.value = generateValidationWarnings(data, formData.description)
}

// SVG Image Management
const svgImageManager = useSVGImageManager({
  defaultX: 100,
  defaultY: 100,
  defaultWidth: 400,
  defaultHeight: 400
})

// NOTE: isRetouching, showImageControls, showUploadOptions provided by useWeddingState composable

// SVG Text Replacement (for Nikkah graphics)
const { handleReplacement, resetReplacement, restoreOriginalElements, replacementState } = useSVGTextReplacement()

// SVG Export
const { exportSVG } = useSVGExport()

// Background Removal
const {
  removeBackground,
  isProcessing: isRemovingBackground,
  progress: backgroundRemovalProgress,
  error: bgRemovalError,
  cancelProcessing: cancelBackgroundRemoval,
  isSupported: isBackgroundRemovalSupported
} = useBackgroundRemoval()

// Wedding sticker refs
const weddingPreviewContainer = ref<HTMLDivElement | null>(null)
// WeddingChatMessages component ref
const weddingChatMessagesRef = ref<InstanceType<typeof WeddingChatMessages> | null>(null)
// Computed property to get chatPreviewContainer from the component
const chatPreviewContainer = computed(() => {
  if (!weddingChatMessagesRef.value) return null
  return weddingChatMessagesRef.value.previewContainers
})
// Computed property to get chatHistoryContainer from the component
const chatHistoryContainer = computed(() => {
  if (!weddingChatMessagesRef.value) return null
  // WeddingChatMessages exposes `chatContainer`
  return weddingChatMessagesRef.value.chatContainer
})
const imageFileInput = ref<HTMLInputElement | null>(null)
let svgElements: ReturnType<typeof getSVGElements> | null = null

// ========================================
// BACKGROUND MANAGER - Using composable
// ========================================
// Forward declaration for updateSVGWithImages (defined later in file)
let _updateSVGWithImages: (() => void) | undefined

// Persistence key based on user ID
const backgroundPersistenceKey = computed(() => {
  const userId = authStore.user?.id || 'anon'
  return `weddingSticker:selectedBackground:${userId}`
})

const {
  availableBackgrounds,
  currentBackgroundIndex,
  currentBackgroundFileName: bgManagerBackgroundFileName,
  usedBackgroundsInSession,
  getPersistedWeddingBackground,
  setPersistedWeddingBackground,
  loadWeddingBackgroundManifest,
  getBackgroundColorConfig,
  getTitleColorForBackground,
  getRandomBackground,
  applyNewBackground,
  updateChatPreviewSVG,
  currentBackgroundPaletteKey,
  LIGHT_BG_COLORS,
  DARK_BG_COLORS,
  RED_GOLD_BG_COLORS,
} = useBackgroundManager({
  weddingPreviewContainer,
  chatPreviewContainer: chatPreviewContainer as Ref<HTMLElement | HTMLElement[] | null>,
  clearTitleImageCache,
  updateSVGWithImages: () => _updateSVGWithImages?.(),
  updateTitleColor,
  flourishSystem: {
    getFlourishColorForBackground,
    updateFlourishColor,
  },
  persistenceKey: backgroundPersistenceKey,
})

// Sync background filename to our shared ref (for flourish system)
watch(bgManagerBackgroundFileName, (newVal) => {
  currentBackgroundFileName.value = newVal
}, { immediate: true })

// NOTE: State refs (showMenu, selectedCategory, showWeddingStickerPreview, etc.)
// are now provided by useWeddingState composable above

// Handle action button clicks in messages
function handleMessageAction(action: { type: string; label?: string; route?: string }) {
  switch (action.type) {
    case 'login':
      // Navigate to login page (same as "Get Started" button on home page)
      router.push('/login')
      break
    case 'register':
      // Navigate to register page
      router.push('/register')
      break
    case 'buy-tokens':
      router.push('/tokens-and-plans')
      break
    case 'navigate':
      if (action.route) {
        router.push(action.route)
      }
      break
    case 'upload':
    case 'add_photo':
      // Trigger image upload (used by useWeddingChat composable)
      triggerImageUpload()
      break
    case 'generate_preview':
    case 'generate':
      // Generate the sticker (used by useWeddingChat composable)
      requestWeddingPreviewGeneration()
      break
    case 'regenerate':
      // Regenerate with a new random background
      regenerateWithNewBackground()
      break
    case 'edit':
      // Open the edit modal
      showEditModal.value = true
      break
    case 'download':
      // Download the sticker as PNG
      exportWeddingSticker('png')
      break
    default:
      break
  }
}

// Wedding size confirmation helpers - using extracted utilities
function hasConfirmedWeddingSize(): boolean {
  return hasConfirmedWeddingSizeUtil(extractedInfo, sizeStepComplete)
}

function promptForWeddingSize(): void {
  promptForWeddingSizeUtil(awaitingSizeDecision, isAnalyzing, chatMessages, scrollToBottom)
}

function setWeddingSize(sizeRaw: string): void {
  setWeddingSizeUtil(
    sizeRaw,
    extractedInfo,
    formData,
    sizeStepComplete,
    awaitingSizeDecision,
    showWeddingStickerPreview,
    handleSizeChange,
    syncWeddingDescriptionFromState
  )
}

function requestWeddingPreviewGeneration(): void {
  if (!hasConfirmedWeddingSize()) {
    promptForWeddingSize()
    return
  }
  generateWeddingPreview()
}

// Token deduction helper function
async function deductTokensForAction(amount: number, reason: string): Promise<boolean> {
  // Token system temporarily disabled for development
  return true
}

function openEditModal() {
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  // Ensure update is processed
  processDescriptionInput()
}

// Handle generate more - using extracted utility
async function handleGenerateMore() {
  await handleGenerateMoreUtil(
    chatMessages,
    isGeneratingPreview,
    generatingMessage,
    getRandomBackground,
    applyNewBackground,
    updateChatPreviewSVG,
    scrollToBottom
  )
}

// Handle generate new - using extracted utility
async function handleGenerateNew() {
  await handleGenerateNewUtil(
    weddingPreviewContainer,
    chatPreviewContainer,
    chatMessages,
    isGeneratingPreview,
    generatingMessage,
    getRandomBackground,
    applyNewBackground,
    scrollToBottom
  )
}

// Handle preview menu actions (from 3-dot menu on preview)
function handlePreviewMenuAction(action: string) {
  if (action === 'generate') {
    handleGenerateMore()
  } else if (action === 'generate-new') {
    handleGenerateNew()
  } else if (action === 'edit') {
    openEditModal()
  } else if (action === 'download') {
    exportWeddingSticker('png')
  }
}

// Computed property for edit modal extracted info
const editModalExtractedInfo = computed(() => ({
  heading: customHeading.value || '',
  name1: extractedInfo.value.names.name1 || '',
  name2: extractedInfo.value.names.name2 || '',
  date: extractedInfo.value.date || '',
  courtesy: extractedInfo.value.courtesy || ''
}))

// Handle save from edit modal - update SVG directly
async function handleEditModalSave(data: { heading: string; name1: string; name2: string; date: string; courtesy: string }) {
  // Update extracted info
  extractedInfo.value.names.name1 = data.name1 || null
  extractedInfo.value.names.name2 = data.name2 || null
  extractedInfo.value.date = data.date || null
  extractedInfo.value.courtesy = data.courtesy || null
  customHeading.value = data.heading || null
  
  // Rebuild description from parts
  // Use brackets for names so extractNames in useWeddingStickerUpdater can detect them
  // and trigger the decorative SVG system with proper fonts
  const parts: string[] = []
  if (data.heading) parts.push(data.heading)
  if (data.name1 && data.name2) {
    parts.push(`(${data.name1} & ${data.name2})`)  // Use brackets for extractNames to detect
  } else if (data.name1) {
    parts.push(`(${data.name1})`)
  }
  if (data.date) parts.push(data.date)
  if (data.courtesy) parts.push(`courtesy: ${data.courtesy}`)
  
  const newDescription = parts.join(', ')
  formData.description = newDescription
  accumulatedDescription.value = newDescription
  
  // Trigger full update through processDescriptionInput which handles
  // the decorative SVG system with proper fonts and positioning
  await processDescriptionInput()
  
  // Sync to chat preview after update
  await nextTick()
  updateChatPreviewSVG()
  
  // Show confirmation
  authStore.showNotification({
    title: 'Updated!',
    message: 'Your design has been updated.',
    type: 'success'
  })
}

// Chat footer handlers
function triggerImageUpload() {
  showUploadOptions.value = false
  if (selectedCategory.value === 'wedding') {
    preGeneratedImageInput.value?.click()
  }
}

// Voice functions now come from useSpeechToText composable:
// - toggleVoiceInput, stopVoiceRecording, stopVoiceRecordingAndSend
// - checkIfMobile, toggleVoice, speakMessage, stopAllSpeech
// - isRecording, isVoiceEnabled, isMobileDevice, interimTranscript

// Main wedding preview generation - using extracted utility
async function generateWeddingPreview() {
  const ctx: GenerationContext = {
    weddingPreviewContainer,
    chatPreviewContainer,
    showWeddingStickerPreview,
    isGeneratingPreview,
    generatingStep,
    generatingMessage,
    chatMessages,
    formData,
    accumulatedDescription,
    extractedInfo,
    validationWarnings,
    isDescriptionVisible,
    hasDesignBeenGenerated,
    preGeneratedImageFile,
    autoRemoveBackground,
    sizeStepComplete,
    awaitingSizeDecision,
    isAnalyzing,
    currentBackgroundFileName,
    availableBackgrounds,
    TOKEN_COST_GENERATE_DESIGN,
    scrollToBottom,
    loadWeddingBackgroundManifest,
    getPersistedWeddingBackground,
    getRandomBackground,
    setPersistedWeddingBackground,
    loadWeddingStickerTemplate,
    processDescriptionInput,
    applyNewBackground,
    updateChatPreviewSVG,
    handleSizeChange,
    updateSVGWithImages,
    makeSVGImageDraggable,
    extractNames,
    deductTokensForAction,
    updateValidationWarnings,
    updateStickerText,
    svgImageManager,
    removeBackground,
    isBackgroundRemovalSupported,
    authStore
  }
  await generateWeddingPreviewUtil(ctx)
}

// Regenerate with a new random background (keeps same text/image)
async function regenerateWithNewBackground() {
  const newBackground = getRandomBackground()
  if (!newBackground) {
    console.warn('⚠️ No backgrounds available for regeneration')
    return
  }
  
  console.log('🔄 Regenerating with new background:', newBackground.name || newBackground.id)
  
  // Apply the new background
  await applyNewBackground(newBackground)
  
  // Update the chat preview
  updateChatPreviewSVG()
  
  // Add a chat message about the change
  chatMessages.value.push({
    id: Date.now(),
    text: `✨ New background applied! Click **New** again to try another style.`,
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
}

// NOTE: State refs provided by useWeddingState composable (crop, upload, form, chat, categories)

// Track image uploads - wrapper for extracted utility
function trackImageUpload(file: File) {
  trackImageUploadUtil(file, {
    chatMessages,
    uploadedImages,
    lastUploadedImage,
    awaitingImageChoice,
    awaitingImageUpdateConfirmation,
    pendingImageFile,
    showWeddingStickerPreview,
    scrollToBottom
  })
}

// showChatHelp - displays help message in chat
function showChatHelp() {
  const helpText = "Let me show you how it works!\n\n1. Type your details or upload a picture\n2. Use two fingers to resize images on mobile\n3. Click the voice icon to hear me speak!\n\nIt's easy! Let's go!"

  chatMessages.value.push({
    id: Date.now(),
    text: helpText,
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
}

// Setup auto-speak watcher for AI messages (using composable)
onMounted(() => {
  setupAutoSpeakWatcher()
  initializeVoice()
})

// NOTE: accumulatedDescription, awaiting states, pendingImageFile, uploadedImages,
// customHeading, selectedHeadingFont, extractedInfo all provided by useWeddingState composable

// Sync title with customHeading when either changes
watch(() => extractedInfo.value.title, (newTitle) => {
  if (newTitle && newTitle !== customHeading.value) {
    customHeading.value = newTitle
    headingStepComplete.value = true
  }
})
watch(customHeading, (newHeading) => {
  if (newHeading && newHeading !== extractedInfo.value.title) {
    extractedInfo.value.title = newHeading
  }
})

// WEDDING CHAT COMPOSABLE - Forward declaration for title/names/date/courtesy detection
let weddingChatProcessor: ReturnType<typeof useWeddingChat> | null = null

// NOTE: State provided by useWeddingState; AI utilities from composables

const scrollToBottom = () => {
  if (weddingChatMessagesRef.value?.scrollToBottom) {
    weddingChatMessagesRef.value.scrollToBottom()
  } else {
    nextTick(() => {
      if (chatHistoryContainer.value) {
        chatHistoryContainer.value.scrollTop = chatHistoryContainer.value.scrollHeight
      }
    })
  }
}

// SPEECH-TO-TEXT & TTS - Forward reference for sendMessage
let _sendMessageRef: (() => void) | null = null
const sendMessageWrapper = () => {
  if (_sendMessageRef) _sendMessageRef()
}

// Initialize speech composable with all required dependencies
const speechHandler = useSpeechToText({
  chatInputText,
  chatMessages: chatMessages as any,
  sendMessage: sendMessageWrapper,
  scrollToBottom,
  showNotification: (opts) => authStore.showNotification(opts),
  selectedCategory: selectedCategory as any,
})

// Destructure what we need from the composable
const {
  isRecording,
  isVoiceEnabled,
  isMobileDevice,
  interimTranscript,
  toggleVoiceInput,
  stopVoiceRecording,
  stopVoiceRecordingAndSend,
  toggleVoice,
  speakMessage,
  stopAllSpeech,
  initializeVoice,
  setupAutoSpeakWatcher,
  checkIfMobile,
} = speechHandler

// Initialize the wedding chat composable for proper title/names/date/courtesy detection
weddingChatProcessor = useWeddingChat({
  extractedInfo: extractedInfo as any,  // Cast to expected ExtractedInfo type
  chatMessages: chatMessages as any,
  isAnalyzing,
  showPreview: showWeddingStickerPreview,
  hasPhoto: computed(() => !!preGeneratedImageFile.value || svgImageManager.images.value.length > 0),
  awaitingPictureDecision: awaitingImageChoice,
  awaitingSizeDecision,
  awaitingBackgroundRemovalDecision,
  onGenerate: () => requestWeddingPreviewGeneration(),
  onScrollToBottom: scrollToBottom,
  onUploadPicture: () => triggerImageUpload(),
  onSetSize: (size: string) => setWeddingSize(size),
  onBackgroundRemovalDecision: (shouldRemoveBackground: boolean) => {
    // Move image from pendingImageFile to preGeneratedImageFile
    if (pendingImageFile.value) {
      preGeneratedImageFile.value = pendingImageFile.value
      console.log('📸 onBackgroundRemovalDecision: set preGeneratedImageFile from pendingImageFile', {
        shouldRemoveBackground,
        fileName: preGeneratedImageFile.value.name,
        fileSize: preGeneratedImageFile.value.size
      })
      
      // Set the auto-remove background flag based on user decision
      autoRemoveBackground.value = shouldRemoveBackground
      
      // Clear pending
      pendingImageFile.value = null
      pictureStepComplete.value = true
      
      // Add confirmation message
      chatMessages.value.push({
        id: Date.now(),
        text: shouldRemoveBackground 
          ? "Got it! I'll remove the background from your image. 🎨" 
          : "Okay! I'll keep the background as is. 📸",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      
      // Check if we can proceed to generation
      const hasAllInfo = extractedInfo.value.names.name1 && extractedInfo.value.date && extractedInfo.value.courtesy
      const hasSize = sizeStepComplete.value || extractedInfo.value.size
      
      setTimeout(() => {
        if (hasAllInfo && hasSize) {
          chatMessages.value.push({
            id: Date.now(),
            text: "Perfect! Let me create your sticker now! 🎨",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          formData.description = accumulatedDescription.value
          setTimeout(() => requestWeddingPreviewGeneration(), 300)
        } else if (hasAllInfo && !sizeStepComplete.value) {
          chatMessages.value.push({
            id: Date.now(),
            text: "What size would you like the sticker? (e.g., '3x3' or 'default' for 4x4 inches)",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          awaitingSizeDecision.value = true
          scrollToBottom()
        }
      }, 500)
    }
  },
})

type WeddingAssistantActionName =
  | 'none'
  | 'open_login'
  | 'generate_preview'
  | 'open_edit'
  | 'download_png'
  | 'regenerate'
  | 'set_size'
  | 'ask_upload'

interface WeddingAssistantDecision {
  message: string
  action?: {
    name: WeddingAssistantActionName
    args?: Record<string, unknown>
  }
  updates?: {
    heading?: string | null
    name1?: string | null
    name2?: string | null
    date?: string | null
    courtesy?: string | null
    size?: string | null
  }
  buttons?: Array<{ type: string; label: string; variant?: string }>
}

function syncWeddingDescriptionFromState() {
  syncWeddingDescriptionFromStateUtil(
    customHeading.value,
    extractedInfo.value,
    accumulatedDescription,
    formData
  )
}

function buildWeddingChatContextForAI() {
  return buildWeddingChatContextForAIUtil(
    authStore.isAuthenticated,
    userStore.user?.tokens ?? 0,
    showWeddingStickerPreview.value,
    customHeading.value,
    extractedInfo.value,
    !!preGeneratedImageFile.value
  )
}

function buildWeddingChatTranscriptForAI(maxMessages = 10): string {
  return buildWeddingChatTranscriptForAIUtil(chatMessages.value as any, maxMessages)
}

function parseSizeToInches(size: string): { w: number; h: number } | null {
  return parseSizeToInchesUtil(size)
}

// analyzeMessage uses weddingChatProcessor and local extraction
async function analyzeMessage(lastUserMessage: string) {
  if (!lastUserMessage || typeof lastUserMessage !== 'string') {
    return
  }

  // Use wedding chat composable for processing
  if (weddingChatProcessor) {
    const handled = await weddingChatProcessor.processMessage(lastUserMessage)
    if (handled) {
      syncWeddingDescriptionFromState()
      isAnalyzing.value = false
      return
    }
  }

  // Fallback: Try local extraction
  const localResult = extractWeddingDetails(lastUserMessage, {
    hasName: !!extractedInfo.value.names.name1,
    hasDate: !!extractedInfo.value.date
  })

  if (localResult.foundSomething) {
    if (localResult.title && !customHeading.value) {
      customHeading.value = localResult.title
      headingStepComplete.value = true
    }
    if (localResult.name1) extractedInfo.value.names.name1 = localResult.name1
    if (localResult.name2) extractedInfo.value.names.name2 = localResult.name2
    if (localResult.date) extractedInfo.value.date = localResult.date
    if (localResult.courtesy) extractedInfo.value.courtesy = localResult.courtesy

    syncWeddingDescriptionFromState()

    const hasName = !!extractedInfo.value.names.name1
    const hasDate = !!extractedInfo.value.date

    let responseText = ''
    if (hasName && hasDate) {
      responseText = `Got it! I've noted your details. Generating your sticker now...`
      setTimeout(() => generateWeddingPreview(), 500)
    } else {
      const missing: string[] = []
      if (!hasName) missing.push("bride's and groom's names")
      if (!hasDate) missing.push('wedding date')
      responseText = `I still need: ${missing.join(' and ')}.`
    }

    isAnalyzing.value = false
    chatMessages.value.push({
      id: Date.now(),
      text: responseText,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }

  // No extraction - ask for info
  isAnalyzing.value = false
  const hasName = !!extractedInfo.value.names.name1
  const hasDate = !!extractedInfo.value.date
  const missing: string[] = []
  if (!hasName) missing.push('names')
  if (!hasDate) missing.push('date')

  const responseText = missing.length > 0
    ? `Please share the ${missing.join(', ')} for your wedding sticker.`
    : 'I have all your details! Would you like to generate your wedding sticker?'

  chatMessages.value.push({
    id: Date.now(),
    text: responseText,
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
}


async function sendMessage() {
  const text = chatInputText.value.trim()
  if (!text) return

  stopVoiceRecording()

  // Add User Message
  chatMessages.value.push({
    id: Date.now(),
    text,
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  chatInputText.value = ''
  scrollToBottom()

  isAnalyzing.value = true
  debouncedAnalyzeMessage(text)
}

// Connect the sendMessage wrapper for speech composable
_sendMessageRef = sendMessage

// Debounced version of analyzeMessage for performance
const debouncedAnalyzeMessage = useDebounceFn(async (text: string) => {
  await analyzeMessage(text)
}, 250, { maxWait: 1500 })

// Handle size change - wrapper for extracted utility
async function handleSizeChange(widthInches: number, heightInches: number) {
  await handleSizeChangeUtil(widthInches, heightInches, {
    weddingPreviewContainer,
    updateSVGWithImagesFn: updateSVGWithImages,
    updateChatPreviewSVG
  })
}

function handleEnterKey(e: KeyboardEvent) {
  if (selectedCategory.value === 'wedding') {
    e.preventDefault()
    sendMessage()
  }
  // Otherwise let it bubble or do nothing (SmartTextarea might handle it)
}

function handlePaste(e: ClipboardEvent) {
  if (selectedCategory.value !== 'wedding') return

  const items = e.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile()
      if (blob) {
        // Handle the pasted image
        e.preventDefault()
        
        // Use the same logic as file selection
        cropImageSrc.value = URL.createObjectURL(blob)
        cropImageFile.value = blob
        isPreGenerationCrop.value = true
        showCropModal.value = true
        
        authStore.showNotification({
          title: 'Image Pasted',
          message: 'Image detected from clipboard!',
          type: 'success'
        })
        return
      }
    }
  }
}

function handleGenerateFromChat() {
  // Wedding is the only category - always use sendMessage
  sendMessage()
}

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId
}

// Reset ALL wedding-related state - uses composable + clears SVG images
function resetWeddingState() {
  resetWeddingStateFromComposable()
  svgImageManager.clearAllImages()
}

function goBack() {
  if (selectedCategory.value) {
    // Reset ALL wedding state and go back to category selection
    resetWeddingState()
    selectedCategory.value = null
  } else {
    // Navigate to home immediately
    router.push('/home')
  }
}

// Wedding Sticker Functions - using extracted template utilities
async function loadWeddingStickerTemplate() {
  const ctx: TemplateContext = {
    weddingPreviewContainer,
    formData,
    accumulatedDescription,
    customHeading,
    selectedHeadingFont,
    selectedCategory,
    currentBackgroundFileName,
    currentBackgroundPaletteKey,
    resetReplacement,
    getSVGElements,
    findMatchingTitle,
    getTitleColorForBackground,
    getFlourishColorForBackground,
    replaceTitleWithImage,
    restoreTitleTextElements,
    insertFlourishAboveNames,
    updateStickerText,
    updateValidationWarnings,
    updateSVGWithImages,
    applyCustomHeadingUtil,
    applyHeadingFontUtil,
    authStore,
    setSvgElements: (elements: any) => { svgElements = elements },
    getSvgElementsRef: () => svgElements
  }
  await loadWeddingStickerTemplateUtil(ctx)
}

// Helper function to update only date and courtesy (not names) when title SVG is active
function updateDateAndCourtesy(description: string, svgElems: any) {
  updateDateAndCourtesyUtil(description, svgElems)
}

// Debounced input handler to prevent UI freezing during typing
const handleDescriptionInput = useDebounceFn(() => {
  processDescriptionInput()
}, 50)

// Process description input - using extracted template utility
async function processDescriptionInput() {
  const ctx: TemplateContext = {
    weddingPreviewContainer,
    formData,
    accumulatedDescription,
    customHeading,
    selectedHeadingFont,
    selectedCategory,
    currentBackgroundFileName,
    currentBackgroundPaletteKey,
    resetReplacement,
    getSVGElements,
    findMatchingTitle,
    getTitleColorForBackground,
    getFlourishColorForBackground,
    replaceTitleWithImage,
    restoreTitleTextElements,
    insertFlourishAboveNames,
    updateStickerText,
    updateValidationWarnings,
    updateSVGWithImages,
    applyCustomHeadingUtil,
    applyHeadingFontUtil,
    authStore,
    setSvgElements: (elements: any) => { svgElements = elements },
    getSvgElementsRef: () => svgElements
  }
  await processDescriptionInputUtil(ctx)
}

// SVG Image Management Functions
const selectedSVGImage = computed(() => svgImageManager.getSelectedImage())

async function handleImageDrop(event: DragEvent) {
  // Get SVG element to read placeholder position
  const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
  
  // Clear existing images to prevent accumulation/duplication
  svgImageManager.clearAllImages()
  
  await svgImageManager.handleDrop(event, svgElement)

  // Update SVG preview with new images
  updateSVGWithImages()
}

async function handleImageFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    // For now, only handle the first file with cropping
    let file = files[0]

    // Step 1: Remove background if enabled
    if (autoRemoveBackground.value && isBackgroundRemovalSupported()) {
      try {
        backgroundRemovalError.value = null

        const result = await removeBackground(file, {
          quality: 'high',
          outputFormat: 'image/png',
          maxDimensions: 2048
        })

        uploadModalProgress.value = 80

        // Convert blob to File
        file = new File([result.blob], file.name.replace(/\.[^/.]+$/, '.png'), {
          type: 'image/png',
          lastModified: Date.now()
        })

        uploadModalStatusText.value = 'Background removed!'
      } catch (error: any) {
        backgroundRemovalError.value = error.message || 'Failed to remove background'
        // Continue with original image
      }
    } else if (autoRemoveBackground.value && !isBackgroundRemovalSupported()) {
      backgroundRemovalError.value = 'Background removal is not supported in this browser'
    }

    // Step 2: Create object URL for the image (original or processed)
    const imageUrl = URL.createObjectURL(file)

    // Step 3: Set crop modal data
    cropImageSrc.value = imageUrl
    cropImageFile.value = file
    showCropModal.value = true
  }

  // Reset input
  if (target) {
    target.value = ''
  }
}

// Image crop modal handlers - refactored to use utilities
async function handleCropComplete(data: CropCompleteData) {
  if (isPreGenerationCrop.value) {
    // Use utility for pre-generation crop handling
    const deps = {
      svgImageManager,
      weddingPreviewContainer,
      updateSVGWithImagesFn: updateSVGWithImages,
      scrollToBottom,
      showNotification: (opts: any) => authStore.showNotification(opts),
      chatMessages,
      uploadedImages,
      preGeneratedImageFile,
      pictureStepComplete,
      pendingImageFile,
      extractedInfo,
      sizeStepComplete,
      awaitingSizeDecision,
      awaitingBackgroundRemovalDecision,
      backgroundRemovalAlreadyHandled,
      accumulatedDescription,
      formData,
      generateWeddingPreviewFn: generateWeddingPreview
    }
    
    handlePreGenerationCropUtil(data, cropImageFile, deps)
    
    // Reset state
    isPreGenerationCrop.value = false
    showCropModal.value = false
    if (cropImageSrc.value) {
      URL.revokeObjectURL(cropImageSrc.value)
      cropImageSrc.value = ''
    }
    cropImageFile.value = null
    return
  }

  // Post-generation crop - use utility
  await handlePostGenerationCropUtil(data, cropImageFile, {
    svgImageManager,
    weddingPreviewContainer,
    updateSVGWithImagesFn: updateSVGWithImages
  })

  // Clean up
  URL.revokeObjectURL(cropImageSrc.value)
  cropImageSrc.value = ''
  cropImageFile.value = null
}

function handleCropModalClose() {
  showCropModal.value = false
  isPreGenerationCrop.value = false

  // Clean up object URL
  if (cropImageSrc.value) {
    URL.revokeObjectURL(cropImageSrc.value)
    cropImageSrc.value = ''
  }
  cropImageFile.value = null
}

function updateSelectedImageProperty(property: string, value: any) {
  if (svgImageManager.selectedImageId.value) {
    svgImageManager.updateImage(svgImageManager.selectedImageId.value, { [property]: value })

    // Update SVG preview
    updateSVGWithImages()
  }
}

// Image scale change - wrapper for extracted utility
function handleImageScaleChange(eventOrScale: Event | number) {
  handleImageScaleChangeUtil(eventOrScale, { svgImageManager, updateSVGWithImagesFn: updateSVGWithImages })
}

// Set image scale - wrapper for extracted utility
function setImageScale(scale: number) {
  setImageScaleUtil(scale, { svgImageManager, updateSVGWithImagesFn: updateSVGWithImages })
}

// Flip image - wrapper for extracted utility
function flipImage() {
  flipImageUtil({ svgImageManager, updateSVGWithImagesFn: updateSVGWithImages })
}

// Auto retouch image - wrapper for extracted utility
async function autoRetouchImage() {
  isRetouching.value = true
  try {
    await autoRetouchImageUtil({
      svgImageManager,
      weddingPreviewContainer,
      updateSVGWithImagesFn: updateSVGWithImages,
      showNotification: (opts) => authStore.showNotification(opts),
      applyRetouch
    })
  } finally {
    isRetouching.value = false
  }
}

async function retouchImage() {
  const selectedImage = svgImageManager.getSelectedImage()
  
  if (!selectedImage) {
    authStore.showNotification({
      title: 'No Image Selected',
      message: 'Please select an image to retouch',
      type: 'info'
    })
    return
  }

  try {
    // Open the crop modal with the selected image for retouching
    cropImageSrc.value = selectedImage.dataUrl
    cropImageFile.value = selectedImage.file
    showCropModal.value = true
    
  } catch (error) {
    authStore.showNotification({
      title: 'Retouch Error',
      message: 'Failed to open image for retouching',
      type: 'error'
    })
  }
}

// Make SVG image draggable - wrapper for extracted utility
function makeSVGImageDraggable(imageElement: SVGImageElement, imageId: string) {
  makeSVGImageDraggableUtil(imageElement, imageId, svgImageManager)
}

// Update SVG with images - wrapper for extracted utility
function updateSVGWithImages() {
  updateSVGWithImagesUtil({
    weddingPreviewContainer,
    svgImageManager,
    formData,
    preGeneratedImageFile,
    makeSVGImageDraggableFn: makeSVGImageDraggable
  })
}

// Wire up forward reference for Background Manager composable
_updateSVGWithImages = updateSVGWithImages

// Export wedding sticker - using extracted utility
async function exportWeddingSticker(format: 'svg' | 'png') {
  const ctx: ExportContext = {
    weddingPreviewContainer,
    svgImageManager,
    exportSVG,
    validateForExport,
    PRINT_DPI,
    showNotification: (opts) => authStore.showNotification(opts)
  }
  await exportWeddingStickerUtil(format, ctx)
}

// Watch for category changes to load wedding template
watch(selectedCategory, async (newCategory) => {
  if (newCategory === 'wedding') {
    // Load wedding template
    await nextTick()
    await loadWeddingStickerTemplate()
  }
})

// Watch for SVG size changes
watch([() => formData.svgWidth, () => formData.svgHeight], ([newWidth, newHeight]) => {
  if (selectedCategory.value === 'wedding' && weddingPreviewContainer.value) {
    const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      svgElement.setAttribute('width', newWidth.toString())
      svgElement.setAttribute('height', newHeight.toString())
    }
  }
})

// Upload Modal Functions
function closeUploadModal() {
  if (!uploadModalProcessing.value) {
    showUploadModal.value = false
    uploadModalSuccess.value = false
  }
}

async function handleModalFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    // Start processing
    uploadModalProcessing.value = true
    uploadModalProgress.value = 0
    uploadModalStatusText.value = 'Uploading image...'
    uploadModalSuccess.value = false

    try {
      // Simulate upload progress
      uploadModalProgress.value = 30
      await new Promise(resolve => setTimeout(resolve, 300))

      // Store file for later processing
      pendingImageFile.value = file
      
      uploadModalProgress.value = 100
      uploadModalStatusText.value = 'Image uploaded!'
      uploadModalSuccess.value = true

      // Close modal
      setTimeout(() => {
        closeUploadModal()
        uploadModalProcessing.value = false
        
        // If preview is already shown, ask if user wants to use this image
        if (showWeddingStickerPreview.value) {
          awaitingBackgroundRemovalDecision.value = true // Reuse this flag or create a new one? 
          // Actually, let's use a specific flow for this.
          // We can reuse awaitingBackgroundRemovalDecision but the prompt is different.
          
          chatMessages.value.push({
            id: Date.now(),
            text: "New picture! Use this one? (yes/no)",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            image: URL.createObjectURL(file)
          })
          scrollToBottom()

          // We need a way to know we are in "confirm image update" mode.
          // Let's use a new state or piggyback on awaitingBackgroundRemovalDecision with a context check?
          // For simplicity, let's add a new state variable: awaitingImageUpdateConfirmation
          awaitingImageUpdateConfirmation.value = true

        } else {
          // Normal flow (before generation)
          // Ask user about background removal
          awaitingBackgroundRemovalDecision.value = true
          chatMessages.value.push({
            id: Date.now(),
            text: "Great! Picture received! Would you like me to remove the background? Say 'yes' or 'no'!",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
        }
      }, 500)

    } catch (error) {
      uploadModalProcessing.value = false
      uploadModalProgress.value = 0
      
      authStore.showNotification({
        title: 'Upload Failed',
        message: 'Failed to process image. Please try again.',
        type: 'error'
      })
    }
  }

  // Reset input
  if (target) {
    target.value = ''
  }
}

function handlePreGeneratedImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    // Track the image upload for AI management
    trackImageUpload(file)

    // Store the file for after cropping
    pendingImageFile.value = file

    // Open crop modal IMMEDIATELY (before sending to chat)
    // Create image URL for crop modal
    const imageUrl = URL.createObjectURL(file)
    cropImageSrc.value = imageUrl
    cropImageFile.value = file
    isPreGenerationCrop.value = true
    showCropModal.value = true

    // The chat message will be sent AFTER cropping is complete
    // See handleCropComplete for the post-crop flow
  }

  // Reset input
  if (target) {
    target.value = ''
  }
}

onMounted(() => {
  // Clear previous form data
  autoDesignStore.resetFormData()

  // Load the background manifest so both the random picker and the UI use the same list
  // (falls back to a hardcoded list if the JSON can't be fetched)
  loadWeddingBackgroundManifest()

  // Set category
  autoDesignStore.setCategory('sticker')

  // Load wedding template
  nextTick(() => {
    loadWeddingStickerTemplate()
  })
})

// Cleanup on unmount to prevent memory leaks and improve navigation speed
onBeforeUnmount(() => {
  // Stop any ongoing speech synthesis and recognition using composable methods
  stopAllSpeech()
  stopVoiceRecording()
  
  // Clear generating messages interval
  stopGeneratingMessages()
  
  // Revoke any object URLs
  if (preGeneratedImagePreview.value) {
    URL.revokeObjectURL(preGeneratedImagePreview.value)
    preGeneratedImagePreview.value = null
  }
})
</script>



