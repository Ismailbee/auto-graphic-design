/**
 * AI Response Helper
 * 
 * Professional, clear English response templates with a friendly tone
 * for the wedding sticker chat assistant.
 */

/**
 * Utility function to pick a random item from an array
 */
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Short, clean greeting messages - organized by time of day
 */
export const greetings = {
  morning: [
    "Good morning! Please provide your information."
  ],
  afternoon: [
    "Good afternoon! Please provide your information."
  ],
  evening: [
    "Good evening! Please provide your information."
  ],
  general: [
    "Hello! Please provide your information."
  ],
  salam: [
    "Wa alaikum assalam! Please provide your information."
  ]
}

/**
 * Professional confirmation messages
 */
export const confirmations = [
  "Got it!",
  "Noted!",
  "Perfect!",
  "Received!",
  "Understood!",
  "Great!"
]

/**
 * Processing messages shown during design generation
 */
export const processingMessages = [
  "Creating your design...",
  "Generating your sticker...",
  "Almost ready..."
]

/**
 * Prompts for asking names
 */
export const askNames = [
  "Please provide the names.",
  "What are the names?"
]

/**
 * Prompts for asking date
 */
export const askDate = [
  "What's the date?",
  "Please provide the date."
]

/**
 * Prompts for asking courtesy
 */
export const askCourtesy = [
  "Please provide the courtesy.",
  "Who is it from?"
]

/**
 * Success messages shown when design is complete
 */
export const successMessages = [
  "Your sticker is ready!",
  "Design complete!",
  "Done! Here's your sticker!"
]

/**
 * Picture-related prompts and confirmations
 */
export const pictureMessages = {
  ask: [
    "Would you like to add a photo?"
  ],
  received: [
    "Photo received!",
    "Great! Adding photo to design."
  ]
}

/**
 * Size-related messages
 */
export const sizeMessages = {
  ask: [
    "What size? (e.g., 3x3 or 4x4 inches)"
  ],
  confirm: (size: string) => [
    `Size set to ${size}!`
  ]
}

/**
 * Multiple image handling messages
 */
export const multipleImagesMessage = [
  "Multiple pictures! Use FIRST or NEW one?"
]

/**
 * Error handling messages
 */
export const errorMessages = {
  noInfo: [
    "Please provide: names, date, and courtesy."
  ],
  unclear: [
    "Please provide: names, date, and courtesy."
  ],
  patience: [
    "Just a moment!",
    "Creating your design..."
  ]
}

/**
 * Fun response messages
 */
export const jokes = [
  "Love is in the air! 💕"
]

/**
 * Casual conversation responses
 */
export const casualResponses = {
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
    "See you later!"
  ]
}

/**
 * Get appropriate greeting based on the message content
 * @param message - The user's message to analyze
 * @param _userName - The user's name (for potential personalization)
 * @returns A contextually appropriate greeting
 */
export function getGreeting(message: string, _userName: string): string {
  if (!message || typeof message !== 'string') return pick(greetings.general)
  const lower = message.toLowerCase()

  if (lower.includes('salam') || lower.includes('assalam')) {
    return pick(greetings.salam)
  }
  if (lower.includes('good morning')) {
    return pick(greetings.morning)
  }
  if (lower.includes('good afternoon')) {
    return pick(greetings.afternoon)
  }
  if (lower.includes('good evening')) {
    return pick(greetings.evening)
  }

  return pick(greetings.general)
}

/**
 * AI Response Helper object with all response templates and utilities
 * This provides a convenient interface for accessing all response categories
 */
export const aiResponseHelper = {
  pick,
  greetings,
  confirmations,
  processing: processingMessages,
  askNames,
  askDate,
  askCourtesy,
  success: successMessages,
  pictureAsk: pictureMessages.ask,
  pictureReceived: pictureMessages.received,
  sizeAsk: sizeMessages.ask,
  sizeConfirm: sizeMessages.confirm,
  multipleImages: multipleImagesMessage,
  errors: errorMessages,
  jokes,
  casual: casualResponses,
  getGreeting
}

/**
 * Composable function for using AI response helper in Vue components
 * @returns The aiResponseHelper object and all individual exports
 */
export function useAIResponseHelper() {
  return {
    aiResponseHelper,
    pick,
    greetings,
    confirmations,
    processingMessages,
    askNames,
    askDate,
    askCourtesy,
    successMessages,
    pictureMessages,
    sizeMessages,
    multipleImagesMessage,
    errorMessages,
    jokes,
    casualResponses,
    getGreeting
  }
}

export default useAIResponseHelper
