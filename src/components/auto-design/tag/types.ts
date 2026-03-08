/**
 * Tag Template Types
 */

export interface TagFormData {
  tagTitle?: string
  theme?: string
  organizationLine2?: string
  eventType?: string
  logoTitle?: string
  date?: string
  time?: string
  venue?: string
}

export type OrderableField = 'logoTitle' | 'tagTitle' | 'theme' | 'subtheme' | 'eventType' | 'baseText'

export type SizableField = OrderableField | 'date' | 'time' | 'venue'

/** Available text size multipliers (X3, X6, X9, X12, X15) */
export const TEXT_SIZE_OPTIONS = [3, 6, 9, 12, 15] as const
export type TextSizeMultiplier = typeof TEXT_SIZE_OPTIONS[number]

/** Default sizes for all fields */
export const DEFAULT_FIELD_SIZES: Record<SizableField, TextSizeMultiplier> = {
  logoTitle: 6,
  tagTitle: 12,
  theme: 6,
  subtheme: 9,
  eventType: 6,
  baseText: 12,
  date: 6,
  time: 6,
  venue: 6,
}

/**
 * Get font size scale factor for a sizable field based on user's size selection.
 * Returns 1.0 at default size, >1.0 when user wants bigger, <1.0 when smaller.
 * Each step = 35% change from default for a strong visible difference.
 */
export function getSizeScale(
  fieldName: SizableField,
  fieldSizes?: Partial<Record<SizableField, TextSizeMultiplier>>
): number {
  const defaultSize = DEFAULT_FIELD_SIZES[fieldName]
  const userSize = fieldSizes?.[fieldName] ?? defaultSize
  const defaultIndex = TEXT_SIZE_OPTIONS.indexOf(defaultSize)
  const userIndex = TEXT_SIZE_OPTIONS.indexOf(userSize as typeof TEXT_SIZE_OPTIONS[number])
  if (defaultIndex === -1 || userIndex === -1) return 1
  const indexDiff = userIndex - defaultIndex
  return Math.max(0.3, Math.min(2.5, 1 + indexDiff * 0.35))
}

export const DEFAULT_FIELD_ORDER: OrderableField[] = ['logoTitle', 'tagTitle', 'theme', 'subtheme', 'eventType', 'baseText']

export interface ExtractedTagInfo {
  tagTitle?: string
  theme?: string
  subtheme?: string
  baseText?: string
  eventType?: string
  logoTitle?: string
  hasLogo?: boolean
  date?: string
  time?: string
  venue?: string
  fieldOrder?: OrderableField[]
  fieldSizes?: Partial<Record<SizableField, TextSizeMultiplier>>
}

export interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: string
  type?: 'text' | 'preview'
  actions?: Array<{ type: string; label: string; variant?: string }>
  templateName?: string  // Track which template generated this preview
}
