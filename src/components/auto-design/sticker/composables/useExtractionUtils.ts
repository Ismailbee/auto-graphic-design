/**
 * useExtractionUtils - Extraction utilities for wedding sticker panel
 * 
 * Extracts names, dates, courtesy messages, and sizes from user input text
 * 
 * NOTE: Date and courtesy extraction now use shared utilities
 */

import { extractDateFromText as sharedExtractDate } from '@/utils/extraction/datePatterns'
import { extractCourtesyFromText as sharedExtractCourtesy } from '@/utils/extraction/courtesyPatterns'

// Helper function to capitalize first letter of each word and strip trailing numbers (typos)
export function capitalizeWords(str: string): string {
  return str.split(' ')
    .map(word => {
      // Remove trailing numbers from each word (handles typos like "Yahaya4" -> "Yahaya")
      const cleanWord = word.replace(/\d+$/, '')
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase()
    })
    .join(' ')
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Common words to skip during name extraction
const COMMON_WORDS = [
  // Basic English words - including 'on' to prevent extraction
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'had', 'has', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'get', 'him', 'let', 'put', 'say', 'she', 'too', 'use', 'from', 'with', 'this', 'that', 'have', 'will', 'your', 'make', 'like', 'just', 'over', 'such', 'into', 'year', 'also', 'back', 'been', 'come', 'could', 'what', 'when', 'more', 'some', 'than', 'them', 'then', 'these', 'would', 'about', 'after', 'could', 'first', 'other', 'their', 'there', 'which', 'would',
  // Short common words - INCLUDING 'on'
  'to', 'a', 'i', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'if', 'in', 'me', 'of', 'on', 'or', 'so', 'up', 'us', 'we',
  // Wedding/sticker context words
  'wedding', 'sticker', 'stiker', 'design', 'designs', 'please', 'courtesy', 'family', 'picture', 'image', 'photo', 'template', 'templates',
  // Colors
  'purple', 'red', 'blue', 'green', 'yellow', 'pink', 'orange', 'black', 'white', 'gold', 'silver', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'violet', 'indigo', 'teal', 'maroon', 'navy', 'beige', 'cream', 'coral', 'lavender', 'turquoise', 'burgundy', 'rose', 'peach', 'mint', 'olive', 'tan', 'ivory', 'aqua', 'lime', 'crimson', 'scarlet', 'amber', 'bronze', 'copper', 'ruby', 'emerald', 'sapphire', 'pearl', 'platinum', 'champagne', 'wine', 'plum', 'mauve', 'lilac', 'fuchsia', 'chartreuse', 'salmon', 'rust',
  // Design/style words
  'color', 'colour', 'style', 'theme', 'background', 'font', 'size', 'shape', 'border', 'frame', 'layout', 'format', 'look', 'fancy', 'elegant', 'simple', 'modern', 'classic', 'traditional', 'beautiful', 'nice', 'pretty', 'cool', 'awesome', 'great', 'best', 'perfect', 'amazing',
  // Greeting/conversation words
  'hi', 'hello', 'hey', 'my', 'is', 'information', 'info', 'details', 'here', 'name', 'names', 'date', 'it', 'yes', 'no', 'ok', 'okay', 'sure', 'thanks', 'thank', 'good', 'morning', 'afternoon', 'evening', 'night',
  // Request verbs
  'want', 'need', 'create', 'looking', 'help', 'assist', 'give', 'show', 'wanted', 'wanting', 'needs', 'needed', 'needing', 'love', 'doing', 'making', 'getting', 'having', 'using', 'going', 'coming', 'thinking', 'try', 'trying', 'start', 'starting', 'work', 'working',
  // Change/update verbs
  'change', 'changed', 'changing', 'update', 'updated', 'updating', 'edit', 'edited', 'editing', 'modify', 'modified', 'modifying', 'replace', 'replaced', 'replacing', 'set', 'setting', 'alter', 'altered', 'altering', 'correct', 'corrected', 'correcting', 'fix', 'fixed', 'fixing', 'switch', 'switched', 'switching', 'different', 'another'
]

// Words to skip before "and" in name patterns
const SKIP_WORDS_BEFORE_AND = ['is', 'are', 'the', 'couple', 'name', 'names', 'my', 'our', 'their', 'for', 'of', 'to', 'from', 'with', 'ceremony', 'wedding', 'congratulation', 'congratulations', 'on', 'your', 'alhamdulillahi', 'beautiful', 'save']

/**
 * Enhanced Name Extraction Function - CASE INSENSITIVE
 * Extracts names from text, handling various formats like:
 * - "John & Sarah"
 * - "(Muhammad & Hauwa)"
 * - "congratulations to John and Sarah"
 */
export function extractNamesFromResponse(text: string): { name1: string | null; name2: string | null } {
  // FIRST: Check if this is just a request phrase - don't extract names from it
  const requestPhrasePatterns = [
    /^i\s+want\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
    /^i\s+need\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
    /^i\s+would\s+like\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
    /^i\s+(?:want|need|would\s+like)\s+(?:to\s+)?(?:create|make|design|get)/i,
    /^(?:create|make|design|get)\s+(?:a\s+)?(?:wedding\s+)?(?:sticker|stiker|design)/i,
    /^(?:can|could)\s+(?:you|i)\s+(?:help|make|create|design|get)/i,
    /^please\s+(?:help|make|create|design|get)/i,
    /^help\s+(?:me\s+)?(?:make|create|design|get)/i,
    /^i\s+want\s+(?:a\s+)?(?:stiker|sticker)\s+design/i,
    /(?:sticker|stiker)\s+design/i,
    // Color/style requests - DON'T extract names from these
    /^i\s+want\s+(?:a\s+)?(?:\w+)\s+(?:color|colour|design|style|theme|background)/i,
    /^i\s+(?:want|need|like|prefer)\s+(?:a\s+)?(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\b/i,
    /\b(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\s+(?:color|colour|design|style|theme|background)/i
  ]
  
  for (const pattern of requestPhrasePatterns) {
    if (pattern.test(text.trim())) {
      console.log('[extractNamesFromResponse] Skipping - detected request phrase:', text)
      return { name1: null, name2: null }
    }
  }

  // PRE-PROCESS: Remove date portion to avoid "Hauwa on" being captured as "Hauwa On"
  let textForNames = text
    .replace(/\s+on\s+\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)(?:\s*[,.]?\s*\d{2,4})?/gi, ' ')
    .replace(/\s+on\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*[,.]?\s*\d{2,4})?/gi, ' ')
    .replace(/\s+on\s+\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/gi, ' ')
    .trim()

  // Priority 0: Check for names inside brackets/parentheses first
  const bracketPattern = /\(([^)]+)\)/
  const bracketMatch = textForNames.match(bracketPattern)

  if (bracketMatch && bracketMatch[1]) {
    const bracketContent = bracketMatch[1].trim()
    const bracketAndPattern = /(.+?)\s*(?:and|&)\s*(.+)/i
    const bracketAndMatch = bracketContent.match(bracketAndPattern)

    if (bracketAndMatch) {
      return { 
        name1: capitalizeWords(bracketAndMatch[1].trim()), 
        name2: capitalizeWords(bracketAndMatch[2].trim()) 
      }
    }
    return { name1: capitalizeWords(bracketContent), name2: null }
  }

  // Special case: "Aishatu & Amina Muhammad" (shared surname at the end)
  const sharedSurnameAmpersandPattern = /\b([a-zA-Z][a-zA-Z'-]+)\s*&\s*([a-zA-Z][a-zA-Z'-]+)\s+([a-zA-Z][a-zA-Z'-]+)\b/i
  const sharedSurnameAmpersandMatch = textForNames.match(sharedSurnameAmpersandPattern)
  if (sharedSurnameAmpersandMatch) {
    const first = sharedSurnameAmpersandMatch[1].trim()
    const second = sharedSurnameAmpersandMatch[2].trim()
    const surname = sharedSurnameAmpersandMatch[3].trim()
    if (
      !SKIP_WORDS_BEFORE_AND.includes(first.toLowerCase()) &&
      !SKIP_WORDS_BEFORE_AND.includes(second.toLowerCase()) &&
      !SKIP_WORDS_BEFORE_AND.includes(surname.toLowerCase())
    ) {
      console.log('[extractNamesFromResponse] Found names via & with shared surname:', first, second, surname)
      return {
        name1: capitalizeWords(`${first} ${surname}`),
        name2: capitalizeWords(`${second} ${surname}`)
      }
    }
  }

  const sharedSurnameAndPattern = /\b([a-zA-Z][a-zA-Z'-]+)\s+(?:and|n)\s+([a-zA-Z][a-zA-Z'-]+)\s+([a-zA-Z][a-zA-Z'-]+)\b/i
  const sharedSurnameAndMatch = textForNames.match(sharedSurnameAndPattern)
  if (sharedSurnameAndMatch) {
    const first = sharedSurnameAndMatch[1].trim()
    const second = sharedSurnameAndMatch[2].trim()
    const surname = sharedSurnameAndMatch[3].trim()
    if (
      !SKIP_WORDS_BEFORE_AND.includes(first.toLowerCase()) &&
      !SKIP_WORDS_BEFORE_AND.includes(second.toLowerCase()) &&
      !SKIP_WORDS_BEFORE_AND.includes(surname.toLowerCase())
    ) {
      console.log('[extractNamesFromResponse] Found names via and with shared surname:', first, second, surname)
      return {
        name1: capitalizeWords(`${first} ${surname}`),
        name2: capitalizeWords(`${second} ${surname}`)
      }
    }
  }
  
  // Try & pattern first (most explicit)
  const ampersandPattern = /\b([a-zA-Z][a-zA-Z'-]+)\s*&\s*([a-zA-Z][a-zA-Z'-]+)\b/i
  const ampersandMatch = textForNames.match(ampersandPattern)
  if (ampersandMatch) {
    const name1 = ampersandMatch[1].trim()
    const name2 = ampersandMatch[2].trim()
    if (!SKIP_WORDS_BEFORE_AND.includes(name1.toLowerCase()) && !SKIP_WORDS_BEFORE_AND.includes(name2.toLowerCase())) {
      console.log('[extractNamesFromResponse] Found names via &:', name1, name2)
      return { 
        name1: capitalizeWords(name1), 
        name2: capitalizeWords(name2) 
      }
    }
  }
  
  // Then try 'and' pattern
  const andPattern = /\b([a-zA-Z][a-zA-Z0-9'-]*(?:\s+[a-zA-Z][a-zA-Z0-9'-]*)?)\s+(?:and|n)\s+([a-zA-Z][a-zA-Z0-9'-]*(?:\s+[a-zA-Z][a-zA-Z0-9'-]*)?)\b/i
  const andMatch = textForNames.match(andPattern)

  if (andMatch) {
    const firstWord = andMatch[1].trim().toLowerCase()
    if (!SKIP_WORDS_BEFORE_AND.includes(firstWord)) {
      return { 
        name1: capitalizeWords(andMatch[1].trim()), 
        name2: capitalizeWords(andMatch[2].trim()) 
      }
    }
    const cleanedText = textForNames.replace(new RegExp(`\\b${andMatch[1]}\\s+(?:and|&|n)\\s+`, 'i'), '')
    const secondTry = cleanedText.match(/\b([a-zA-Z][a-zA-Z'-]+)\s*(?:and|&|n)\s*([a-zA-Z][a-zA-Z'-]+)\b/i)
    if (secondTry) {
      return {
        name1: capitalizeWords(secondTry[1].trim()),
        name2: capitalizeWords(secondTry[2].trim())
      }
    }
  }

  // Pattern 2: Two consecutive words that look like names
  const twoNamesPattern = /\b([a-zA-Z][a-zA-Z'-]{1,})\s+([a-zA-Z][a-zA-Z'-]{1,})\b/i
  const twoNamesMatch = textForNames.match(twoNamesPattern)
  
  if (twoNamesMatch) {
    const word1 = twoNamesMatch[1].toLowerCase()
    const word2 = twoNamesMatch[2].toLowerCase()
    
    if (!COMMON_WORDS.includes(word1) && !COMMON_WORDS.includes(word2)) {
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
    if (cleanWord.length >= 2 && !COMMON_WORDS.includes(cleanWord.toLowerCase())) {
      if (/^[a-zA-Z][a-zA-Z'-]+$/.test(cleanWord)) {
        return { name1: capitalizeWords(cleanWord), name2: null }
      }
    }
  }

  return { name1: null, name2: null }
}

/**
 * Extract date from text - uses shared utility
 * Supports formats like:
 * - "6th March, 2023"
 * - "March 6, 2023"
 * - "12/25/2023"
 */
export function extractDateFromText(text: string): string | null {
  console.log('📅 extractDateFromText input:', text)
  const result = sharedExtractDate(text)
  console.log('📅 Date extraction result:', result)
  return result
}

/**
 * Extract courtesy from text - uses shared utility
 * STRICT MODE: Only matches very explicit courtesy patterns
 */
export function extractCourtesyFromText(text: string): string | null {
  console.log('🎁 extractCourtesyFromText input:', text)
  const result = sharedExtractCourtesy(text)
  console.log('🎁 Courtesy extraction result:', result)
  return result
}

/**
 * Extract size from text (e.g., "3x3 inches")
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
 * Extract names from text inside brackets ()
 */
export function extractNamesFromBrackets(text: string): string | null {
  const bracketPattern = /\(([^)]+)\)/
  const match = text.match(bracketPattern)

  if (match && match[1]) {
    const bracketContent = match[1].trim()
    if (bracketContent.includes('&') || bracketContent.toLowerCase().includes(' and ')) {
      return bracketContent
    }
    if (/^[A-Za-z\s]+$/.test(bracketContent)) {
      return bracketContent
    }
  }

  return null
}

/**
 * Parse all-in-one message to extract names, date, and courtesy
 */
export function parseAllInOneMessage(text: string): {
  names: { name1: string | null; name2: string | null };
  date: string | null;
  courtesy: string | null;
} {
  console.log('📋 parseAllInOneMessage input:', text)
  
  const bracketNames = extractNamesFromBrackets(text)
  let names = { name1: null as string | null, name2: null as string | null }

  if (bracketNames) {
    const andPattern = /(.+?)\s*(?:and|&)\s*(.+)/i
    const andMatch = bracketNames.match(andPattern)
    if (andMatch) {
      names.name1 = andMatch[1].trim()
      names.name2 = andMatch[2].trim()
    } else {
      names.name1 = bracketNames
    }
    console.log('📋 Names from brackets:', names)
  } else {
    names = extractNamesFromResponse(text)
    console.log('📋 Names from response:', names)
  }

  const date = extractDateFromText(text)
  console.log('📋 Date extracted:', date)
  
  const courtesy = extractCourtesyFromText(text)
  console.log('📋 Courtesy extracted:', courtesy)

  console.log('📋 parseAllInOneMessage result:', { names, date, courtesy })
  return { names, date, courtesy }
}

/**
 * Composable hook for extraction utilities
 */
export function useExtractionUtils() {
  return {
    capitalizeWords,
    escapeRegExp,
    extractNamesFromResponse,
    extractDateFromText,
    extractCourtesyFromText,
    extractSizeFromText,
    extractNamesFromBrackets,
    parseAllInOneMessage,
    COMMON_WORDS,
    SKIP_WORDS_BEFORE_AND
  }
}
