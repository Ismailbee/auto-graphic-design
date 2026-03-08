/**
 * Intent Detection Composable
 * 
 * Classifies user messages into different intent categories to help
 * the chat system respond appropriately.
 * 
 * Supported intents:
 * - greeting: User says hello
 * - thanks: User expresses gratitude
 * - confirmation: Yes/No responses
 * - change_request: User wants to modify something
 * - question: User asks a question
 * - help_request: User needs assistance
 * - cancel: User wants to start over
 * - download: User wants to save/export
 * - provide_info: User is providing wedding details
 */

// Intent types
export type UserIntent = 
  | 'greeting'
  | 'thanks'
  | 'confirmation'
  | 'provide_info'
  | 'change_request'
  | 'question'
  | 'help_request'
  | 'cancel'
  | 'download'

export interface IntentEntities {
  hasNames?: boolean
  hasDate?: boolean
  hasCourtesy?: boolean
  hasSize?: boolean
  targetField?: string  // What field they want to change (names, date, courtesy, size, picture, heading)
}

export interface IntentResult {
  intent: UserIntent
  confidence: number  // 0-1 scale
  entities: IntentEntities
}

// Pattern definitions
const PATTERNS = {
  // PRIORITY 1: Greeting patterns (must be checked first)
  greeting: {
    exact: /^(hi+|hello+|hey+|good morning|good afternoon|good evening|assalam|salam|salaam|as-salamu|wa alaikum|hii+|helo+|hola|howdy|greetings)/i,
    anywhere: /\b(hi there|hello there|good morning|good afternoon|good evening|assalam|salam|salaam)\b/i
  },
  
  // PRIORITY 2: Confirmation patterns (yes/no)
  confirmation: {
    exact: /^(yes|yeah|yep|sure|ok|okay|no|nope|nah|please|alright|fine|correct|right|definitely|absolutely|of course)$/i,
    positive: /^(yes|yeah|yep|sure|ok|okay|please|alright|fine|correct|right|definitely|absolutely|of course)$/i,
    negative: /^(no|nope|nah)$/i
  },
  
  // Thanks patterns
  thanks: /\b(thank|thanks|thx|appreciate|grateful|awesome|great job|perfect|amazing|wonderful|beautiful|love it|looks great)\b/i,
  
  // Change/Edit request patterns
  change: /\b(change|update|edit|modify|replace|make it|set the|use|switch|different|alter|correct|fix)\b/i,
  
  // Question patterns
  question: /(\?$|\b(what|how|when|where|who|why|which|can you|could you|would you|is it|are you|do you|does it)\b)/i,
  
  // Help request patterns
  help: /\b(help|assist|guide|how do|how to|stuck|confused|don't understand|what should)\b/i,
  
  // Cancel patterns
  cancel: /\b(cancel|start over|restart|reset|clear|new design|begin again|forget)\b/i,
  
  // Download patterns
  download: /\b(download|save|export|get the|send me)\b/i,
  
  // Entity detection patterns
  entities: {
    names: /\b([a-zA-Z][a-zA-Z'-]+)\s+(?:and|&|n)\s+([a-zA-Z][a-zA-Z'-]+)\b/i,
    namesBrackets: /\(([^)]+)\)/,
    date: /\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
    dateSlash: /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/,
    courtesy: /\b(courtesy|from the|from .+ family)\b/i,
    size: /\d+(?:\.\d+)?\s*(?:x|by)\s*\d+(?:\.\d+)?/i
  },
  
  // Target field detection for change requests
  targetFields: {
    names: /\b(name|names|couple|bride|groom)\b/i,
    date: /\b(date|day|when)\b/i,
    courtesy: /\b(courtesy|from|sender|family)\b/i,
    size: /\b(size|dimension|inches|inch)\b/i,
    picture: /\b(picture|photo|image|pic)\b/i,
    heading: /\b(heading|title|text)\b/i
  }
}

/**
 * Detect the intent of a user message
 * @param message - The user's message to analyze
 * @returns IntentResult with intent type, confidence, and detected entities
 */
