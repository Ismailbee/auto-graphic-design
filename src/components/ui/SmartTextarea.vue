<template>
  <div class="smart-textarea-wrapper">
    <textarea
      ref="textareaRef"
      :value="modelValue"
      @input="handleInput"
      @keydown="handleKeydown"
      @click="updateCursorPosition"
      @blur="handleBlur"
      class="smart-textarea"
      v-bind="$attrs"
    ></textarea>

    <!-- Suggestions Dropdown -->
    <ul
      v-if="showSuggestions && suggestions.length > 0"
      class="suggestions-dropdown"
      :style="dropdownStyle"
    >
      <li
        v-for="(suggestion, index) in suggestions"
        :key="suggestion"
        :class="{ 'suggestion-item': true, 'active': index === activeSuggestionIndex }"
        @mousedown.prevent="applySuggestion(suggestion)"
        @mouseenter="activeSuggestionIndex = index"
      >
        <span class="suggestion-text">{{ suggestion }}</span>
        <span class="suggestion-hint">Press Enter</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'input', event: Event): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

// --- Dictionary Configuration ---
// Key: Correct Word
// Value: Array of common misspellings
const dictionary: Record<string, string[]> = {
  "courtesy": ["couresy", "courresy", "coursty", "coresty", "coutesy", "curtesy"],
  "congratulation": ["congratulaion", "congratolation", "congraulation", "congratulatoin", "congratsion", "congradulation", "congradulations"],
  "Alhamdulillahi": ["alhamdulilahi", "alhamdulilah", "alhamdullilahi", "alhamudlillahi", "alhamdullahi", "alhamdulillah"],
  "wedding": ["weding", "weddng", "weedding"],
  "ceremony": ["cermony", "ceromony", "cerimony"],
  "family": ["famly", "fmily"],
  "marriage": ["marrage", "marraige", "mariagge"],
  "invitation": ["invitaion", "invtation"],
  "celebration": ["celbration", "celeration"],
  "couple": ["cople", "coupl"],
  "reception": ["recetion", "recepton"],
  "venue": ["venu"],
  "date": ["dte", "dat"]
}

// Flattened map for O(1) lookup of misspellings -> correct word
const correctionMap = new Map<string, string>()
Object.entries(dictionary).forEach(([correct, wrongs]) => {
  wrongs.forEach(wrong => correctionMap.set(wrong.toLowerCase(), correct))
})

// List of correct words for auto-suggestion
const correctWords = Object.keys(dictionary)

// --- State ---
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const showSuggestions = ref(false)
const suggestions = ref<string[]>([])
const activeSuggestionIndex = ref(0)
const cursorPosition = ref(0)
const currentWordRange = ref<{ start: number, end: number } | null>(null)

// Dropdown positioning
const dropdownTop = ref(0)
const dropdownLeft = ref(0)

const dropdownStyle = computed(() => ({
  top: `${dropdownTop.value}px`,
  left: `${dropdownLeft.value}px`
}))

// --- Event Handlers ---

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  const newValue = target.value
  
  emit('update:modelValue', newValue)
  emit('input', event)
  
  updateCursorPosition()
  checkAutoCorrect(newValue)
  triggerSuggestions(newValue)
}

function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event)

  if (showSuggestions.value && suggestions.value.length > 0) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % suggestions.value.length
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + suggestions.value.length) % suggestions.value.length
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      applySuggestion(suggestions.value[activeSuggestionIndex.value])
    } else if (event.key === 'Escape') {
      showSuggestions.value = false
    }
  }
}

