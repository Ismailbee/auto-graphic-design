/**
 * Composable for extracting wedding information from text
 * Handles names, dates, courtesy, and size extraction
 * 
 * NOTE: Uses shared utilities from @/utils/extraction/
 */

import { ref } from 'vue'
import { extractDateFromText as sharedExtractDate } from '@/utils/extraction/datePatterns'
import { extractCourtesyFromText as sharedExtractCourtesy } from '@/utils/extraction/courtesyPatterns'
import { 
  capitalizeWords,
  COMMON_WORDS,
  isRequestPhrase,
  SKIP_WORDS_BEFORE_AND,
  extractNamesFromBrackets as sharedExtractFromBrackets
} from '@/utils/extraction/namePatterns'

// Import canonical ExtractedInfo type
import type { ExtractedInfo } from '@/components/auto-design/sticker/types'
export type { ExtractedInfo }

export interface ExtractedNames {
  name1: string | null
  name2: string | null
}

export interface ParseResult extends ExtractedInfo {
  rawText: string
}

// Use shared utilities - COMMON_WORDS, isRequestPhrase, SKIP_WORDS_BEFORE_AND, capitalizeWords are imported above

/**
 * Extract names from text
 */
export function extractNamesFromResponse(text: string): ExtractedNames {
  // Skip request phrases
  if (isRequestPhrase(text)) {
    console.log('[extractNames] Skipping - detected request phrase:', text)
    return { name1: null, name2: null }
  }

  // Priority 0: Check for names inside brackets/parentheses
  const bracketMatch = text.match(/\(([^)]+)\)/)
  if (bracketMatch && bracketMatch[1]) {
    const bracketContent = bracketMatch[1].trim()
    const bracketAndMatch = bracketContent.match(/(.+?)\s*(?:and|&)\s*(.+)/i)
    if (bracketAndMatch) {
      return { 
        name1: capitalizeWords(bracketAndMatch[1].trim()), 
        name2: capitalizeWords(bracketAndMatch[2].trim()) 
      }
    }
    return { name1: capitalizeWords(bracketContent), name2: null }
  }

  // Pre-process: Remove date portion to avoid "Hauwa on" being captured as "Hauwa On"
  // Match patterns like "on 6th January" or "on March 7" and remove them for name extraction
  let textForNames = text
    .replace(/\s+on\s+\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s*[,.]?\s*\d{2,4})?/gi, ' ')
    .replace(/\s+on\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*[,.]?\s*\d{2,4})?/gi, ' ')
    .replace(/\s+on\s+\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/gi, ' ')
    // Also remove courtesy portion
    .replace(/courtesy\s*[:;]?\s*.+$/gi, ' ')
    .trim()
  
  console.log('[extractNames] Text after cleanup:', textForNames)

  // Pattern 1: Name and Name or Name & Name (must be capitalized or after ceremony/wedding words)
  // Updated to work even after "ceremony" keyword
  const andPattern = /\b([A-Z][a-zA-Z0-9'-]*(?:\s+[A-Z][a-zA-Z0-9'-]*)?)\s*(?:and|&|n)\s*([A-Z][a-zA-Z0-9'-]*(?:\s+[A-Z][a-zA-Z0-9'-]*)?)\b/
  const andMatch = textForNames.match(andPattern)

  if (andMatch) {
    const firstWord = andMatch[1].trim().toLowerCase()
    if (!SKIP_WORDS_BEFORE_AND.has(firstWord)) {
      console.log('[extractNames] Found with & pattern:', andMatch[1], andMatch[2])
      return { 
        name1: capitalizeWords(andMatch[1].trim()), 
        name2: capitalizeWords(andMatch[2].trim()) 
      }
    }
  }
  
  // Pattern 1b: Case-insensitive name pattern after keywords like "ceremony"
  // Note: we[ea]ding handles common "weeding" typo
  const afterKeywordPattern = /(?:ceremony|we[ea]ding|nikkah|nikah|walimah|fatiha)\s+([a-zA-Z][a-zA-Z'-]*)\s*(?:and|&|n)\s*([a-zA-Z][a-zA-Z'-]*)/i
  const afterKeywordMatch = textForNames.match(afterKeywordPattern)
  if (afterKeywordMatch) {
    const name1 = afterKeywordMatch[1].trim()
    const name2 = afterKeywordMatch[2].trim()
    if (!COMMON_WORDS.has(name1.toLowerCase()) && !COMMON_WORDS.has(name2.toLowerCase())) {
      console.log('[extractNames] Found after ceremony keyword:', name1, name2)
      return { 
        name1: capitalizeWords(name1), 
        name2: capitalizeWords(name2) 
      }
    }
  }

  // Try again without case sensitivity
  const andPatternCI = /\b([a-zA-Z][a-zA-Z0-9'-]*)\s*(?:and|&)\s*([a-zA-Z][a-zA-Z0-9'-]*)\b/i
  const andMatchCI = textForNames.match(andPatternCI)

  if (andMatchCI) {
    const name1 = andMatchCI[1].trim()
    const name2 = andMatchCI[2].trim()
    // Check both words are not common words
    if (!COMMON_WORDS.has(name1.toLowerCase()) && !COMMON_WORDS.has(name2.toLowerCase())) {
      console.log('[extractNames] Found with case-insensitive & pattern:', name1, name2)
      return { 
        name1: capitalizeWords(name1), 
        name2: capitalizeWords(name2) 
      }
    }
  }

  // Pattern 2: Two consecutive name-like words
  const twoNamesMatch = textForNames.match(/\b([a-zA-Z][a-zA-Z'-]{1,})\s+([a-zA-Z][a-zA-Z'-]{1,})\b/i)
  if (twoNamesMatch) {
    const word1 = twoNamesMatch[1].toLowerCase()
    const word2 = twoNamesMatch[2].toLowerCase()
    if (!COMMON_WORDS.has(word1) && !COMMON_WORDS.has(word2)) {
      return { 
        name1: capitalizeWords(twoNamesMatch[1]), 
        name2: capitalizeWords(twoNamesMatch[2]) 
      }
    }
  }

  // Pattern 3: Single name
  const words = textForNames.split(/\s+/)
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z'-]/g, '')
    if (cleanWord.length >= 2 && !COMMON_WORDS.has(cleanWord.toLowerCase())) {
      if (/^[a-zA-Z][a-zA-Z'-]+$/.test(cleanWord)) {
        return { name1: capitalizeWords(cleanWord), name2: null }
      }
    }
  }

  return { name1: null, name2: null }
}

