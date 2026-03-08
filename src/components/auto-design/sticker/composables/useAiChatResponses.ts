/**
 * Composable for AI Chat Response Generation
 * Handles intent detection, response generation, and conversation flow
 */

import { ref, computed } from 'vue'

// Intent types
export type UserIntent = 
  | 'provide_info'
  | 'change_request'
  | 'question'
  | 'confirmation'
  | 'greeting'
  | 'thanks'
  | 'help_request'
  | 'cancel'
  | 'download'

export interface IntentResult {
  intent: UserIntent
  confidence: number
  entities: {
    hasNames?: boolean
    hasDate?: boolean
    hasCourtesy?: boolean
    hasSize?: boolean
    targetField?: string
  }
}

// Response helper with predefined messages
export const aiResponseHelper = {
  // Random picker helper
  pick: (arr: string[]) => arr[Math.floor(Math.random() * arr.length)],

  // Professional greetings - simple and clean
  greetings: {
    morning: [
      "Good morning! Please provide your details."
    ],
    afternoon: [
      "Good afternoon! Please provide your details."
    ],
    evening: [
      "Good evening! Please provide your details."
    ],
    general: [
      "Hello! Please provide your details."
    ],
    salam: [
      "Wa alaikum assalam! Please provide your details."
    ]
  },

  // Confirmations
  confirmations: [
    "Got it!",
    "Noted!",
    "Perfect!",
    "Received!",
    "Understood!",
    "Great!"
  ],

  // Processing messages
  processing: [
    "Creating your design...",
    "Almost ready..."
  ],

  // Asking for names
  askNames: [
    "Please provide the names.",
    "What are the names?"
  ],

  // Asking for date
  askDate: [
    "What's the date?",
    "Please provide the date."
  ],

  // Asking for courtesy
  askCourtesy: [
    "Please provide the courtesy.",
    "Who is it from?"
  ],

  // Success messages
  success: [
    "Your design is ready!",
    "Done!",
    "Design complete!"
  ],

  // Picture-related responses
  pictureAsk: [
    "Add a photo?"
  ],

  pictureReceived: [
    "Photo received!",
    "Got the photo!"
  ],

  // Size-related
  sizeAsk: [
    "What size?"
  ],

  sizeConfirm: (size: string) => [
    `Size set to ${size}!`
  ],

  // Multiple images detected
  multipleImages: [
    "Multiple pictures! Use FIRST or NEW one?"
  ],

  // Error handling
  errors: {
    noInfo: [
      "Please provide your details."
    ],
    unclear: [
      "Please provide your details."
    ],
    patience: [
      "Just a moment!",
      "Almost ready..."
    ]
  },

  // Fun responses for casual chat
  jokes: [
    "Love is in the air! 💕"
  ],

  // Casual responses
  casual: {
    thanks: [
      "You're welcome!",
      "Glad to help!"
    ],
    howAreYou: [
      "Ready to help!",
      "What can I create for you?"
    ],
    goodbye: [
      "Goodbye!",
      "See you!"
    ]
  },

  // Get appropriate greeting
  getGreeting: (message: string, userName: string): string => {
    const lower = message.toLowerCase()
    const h = aiResponseHelper

    if (lower.includes('salam') || lower.includes('assalam')) {
      return h.pick(h.greetings.salam)
    }
    if (lower.includes('good morning')) {
      return h.pick(h.greetings.morning)
    }
    if (lower.includes('good afternoon')) {
      return h.pick(h.greetings.afternoon)
    }
    if (lower.includes('good evening')) {
      return h.pick(h.greetings.evening)
    }

    const greeting = h.pick(h.greetings.general)
    return greeting.replace('{name}', userName)
  }
}

/**
 * Detect user intent from message
 */
export function detectIntent(message: string): IntentResult {
  const lowerMsg = message.toLowerCase().trim()
  const result: IntentResult = {
    intent: 'provide_info',
    confidence: 0.5,
    entities: {}
  }

  // PRIORITY 1: Detect greeting intent
  const greetingPatterns = /^(hi+|hello+|hey+|good morning|good afternoon|good evening|assalam|salam|salaam|as-salamu|wa alaikum|hii+|helo+|hola|howdy|greetings)/i
  if (greetingPatterns.test(lowerMsg)) {
    result.intent = 'greeting'
    result.confidence = 0.95
    return result
  }

  // PRIORITY 2: Detect confirmation intent
  const confirmationPatterns = /^(yes|yeah|yep|sure|ok|okay|no|nope|nah|please|alright|fine|correct|right|definitely|absolutely|of course)$/i
  if (confirmationPatterns.test(lowerMsg)) {
    result.intent = 'confirmation'
    result.confidence = 0.9
    return result
  }

  // PRIORITY 3: Thanks intent
  const thanksPatterns = /\b(thank|thanks|thank you|thx|appreciate|grateful)\b/i
  if (thanksPatterns.test(lowerMsg)) {
    result.intent = 'thanks'
    result.confidence = 0.9
    return result
  }

  // PRIORITY 4: Help request
  const helpPatterns = /\b(help|assist|how do i|how to|what should|guide|tutorial|instructions|show me|teach me)\b/i
  if (helpPatterns.test(lowerMsg)) {
    result.intent = 'help_request'
    result.confidence = 0.85
    return result
  }

  // PRIORITY 5: Cancel/restart
  const cancelPatterns = /\b(cancel|restart|start over|reset|begin again|new design|clear|undo all)\b/i
  if (cancelPatterns.test(lowerMsg)) {
    result.intent = 'cancel'
    result.confidence = 0.9
    return result
  }

  // PRIORITY 6: Download request
  const downloadPatterns = /\b(download|export|save|get the image|get my design|get sticker)\b/i
  if (downloadPatterns.test(lowerMsg)) {
    result.intent = 'download'
    result.confidence = 0.9
    return result
  }

  // PRIORITY 7: Change request
  const changePatterns = /\b(change|update|modify|edit|replace|fix|correct|alter|different|another|new)\s+(the\s+)?(name|date|courtesy|heading|title|picture|photo|image|background|size|color)/i
  if (changePatterns.test(lowerMsg)) {
    result.intent = 'change_request'
    result.confidence = 0.85
    
    // Detect target field
    if (/\b(name|names|couple)\b/i.test(lowerMsg)) result.entities.targetField = 'names'
    else if (/\b(date|day|when)\b/i.test(lowerMsg)) result.entities.targetField = 'date'
    else if (/\b(courtesy|from|sender)\b/i.test(lowerMsg)) result.entities.targetField = 'courtesy'
    else if (/\b(heading|title)\b/i.test(lowerMsg)) result.entities.targetField = 'heading'
    else if (/\b(picture|photo|image)\b/i.test(lowerMsg)) result.entities.targetField = 'picture'
    else if (/\b(background|bg)\b/i.test(lowerMsg)) result.entities.targetField = 'background'
    else if (/\b(size|dimension)\b/i.test(lowerMsg)) result.entities.targetField = 'size'
    
    return result
  }

  // PRIORITY 8: Question
  const questionPatterns = /^(what|where|when|who|why|how|can|could|would|will|is|are|do|does|did)\b|\?$/i
  if (questionPatterns.test(lowerMsg)) {
    result.intent = 'question'
    result.confidence = 0.7
    return result
  }

  // Default: providing info
  result.intent = 'provide_info'
  result.confidence = 0.5
  return result
}

