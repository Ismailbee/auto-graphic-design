/**
 * Wedding Chat Composable
 * 
 * Main composable for the wedding sticker chat assistant.
 * Combines offline responses and local extraction for a complete chat experience.
 */

import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { ChatMessage, ExtractedInfo, LocalExtractionResult, OfflineResponseContext } from '../types'
import { extractWeddingDetails } from './useLocalExtraction'
import {
  offlineDelay,
  isGreeting,
  getGreetingResponse,
  isWhoAreYou,
  getWhoAreYouResponse,
  isHowAreYou,
  getHowAreYouResponse,
  isCapabilityQuestion,
  getCapabilityResponse,
  isNonWeddingRequest,
  getNonWeddingResponse,
  isVagueDesignRequest,
  getVagueDesignResponse,
  isAffirmative,
  getAffirmativeResponse,
  isChangeRequest,
  getChangeResponse,
  isNegative,
  getNegativeResponse,
  isThanks,
  getThanksResponse,
  isHelp,
  getHelpResponse,
  isStartRequest,
  getStartResponse,
  isPricingQuestion,
  getPricingResponse,
  isConfused,
  getConfusedResponse,
  getFallbackResponse,
  getExtractionSuccessResponse,
  isTitleOnly,
  getTitleOnlyResponse,
  isNamesOnly,
  getNamesOnlyResponse,
  isDateOnly,
  getDateOnlyResponse,
  isCourtesyOnly,
} from './useOfflineResponses'

export interface UseWeddingChatOptions {
  extractedInfo: Ref<ExtractedInfo>
  chatMessages: Ref<ChatMessage[]>
  isAnalyzing: Ref<boolean>
  showPreview: Ref<boolean>
  hasPhoto?: Ref<boolean>
  awaitingPictureDecision?: Ref<boolean>
  awaitingSizeDecision?: Ref<boolean>
  awaitingBackgroundRemovalDecision?: Ref<boolean>
  onGenerate: () => void
  onScrollToBottom: () => void
  onUploadPicture?: () => void
  onSetSize?: (size: string) => void
  onBackgroundRemovalDecision?: (removeBackground: boolean) => void
}

