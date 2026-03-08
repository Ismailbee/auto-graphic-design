/**
 * Form Utilities for StickerTemplatePanel
 * Extracted for better maintainability and file size reduction
 */

// Date extraction from description text
export function extractDateFromDescription(desc: string): string | null {
  const datePatterns = [
    /(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*,?\s*\d{4})/i,
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*\d{4}/i,
    /\d{4}-\d{2}-\d{2}/,
    /\d{1,2}\/\d{1,2}\/\d{4}/
  ]
  
  for (const pattern of datePatterns) {
    const match = desc.match(pattern)
    if (match) return match[0].trim()
  }
  return null
}

// Courtesy extraction from description text
export function extractCourtesyFromDescription(desc: string): { text: string, prefix: string } | null {
  const courtesyPattern = /courtesy:\s*([^\n]+?)(?:\s*$|\.|\n)/i
  const courtesyMatch = desc.match(courtesyPattern)
  if (courtesyMatch) return { text: courtesyMatch[1].trim(), prefix: 'Courtesy:' }
  
  const cutCeePattern = /cut-cee:\s*([^\n]+?)(?:\s*$|\.|\n)/i
  const cutCeeMatch = desc.match(cutCeePattern)
  if (cutCeeMatch) return { text: cutCeeMatch[1].trim(), prefix: 'CUT-CEE:' }
  
  return null
}

// Update date and courtesy in SVG elements
export function updateDateAndCourtesyUtil(description: string, svgElements: any): void {
  const dateText = extractDateFromDescription(description)
  if (dateText && svgElements.dateText) {
    svgElements.dateText.textContent = dateText
  }

  const courtesyData = extractCourtesyFromDescription(description)
  if (courtesyData && svgElements.courtesyText) {
    svgElements.courtesyText.textContent = `${courtesyData.prefix} ${courtesyData.text}`
  }
}

// Courtesy keyword autocomplete map
export const COURTESY_KEYWORDS = [
  { trigger: 'cour', complete: 'courtesy:' },
  { trigger: 'court', complete: 'courtesy:' },
  { trigger: 'courte', complete: 'courtesy:' },
  { trigger: 'courtes', complete: 'courtesy:' },
  { trigger: 'coutesy', complete: 'courtesy:' },
  { trigger: 'coutees', complete: 'courtesy:' },
  { trigger: 'cut', complete: 'cut-cee:' },
  { trigger: 'cutcee', complete: 'cut-cee:' },
  { trigger: 'cut-cee', complete: 'cut-cee:' },
  { trigger: 'cutc', complete: 'cut-cee:' },
]

// Handle description keydown events (auto-pair parentheses and autocomplete)
export function handleDescriptionKeydownUtil(
  event: KeyboardEvent,
  formDataDescription: string,
  setDescription: (val: string) => void
): void {
  const textarea = event.target as HTMLTextAreaElement
  const cursorPos = textarea.selectionStart
  const textBeforeCursor = formDataDescription.substring(0, cursorPos)
  
  // Auto-pair parentheses
  if (event.key === '(') {
    event.preventDefault()
    const textAfterCursor = formDataDescription.substring(cursorPos)
    setDescription(textBeforeCursor + '()' + textAfterCursor)
    setTimeout(() => {
      textarea.selectionStart = cursorPos + 1
      textarea.selectionEnd = cursorPos + 1
    }, 0)
    return
  }
  
  // Auto-complete courtesy keywords
  if (event.key === ' ' || event.key === 'Tab') {
    const lastWord = textBeforeCursor.split(/\s+/).pop()?.toLowerCase() || ''
    const match = COURTESY_KEYWORDS.find(k => lastWord === k.trigger)
    
    if (match) {
      event.preventDefault()
      const wordsBeforeLast = textBeforeCursor.substring(0, textBeforeCursor.length - lastWord.length)
      const textAfterCursor = formDataDescription.substring(cursorPos)
      setDescription(wordsBeforeLast + match.complete + ' ' + textAfterCursor)
      
      setTimeout(() => {
        const newPos = wordsBeforeLast.length + match.complete.length + 1
        textarea.selectionStart = newPos
        textarea.selectionEnd = newPos
      }, 0)
    }
  }
}

// Validation warning generator
export function generateValidationWarnings(
  data: { name1?: string | null, name2?: string | null, date?: string | null, courtesy?: string | null },
  description: string
): string[] {
  const warnings: string[] = []
  
  // Only show warnings if user has started typing
  if (description.trim()) {
    if (!data.date) {
      warnings.push('You did not include the date.')
    }
    if (!data.courtesy) {
      warnings.push('You did not include the courtesy.')
    }
    if (!data.name1 && !data.name2) {
      warnings.push('You did not include the name')
    }
  }
  
  return warnings
}

// Apply custom heading to SVG elements
export function applyCustomHeadingUtil(
  svgElement: SVGElement | null,
  customHeadingValue: string | null
): void {
  if (!svgElement || !customHeadingValue) return
  
  const blessingText = svgElement.querySelector('#blessing-text')
  const occasionText = svgElement.querySelector('#occasion-text')
  const eventTypeText = svgElement.querySelector('#event-type-text')
  const ceremonyText = svgElement.querySelector('#ceremony-text')
  
  const headingElements = [blessingText, occasionText, eventTypeText, ceremonyText].filter(Boolean)
  const headingParts = customHeadingValue.split(/\s+/)

  if (headingParts.length >= 4 && blessingText && occasionText && eventTypeText && ceremonyText) {
    blessingText.textContent = headingParts[0]
    occasionText.textContent = headingParts[1].toUpperCase()
    eventTypeText.textContent = headingParts[2].toUpperCase()
    ceremonyText.textContent = headingParts.slice(3).join(' ').toUpperCase()
  } else if (headingParts.length === 3 && blessingText && occasionText && eventTypeText) {
    blessingText.textContent = headingParts[0]
    occasionText.textContent = headingParts[1].toUpperCase()
    eventTypeText.textContent = headingParts[2].toUpperCase()
    if (ceremonyText) ceremonyText.textContent = ''
  } else if (headingParts.length === 2 && blessingText && occasionText) {
    blessingText.textContent = headingParts[0]
    occasionText.textContent = headingParts[1].toUpperCase()
    if (eventTypeText) eventTypeText.textContent = ''
    if (ceremonyText) ceremonyText.textContent = ''
  } else if (headingParts.length === 1 && blessingText) {
    blessingText.textContent = headingParts[0]
    if (occasionText) occasionText.textContent = ''
    if (eventTypeText) eventTypeText.textContent = ''
    if (ceremonyText) ceremonyText.textContent = ''
  }
}

// Apply heading font to SVG elements
export function applyHeadingFontUtil(
  svgElement: SVGElement | null,
  selectedFont: 'playfair' | 'lato' | null
): void {
  if (!svgElement || !selectedFont) return
  
  const fontFamily = selectedFont === 'playfair'
    ? "'Playfair Display', Georgia, serif"
    : "'Lato', 'Helvetica Neue', Arial, sans-serif"
  
  const fontWeight = selectedFont === 'playfair' ? '700' : '400'
  
  const headingElements = [
    svgElement.querySelector('#blessing-text'),
    svgElement.querySelector('#occasion-text'),
    svgElement.querySelector('#event-type-text'),
    svgElement.querySelector('#ceremony-text')
  ].filter(Boolean) as Element[]
  
  headingElements.forEach(el => {
    (el as HTMLElement).style.fontFamily = fontFamily;
    (el as HTMLElement).style.fontWeight = fontWeight
  })
}
