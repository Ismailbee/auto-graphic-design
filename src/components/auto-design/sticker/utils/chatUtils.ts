/**
 * Chat Utilities
 * Extracted from StickerTemplatePanel.vue to reduce file size
 * Contains functions for chat message handling, image tracking, and AI response processing
 */

import type { Ref } from 'vue'
import type { ChatMessage } from '../types'

// Re-export for backward compatibility
export type { ChatMessage }

// Type for tracked image upload
export interface TrackedImage {
  file: File
  timestamp: number
  used: boolean
}

// Dependencies for chat utilities
export interface ChatUtilsDeps {
  chatMessages: Ref<ChatMessage[]>
  uploadedImages: Ref<TrackedImage[]>
  lastUploadedImage: Ref<File | null>
  awaitingImageChoice: Ref<boolean>
  awaitingImageUpdateConfirmation: Ref<boolean>
  pendingImageFile: Ref<File | null>
  showWeddingStickerPreview: Ref<boolean>
  scrollToBottom: () => void
}

/**
 * Track an image upload and manage the upload history
 */
export function trackImageUploadUtil(
  file: File,
  deps: ChatUtilsDeps
): void {
  const { uploadedImages, lastUploadedImage } = deps
  
  const timestamp = Date.now()
  uploadedImages.value.push({ file, timestamp, used: false })
  lastUploadedImage.value = file
  
  // Handle multiple image uploads
  handleMultipleImageUploadsUtil(deps)
}

/**
 * Handle multiple image uploads with AI confirmation prompts
 */
