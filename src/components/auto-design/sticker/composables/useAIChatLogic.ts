/**
 * AI Chat Logic Composable
 * 
 * Handles Ollama AI integration, message analysis, and chat flow control
 * for the wedding sticker design assistant.
 * 
 * Key features :
 * - Ollama AI chat integration with structured JSON responses
 * - Deterministic interceptors for common intents (photo, help, greetings)
 * - Offline fallback extraction when AI is unavailable
 * - Wizard state management (picture, background removal, size decisions)
 * - Action execution (login, upload, generate, edit, download)
 */

import { ref, type Ref, computed } from 'vue'
import { ai } from '@/services/ai/ai.service'
import { extractFirstJsonBlock, safeJsonParse } from '@/services/ai/json.util'
import { extractWeddingDetails, hasWeddingDetails } from './useLocalExtraction'
import { parseSizeToInches } from '../utils/previewUtils'

// ============================================================================
// Types & Interfaces
// ============================================================================

export type WeddingAssistantActionName =
  | 'none'
  | 'open_login'
  | 'generate_preview'
  | 'open_edit'
  | 'download_png'
  | 'regenerate'
  | 'set_size'
  | 'ask_upload'

export interface WeddingAssistantDecision {
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

// Import shared types
import type { ChatMessage, ExtractedInfo } from '../types'
export type { ChatMessage, ExtractedInfo }

export interface AskedQuestions {
  picture: boolean
  size: boolean
}

export interface FormData {
  description: string
  customSize: string
}

export interface UseAIChatLogicOptions {
  // State refs
  chatMessages: Ref<ChatMessage[]>
  extractedInfo: Ref<ExtractedInfo>
  customHeading: Ref<string | null>
  askedQuestions: Ref<AskedQuestions>
  formData: FormData
  
  // Wizard states
  awaitingPictureDecision: Ref<boolean>
  awaitingBackgroundRemovalDecision: Ref<boolean>
  awaitingSizeDecision: Ref<boolean>
  
  // Step completion
  headingStepComplete: Ref<boolean>
  sizeStepComplete: Ref<boolean>
  pictureStepComplete: Ref<boolean>
  
  // Preview state
  showWeddingStickerPreview: Ref<boolean>
  isGeneratingPreview: Ref<boolean>
  isAnalyzing: Ref<boolean>
  preGeneratedImageFile: Ref<File | null>
  
  // Auth state
  isAuthenticated: Ref<boolean>
  
  // Image manager (for checking existing images)
  hasExistingImages: () => boolean
  