export function useWeddingChat(options: UseWeddingChatOptions) {
  const {
    extractedInfo,
    chatMessages,
    isAnalyzing,
    showPreview,
    hasPhoto,
    awaitingPictureDecision,
    awaitingSizeDecision,
    awaitingBackgroundRemovalDecision,
    onGenerate,
    onScrollToBottom,
    onUploadPicture,
    onSetSize,
    onBackgroundRemovalDecision,
  } = options

  // Track request ID to ignore stale responses
  let requestId = 0

  // Build context for offline responses
  const getContext = (): OfflineResponseContext => ({
    hasTitle: !!extractedInfo.value.title,
    hasName: !!extractedInfo.value.names.name1,
    hasDate: !!extractedInfo.value.date,
    hasCourtesy: !!extractedInfo.value.courtesy,
    hasPreview: showPreview.value,
    hasPhoto: !!hasPhoto?.value,
    title: extractedInfo.value.title,
    name1: extractedInfo.value.names.name1,
    name2: extractedInfo.value.names.name2,
    date: extractedInfo.value.date,
    courtesy: extractedInfo.value.courtesy,
  })

  // Add a message to chat
  const addMessage = (message: ChatMessage) => {
    chatMessages.value.push(message)
    onScrollToBottom()
  }

  // Apply extracted data to state
  const applyExtraction = (result: LocalExtractionResult) => {
    if (result.title) extractedInfo.value.title = result.title
    if (result.name1) extractedInfo.value.names.name1 = result.name1
    if (result.name2) extractedInfo.value.names.name2 = result.name2
    // A month/year-only date (e.g. "January 2026") isn't specific enough.
    // Keep it in the chat summary, but don't store it as the required wedding date.
    if (result.date && !result.dateIsPartial) extractedInfo.value.date = result.date
    if (result.courtesy) extractedInfo.value.courtesy = result.courtesy
  }

  /**
   * Process a user message and generate a response
   * This handles all offline shortcuts and local extraction
   */
  async function processMessage(message: string): Promise<boolean> {
    const reqId = ++requestId
    // Ensure message is a string before calling trim/toLowerCase
    if (!message || typeof message !== 'string') {
      console.error('processMessage called with non-string:', message)
      return false
    }
    const lowerMsg = message.trim().toLowerCase()
    const ctx = getContext()

    // Picture/upload intent
    if (/(\bphoto\b|\bpicture\b|\bimage\b)/i.test(lowerMsg)) {
      const looksLikeRequest = /(upload|add|attach|include|put|send|share|don'?t\s+forget|remember)/i.test(lowerMsg)
      if (looksLikeRequest) {
        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        addMessage({
          id: Date.now(),
          text: `Sure — you can add a picture now. Tap “Add Picture” and choose your image.`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [{ type: 'upload', label: 'Add Picture', variant: 'primary' }]
        } as any)
        return true
      }
    }

    // --- Quick Shortcuts (no extraction needed) ---

    // Greetings
    if (isGreeting(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getGreetingResponse(lowerMsg, ctx))
      return true
    }

    // Who are you?
    if (isWhoAreYou(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getWhoAreYouResponse())
      return true
    }

    // How are you?
    if (isHowAreYou(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getHowAreYouResponse())
      return true
    }

    // Capabilities question
    if (isCapabilityQuestion(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getCapabilityResponse())
      return true
    }

    // Non-wedding request
    if (isNonWeddingRequest(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getNonWeddingResponse())
      return true
    }

    // Vague design request
    if (isVagueDesignRequest(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getVagueDesignResponse())
      return true
    }

    // Affirmative (yes/yeah/ok) - handle picture decision first
    if (isAffirmative(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      
      // If awaiting picture decision, "yes" means user wants to add a picture
      if (awaitingPictureDecision?.value) {
        awaitingPictureDecision.value = false
        addMessage({
          id: Date.now(),
          text: 'Great! Tap "Add Picture" below to upload your image.',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [{ type: 'upload', label: 'Add Picture', variant: 'primary' }]
        } as any)
        return true
      }
      
      // If awaiting background removal decision, "yes" means user wants to remove background
      if (awaitingBackgroundRemovalDecision?.value) {
        awaitingBackgroundRemovalDecision.value = false
        if (onBackgroundRemovalDecision) {
          onBackgroundRemovalDecision(true)
        }
        return true
      }
      
      // Otherwise, normal affirmative response
      addMessage(getAffirmativeResponse(ctx, onGenerate))
      return true
    }

    // Size input - handle when user provides size like "3x3", "4x4", "4 by 2.5", "default"
    // Matches: "3x3", "4X4", "4 by 2.5", "3.5x4", "4 x 3", etc.
    const sizeMatch = message.match(/^(\d+(?:\.\d+)?)\s*(?:[xX×]|by)\s*(\d+(?:\.\d+)?)$/i)
    if (sizeMatch || lowerMsg === 'default') {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      
      // Always handle size input if it matches the pattern
      // (this prevents it from being treated as courtesy)
      // Normalize size format to "WxH"
      let sizeValue: string
      if (lowerMsg === 'default') {
        sizeValue = '4x4'
      } else if (sizeMatch) {
        sizeValue = `${sizeMatch[1]}x${sizeMatch[2]}`
      } else {
        sizeValue = message.trim()
      }
      
      // Reset the awaiting flag if it was set
      if (awaitingSizeDecision?.value) {
        awaitingSizeDecision.value = false
      }
      
      // Call the size handler
      if (onSetSize) {
        onSetSize(sizeValue)
      }
      
      addMessage({
        id: Date.now(),
        text: `Perfect! Size set to ${sizeValue} inches. Creating your sticker now! ✨`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      
      // Trigger generation after a short delay
      setTimeout(() => {
        onGenerate()
      }, 500)
      
      return true
    }

    // Change request
    const changeResult = isChangeRequest(lowerMsg)
    if (changeResult.match && changeResult.field) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getChangeResponse(changeResult.field))
      return true
    }

    // Negative (no/nope) - if all details complete, generate the sticker
    if (isNegative(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      
      // If awaiting background removal decision, "no" means user wants to keep background
      if (awaitingBackgroundRemovalDecision?.value) {
        awaitingBackgroundRemovalDecision.value = false
        if (onBackgroundRemovalDecision) {
          onBackgroundRemovalDecision(false)
        }
        return true
      }
      
      addMessage(getNegativeResponse(ctx, onGenerate))
      return true
    }

    // Thanks
    if (isThanks(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getThanksResponse(ctx.hasPreview))
      return true
    }

    // Help
    if (isHelp(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getHelpResponse())
      return true
    }

    // Start request
    if (isStartRequest(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getStartResponse())
      return true
    }

    // Pricing question
    if (isPricingQuestion(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getPricingResponse())
      return true
    }

    // Confusion
    if (isConfused(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getConfusedResponse())
      return true
    }

    // --- Partial Input Detection (Title-only, Names-only, Date-only) ---

    // Title-only: user sent just a title like "wedding ceremony" or "graduation"
    if (isTitleOnly(message)) {
      const extraction = extractWeddingDetails(message, { hasName: ctx.hasName, hasDate: ctx.hasDate })
      if (extraction.title) {
        applyExtraction(extraction)
        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        const updatedCtx = getContext()
        addMessage(getTitleOnlyResponse(extraction.title, updatedCtx))
        return true
      }
    }

    // Names-only: user sent just names like "Suleiman & Aisha"
    if (isNamesOnly(message)) {
      const extraction = extractWeddingDetails(message, { hasName: ctx.hasName, hasDate: ctx.hasDate })
      if (extraction.name1 && extraction.name2) {
        applyExtraction(extraction)
        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        const updatedCtx = getContext()
        addMessage(getNamesOnlyResponse(extraction.name1, extraction.name2, updatedCtx))
        return true
      }
    }

    // Date-only: user sent just a date like "6th January, 2025"
    if (isDateOnly(message)) {
      const extraction = extractWeddingDetails(message, { hasName: ctx.hasName, hasDate: ctx.hasDate })
      if (extraction.date) {
        applyExtraction(extraction)
        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        const updatedCtx = getContext()
        addMessage(getDateOnlyResponse(extraction.date, updatedCtx))
        return true
      }
    }

    // Courtesy-only: user sent just courtesy when we already have title, names, date
    if (isCourtesyOnly(message, ctx)) {
      // Treat the whole message as courtesy
      extractedInfo.value.courtesy = message.trim()
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      const updatedCtx = getContext()
      // All details complete - ask about picture
      const hasAnyPhoto = !!hasPhoto?.value
      if (!hasAnyPhoto) {
        // Set flag so "yes" response triggers picture upload
        if (awaitingPictureDecision) awaitingPictureDecision.value = true
        addMessage({
          id: Date.now(),
          text: `Got it! Would you like to add a picture?`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'upload', label: 'Add Picture', variant: 'secondary' },
            { type: 'generate_preview', label: 'Generate', variant: 'primary' }
          ]
        } as any)
      } else {
        addMessage({
          id: Date.now(),
          text: `Got the courtesy: "${message.trim()}". What size would you like? (e.g., 3x3, 4x4, or type "default")`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }
      return true
    }

    // --- Try Local Extraction ---
    const extraction = extractWeddingDetails(message, {
      hasName: ctx.hasName,
      hasDate: ctx.hasDate,
    })

    if (extraction.foundSomething) {
      // Apply extracted info
      applyExtraction(extraction)

      // If names are still missing AND this message didn't include names,
      // let the caller try Ollama instead of replying offline.
      const updatedCtxPreReply = getContext()
      const messageHadNames = !!(extraction.name1 || extraction.name2)
      if (!updatedCtxPreReply.hasName && !messageHadNames) {
        return false
      }

      await offlineDelay()
      if (reqId !== requestId) return true
      
      isAnalyzing.value = false
      
      // Get updated context after applying extraction
      const updatedCtx = getContext()
      
      // Check if we have all required details (title is optional if explicitly skipped)
      if (updatedCtx.hasTitle && updatedCtx.hasName && updatedCtx.hasDate && updatedCtx.hasCourtesy) {
        // All details complete - ask about picture
        const hasAnyPhoto = !!hasPhoto?.value
        if (!hasAnyPhoto) {
          // Set flag so "yes" response triggers picture upload
          if (awaitingPictureDecision) awaitingPictureDecision.value = true
          addMessage({
            id: Date.now(),
            text: 'All set! Add a picture?',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { type: 'upload', label: 'Add Picture', variant: 'secondary' },
              { type: 'generate_preview', label: 'Generate', variant: 'primary' }
            ]
          } as any)
        } else {
          // Has photo - ask for size
          addMessage({
            id: Date.now(),
            text: 'What size would you like? (e.g., 3x3, 4x4, or type "default")',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        }
      } else {
        // Need more info - ask for what's missing
        addMessage(getExtractionSuccessResponse(extraction, updatedCtx))
      }
      
      return true
    }

    // Nothing matched - return false to let caller try Ollama or fallback
    return false
  }

  /**
   * Generate a fallback response when nothing was understood
   */
  async function generateFallbackResponse(): Promise<void> {
    await offlineDelay()
    isAnalyzing.value = false
    addMessage(getFallbackResponse(getContext()))
  }

  /**
   * Handle offline extraction when Ollama fails
   */
  async function handleOfflineExtraction(message: string): Promise<void> {
    const ctx = getContext()
    const extraction = extractWeddingDetails(message, {
      hasName: ctx.hasName,
      hasDate: ctx.hasDate,
    })

    await offlineDelay()
    
    // Apply extracted data
    applyExtraction(extraction)

    isAnalyzing.value = false
    
    // Get updated context
    const updatedCtx = getContext()

    // Check if all required details are present (title is optional if explicitly skipped)
    if (updatedCtx.hasTitle && updatedCtx.hasName && updatedCtx.hasDate && updatedCtx.hasCourtesy && !updatedCtx.hasPreview) {
      const hasAnyPhoto = !!hasPhoto?.value
      if (!hasAnyPhoto) {
        // Set flag so "yes" response triggers picture upload
        if (awaitingPictureDecision) awaitingPictureDecision.value = true
        // Ask about picture
        addMessage({
          id: Date.now(),
          text: 'All set! Add a picture?',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'upload', label: 'Add Picture', variant: 'secondary' },
            { type: 'generate_preview', label: 'Generate', variant: 'primary' }
          ]
        } as any)
      } else {
        // Has photo - ask for size
        addMessage({
          id: Date.now(),
          text: 'What size would you like? (e.g., 3x3, 4x4, or type "default")',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }
      return
    }

    if (extraction.foundSomething) addMessage(getExtractionSuccessResponse(extraction, updatedCtx))
    else addMessage(getFallbackResponse(updatedCtx))
  }

  return {
    processMessage,
    generateFallbackResponse,
    handleOfflineExtraction,
    applyExtraction,
    getContext,
  }
}