export function handleMultipleImageUploadsUtil(deps: ChatUtilsDeps): void {
  const {
    uploadedImages,
    lastUploadedImage,
    showWeddingStickerPreview,
    awaitingImageChoice,
    awaitingImageUpdateConfirmation,
    pendingImageFile,
    chatMessages,
    scrollToBottom
  } = deps
  
  const unusedImages = uploadedImages.value.filter(img => !img.used)
  
  // Pre-generation: Multiple images uploaded
  if (!showWeddingStickerPreview.value && unusedImages.length > 1) {
    awaitingImageChoice.value = true

    const aiMessage = `Multiple pictures uploaded. Use FIRST or NEW one?`

    chatMessages.value.push({
      id: Date.now(),
      text: aiMessage,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }

  // Post-generation: New image uploaded after design is created
  if (showWeddingStickerPreview.value && lastUploadedImage.value) {
    awaitingImageUpdateConfirmation.value = true
    pendingImageFile.value = lastUploadedImage.value

    const aiMessage = "I see you've uploaded a new picture! Would you like me to replace the current image in your design? Say 'yes' or 'no'!"
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiMessage,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }
}

/**
 * Add a user message to the chat
 */
export function addUserMessageUtil(
  text: string,
  chatMessages: Ref<ChatMessage[]>,
  scrollToBottom: () => void
): void {
  chatMessages.value.push({
    id: Date.now(),
    text,
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
}

/**
 * Add an AI message to the chat
 */
export function addAIMessageUtil(
  text: string,
  chatMessages: Ref<ChatMessage[]>,
  scrollToBottom: () => void,
  options?: {
    image?: string
    type?: 'text' | 'preview'
    actions?: ChatMessage['actions']
  }
): void {
  chatMessages.value.push({
    id: Date.now(),
    text,
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...options
  })
  scrollToBottom()
}

/**
 * Build wedding chat context for AI
 */
export function buildWeddingChatContextForAIUtil(
  authIsAuthenticated: boolean,
  userTokens: number,
  showWeddingStickerPreview: boolean,
  customHeading: string | null,
  extractedInfo: {
    names: { name1: string | null; name2: string | null }
    date: string | null
    courtesy: string | null
    size: string | null
  },
  hasPhoto: boolean
): string {
  const state = {
    authenticated: !!authIsAuthenticated,
    tokens: userTokens ?? 0,
    hasPreview: !!showWeddingStickerPreview,
    heading: customHeading ?? null,
    details: {
      name1: extractedInfo.names.name1 ?? null,
      name2: extractedInfo.names.name2 ?? null,
      date: extractedInfo.date ?? null,
      courtesy: extractedInfo.courtesy ?? null,
      size: extractedInfo.size ?? null
    },
    hasPhoto: !!hasPhoto
  }

  return JSON.stringify(state, null, 2)
}

/**
 * Build wedding chat transcript for AI
 */
export function buildWeddingChatTranscriptForAIUtil(
  chatMessages: ChatMessage[],
  maxMessages = 10
): string {
  const items = chatMessages
    .filter(m => m && m.sender && !m.isLoading && m.type !== 'preview')
    .slice(-maxMessages)
    .map(m => {
      const role = m.sender === 'user' ? 'User' : 'Assistant'
      const text = String(m.text ?? '').trim()
      return `${role}: ${text}`
    })

  return items.join('\n')
}

// Re-export parseSizeToInches from previewUtils for backward compatibility
export { parseSizeToInches as parseSizeToInchesUtil } from './previewUtils'

/**
 * Sync wedding description from extracted state
 */
export function syncWeddingDescriptionFromStateUtil(
  customHeading: string | null,
  extractedInfo: {
    names: { name1: string | null; name2: string | null }
    date: string | null
    courtesy: string | null
  },
  accumulatedDescription: Ref<string>,
  formDataDescription: { description: string }
): void {
  const parts: string[] = []
  if (customHeading) parts.push(customHeading)

  const n1 = extractedInfo.names.name1
  const n2 = extractedInfo.names.name2
  if (n1 && n2) parts.push(`(${n1} & ${n2})`)
  else if (n1) parts.push(`(${n1})`)

  if (extractedInfo.date) parts.push(extractedInfo.date)
  if (extractedInfo.courtesy) parts.push(`courtesy: ${extractedInfo.courtesy}`)

  const desc = parts.join(', ')
  accumulatedDescription.value = desc
  formDataDescription.description = desc
}

// Dependencies for reset functions
export interface ResetDeps {
  extractedInfo: Ref<{
    title: string | null
    date: string | null
    courtesy: string | null
    size: string | null
    names: { name1: string | null; name2: string | null }
  }>
  customHeading: Ref<string | null>
  selectedHeadingFont: Ref<'playfair' | 'lato' | null>
  headingStepComplete: Ref<boolean>
  awaitingTitleConfirmation: Ref<boolean>
  pendingTitle: Ref<string | null>
  awaitingHeadingInput: Ref<boolean>
  awaitingFontChoice: Ref<boolean>
  accumulatedDescription: Ref<string>
  formData: { description: string; customSize: string }
  sizeStepComplete: Ref<boolean>
  awaitingSizeDecision: Ref<boolean>
  chatMessages: Ref<ChatMessage[]>
  preGeneratedImageFile: Ref<File | null>
  preGeneratedImagePreview: Ref<string | null>
  pendingImageFile: Ref<File | null>
  awaitingBackgroundRemovalDecision: Ref<boolean>
  uploadedImages: Ref<TrackedImage[]>
  lastUploadedImage: Ref<File | null>
  hasDesignBeenGenerated: Ref<boolean>
  showWeddingStickerPreview: Ref<boolean>
  isGeneratingPreview: Ref<boolean>
  isAnalyzing: Ref<boolean>
  askedQuestions: Ref<{
    picture: boolean
    size: boolean
    backgroundRemoval: boolean
    heading: boolean
    names: boolean
    date: boolean
    courtesy: boolean
  }>
  svgImageManager: { clearAllImages: () => void }
}

/**
 * Reset all asked questions for a fresh flow
 */
export function resetAskedQuestionsUtil(
  askedQuestions: Ref<{
    picture: boolean
    size: boolean
    backgroundRemoval: boolean
    heading: boolean
    names: boolean
    date: boolean
    courtesy: boolean
  }>
): void {
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

/**
 * Reset ALL wedding-related state for a fresh start
 */
export function resetWeddingStateUtil(deps: ResetDeps): void {
  const {
    extractedInfo,
    customHeading,
    selectedHeadingFont,
    headingStepComplete,
    awaitingTitleConfirmation,
    pendingTitle,
    awaitingHeadingInput,
    awaitingFontChoice,
    accumulatedDescription,
    formData,
    sizeStepComplete,
    awaitingSizeDecision,
    chatMessages,
    preGeneratedImageFile,
    preGeneratedImagePreview,
    pendingImageFile,
    awaitingBackgroundRemovalDecision,
    uploadedImages,
    lastUploadedImage,
    hasDesignBeenGenerated,
    showWeddingStickerPreview,
    isGeneratingPreview,
    isAnalyzing,
    askedQuestions,
    svgImageManager
  } = deps

  // Clear extracted info (names, date, courtesy, etc.)
  extractedInfo.value = {
    title: null,
    date: null,
    courtesy: null,
    size: null,
    names: { name1: null, name2: null }
  }
  
  // Clear heading state
  customHeading.value = null
  selectedHeadingFont.value = null
  headingStepComplete.value = false
  awaitingTitleConfirmation.value = false
  pendingTitle.value = null
  awaitingHeadingInput.value = false
  awaitingFontChoice.value = false
  
  // Clear accumulated description
  accumulatedDescription.value = ''
  formData.description = ''
  formData.customSize = ''

  // Require size again for a fresh start
  sizeStepComplete.value = false
  awaitingSizeDecision.value = false
  
  // Clear chat messages
  chatMessages.value = []
  
  // Clear image state
  preGeneratedImageFile.value = null
  preGeneratedImagePreview.value = null
  pendingImageFile.value = null
  awaitingBackgroundRemovalDecision.value = false
  uploadedImages.value = []
  lastUploadedImage.value = null
  
  // Reset flags
  hasDesignBeenGenerated.value = false
  showWeddingStickerPreview.value = false
  isGeneratingPreview.value = false
  isAnalyzing.value = false
  
  // Reset asked questions
  resetAskedQuestionsUtil(askedQuestions)
  
  // Clear SVG images
  svgImageManager.clearAllImages()
}