  // Callbacks
  scrollToBottom: () => void
  triggerPreGeneratedImageInput: () => void
  openAuthModal: (mode: 'login' | 'register') => void
  initWeddingChatOffline: () => {
    applyExtraction: (extraction: any) => void
    handleOfflineExtraction: (message: string) => Promise<void>
    processMessage: (message: string) => Promise<boolean>
  }
  processDescriptionInput: () => Promise<void>
  updateChatPreviewSVG: () => void
  generateWeddingPreview: () => Promise<void>
  openEditModal: () => void
  exportWeddingSticker: (format: 'png' | 'pdf') => void
  handleGenerateNew: () => Promise<void>
  handleSizeChange: (widthInches: number, heightInches: number) => Promise<void>
}

// ============================================================================
// Request ID tracker (for stale response detection)
// ============================================================================

let weddingChatRequestId = 0

// ============================================================================
// Main Composable
// ============================================================================

export function useAIChatLogic(options: UseAIChatLogicOptions) {
  const {
    chatMessages,
    extractedInfo,
    customHeading,
    askedQuestions,
    formData,
    awaitingPictureDecision,
    awaitingBackgroundRemovalDecision,
    awaitingSizeDecision,
    headingStepComplete,
    sizeStepComplete,
    pictureStepComplete,
    showWeddingStickerPreview,
    isGeneratingPreview,
    isAnalyzing,
    preGeneratedImageFile,
    isAuthenticated,
    hasExistingImages,
    scrollToBottom,
    triggerPreGeneratedImageInput,
    openAuthModal,
    initWeddingChatOffline,
    processDescriptionInput,
    updateChatPreviewSVG,
    generateWeddingPreview,
    openEditModal,
    exportWeddingSticker,
    handleGenerateNew,
    handleSizeChange
  } = options

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Build current wedding chat state context for AI
   */
  function buildWeddingChatContextForAI(): string {
    const state = {
      authenticated: isAuthenticated.value,
      hasPreview: showWeddingStickerPreview.value,
      heading: customHeading.value ?? null,
      details: {
        name1: extractedInfo.value.names.name1 ?? null,
        name2: extractedInfo.value.names.name2 ?? null,
        date: extractedInfo.value.date ?? null,
        courtesy: extractedInfo.value.courtesy ?? null,
        size: extractedInfo.value.size ?? null
      },
      hasPhoto: !!preGeneratedImageFile.value || hasExistingImages()
    }
    return JSON.stringify(state, null, 2)
  }

  /**
   * Build conversation transcript for AI context
   */
  function buildWeddingChatTranscriptForAI(maxMessages = 10): string {
    const items = chatMessages.value
      .filter(m => m && m.sender && !m.isLoading && m.type !== 'preview')
      .slice(-maxMessages)
      .map(m => {
        const role = m.sender === 'user' ? 'User' : 'Assistant'
        const text = String(m.text ?? '').trim()
        return `${role}: ${text}`
      })
    return items.join('\n')
  }

  /**
   * Sync description from extracted state
   */
  function syncWeddingDescriptionFromState(): void {
    const parts: string[] = []
    if (!customHeading.value && extractedInfo.value.title) {
      customHeading.value = extractedInfo.value.title
      headingStepComplete.value = true
    }
    if (customHeading.value && !extractedInfo.value.title) {
      extractedInfo.value.title = customHeading.value
    }
    if (customHeading.value) parts.push(customHeading.value)

    const n1 = extractedInfo.value.names.name1
    const n2 = extractedInfo.value.names.name2
    if (n1 && n2) parts.push(`(${n1} & ${n2})`)
    else if (n1) parts.push(`(${n1})`)

    if (extractedInfo.value.date) parts.push(extractedInfo.value.date)
    if (extractedInfo.value.courtesy) parts.push(`courtesy: ${extractedInfo.value.courtesy}`)

    const desc = parts.join(', ')
    formData.description = desc
  }

  /**
   * Extract size from text input
   */
  function extractSizeFromText(text: string): string | null {
    const sizeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)(?:\s*(?:inch|inches|in))?/i)
    if (sizeMatch) {
      const width = parseFloat(sizeMatch[1])
      const height = parseFloat(sizeMatch[2])
      return `${width}x${height} in`
    }
    return null
  }

  /**
   * Sanitize AI assistant text (remove markdown, code blocks, limit length)
   */
  function sanitizeAssistantText(input: string): string {
    const raw = String(input || '')
    const noFences = raw.replace(/```[\s\S]*?```/g, ' ')
    const noMdHeadings = noFences.replace(/^\s{0,3}#{1,6}\s+/gm, '')
    const noBullets = noMdHeadings.replace(/^\s*[-*•]+\s+/gm, '')
    const noBold = noBullets.replace(/\*\*([^*]+)\*\*/g, '$1')
    const flattened = noBold.replace(/\s*\n+\s*/g, ' ').replace(/\s+/g, ' ').trim()
    if (!flattened) return ''

    // Keep only the first 1–2 sentences
    const parts = flattened.split(/(?<=[.!?])\s+/).filter(Boolean)
    const out = parts.slice(0, 2).join(' ').trim()
    return out.length > 220 ? out.slice(0, 220).trim() : out
  }

  /**
   * Check if this is a non-wedding design request
   */
  function isNonWeddingDesignRequest(message: string): boolean {
    const m = (message || '').toLowerCase()
    
    // If the message references supported sticker types, treat as in-scope
    const mentionsSupported = /\b(wedding|nikah|nikkah|walimah|walima|bride|groom|graduation|birthday|naming\s+ceremony|naming|freedom|conjugal|together\s+forever|walimat)\b/i.test(m)
    
    // Out-of-scope design intents (things we don't support)
    const nonSupportedDesign = /\b(flyer|poster|logo|business\s*card|banner|brochure|certificate|cv|resume|invitation|funeral|obituary|church|mosque\s+poster|campaign|political|real\s*estate)\b/i.test(m)
    
    return nonSupportedDesign && !mentionsSupported
  }

  /**
   * Try to extract wedding details locally without Ollama
   */
  function tryLocalExtraction(message: string): {
    foundSomething: boolean
    name1?: string
    name2?: string
    date?: string
    courtesy?: string
  } {
    const result: ReturnType<typeof tryLocalExtraction> = { foundSomething: false }
    const msg = message.trim()
    
    // --- Extract Names ---
    const namePatterns = [
      /([A-Z][a-zA-Z']+(?:\s+[A-Z][a-zA-Z']+)?)\s*(?:&|and|AND|with)\s*([A-Z][a-zA-Z']+(?:\s+[A-Z][a-zA-Z']+)?)/,
      /([a-zA-Z][a-zA-Z']+(?:\s+[a-zA-Z][a-zA-Z']+)?)\s*(?:&|and)\s*([a-zA-Z][a-zA-Z']+(?:\s+[a-zA-Z][a-zA-Z']+)?)/i,
      /(?:ceremony|wedding|marriage)\s+(?:of\s+)?([A-Z][a-zA-Z']+(?:\s+[A-Z][a-zA-Z']+)?)\s*(?:&|and|AND|with)\s*([A-Z][a-zA-Z']+(?:\s+[A-Z][a-zA-Z']+)?)/i,
    ]
    
    for (const pattern of namePatterns) {
      const match = msg.match(pattern)
      if (match && match[1].length > 1 && match[2].length > 1) {
        const capitalize = (str: string) => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        result.name1 = capitalize(match[1].trim())
        result.name2 = capitalize(match[2].trim())
        result.foundSomething = true
        break
      }
    }
    
    // --- Extract Date ---
    const datePatterns = [
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4})/i,
      /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
      /on\s+(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December))/i,
    ]
    
    for (const pattern of datePatterns) {
      const match = msg.match(pattern)
      if (match) {
        result.date = match[1].trim()
        result.foundSomething = true
        break
      }
    }
    
    // --- Extract Courtesy Message ---
    const courtesyPatterns = [
      /^((?:congratulation|congratulations|felicitation|best wishes|wishing you|celebrating)[\s\w]*(?:ceremony|wedding|marriage|union|love)?)/i,
      /((?:with love|courtesy|from|by)[\s:]*(?:the\s+)?[\w\s]+(?:family|families))/i,
      /(we invite you[\s\w]+)/i,
      /((?:alhamdulillah|alhamdulillahi|masha ?allah|barakallah)[\s\w]*)/i,
      /^(the\s+[\w\s]+family)/i,
      /^(family\s+of\s+[\w\s]+)/i,
      /^(from\s+[\w\s]+)/i,
    ]
    
    for (const pattern of courtesyPatterns) {
      const match = msg.match(pattern)
      if (match) {
        result.courtesy = match[1].trim()
        result.foundSomething = true
        break
      }
    }
    
    // If message is short and doesn't match other patterns, it might be a courtesy message
    const hasExistingName = !!extractedInfo.value?.names?.name1
    const hasExistingDate = !!extractedInfo.value?.date
    const noNameInMsg = !namePatterns.some(p => p.test(msg))
    const noDateInMsg = !datePatterns.some(p => p.test(msg))
    
    if (!result.foundSomething && hasExistingName && hasExistingDate && noNameInMsg && noDateInMsg) {
      if (msg.length >= 3 && msg.length < 100 && !/^(yes|no|ok|hi|hello|hey|thanks)/i.test(msg)) {
        result.courtesy = msg
        result.foundSomething = true
      }
    }
    
    // If we found names but no courtesy, try to extract greeting as courtesy
    if (result.name1 && !result.courtesy) {
      const looksLikeGreeting = /congratulat|celebrat|invite|wish|alhamdulillah/i.test(msg)
      if (looksLikeGreeting) {
        const beforeNames = msg.split(/[A-Z][a-z]+\s*(?:&|and)/i)[0]?.trim()
        if (beforeNames && beforeNames.length > 10) {
          result.courtesy = beforeNames
        }
      }
    }
    
    return result
  }

  /**
   * Apply best-effort local extraction to message
   */
  async function applyBestEffortLocalExtraction(message: string): Promise<boolean> {
    if (!hasWeddingDetails(message)) return false

    const weddingChat = initWeddingChatOffline()
    const extraction = extractWeddingDetails(message, {
      hasName: !!extractedInfo.value.names.name1,
      hasDate: !!extractedInfo.value.date,
    })

    if (!extraction.foundSomething) return false

    weddingChat.applyExtraction(extraction)
    syncWeddingDescriptionFromState()
    if (showWeddingStickerPreview.value) {
      await processDescriptionInput()
      updateChatPreviewSVG()
    }
    return true
  }

  /**
   * Prompt for picture or generate preview
   */
  async function promptPictureOrGenerate(): Promise<void> {
    if (awaitingPictureDecision.value) return

    const hasTitle = !!(customHeading.value || extractedInfo.value.title)
    const hasName = !!extractedInfo.value.names.name1
    const hasDate = !!extractedInfo.value.date
    if (!hasTitle || !hasName || !hasDate) return

    const hasPhoto = !!preGeneratedImageFile.value || hasExistingImages()
    if (hasPhoto) {
      await maybeAskSizeThenGenerate()
      return
    }

    awaitingPictureDecision.value = true
  }

  /**
   * Prompt for size if needed
   */
  function promptSizeIfNeeded(): boolean {
    if (sizeStepComplete.value || extractedInfo.value.size || askedQuestions.value.size) return false
    awaitingSizeDecision.value = true
    askedQuestions.value.size = true
    chatMessages.value.push({
      id: Date.now(),
      text: "What size do you want? 📐: '3x3' → 🎯 'default' (4x4).",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return true
  }

  /**
   * Ask for size then generate
   */
  async function maybeAskSizeThenGenerate(): Promise<void> {
    if (promptSizeIfNeeded()) return
    await generateWeddingPreview()
  }

  // ============================================================================
  // Main AI Analysis Function
  // ============================================================================

  /**
   * Analyze message with Ollama AI
   */
  async function analyzeMessageWithOllama(lastUserMessage: string): Promise<void> {
    const reqId = ++weddingChatRequestId

    // Hard UI intent: if user is asking to add/upload a picture, handle it deterministically
    if (/(\bphoto\b|\bpicture\b|\bimage\b)/i.test(lastUserMessage)) {
      if (awaitingPictureDecision.value) {
        isAnalyzing.value = false
        scrollToBottom()
        return
      }
      const looksLikeRequest = /(upload|add|attach|include|put|send|share|don'?t\s+forget|remember)/i.test(lastUserMessage)
      const looksLikeQuestion = /\b(what\s+about|what\s+of|how\s+about|about)\b|\?/i.test(lastUserMessage)
      if (looksLikeRequest || looksLikeQuestion || /^\s*(photo|picture|image)\s*$/i.test(lastUserMessage.trim())) {
        isAnalyzing.value = false
        awaitingPictureDecision.value = true
        askedQuestions.value.picture = true
        chatMessages.value.push({
          id: Date.now(),
          text: 'You can add a picture → tap "Add Picture", or tap "Generate" to continue without one.',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'upload', label: 'Add Picture', variant: 'secondary' },
            { type: 'generate_preview', label: 'Generate', variant: 'primary' }
          ]
        })
        scrollToBottom()
        return
      }
    }

    // Hard UI intent: user asks what info is needed / how it works
    const helpMsg = lastUserMessage.toLowerCase()
    const looksLikeHelpQuestion =
      helpMsg.includes('what information') ||
      helpMsg.includes('what info') ||
      helpMsg.includes('what details') ||
      helpMsg.includes('what do i need') ||
      helpMsg.includes('what do you need') ||
      helpMsg.includes('what u need') ||
      helpMsg.includes('how do you create') ||
      helpMsg.includes('how do you make') ||
      helpMsg.includes('how does this work') ||
      helpMsg.includes('i do not understand') ||
      helpMsg.includes("i don't understand") ||
      helpMsg.includes('confused') ||
      (helpMsg.includes('mean') && (helpMsg.includes('provide') || helpMsg.includes('prove') || helpMsg.includes('information') || helpMsg.includes('details'))) ||
      helpMsg.includes('do you mean')
    
    if (looksLikeHelpQuestion) {
      isAnalyzing.value = false
      chatMessages.value.push({
        id: Date.now(),
        text: "No worries — we’ll do it step by step. First, what title/heading should I put at the top? (Example: ‘Wedding Ceremony’)",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }

    // First-chat / short-ack intercept: avoid long model welcome messages
    const hasTitleAlready = !!(customHeading.value || extractedInfo.value.title)
    const hasNameAlready = !!extractedInfo.value.names.name1
    const hasDateAlready = !!extractedInfo.value.date
    const hasAnyRequired = hasTitleAlready || hasNameAlready || hasDateAlready
    const trimmed = (lastUserMessage || '').trim().toLowerCase()
    const isGreetingOrAck =
      /^(hi|hello|hey|salam|assalamualaikum|good\s*(morning|afternoon|evening))\b/i.test(trimmed) ||
      /^(ok|okay|k|alright|sure|yes|yep|yeah)\b/i.test(trimmed)
    const isStartWeddingSticker = /\b(create|make|design|start)\b.*\b(wedding)\b.*\b(sticker|stiker)\b/i.test(trimmed) || /\bwedding\s*(sticker|stiker)\b/i.test(trimmed)
    
    if ((isGreetingOrAck || isStartWeddingSticker) && !hasAnyRequired) {
      isAnalyzing.value = false
      chatMessages.value.push({
        id: Date.now(),
        text: "Hi! 😊 Let’s start — what title/heading should I put at the top? (Example: ‘Wedding Ceremony’)",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }

    // Hard scope rule: ONLY wedding stickers are supported
    if (isNonWeddingDesignRequest(lastUserMessage)) {
      isAnalyzing.value = false
      const hasTitle = !!(customHeading.value || extractedInfo.value.title)
      const hasName = !!extractedInfo.value.names.name1
      const hasDate = !!extractedInfo.value.date
      const hasCourtesy = !!extractedInfo.value.courtesy

      const need: string[] = []
      if (!hasTitle) need.push('title/heading')
      if (!hasName) need.push('names')
      if (!hasDate) need.push('date')
      if (!hasCourtesy) need.push('courtesy')

      const followUp = need.length
        ? `To help you with a wedding sticker, please provide the ${need.join(', ')}.`
        : 'If you want, I can generate your wedding sticker now.'

      chatMessages.value.push({
        id: Date.now(),
        text: `I'm only trained to design wedding stickers. ${followUp}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }

    // Build AI context
    const context = buildWeddingChatContextForAI()
    const transcript = buildWeddingChatTranscriptForAI()

    const task = [
      'You are an assistant inside a graphic design app.',
      'The ONLY supported design type is: wedding sticker.',
      'Keep replies SHORT: max 2 sentences.',
      'Do NOT use markdown, headings, bullets, or lists.',
      'Understand what the user means; do not just repeat their words.',
      'If user asks for flyers/posters/logos/etc: politely say you only create wedding stickers and offer to help with a wedding sticker.',
      'If user asks general questions: briefly explain how wedding sticker creation works.',
      'Required wedding details: title/heading, couple names, wedding date.',
      'Optional: color preference (ask only AFTER required details are present).',
      'If details are missing: ask ONLY for the missing required detail(s).',
      'Never mention AI, models, prompts, JSON, or technical terms to the user.',
      'If you want to update fields, output JSON like: {"message":"...","updates":{"title":null,"name1":null,"name2":null,"date":null}}',
      'If you do NOT need to update fields, you may reply with plain text.'
    ].join('\n')

    try {
      const system = 'You are a friendly, conversational wedding sticker assistant. Chat naturally, be warm and helpful.'

      const aiText = await ai.chatText({
        system,
        user: `${task}\n\nState:\n${context}\n\nConversation:\n${transcript}\n\nUser: ${lastUserMessage}`,
        temperature: 0.6,
        maxTokens: 110
      })

      console.log('Ollama response:', aiText)

      let rawDecision: any | null = null
      const direct = safeJsonParse<any>(aiText)
      if (direct.ok) {
        rawDecision = direct.value
        console.log('✓ Direct JSON parse succeeded')
      } else {
        console.log('⚠️ Direct parse failed, trying extraction...')
        const extracted = extractFirstJsonBlock(aiText)
        console.log('📦 Extracted JSON block:', extracted)
        if (extracted) {
          const parsed = safeJsonParse<any>(extracted)
          if (parsed.ok) {
            rawDecision = parsed.value
            console.log('✓ Extracted JSON parse succeeded')
          }
        }
      }

      // Ignore stale responses
      if (reqId !== weddingChatRequestId) return

      // If JSON parsing failed, handle as plain text response
      if (!rawDecision) {
        isAnalyzing.value = false

        const stripped = String(aiText || '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/\uFEFF/g, '')
          .trim()

        const msgMatch = stripped.match(/"(?:message|reply|text|answer)"\s*:\s*"([^"]+)"/i)
        let msgText = sanitizeAssistantText((msgMatch?.[1] || stripped).trim())

        // Apply local extraction for plain-text model replies
        await applyBestEffortLocalExtraction(lastUserMessage)

        const hasTitle = !!(customHeading.value || extractedInfo.value.title)
        const hasName = !!extractedInfo.value.names.name1
        const hasDate = !!extractedInfo.value.date
        const hasCourtesy = !!extractedInfo.value.courtesy
        const hasPhoto = !!preGeneratedImageFile.value || hasExistingImages()

        // If the model tries to refuse image support, override with correct flow
        if (/don\s*'?t\s+currently\s+support\s+adding\s+images?|text\s+only/i.test(msgText)) {
          awaitingPictureDecision.value = true
          askedQuestions.value.picture = true
          chatMessages.value.push({
            id: Date.now(),
            text: 'You can add a picture → tap "Add Picture", or tap "Generate" to continue without one.',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { type: 'upload', label: 'Add Picture', variant: 'secondary' },
              { type: 'generate_preview', label: 'Generate', variant: 'primary' }
            ]
          })
          scrollToBottom()
          return
        }

        // If all required details are complete, proceed to picture question
        if (hasTitle && hasName && hasDate && hasCourtesy) {
          if (!hasPhoto && !awaitingPictureDecision.value) {
            awaitingPictureDecision.value = true
            askedQuestions.value.picture = true
            chatMessages.value.push({
              id: Date.now(),
              text: 'All set! Add a picture?',
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [
                { type: 'upload', label: 'Add Picture', variant: 'secondary' },
                { type: 'generate_preview', label: 'Generate', variant: 'primary' }
              ]
            })
            scrollToBottom()
            return
          }

          await maybeAskSizeThenGenerate()
          return
        }

        // If still missing required fields, ask what's missing
        const missing: string[] = []
        if (!hasTitle) missing.push('title/heading')
        if (!hasName) missing.push('names')
        if (!hasDate) missing.push('date')
        if (!hasCourtesy) missing.push('courtesy')
        if (missing.length) {
          chatMessages.value.push({
            id: Date.now(),
            text: `Please provide the ${missing.join(', ')}.`,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }

        const looksLikeJsonOrCode = /^\s*(\{|\[|<|```)/.test(msgText) || /\b(json|schema|format)\b/i.test(msgText)
        if (!msgText || looksLikeJsonOrCode) {
          console.log('⚠️ Ollama output unusable, using offline extraction')
          const weddingChat = initWeddingChatOffline()
          await weddingChat.handleOfflineExtraction(lastUserMessage)
          syncWeddingDescriptionFromState()
          if (showWeddingStickerPreview.value) {
            await processDescriptionInput()
            updateChatPreviewSVG()
          }
          return
        }

        chatMessages.value.push({
          id: Date.now(),
          text: msgText,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      }

      // Process structured JSON response
      const decision: WeddingAssistantDecision = {
        message: String(
          rawDecision?.message ??
            rawDecision?.text ??
            rawDecision?.reply ??
            rawDecision?.answer ??
            ''
        ),
        action: {
          name: (rawDecision?.action?.name ?? 'none') as WeddingAssistantActionName,
          args: (rawDecision?.action?.args ?? {}) as Record<string, unknown>
        },
        updates: (rawDecision?.updates ?? rawDecision?.update ?? undefined) as any,
        buttons: (rawDecision?.buttons ?? rawDecision?.button ?? undefined) as any
      }

      // Enforce authentication UI rules
      const modelButtons = Array.isArray(decision.buttons) ? decision.buttons : []
      if (isAuthenticated.value) {
        decision.buttons = modelButtons.filter(b => (b as any)?.type !== 'login')
        if (decision.action?.name === 'open_login') decision.action.name = 'none'
      } else {
        if (decision.action?.name === 'open_login') {
          decision.buttons = [{ type: 'login', label: 'Login', variant: 'primary' }]
        } else {
          decision.buttons = modelButtons.filter(b => (b as any)?.type !== 'login')
        }
      }

      // Apply extracted updates
      if (decision.updates) {
        if (decision.updates.heading !== undefined) {
          customHeading.value = decision.updates.heading
          headingStepComplete.value = !!decision.updates.heading
          extractedInfo.value.title = decision.updates.heading ?? null
        }
        if ((decision.updates as any).title !== undefined) {
          extractedInfo.value.title = (decision.updates as any).title
          if ((decision.updates as any).title) {
            customHeading.value = (decision.updates as any).title
            headingStepComplete.value = true
          }
        }
        if (decision.updates.name1 !== undefined) extractedInfo.value.names.name1 = decision.updates.name1
        if (decision.updates.name2 !== undefined) extractedInfo.value.names.name2 = decision.updates.name2
        if (decision.updates.date !== undefined) extractedInfo.value.date = decision.updates.date
        if (decision.updates.courtesy !== undefined) extractedInfo.value.courtesy = decision.updates.courtesy
        if (decision.updates.size !== undefined) {
          extractedInfo.value.size = decision.updates.size
          formData.customSize = decision.updates.size ?? ''
        }

        syncWeddingDescriptionFromState()

        if (showWeddingStickerPreview.value) {
          await processDescriptionInput()
          updateChatPreviewSVG()
        }
      }

      isAnalyzing.value = false

      // Build response message
      let msgText =
        sanitizeAssistantText((decision.message || '').toString().trim()) ||
        ''

      let shouldPromptPicture = false
      
      // Filter out JSON-like or placeholder responses  
      const badPatterns = /^(your reply|your response|<write|message here|here is|revised|\{|\[|json|structure|\`\`\`)|(\[new_name\]|\[name\]|\[date\]|\[message\])/i
      if (!msgText || badPatterns.test(msgText)) {
        const applied = await applyBestEffortLocalExtraction(lastUserMessage)
        if (applied) {
          const hasTitle = !!(customHeading.value || extractedInfo.value.title)
          const hasName = !!extractedInfo.value.names.name1
          const hasDate = !!extractedInfo.value.date

          if (hasTitle && hasName && hasDate) {
            msgText = 'All set. Would you like to add a picture for your design?'
            decision.buttons = [
              { type: 'upload', label: 'Add Picture', variant: 'secondary' },
              { type: 'generate_preview', label: 'Generate', variant: 'primary' }
            ] as any
            shouldPromptPicture = true
          } else {
            const need: string[] = []
            if (!hasTitle) need.push('title/heading')
            if (!hasName) need.push('names')
            if (!hasDate) need.push('date')
            msgText = need.length ? `Please share the ${need.join(', ')} for your wedding sticker.` : 'Please share your wedding sticker details.'
          }
        } else {
          const hasTitle = !!(customHeading.value || extractedInfo.value.title)
          const hasName = !!extractedInfo.value.names.name1
          const hasDate = !!extractedInfo.value.date
          if (hasTitle && hasName && hasDate) {
            msgText = 'All set. Would you like to add a picture for your design?'
            decision.buttons = [
              { type: 'upload', label: 'Add Picture', variant: 'secondary' },
              { type: 'generate_preview', label: 'Generate', variant: 'primary' }
            ] as any
            shouldPromptPicture = true
          } else {
            const need: string[] = []
            if (!hasTitle) need.push('title/heading')
            if (!hasName) need.push('names')
            if (!hasDate) need.push('date')
            msgText = need.length > 0 
              ? 'Please share the ' + need.join(', ') + ' for your wedding sticker.'
              : 'How can I help with your wedding sticker?'
          }
        }
      }

      // If we now have all required details, keep the reply short
      const hasTitle = !!(customHeading.value || extractedInfo.value.title)
      const hasName = !!extractedInfo.value.names.name1
      const hasDate = !!extractedInfo.value.date
      const hasAnyPhoto = !!preGeneratedImageFile.value || hasExistingImages()
      if (hasTitle && hasName && hasDate) {
        if (!hasAnyPhoto) {
          msgText = 'All set. Would you like to add a picture for your design?'
          decision.buttons = [
            { type: 'upload', label: 'Add Picture', variant: 'secondary' },
            { type: 'generate_preview', label: 'Generate', variant: 'primary' }
          ] as any
          shouldPromptPicture = true
        } else {
          msgText = 'Great — generating your wedding sticker now.'
          decision.buttons = undefined as any
          shouldPromptPicture = false
        }
      }
      
      chatMessages.value.push({
        id: Date.now(),
        text: msgText,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: Array.isArray(decision.buttons) ? decision.buttons : undefined
      })
      scrollToBottom()

      if (shouldPromptPicture) {
        await promptPictureOrGenerate()
      } else {
        const hasTitle = !!(customHeading.value || extractedInfo.value.title)
        const hasName = !!extractedInfo.value.names.name1
        const hasDate = !!extractedInfo.value.date
        const hasPhoto = !!preGeneratedImageFile.value || hasExistingImages()
        if (hasTitle && hasName && hasDate && hasPhoto && !showWeddingStickerPreview.value && !isGeneratingPreview.value) {
          await maybeAskSizeThenGenerate()
        }
      }

      // Execute actions
      const actionName = decision.action?.name ?? 'none'
      const actionArgs = decision.action?.args ?? {}

      if (actionName === 'open_login') {
        openAuthModal('login')
        return
      }

      if (actionName === 'ask_upload') {
        triggerPreGeneratedImageInput()
        return
      }

      if (actionName === 'set_size') {
        const size = (actionArgs as any).size as string | undefined
        if (size) {
          const parsed = parseSizeToInches(size)
          if (parsed) {
            await handleSizeChange(parsed.w, parsed.h)
          }
        }
        return
      }

      if (actionName === 'generate_preview') {
        const hasTitle = !!(customHeading.value || extractedInfo.value.title)
        const hasNames = !!extractedInfo.value.names.name1
        const hasDate = !!extractedInfo.value.date
        if (!hasTitle || !hasNames || !hasDate) return
        await maybeAskSizeThenGenerate()
        return
      }

      if (actionName === 'open_edit') {
        if (!showWeddingStickerPreview.value) return
        openEditModal()
        return
      }

      if (actionName === 'download_png') {
        if (!showWeddingStickerPreview.value) return
        exportWeddingSticker('png')
        return
      }

      if (actionName === 'regenerate') {
        if (!showWeddingStickerPreview.value) return
        await handleGenerateNew()
        return
      }
    } catch (e) {
      if (reqId !== weddingChatRequestId) return
      console.log('⚠️ Ollama unavailable, using offline extraction')
      const weddingChat = initWeddingChatOffline()
      await weddingChat.handleOfflineExtraction(lastUserMessage)
      syncWeddingDescriptionFromState()

      const hasTitle = !!(customHeading.value || extractedInfo.value.title)
      const hasName = !!extractedInfo.value.names.name1
      const hasDate = !!extractedInfo.value.date
      const hasPhoto = !!preGeneratedImageFile.value || hasExistingImages()
      if (hasTitle && hasName && hasDate && !hasPhoto && !awaitingPictureDecision.value) {
        awaitingPictureDecision.value = true
        askedQuestions.value.picture = true
      }

      if (showWeddingStickerPreview.value) {
        await processDescriptionInput()
        updateChatPreviewSVG()
      }
    }
  }

  /**
   * Main message analysis dispatcher (offline-first, Ollama fallback)
   */
  async function analyzeMessage(lastUserMessage: string): Promise<void> {
    const weddingChat = initWeddingChatOffline()
    const handledOffline = await weddingChat.processMessage(lastUserMessage)
    
    if (handledOffline) {
      syncWeddingDescriptionFromState()
      if (showWeddingStickerPreview.value) {
        await processDescriptionInput()
        updateChatPreviewSVG()
      }
      return
    }
    
    console.log('⚙️ Offline did not understand, trying Ollama...')
    await analyzeMessageWithOllama(lastUserMessage)
  }

  // ============================================================================
  // Exported API
  // ============================================================================

  return {
    // Core functions
    analyzeMessage,
    analyzeMessageWithOllama,
    
    // Context builders
    buildWeddingChatContextForAI,
    buildWeddingChatTranscriptForAI,
    
    // Helper functions
    syncWeddingDescriptionFromState,
    parseSizeToInches,
    extractSizeFromText,
    sanitizeAssistantText,
    isNonWeddingDesignRequest,
    tryLocalExtraction,
    applyBestEffortLocalExtraction,
    
    // Flow control
    promptPictureOrGenerate,
    promptSizeIfNeeded,
    maybeAskSizeThenGenerate
  }
}

// Types are exported via the interface definition above