/**
 * Extract date from text - uses shared utility
 */
export function extractDateFromText(text: string): string | null {
  return sharedExtractDate(text)
}

/**
 * Extract courtesy from text - uses shared utility
 */
export function extractCourtesyFromText(text: string): string | null {
  return sharedExtractCourtesy(text)
}

/**
 * Extract size from text
 */
export function extractSizeFromText(text: string): string | null {
  const sizeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)(?:\s*(?:inch|inches|in))?/i)
  if (sizeMatch) {
    const width = parseFloat(sizeMatch[1])
    const height = parseFloat(sizeMatch[2])
    return `${width}x${height} in`
  }
  return null
}

/**
 * Parse all information from a single message
 */
export function parseAllInOneMessage(text: string): ParseResult {
  return {
    names: extractNamesFromResponse(text),
    date: extractDateFromText(text),
    courtesy: extractCourtesyFromText(text),
    size: extractSizeFromText(text),
    rawText: text
  }
}

/**
 * Composable for text extraction
 */
export function useTextExtraction() {
  const extractedInfo = ref<ExtractedInfo>({
    names: { name1: null, name2: null },
    date: null,
    courtesy: null,
    size: null
  })

  function extractFromText(text: string): ParseResult {
    const result = parseAllInOneMessage(text)
    
    // Update extracted info if new data found
    if (result.names.name1 && !extractedInfo.value.names.name1) {
      extractedInfo.value.names = result.names
    }
    if (result.date && !extractedInfo.value.date) {
      extractedInfo.value.date = result.date
    }
    if (result.courtesy && !extractedInfo.value.courtesy) {
      extractedInfo.value.courtesy = result.courtesy
    }
    if (result.size && !extractedInfo.value.size) {
      extractedInfo.value.size = result.size
    }

    return result
  }

  function resetExtraction() {
    extractedInfo.value = {
      names: { name1: null, name2: null },
      date: null,
      courtesy: null,
      size: null
    }
  }

  function hasAllRequiredInfo(): boolean {
    return !!(
      extractedInfo.value.names.name1 &&
      extractedInfo.value.date &&
      extractedInfo.value.courtesy
    )
  }

  function getMissingFields(): string[] {
    const missing: string[] = []
    if (!extractedInfo.value.names.name1) missing.push('names')
    if (!extractedInfo.value.date) missing.push('date')
    if (!extractedInfo.value.courtesy) missing.push('courtesy')
    return missing
  }

  return {
    extractedInfo,
    extractFromText,
    resetExtraction,
    hasAllRequiredInfo,
    getMissingFields,
    // Export individual functions for direct use
    extractNamesFromResponse,
    extractDateFromText,
    extractCourtesyFromText,
    extractSizeFromText,
    parseAllInOneMessage
  }
}
