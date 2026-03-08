/**
 * Helper functions for type-safe event handling
 */

/**
 * Get value from input event target safely
 */
export const getInputValue = (event: Event): string => {
  const target = event.target as HTMLInputElement | null
  return target?.value ?? ''
}

/**
 * Get numeric value from input event target safely
 */
export const getInputNumberValue = (event: Event): number => {
  const value = getInputValue(event)
  const num = parseFloat(value)
  return isNaN(num) ? 0 : num
}

/**
 * Get integer value from input event target safely
 */
export const getInputIntValue = (event: Event): number => {
  const value = getInputValue(event)
  const num = parseInt(value, 10)
  return isNaN(num) ? 0 : num
}

/**
 * Get checked state from checkbox event target safely
 */
export const getInputChecked = (event: Event): boolean => {
  const target = event.target as HTMLInputElement | null
  return target?.checked ?? false
}

