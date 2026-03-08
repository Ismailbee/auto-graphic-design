/**
 * Name Extraction Patterns - Single Source of Truth
 * 
 * This file contains all name patterns used across the application.
 * DO NOT duplicate these patterns elsewhere.
 */

/**
 * Pattern to extract names from brackets: (Name1 & Name2) or [Name1 and Name2]
 */
export const BRACKET_PATTERN = /[\[(]([^\])\)]+)[\])]/

/**
 * Patterns for extracting couple names from text
 */
export const NAME_PATTERNS: RegExp[] = [
  // Bracketed couples: (A & B) or [A and B]
  BRACKET_PATTERN,
  // Explicit label: "names: A & B", "couple's names are A and B"
  /\b(?:names?|couple(?:'s)?\s+names?)\s*(?:are|is|:)\s*([^\n]+)$/i,
  // Bride/Groom labels
  /\bbride\s*[:\-]\s*([^,\n]+)\s*(?:,|\s)\s*groom\s*[:\-]\s*([^\n]+)$/i,
  /\bgroom\s*[:\-]\s*([^,\n]+)\s*(?:,|\s)\s*bride\s*[:\-]\s*([^\n]+)$/i,
  // Fallback: "A & B" / "A and B" / "A with B"
  /\b([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)?)\s*(?:&|and|with)\s*([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)?)\b/,
  // "wedding of A & B"
  /(?:ceremony|wedding|marriage)\s+(?:of\s+)?([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)?)\s*(?:&|and|with)\s*([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+)?)\b/i,
]

/**
 * Stop words that should not be considered as names
 */
export const NAME_STOP_WORDS = new Set([
  'wedding',
  'ceremony',
  'marriage',
  'anniversary',
  'family',
  'sticker',
  'stiker',
  'congratulations',
  'congratulation',
  'alhamdulillah',
  'mashaallah',
  'mashallah',
  'barakallah',
  'the',
  'and',
  'with',
  'from',
  'courtesy',
  'on',
  'of',
])

/**
 * Extended list of common words that should NOT be extracted as names
 */
export const COMMON_WORDS = new Set([
  // Basic English words
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'had', 'has', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'get', 'him', 'let', 'put', 'say', 'she', 'too', 'use', 'from', 'with', 'this', 'that', 'have', 'will', 'your', 'make', 'like', 'just', 'over', 'such', 'into', 'year', 'also', 'back', 'been', 'come', 'could', 'what', 'when', 'more', 'some', 'than', 'them', 'then', 'these', 'would', 'about', 'after', 'first', 'other', 'their', 'there', 'which',
  // Short common words
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
])

/**
 * Request phrase patterns that should skip name extraction
 */
export const REQUEST_PHRASE_PATTERNS: RegExp[] = [
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
  /^i\s+want\s+(?:a\s+)?(?:\w+)\s+(?:color|colour|design|style|theme|background)/i,
  /^i\s+(?:want|need|like|prefer)\s+(?:a\s+)?(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\b/i,
  /\b(?:purple|red|blue|green|yellow|pink|orange|black|white|gold|silver|brown|gray|grey)\s+(?:color|colour|design|style|theme|background)/i
]

/**
 * Words to skip before "and"/"&" in name extraction
 */
export const SKIP_WORDS_BEFORE_AND = new Set([
  'is', 'are', 'the', 'couple', 'name', 'names', 'my', 'our', 'their', 'for', 'of', 'to', 'from', 'with'
])

/**
 * Check if text is a request phrase (should skip name extraction)
 */
export function isRequestPhrase(text: string): boolean {
  return REQUEST_PHRASE_PATTERNS.some(pattern => pattern.test(text.trim()))
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  if (!str) return ''
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Normalize a name candidate by cleaning up punctuation and invalid parts
 */
export function normalizeNameCandidate(value: string): string | null {
  let name = (value || '').trim()
  if (!name) return null

  // Strip surrounding punctuation/quotes
  name = name.replace(/^[\s"'""''.,:;\-]+/, '').replace(/[\s"'""''.,:;\-]+$/, '').trim()

  // Remove common leading labels/verbs
  name = name
    .replace(/^(?:names?|couple(?:'s)?\s+names?|bride|groom)\s*[:\-]\s*/i, '')
    .replace(/^(?:is|are|was|were)\s+/i, '')
    .replace(/^(?:the\s+)?(?:wedding|ceremony|marriage)\s+/i, '')
    .trim()

  // If we accidentally captured a dangling "on", remove it
  name = name.replace(/\s+on\s*$/i, '').trim()

  // If a date phrase was included, trim it off
  const onDateIdx = name.search(/\s+on\s+(?:\d{1,2}|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i)
  if (onDateIdx >= 0) {
    name = name.slice(0, onDateIdx).trim()
  }

  // Collapse whitespace
  name = name.replace(/\s+/g, ' ').trim()
  if (!name) return null

  // Reject obvious non-names
  const lower = name.toLowerCase()
  if (NAME_STOP_WORDS.has(lower)) return null

  // Keep reasonably short single-token names too (e.g., Fatiha)
  if (name.length < 2) return null
  
  return capitalizeWords(name)
}

/**
 * Extract names from bracketed text like (John & Sarah)
 */
export function extractNamesFromBrackets(text: string): { name1: string | null; name2: string | null } {
  if (!text || typeof text !== 'string') {
    return { name1: null, name2: null }
  }
  
  const bracketMatch = text.match(BRACKET_PATTERN)
  if (!bracketMatch) {
    return { name1: null, name2: null }
  }
  
  const inner = bracketMatch[1].trim()
  
  // Split by & or "and"
  const separatorMatch = inner.match(/(.+?)\s*(?:&|and)\s*(.+)/i)
  if (separatorMatch) {
    const name1 = normalizeNameCandidate(separatorMatch[1])
    const name2 = normalizeNameCandidate(separatorMatch[2])
    return { name1, name2 }
  }
  
  // Single name in brackets
  const singleName = normalizeNameCandidate(inner)
  return { name1: singleName, name2: null }
}

/**
 * Extract couple names from any text format
 */
export function extractNames(text: string): { name1: string | null; name2: string | null } {
  if (!text || typeof text !== 'string') {
    return { name1: null, name2: null }
  }
  
  // Try bracketed names first (most reliable)
  const bracketResult = extractNamesFromBrackets(text)
  if (bracketResult.name1) {
    return bracketResult
  }
  
  // Try other patterns
  for (const pattern of NAME_PATTERNS) {
    if (pattern === BRACKET_PATTERN) continue // Already tried
    
    const match = text.match(pattern)
    if (match) {
      if (match[2]) {
        // Two capture groups (name1 & name2)
        const name1 = normalizeNameCandidate(match[1])
        const name2 = normalizeNameCandidate(match[2])
        if (name1 || name2) {
          return { name1, name2 }
        }
      } else if (match[1]) {
        // Single capture group - might contain both names
        const inner = match[1].trim()
        const separatorMatch = inner.match(/(.+?)\s*(?:&|and)\s*(.+)/i)
        if (separatorMatch) {
          const name1 = normalizeNameCandidate(separatorMatch[1])
          const name2 = normalizeNameCandidate(separatorMatch[2])
          return { name1, name2 }
        }
        // Single name
        const name1 = normalizeNameCandidate(inner)
        return { name1, name2: null }
      }
    }
  }
  
  return { name1: null, name2: null }
}

/**
 * Check if text contains names
 */
export function hasNames(text: string): boolean {
  const { name1, name2 } = extractNames(text)
  return !!(name1 || name2)
}
