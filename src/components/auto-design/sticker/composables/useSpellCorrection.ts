/**
 * Spell Correction Composable
 * 
 * Provides fuzzy spell correction using Levenshtein distance algorithm.
 * Includes an extended dictionary of common misspellings for wedding-related
 * and Islamic/religious terms.
 * 
 * Features:
 * - Levenshtein distance calculation for fuzzy matching
 * - Extended misspelling dictionary with 100+ entries
 * - Case-preserving corrections
 * - Configurable similarity threshold
 */

// Type definitions
export interface SpellCorrectionResult {
  corrected: string
  suggestions: string[]
  hasCorrections: boolean
}

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits needed to transform str1 into str2
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  
  // Create a matrix
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  
  // Fill in the rest
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        )
      }
    }
  }
  
  return dp[m][n]
}

/**
 * Extended dictionary for fuzzy matching
 * Maps common misspellings to their correct forms
 */
export const COMMON_MISSPELLINGS: Record<string, string> = {
  // Islamic/Religious terms
  'alhadullia': 'Alhamdulillah',
  'alhamdulila': 'Alhamdulillah',
  'alhamdullilah': 'Alhamdulillah',
  'alhamdulilah': 'Alhamdulillah',
  'alhamduillah': 'Alhamdulillah',
  'alhamdulliah': 'Alhamdulillah',
  'alhamduliah': 'Alhamdulillah',
  'mashallah': 'Masha Allah',
  'mashaallah': 'Masha Allah',
  'inshallah': 'Insha Allah',
  'inshaallah': 'Insha Allah',
  
  // Courtesy variations
  'courtesay': 'courtesy',
  'courtsey': 'courtesy',
  'courtesey': 'courtesy',
  'curtesy': 'courtesy',
  'cortesy': 'courtesy',
  'courtisy': 'courtesy',
  
  // Wedding related
  'weding': 'wedding',
  'weddin': 'wedding',
  'weddng': 'wedding',
  'weeding': 'wedding',
  'mariage': 'marriage',
  'marrage': 'marriage',
  'marriag': 'marriage',
  'marraige': 'marriage',
  'anniversery': 'anniversary',
  'aniversary': 'anniversary',
  'anniversay': 'anniversary',
  'aniversery': 'anniversary',
  'anniverary': 'anniversary',
  
  // Congratulations variations
  'congradulations': 'congratulations',
  'congatulations': 'congratulations',
  'congrats': 'congratulations',
  'congratualations': 'congratulations',
  'congraulatons': 'congratulations',
  'congradulation': 'congratulations',
  'congrads': 'congratulations',
  
  // Names/Titles
  'fiance': 'fiancé',
  'fiancee': 'fiancée',
  'fianc': 'fiancé',
  
  // Event terms
  'recpetion': 'reception',
  'recepton': 'reception',
  'recption': 'reception',
  'receptions': 'reception',
  'cereomny': 'ceremony',
  'cermony': 'ceremony',
  'ceremoney': 'ceremony',
  'ceremmony': 'ceremony',
  'cerimony': 'ceremony',
  
  // Common words
  'beautifull': 'beautiful',
  'beautful': 'beautiful',
  'beutiful': 'beautiful',
  'happyness': 'happiness',
  'hapiness': 'happiness',
  'occassion': 'occasion',
  'ocasion': 'occasion',
  'occation': 'occasion',
  'celabration': 'celebration',
  'celebraton': 'celebration',
  'celebraion': 'celebration',
  'blessings': 'blessings',
  'blesings': 'blessings',
  'blssings': 'blessings',
  'togather': 'together',
  'togehter': 'together',
  'togeter': 'together',
  'speciall': 'special',
  'specail': 'special',
  'speical': 'special',
  'wonderfull': 'wonderful',
  'wonderfule': 'wonderful',
  'wonerful': 'wonderful',
  
  // Family terms
  'familly': 'family',
  'famaly': 'family',
  'famliy': 'family',
  
  // Date/Time related
  'januray': 'January',
  'janurary': 'January',
  'febuary': 'February',
  'feburary': 'February',
  'febrary': 'February',
  'wendsday': 'Wednesday',
  'wensday': 'Wednesday',
  'wedensday': 'Wednesday',
  'saturday': 'Saturday',
  'saterday': 'Saturday',
  'satuday': 'Saturday',
  
  // Action words
  'plese': 'please',
  'pleasse': 'please',
  'pls': 'please',
  'thankyou': 'thank you',
  'thnks': 'thanks',
  'thanx': 'thanks'
}

