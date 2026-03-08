/**
 * Courtesy Extraction Patterns - Single Source of Truth
 * 
 * This file contains all courtesy/from patterns used across the application.
 * DO NOT duplicate these patterns elsewhere.
 */

/**
 * Patterns for extracting courtesy messages from text
 */
export const COURTESY_PATTERNS: RegExp[] = [
  // Explicit courtesy patterns
  /\b(courtesy)\b\s*(?::|\-|of|is)?\s*([\w\s]+(?:family|families)?)/i,
  // "with love from" / "from the" patterns
  /((?:with love|from|by)[\s:]*(?:the\s+)?[\w\s]+(?:family|families))/i,
  // Invitation style
  /(we invite you[\s\w]+)/i,
  // "the X family" at start
  /^(the\s+[\w\s]+family)/i,
  // "family of X"
  /^(family\s+of\s+[\w\s]+)/i,
  // "from X"
  /^(from\s+[\w\s]+)/i,
  // "courtesy: X" or "c/o: X"
  /(?:courtesy|c\/o)\s*[:=]\s*(.+?)(?:\.|$)/i,
]

/**
 * Extract courtesy message from text
 * @param text - The text to search
 * @returns Object with text and prefix, or null
 */
export function extractCourtesy(text: string): { text: string; prefix: string } | null {
  if (!text || typeof text !== 'string') return null
  
  // Check for explicit "courtesy:" label first
  const courtesyMatch = text.match(/courtesy\s*[:=\-]?\s*(.+?)(?:\.|$)/i)
  if (courtesyMatch) {
    const courtesyText = courtesyMatch[1].trim()
    if (courtesyText && courtesyText.length > 2) {
      return { text: courtesyText, prefix: 'Courtesy:' }
    }
  }
  
  // Try other patterns
  for (const pattern of COURTESY_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const captured = match[2] || match[1]
      if (captured) {
        const cleaned = captured.trim()
        if (cleaned.length > 2) {
          // Determine appropriate prefix
          const lowerMatch = (match[0] || '').toLowerCase()
          let prefix = 'Courtesy:'
          if (lowerMatch.includes('with love')) {
            prefix = 'With Love,'
          } else if (lowerMatch.includes('from')) {
            prefix = 'From:'
          }
          return { text: cleaned, prefix }
        }
      }
    }
  }
  
  return null
}

/**
 * Check if text contains a courtesy message
 */
export function hasCourtesy(text: string): boolean {
  return extractCourtesy(text) !== null
}

/**
 * Check if message is ONLY a courtesy (for courtesy-only detection)
 */
export function isCourtesyOnly(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  
  const trimmed = text.trim().toLowerCase()
  
  // Check if it starts with courtesy-related words
  if (/^(courtesy|from|by|with love|c\/o)\s*[:=\-]?\s*/i.test(trimmed)) {
    return true
  }
  
  // Check if it ends with "family" or "families"
  if (/\b(family|families)\s*$/i.test(trimmed)) {
    // Make sure it's not too long (probably just a courtesy)
    if (trimmed.split(/\s+/).length <= 6) {
      return true
    }
  }
  
  return false
}

/**
 * False positive words to skip in courtesy extraction
 */
const COURTESY_FALSE_POSITIVES = new Set([
  'the', 'a', 'an', 'way', 'now', 'then', 'here', 'there',
  'me', 'you', 'us', 'them', 'him', 'her', 'it', 'this', 'that',
  'what', 'when', 'where', 'why', 'how', 'who', 'whom',
  'yes', 'no', 'ok', 'okay', 'sure', 'thanks', 'thank',
  'my', 'your', 'our', 'their', 'his', 'her', 'its'
])

/**
 * Detailed patterns for strict courtesy extraction
 */
const STRICT_COURTESY_PATTERNS: RegExp[] = [
  // Match "change the courtesy: Name"
  /(?:change|update|edit)\s+(?:the\s+)?courtesy\s*[:\s]+(?:to\s+)?(.+?)(?:\s*$|\n|!)/i,
  // Match "courtesy of Name" or "courtesy: Name"
  /courtesy\s*(?:of|:|;)\s*(.+?)(?:\s*$|\n|!)/i,
  // Match "courtesy Name"
  /courtesy\s+([a-zA-Z][a-zA-Z\s&'.-]+?)(?:\s*$|\n|!)/i,
  // Match "cut-cee: Name"
  /cut-cee\s*[:\s]+(.+?)(?:\s*$|\n|!)/i,
  // Match "from the [Name] Family"
  /from\s+the\s+([A-Za-z][A-Za-z\s&'.-]+\s+(?:family|families))(?:\s*$|\n|,|\.(?!\w)|!)/i,
  // Match "from [Name] Family"
  /from\s+([A-Za-z][A-Za-z\s&'.-]+\s+(?:family|families))(?:\s*$|\n|,|\.(?!\w)|!)/i,
  // Match "gift from Name"
  /(?:gift|sticker|card)\s+from\s+([A-Za-z][A-Za-z\s&'.-]+?)(?:\s*$|\n|,|\.(?!\w)|!)/i,
]

/**
 * Extract courtesy from text (STRICT mode) - Single source of truth
 * Only matches when explicit courtesy keywords are present
 * 
 * @param text - Text to extract from
 * @returns Formatted courtesy string like "courtesy: Name" or null
 */
export function extractCourtesyFromText(text: string): string | null {
  if (!text || typeof text !== 'string') return null
  
  // Skip if this looks like a heading/title input
  const isHeadingInput = /\b(heading|title|header|congratulations|happy|wedding|best wishes|wishing you)\b/i.test(text)
  if (isHeadingInput && !/\b(courtesy|cut-cee|from the .+ family|from .+ family)\b/i.test(text)) {
    return null
  }
  
  // STRICT: Only match if the message explicitly indicates courtesy/sender info
  const hasCourtesyKeyword = /\b(courtesy|cut-cee)\b/i.test(text) || 
                            /\bfrom\s+(the\s+)?[a-zA-Z][a-zA-Z]*\s+(family|families)\b/i.test(text) ||
                            /\b(change|update|edit)\s+(the\s+)?courtesy/i.test(text)

  if (!hasCourtesyKeyword) {
    return null
  }

  for (const pattern of STRICT_COURTESY_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]) {
      let name = match[1].trim().replace(/[.,!?:;]+$/, '').trim()
      
      if (name.length < 3) continue
      if (COURTESY_FALSE_POSITIVES.has(name.toLowerCase())) continue
      
      // Remove bad prefixes
      name = name.replace(/^(the|a|an|my|your|our|their)\s+/i, '').trim()
      name = name.replace(/["']+$/, '').trim()
      if (name.length < 3) continue

      return `courtesy: ${name}`
    }
  }
  return null
}
