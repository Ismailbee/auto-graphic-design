/**
 * Wedding Sticker State Composable
 * 
 * Centralizes all reactive state for the wedding sticker panel.
 * Extracted from StickerTemplatePanel.vue for file size reduction.
 */

import { ref, reactive, computed, watch, type Ref, type ComputedRef } from 'vue'
import type { ChatMessage, ExtractedInfo } from '../types'
import { GENERATING_MESSAGES } from '../utils/previewUtils'

// ============================================================================
// Types
// ============================================================================

export interface UploadedImage {
  file: File
  timestamp: number
  used: boolean
}

export interface AskedQuestions {
  picture: boolean
  size: boolean
  backgroundRemoval: boolean
  heading: boolean
  names: boolean
  date: boolean
  courtesy: boolean
}

export interface FormData {
  description: string
  removeBackground: boolean
  useColorPicker: boolean
  backgroundColor: string
  customSize: string
  svgWidth: number
  svgHeight: number
}

export interface WeddingStateReturn {
  // Category & View
  showMenu: Ref<boolean>
  selectedCategory: Ref<string | null>
  categories: { id: string; name: string; icon: string; gradient: string }[]
  
  // Preview State
  showWeddingStickerPreview: Ref<boolean>
  isGeneratingPreview: Ref<boolean>
  generatingStep: Ref<number>
  isDescriptionVisible: Ref<boolean>
  showEditModal: Ref<boolean>
  generatingMessage: Ref<string>
  isGeneratingNewBackground: Ref<boolean>
  
  // Token Tracking
  hasDesignBeenGenerated: Ref<boolean>
  TOKEN_COST_GENERATE_DESIGN: number
  TOKEN_COST_EDIT_TEXT: number
  TOKEN_COST_CHANGE_BACKGROUND: number
  
  // Form Data
  formData: FormData
  
  // Chat State
  chatInputText: Ref<string>
  chatMessages: Ref<ChatMessage[]>
  isAnalyzing: Ref<boolean>
  accumulatedDescription: Ref<string>
  
  // Wizard Step State
  awaitingPictureDecision: Ref<boolean>
  awaitingSizeDecision: Ref<boolean>
  pictureStepComplete: Ref<boolean>
  sizeStepComplete: Ref<boolean>
  awaitingBackgroundRemovalDecision: Ref<boolean>
  awaitingImageUpdateConfirmation: Ref<boolean>
  backgroundRemovalAlreadyHandled: Ref<boolean>
  
  // Image State
  pendingImageFile: Ref<File | null>
  uploadedImages: Ref<UploadedImage[]>
  lastUploadedImage: Ref<File | null>
  awaitingImageChoice: Ref<boolean>
  awaitingNameInput: Ref<boolean>
  nameExtractionAttempts: Ref<number>
  
  // Pre-generated Image State
  preGeneratedImageFile: Ref<File | null>
  preGeneratedImagePreview: Ref<string | null>
  
  // Heading/Title State
  awaitingHeadingInput: Ref<boolean>
  awaitingFontChoice: Ref<boolean>
  customHeading: Ref<string | null>
  selectedHeadingFont: Ref<'playfair' | 'lato' | null>
  headingStepComplete: Ref<boolean>
  awaitingTitleConfirmation: Ref<boolean>
  pendingTitle: Ref<string | null>
  
  // Extracted Info
  extractedInfo: Ref<ExtractedInfo>
  
  // Asked Questions Tracking
  askedQuestions: Ref<AskedQuestions>
  
  // Post-generation Update State
  awaitingDateChange: Ref<boolean>
  awaitingCourtesyChange: Ref<boolean>
  pendingDateUpdate: Ref<string | null>
  pendingCourtesyUpdate: Ref<string | null>
  awaitingCourtesyInput: Ref<boolean>
  pendingCourtesyText: Ref<string | null>
  
