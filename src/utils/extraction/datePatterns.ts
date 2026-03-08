/**
 * Date Extraction Patterns - Single Source of Truth
 * 
 * This file contains all date patterns used across the application.
 * DO NOT duplicate these patterns elsewhere.
 */

/**
 * Comprehensive date patterns for extracting dates from text
 * Supports multiple formats:
 * - "25th December 2025" or "25 December, 2025"
 * - "December 25, 2025" or "Dec 25 2025"
 * - "25/12/2025" or "25-12-2025" or "25.12.2025"
 * - "2025-12-25" (ISO format)
 * - "25/12/25" (short year)
 * - "December 2025" (month and year only)
 * - "on 25th December" (with prefix)
 */
export const DATE_PATTERNS: RegExp[] = [
  // "25th December 2025" or "25 December, 2025"
  /(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*,?\s*(\d{4})/i,
  // "December 25, 2025" or "Dec 25 2025"
  /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s*(\d{4})/i,
  // "25/12/2025" or "25-12-2025" or "25.12.2025"
  /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
  // "2025-12-25" (ISO format)
  /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
  // "25/12/25" (short year)
  /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})(?!\d)/,
  // Just month and year: "December 2025"
  /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i,
  // "on 25th December" or "25th December" (day + month, no year)
  /(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/i,
  // "December 25th" (month + day, no year)
  /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?/i,
]

/**
 * Extract the first date match from text
 * @param text - The text to search for dates
 * @returns The matched date string or null
 */
export function extractDateFromText(text: string): string | null {
  if (!text || typeof text !== 'string') return null
  
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      return match[0]
    }
  }
  return null
}

/**
 * Check if text contains any date pattern
 * @param text - The text to check
 * @returns True if text contains a date
 */
export function hasDate(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  return DATE_PATTERNS.some(pattern => pattern.test(text))
}

/**
 * Check if a message is ONLY a date (for date-only detection)
 * @param text - The text to check
 * @returns True if text is primarily a date
 */
export function isDateOnly(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  
  const trimmed = text.trim()
  // Remove common prefixes
  const cleaned = trimmed
    .replace(/^(on|dated?|the)\s+/i, '')
    .trim()
  
  // Check if what remains is mostly a date
  for (const pattern of DATE_PATTERNS) {
    const match = cleaned.match(pattern)
    if (match && match[0].length >= cleaned.length * 0.7) {
      return true
    }
  }
  return false
}