// Dictionary words for fuzzy matching (unique correct spellings)
const DICTIONARY_WORDS = Object.values(COMMON_MISSPELLINGS).filter((v, i, a) => a.indexOf(v) === i)

// Words to skip during correction (common English words)
const SKIP_WORDS = [
  'and', 'the', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 
  'was', 'one', 'our', 'out', 'day', 'had', 'has', 'his', 'how', 'its', 
  'may', 'new', 'now', 'old', 'see', 'way', 'who', 'boy', 'did', 'get', 
  'him', 'let', 'put', 'say', 'she', 'too', 'use'
]

/**
 * Find best fuzzy match for a word
 * @param word - Word to find a match for
 * @param threshold - Maximum allowed difference ratio (0-1, default 0.3 = 30%)
 * @returns Corrected word or null if no good match found
 */
export function findFuzzyMatch(word: string, threshold: number = 0.3): string | null {
  const lowerWord = word.toLowerCase()
  
  // First check exact match in misspellings dictionary
  if (COMMON_MISSPELLINGS[lowerWord]) {
    return COMMON_MISSPELLINGS[lowerWord]
  }
  
  // Skip if word is too short (less than 4 chars) to avoid false positives
  if (lowerWord.length < 4) return null
  
  // Skip if word is a common English word that shouldn't be corrected
  if (SKIP_WORDS.includes(lowerWord)) return null
  
  let bestMatch: string | null = null
  let bestDistance = Infinity
  
  // Check against all dictionary words
  for (const dictWord of DICTIONARY_WORDS) {
    const distance = levenshteinDistance(lowerWord, dictWord.toLowerCase())
    const maxLength = Math.max(lowerWord.length, dictWord.length)
    const similarity = 1 - (distance / maxLength)
    
    // Only consider if similarity is above threshold
    if (similarity >= (1 - threshold) && distance < bestDistance) {
      bestDistance = distance
      bestMatch = dictWord
    }
  }
  
  // Also check against all misspelling keys
  for (const [misspelled, correct] of Object.entries(COMMON_MISSPELLINGS)) {
    const distance = levenshteinDistance(lowerWord, misspelled)
    const maxLength = Math.max(lowerWord.length, misspelled.length)
    const similarity = 1 - (distance / maxLength)
    
    if (similarity >= (1 - threshold) && distance < bestDistance) {
      bestDistance = distance
      bestMatch = correct
    }
  }
  
  return bestMatch
}

/**
 * Correct common misspellings in text with fuzzy matching
 * @param text - Input text to correct
 * @param fuzzyThreshold - Threshold for fuzzy matching (default 0.25 = 25%)
 * @returns Object containing corrected text and list of suggestions made
 */
export function correctSpelling(text: string, fuzzyThreshold: number = 0.25): SpellCorrectionResult {
  let corrected = text
  const suggestions: string[] = []

  // Split into words while preserving punctuation positions
  const wordPattern = /\b([a-zA-Z]+)\b/g
  let match

  while ((match = wordPattern.exec(text)) !== null) {
    const word = match[1]
    const cleanWord = word.toLowerCase()
    
    // First try exact match
    if (COMMON_MISSPELLINGS[cleanWord]) {
      const correctWord = COMMON_MISSPELLINGS[cleanWord]
      // Preserve original case if word was capitalized
      const replacement = word[0] === word[0].toUpperCase() 
        ? correctWord.charAt(0).toUpperCase() + correctWord.slice(1)
        : correctWord
      corrected = corrected.replace(new RegExp(`\\b${word}\\b`, 'g'), replacement)
      suggestions.push(`"${word}" → "${replacement}"`)
    } else {
      // Try fuzzy matching
      const fuzzyMatch = findFuzzyMatch(word, fuzzyThreshold)
      if (fuzzyMatch && fuzzyMatch.toLowerCase() !== cleanWord) {
        // Preserve original case
        const replacement = word[0] === word[0].toUpperCase()
          ? fuzzyMatch.charAt(0).toUpperCase() + fuzzyMatch.slice(1)
          : fuzzyMatch.toLowerCase()
        corrected = corrected.replace(new RegExp(`\\b${word}\\b`, 'g'), replacement)
        suggestions.push(`"${word}" → "${replacement}" (fuzzy)`)
      }
    }
  }

  return { 
    corrected, 
    suggestions,
    hasCorrections: suggestions.length > 0
  }
}

/**
 * Composable function for spell correction
 * Returns utility functions for spell checking and correction
 */
export function useSpellCorrection() {
  return {
    correctSpelling,
    findFuzzyMatch,
    levenshteinDistance,
    COMMON_MISSPELLINGS,
  }
}