function handleBlur() {
  // Delay hiding to allow click event on suggestion to fire
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function updateCursorPosition() {
  if (textareaRef.value) {
    cursorPosition.value = textareaRef.value.selectionStart
  }
}

// --- Logic: Auto-Correction ---

// Debounced check for pause-based correction
const debouncedAutoCorrect = useDebounceFn((text: string) => {
  performCorrection(text)
}, 300)

function checkAutoCorrect(text: string) {
  // Immediate check on space or punctuation
  const lastChar = text.slice(cursorPosition.value - 1, cursorPosition.value)
  if (/[\s.,;!?]/.test(lastChar)) {
    performCorrection(text)
  } else {
    // Delayed check for pauses
    debouncedAutoCorrect(text)
  }
}

function performCorrection(text: string) {
  const { word, start, end } = getCurrentWord(text, cursorPosition.value - 1) // Check word before cursor
  
  if (!word) return

  const lowerWord = word.toLowerCase()
  if (correctionMap.has(lowerWord)) {
    const correctWord = correctionMap.get(lowerWord)!
    
    // Preserve case if original was capitalized
    const isCapitalized = word[0] === word[0].toUpperCase()
    const replacement = isCapitalized 
      ? correctWord.charAt(0).toUpperCase() + correctWord.slice(1) 
      : correctWord

    // Don't replace if it's already correct (to avoid loops or cursor jumps on correct words)
    if (word === replacement) return

    replaceText(start, end, replacement)
  }
}

// --- Logic: Auto-Suggestions ---

function triggerSuggestions(text: string) {
  const { word, start, end } = getCurrentWord(text, cursorPosition.value)
  
  if (!word || word.length < 3) {
    showSuggestions.value = false
    return
  }

  const lowerWord = word.toLowerCase()
  
  // Find matches
  const matches = correctWords.filter(w => 
    w.toLowerCase().startsWith(lowerWord) && w.toLowerCase() !== lowerWord
  )

  if (matches.length > 0) {
    suggestions.value = matches.map(match => {
      // Match case of user input
      const isCapitalized = word[0] === word[0].toUpperCase()
      const isAllCaps = word === word.toUpperCase() && word.length > 1
      
      if (isAllCaps) return match.toUpperCase()
      if (isCapitalized) return match.charAt(0).toUpperCase() + match.slice(1)
      return match
    })
    
    currentWordRange.value = { start, end }
    activeSuggestionIndex.value = 0
    calculateDropdownPosition(start)
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
  }
}

function applySuggestion(suggestion: string) {
  if (!currentWordRange.value) return
  
  replaceText(currentWordRange.value.start, currentWordRange.value.end, suggestion)
  showSuggestions.value = false
}

// --- Helper: Text Replacement ---

function replaceText(start: number, end: number, replacement: string) {
  if (!textareaRef.value) return

  const currentValue = textareaRef.value.value
  const before = currentValue.slice(0, start)
  const after = currentValue.slice(end)
  const newValue = before + replacement + after
  
  // Calculate new cursor position
  const newCursorPos = start + replacement.length

  emit('update:modelValue', newValue)
  
  // Update DOM and Cursor
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.value = newValue
      textareaRef.value.setSelectionRange(newCursorPos, newCursorPos)
      cursorPosition.value = newCursorPos
    }
  })
}

// --- Helper: Word Detection ---

function getCurrentWord(text: string, index: number) {
  // Find word boundaries around index
  // Look back
  let start = index
  while (start > 0 && !/[\s.,;!?]/.test(text[start - 1])) {
    start--
  }
  
  // Look forward
  let end = index
  while (end < text.length && !/[\s.,;!?]/.test(text[end])) {
    end++
  }
  
  return {
    word: text.slice(start, end),
    start,
    end
  }
}

// --- Helper: UI Positioning ---

function calculateDropdownPosition(index: number) {
  if (!textareaRef.value) return

  // Create a mirror element to calculate coordinates
  const mirror = document.createElement('div')
  const style = window.getComputedStyle(textareaRef.value)
  
  // Copy styles
  Array.from(style).forEach(prop => {
    mirror.style.setProperty(prop, style.getPropertyValue(prop))
  })
  
  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.wordWrap = 'break-word'
  mirror.style.top = '0'
  mirror.style.left = '0'
  
  // Content up to the cursor
  const textBefore = textareaRef.value.value.substring(0, index)
  const span = document.createElement('span')
  span.textContent = textBefore
  mirror.appendChild(span)
  
  // Marker for position
  const marker = document.createElement('span')
  marker.textContent = '|'
  mirror.appendChild(marker)
  
  document.body.appendChild(mirror)
  
  const markerRect = marker.getBoundingClientRect()
  const textareaRect = textareaRef.value.getBoundingClientRect()
  
  // Calculate relative position
  // Note: This is a simplified calculation. For perfect positioning inside a scrollable textarea, 
  // more complex logic is needed (subtracting scrollLeft/Top).
  // Here we position relative to the wrapper.
  
  // We need to account for the textarea's own scroll
  const scrollTop = textareaRef.value.scrollTop
  const scrollLeft = textareaRef.value.scrollLeft

  // Position relative to the textarea container
  // We can't easily get the exact pixel coordinates inside the textarea without the mirror hack
  // The mirror hack gives us coordinates relative to the viewport if we use getBoundingClientRect
  // But we want coordinates relative to the .smart-textarea-wrapper
  
  // Let's try a simpler approach: Position at the bottom of the textarea for now, 
  // or use the mirror's offset relative to the mirror's container.
  
  // Better approach for this context:
  // Use the mirror to get the offsetTop and offsetLeft of the marker
  const markerTop = marker.offsetTop
  const markerLeft = marker.offsetLeft
  
  dropdownTop.value = markerTop - scrollTop + 24 // + line height
  dropdownLeft.value = markerLeft - scrollLeft
  
  document.body.removeChild(mirror)
}

</script>

<style scoped>
.smart-textarea-wrapper {
  position: relative;
  width: 100%;
}

.smart-textarea {
  width: 100%;
  min-height: 120px;
  padding: 16px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.6;
  color: #1f2937;
  resize: vertical;
  transition: all 0.2s ease;
  outline: none;
}

.smart-textarea:hover {
  border-color: #d1d5db;
  background: #fff;
}

.smart-textarea:focus {
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
}

.smart-textarea::placeholder {
  color: #9ca3af;
}

.suggestions-dropdown {
  position: absolute;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  list-style: none;
  padding: 4px 0;
  margin: 0;
  min-width: 200px;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.15s ease;
}

.suggestion-item:hover, .suggestion-item.active {
  background-color: #f3f4f6;
}

.suggestion-text {
  font-weight: 500;
  color: #111827;
}

.suggestion-hint {
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>
