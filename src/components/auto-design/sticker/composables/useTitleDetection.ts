/**
 * Title Detection Utilities
 * 
 * Detects and extracts wedding title phrases from user chat messages.
 * Maps common wedding-related phrases to their properly formatted display versions.
 */

// ========================================
// TITLE DETECTION PATTERNS
// ========================================

/**
 * Regex patterns to detect if text contains a potential title phrase
 */
export const titlePatterns = [
  /congratulation[s]?\s+on\s+your\s+wedding/i,
  /congratulation[s]?\s+on\s+your\s+wedding\s+ceremony/i,
  /congratulation[s]?\s+on\s+your\s+(?:qur'?anic\s+)?(?:walima|walimah|walimat|walmia|walmiah|wamima|wamimat|wamimah)/i,
  /beautiful\s+beginning/i,
  /conjugal\s+bliss/i,
  /save\s+the\s+date/i,
  /alhamdulillah[i]?\s+on\s+your\s+wedding/i,
  /alhamdulillah[i]?\s+on\s+your\s+wedding\s+ceremony/i,
  /alhamdulillah[i]?\s+on\s+your\s+(?:qur'?anic\s+)?walima/i,
  /alhamdulillah[i]?\s+on\s+your\s+(?:qur'?anic\s+)?graduation/i,
  /thank[s]?\s+for\s+attending/i,
  /best\s+wishes/i,
  /happy\s+wedding/i,
  /with\s+love/i
]

/**
 * Map of regex patterns to their properly formatted display titles
 * Order matters - more specific patterns should come first
 */
export const titlePhraseMap: { pattern: RegExp; display: string }[] = [
  { pattern: /congratulation[s]?\s+on\s+your\s+wedding\s+ceremony/i, display: 'Congratulations On Your Wedding Ceremony' },
  { pattern: /congratulation[s]?\s+on\s+your\s+wedding/i, display: 'Congratulations On Your Wedding' },
  { pattern: /congratulation[s]?\s+on\s+your\s+qur'?anic\s+(?:walima|walimah|walimat|walmia|walmiah|wamima|wamimat|wamimah)/i, display: "Congratulations On Your Qur'anic Walima" },
  { pattern: /congratulation[s]?\s+on\s+your\s+(?:walima|walimah|walimat|walmia|walmiah|wamima|wamimat|wamimah)/i, display: 'Congratulations On Your Walima' },
  { pattern: /beautiful\s+beginning/i, display: 'Beautiful Beginning' },
  { pattern: /conjugal\s+bliss/i, display: 'Conjugal Bliss' },
  { pattern: /save\s+the\s+date/i, display: 'Save The Date' },
  { pattern: /alhamdulillah[i]?\s+on\s+your\s+qur'?anic\s+walima/i, display: "Alhamdulillahi On Your Qur'anic Walima" },
  { pattern: /alhamdulillah[i]?\s+on\s+your\s+qur'?anic\s+graduation/i, display: "Alhamdulillahi On Your Qur'anic Graduation" },
  { pattern: /alhamdulillah[i]?\s+on\s+your\s+wedding\s+ceremony/i, display: 'Alhamdulillahi On Your Wedding Ceremony' },
  { pattern: /alhamdulillah[i]?\s+on\s+your\s+wedding/i, display: 'Alhamdulillahi On Your Wedding' },
  { pattern: /thank[s]?\s+for\s+attending/i, display: 'Thanks For Attending' },
  { pattern: /best\s+wishes/i, display: 'Best Wishes' },
  { pattern: /happy\s+wedding/i, display: 'Happy Wedding' },
  { pattern: /with\s+love/i, display: 'With Love' },
]

// ========================================
// DETECTION FUNCTIONS
// ========================================

/**
 * Check if text contains a potential title phrase
 * @param text - The text to check
 * @returns true if text matches any title pattern
 */
export function isPotentialTitle(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  const lower = text.toLowerCase().trim()
  return titlePatterns.some(pattern => pattern.test(lower))
}

/**
 * Extract title phrase from text and return the formatted display version
 * @param text - The text to extract from
 * @returns The formatted display title or null if no match
 */
export function extractTitleFromText(text: string): string | null {
  if (!text || typeof text !== 'string') return null
  const lower = text.toLowerCase().trim()
  for (const { pattern, display } of titlePhraseMap) {
    if (pattern.test(lower)) {
      return display
    }
  }
  return null
}

/**
 * Get all available title display options
 * @returns Array of all possible title display strings
 */
export function getAllTitleOptions(): string[] {
  return titlePhraseMap.map(entry => entry.display)
}

// ========================================
// COMPOSABLE
// ========================================

/**
 * Title detection composable for Vue components
 */
export function useTitleDetection() {
  return {
    titlePatterns,
    titlePhraseMap,
    isPotentialTitle,
    extractTitleFromText,
    getAllTitleOptions
  }
}

export default useTitleDetection