  // Crop Modal State
  showCropModal: Ref<boolean>
  cropImageSrc: Ref<string>
  cropImageFile: Ref<File | null>
  isPreGenerationCrop: Ref<boolean>
  
  // Upload Modal State
  showUploadModal: Ref<boolean>
  uploadModalProcessing: Ref<boolean>
  uploadModalProgress: Ref<number>
  uploadModalStatusText: Ref<string>
  uploadModalSuccess: Ref<boolean>
  
  // Background Removal State
  autoRemoveBackground: Ref<boolean>
  backgroundRemovalError: Ref<string | null>
  
  // Image Controls
  showImageControls: Ref<boolean>
  isRetouching: Ref<boolean>
  showUploadOptions: Ref<boolean>
  
  // Animation
  loadingAnimation: Ref<object | null>
  
  // Refs for DOM elements
  preGeneratedImageInput: Ref<HTMLInputElement | null>
  
  // Utility methods
  resetAskedQuestions: () => void
  resetWeddingState: () => void
}

// ============================================================================
// Main Composable
// ============================================================================

export function useWeddingState(): WeddingStateReturn {
  // ========================================
  // Category & View State
  // ========================================
  const showMenu = ref(false)
  const selectedCategory = ref<string | null>('wedding')
  
  const categories = [
    { id: 'wedding', name: 'Wedding', icon: '💍', gradient: 'linear-gradient(135deg, #f093fb 0%, #a855f7 100%)' }
  ]
  
  // ========================================
  // Preview State
  // ========================================
  const showWeddingStickerPreview = ref(false)
  const isGeneratingPreview = ref(false)
  const generatingStep = ref(0)
  const isDescriptionVisible = ref(true)
  const showEditModal = ref(false)
  const generatingMessage = ref(GENERATING_MESSAGES[0])
  const isGeneratingNewBackground = ref(false)
  
  // ========================================
  // Token Tracking
  // ========================================
  const hasDesignBeenGenerated = ref(false)
  const TOKEN_COST_GENERATE_DESIGN = 15
  const TOKEN_COST_EDIT_TEXT = 5
  const TOKEN_COST_CHANGE_BACKGROUND = 10
  
  // ========================================
  // Form Data
  // ========================================
  const formData = reactive<FormData>({
    description: '',
    removeBackground: false,
    useColorPicker: false,
    backgroundColor: '#ffffff',
    customSize: '4x4',
    svgWidth: 400,
    svgHeight: 400
  })
  
  // ========================================
  // Chat State
  // ========================================
  const chatInputText = ref('')
  const chatMessages = ref<ChatMessage[]>([])
  const isAnalyzing = ref(false)
  const accumulatedDescription = ref('')
  
  // ========================================
  // Wizard Step State
  // ========================================
  const awaitingPictureDecision = ref(false)
  const awaitingSizeDecision = ref(false)
  const pictureStepComplete = ref(false)
  const sizeStepComplete = ref(false)
  const awaitingBackgroundRemovalDecision = ref(false)
  const awaitingImageUpdateConfirmation = ref(false)
  const backgroundRemovalAlreadyHandled = ref(false)
  
  // ========================================
  // Image State
  // ========================================
  const pendingImageFile = ref<File | null>(null)
  const uploadedImages = ref<UploadedImage[]>([])
  const lastUploadedImage = ref<File | null>(null)
  const awaitingImageChoice = ref(false)
  const awaitingNameInput = ref(false)
  const nameExtractionAttempts = ref(0)
  
  // Pre-generated Image State
  const preGeneratedImageFile = ref<File | null>(null)
  const preGeneratedImagePreview = ref<string | null>(null)
  
  // ========================================
  // Heading/Title State
  // ========================================
  const awaitingHeadingInput = ref(false)
  const awaitingFontChoice = ref(false)
  const customHeading = ref<string | null>(null)
  const selectedHeadingFont = ref<'playfair' | 'lato' | null>(null)
  const headingStepComplete = ref(false)
  const awaitingTitleConfirmation = ref(false)
  const pendingTitle = ref<string | null>(null)
  
  // ========================================
  // Extracted Info
  // ========================================
  const extractedInfo = ref<ExtractedInfo>({
    title: null,
    date: null,
    courtesy: null,
    size: null,
    names: { name1: null, name2: null }
  })
  
  // Sync title with customHeading
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
  
  // ========================================
  // Asked Questions Tracking
  // ========================================
  const askedQuestions = ref<AskedQuestions>({
    picture: false,
    size: false,
    backgroundRemoval: false,
    heading: false,
    names: false,
    date: false,
    courtesy: false
  })
  
  // ========================================
  // Post-generation Update State
  // ========================================
  const awaitingDateChange = ref(false)
  const awaitingCourtesyChange = ref(false)
  const pendingDateUpdate = ref<string | null>(null)
  const pendingCourtesyUpdate = ref<string | null>(null)
  const awaitingCourtesyInput = ref(false)
  const pendingCourtesyText = ref<string | null>(null)
  
  // ========================================
  // Crop Modal State
  // ========================================
  const showCropModal = ref(false)
  const cropImageSrc = ref('')
  const cropImageFile = ref<File | null>(null)
  const isPreGenerationCrop = ref(false)
  
  // ========================================
  // Upload Modal State
  // ========================================
  const showUploadModal = ref(false)
  const uploadModalProcessing = ref(false)
  const uploadModalProgress = ref(0)
  const uploadModalStatusText = ref('Preparing...')
  const uploadModalSuccess = ref(false)
  
  // ========================================
  // Background Removal State
  // ========================================
  const autoRemoveBackground = ref(false)
  const backgroundRemovalError = ref<string | null>(null)
  
  // ========================================
  // Image Controls
  // ========================================
  const showImageControls = ref(false)
  const isRetouching = ref(false)
  const showUploadOptions = ref(false)
  
  // ========================================
  // Animation
  // ========================================
  const loadingAnimation = ref<object | null>(null)
  
  // ========================================
  // DOM Refs
  // ========================================
  const preGeneratedImageInput = ref<HTMLInputElement | null>(null)
  
  // ========================================
  // Utility Methods
  // ========================================
  function resetAskedQuestions(): void {
    askedQuestions.value = {
      picture: false,
      size: false,
      backgroundRemoval: false,
      heading: false,
      names: false,
      date: false,
      courtesy: false
    }
  }
  
  function resetWeddingState(): void {
    // Reset extracted info
    extractedInfo.value = {
      title: null,
      date: null,
      courtesy: null,
      size: null,
      names: { name1: null, name2: null }
    }
    
    // Reset heading state
    customHeading.value = null
    selectedHeadingFont.value = null
    headingStepComplete.value = false
    awaitingTitleConfirmation.value = false
    pendingTitle.value = null
    awaitingHeadingInput.value = false
    awaitingFontChoice.value = false
    
    // Reset description
    accumulatedDescription.value = ''
    formData.description = ''
    
    // Reset step state
    sizeStepComplete.value = false
    awaitingSizeDecision.value = false
    pictureStepComplete.value = false
    awaitingPictureDecision.value = false
    
    // Reset chat
    chatMessages.value = []
    
    // Reset image state
    preGeneratedImageFile.value = null
    preGeneratedImagePreview.value = null
    pendingImageFile.value = null
    awaitingBackgroundRemovalDecision.value = false
    uploadedImages.value = []
    lastUploadedImage.value = null
    
    // Reset generation state
    hasDesignBeenGenerated.value = false
    showWeddingStickerPreview.value = false
    isGeneratingPreview.value = false
    isAnalyzing.value = false
    
    // Reset asked questions
    resetAskedQuestions()
  }
  
  return {
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
    resetWeddingState
  }
}