/**
 * Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  
  if (m === 0) return n
  if (n === 0) return m
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  
  return dp[m][n]
}

/**
 * Composable for AI chat responses
 */
export function useAiChatResponses() {
  // State
  const lastIntent = ref<IntentResult | null>(null)
  
  // Get greeting based on time and message
  function getGreeting(message: string, userName: string = 'there'): string {
    return aiResponseHelper.getGreeting(message, userName)
  }
  
  // Get random confirmation
  function getConfirmation(): string {
    return aiResponseHelper.pick(aiResponseHelper.confirmations)
  }
  
  // Get processing message
  function getProcessingMessage(): string {
    return aiResponseHelper.pick(aiResponseHelper.processing)
  }
  
  // Get success message
  function getSuccessMessage(): string {
    return aiResponseHelper.pick(aiResponseHelper.success)
  }
  
  // Get error message
  function getErrorMessage(type: 'noInfo' | 'unclear' | 'patience'): string {
    return aiResponseHelper.pick(aiResponseHelper.errors[type])
  }
  
  // Get ask message
  function getAskMessage(field: 'names' | 'date' | 'courtesy'): string {
    const key = `ask${field.charAt(0).toUpperCase() + field.slice(1)}` as 'askNames' | 'askDate' | 'askCourtesy'
    return aiResponseHelper.pick(aiResponseHelper[key])
  }
  
  // Analyze message and detect intent
  function analyzeIntent(message: string): IntentResult {
    const intent = detectIntent(message)
    lastIntent.value = intent
    return intent
  }
  
  // Generate response based on intent
  function generateResponse(
    intent: IntentResult,
    context: {
      hasNames?: boolean
      hasDate?: boolean
      hasCourtesy?: boolean
      hasPreview?: boolean
      userName?: string
    }
  ): string {
    const h = aiResponseHelper
    
    switch (intent.intent) {
      case 'greeting':
        return getGreeting('', context.userName || 'there')
      
      case 'thanks':
        return h.pick(h.casual.thanks)
      
      case 'help_request':
        return `Hi ${context.userName || 'there'}! I'm here to help you create a wedding sticker.\n\n` +
          `Here's what I need:\n` +
          `1️⃣ **Names** - The couple's names (e.g., "John and Mary")\n` +
          `2️⃣ **Date** - The wedding date (e.g., "25th December 2025")\n` +
          `3️⃣ **Courtesy** - Who it's from (e.g., "courtesy: The Smith Family")\n\n` +
          `You can tell me all at once or one at a time!`
      
      case 'cancel':
        return "No problem! Let's start fresh. Tell me the couple's names and wedding details!"
      
      case 'download':
        if (context.hasPreview) {
          return "Click the Download button below to save your sticker!"
        }
        return "Let's create your design first! Please provide the names, date, and courtesy."
      
      case 'change_request':
        const field = intent.entities.targetField
        if (field === 'names') {
          return "Sure! What are the new names?"
        } else if (field === 'date') {
          return "Of course! What's the new date?"
        } else if (field === 'courtesy') {
          return "No problem! What should the courtesy be?"
        } else if (field === 'background') {
          return "Changing background now..."
        } else if (field === 'picture') {
          return "Click the + button to upload a new picture!"
        }
        return "What would you like to change?"
      
      case 'confirmation':
        return h.pick(h.confirmations)
      
      case 'question':
        return h.pick(h.errors.unclear)
      
      default:
        // Check what info is missing
        if (!context.hasNames) {
          return h.pick(h.askNames)
        }
        if (!context.hasDate) {
          return h.pick(h.askDate)
        }
        if (!context.hasCourtesy) {
          return h.pick(h.askCourtesy)
        }
        return h.pick(h.success)
    }
  }
  
  return {
    // State
    lastIntent,
    
    // Methods
    analyzeIntent,
    generateResponse,
    getGreeting,
    getConfirmation,
    getProcessingMessage,
    getSuccessMessage,
    getErrorMessage,
    getAskMessage,
    
    // Expose helper for direct access
    aiResponseHelper,
    detectIntent,
    levenshteinDistance
  }
}