export function detectIntent(message: string): IntentResult {
  const result: IntentResult = {
    intent: 'provide_info',
    confidence: 0.5,
    entities: {}
  }

  if (!message || typeof message !== 'string') {
    return result
  }

  const lowerMsg = message.toLowerCase().trim()

  // PRIORITY 1: Detect greeting intent FIRST (before confirmation check)
  // This ensures "hi", "hello", "hey" are treated as greetings, not confirmations
  if (PATTERNS.greeting.exact.test(lowerMsg)) {
    result.intent = 'greeting'
    result.confidence = 0.95
    return result
  }

  // PRIORITY 2: Detect confirmation intent (for yes/no responses)
  if (PATTERNS.confirmation.exact.test(lowerMsg)) {
    const isPositive = PATTERNS.confirmation.positive.test(lowerMsg)
    result.intent = 'confirmation'
    result.confidence = 0.95
    result.entities.targetField = isPositive ? 'positive' : 'negative'
    return result
  }

  // Check for greetings anywhere in message
  if (PATTERNS.greeting.anywhere.test(lowerMsg)) {
    result.intent = 'greeting'
    result.confidence = 0.9
    return result
  }

  // Detect thanks intent
  if (PATTERNS.thanks.test(lowerMsg)) {
    result.intent = 'thanks'
    result.confidence = 0.85
    return result
  }

  // Detect change/edit request intent
  if (PATTERNS.change.test(lowerMsg)) {
    result.intent = 'change_request'
    result.confidence = 0.85
    
    // Detect what they want to change
    for (const [field, pattern] of Object.entries(PATTERNS.targetFields)) {
      if (pattern.test(lowerMsg)) {
        result.entities.targetField = field
        break
      }
    }
    return result
  }

  // Detect question intent
  if (PATTERNS.question.test(lowerMsg)) {
    result.intent = 'question'
    result.confidence = 0.8
    return result
  }

  // Detect help request
  if (PATTERNS.help.test(lowerMsg)) {
    result.intent = 'help_request'
    result.confidence = 0.85
    return result
  }

  // Detect cancel intent
  if (PATTERNS.cancel.test(lowerMsg)) {
    result.intent = 'cancel'
    result.confidence = 0.9
    return result
  }

  // Detect download intent
  if (PATTERNS.download.test(lowerMsg)) {
    result.intent = 'download'
    result.confidence = 0.85
    return result
  }

  // Default: providing information - check what entities are present
  result.intent = 'provide_info'
  result.confidence = 0.6
  
  // Check for entities in the message
  result.entities.hasNames = PATTERNS.entities.names.test(message) || PATTERNS.entities.namesBrackets.test(message)
  result.entities.hasDate = PATTERNS.entities.date.test(message) || PATTERNS.entities.dateSlash.test(message)
  result.entities.hasCourtesy = PATTERNS.entities.courtesy.test(message)
  result.entities.hasSize = PATTERNS.entities.size.test(message)

  // Increase confidence if entities detected
  if (result.entities.hasNames || result.entities.hasDate || result.entities.hasCourtesy || result.entities.hasSize) {
    result.confidence = 0.8
  }

  return result
}

/**
 * Check if a message is a positive confirmation
 */
export function isPositiveConfirmation(message: string): boolean {
  return PATTERNS.confirmation.positive.test(message.toLowerCase().trim())
}

/**
 * Check if a message is a negative confirmation
 */
export function isNegativeConfirmation(message: string): boolean {
  return PATTERNS.confirmation.negative.test(message.toLowerCase().trim())
}

/**
 * Check if a message is a greeting
 */
export function isGreeting(message: string): boolean {
  const lower = message.toLowerCase().trim()
  return PATTERNS.greeting.exact.test(lower) || PATTERNS.greeting.anywhere.test(lower)
}

/**
 * Check if a message is a change request
 */
export function isChangeRequest(message: string): boolean {
  return PATTERNS.change.test(message.toLowerCase())
}

/**
 * Extract target field from a change request message
 */
export function extractTargetField(message: string): string | null {
  const lower = message.toLowerCase()
  for (const [field, pattern] of Object.entries(PATTERNS.targetFields)) {
    if (pattern.test(lower)) {
      return field
    }
  }
  return null
}

/**
 * Composable function for intent detection
 * Returns utility functions for analyzing user intent
 */
export function useIntentDetection() {
  return {
    detectIntent,
    isPositiveConfirmation,
    isNegativeConfirmation,
    isGreeting,
    isChangeRequest,
    extractTargetField,
    // Export patterns for advanced use cases
    PATTERNS,
  }
}
