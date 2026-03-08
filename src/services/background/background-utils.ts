import type { BackgroundItem, BackgroundPaletteKey } from './background.types'

function norm(input: string): string {
  return (input || '').toLowerCase()
}

export function inferPaletteKeyFromText(input: string): BackgroundPaletteKey {
  const text = norm(input)
  if (!text) return 'unknown'

  // Explicit red/gold themes
  if (text.includes('red and gold') || (text.includes('red') && text.includes('gold'))) return 'redGold'

  // Known dark themes
  if (text.includes('deep green') || text.includes('dark') || text.includes('black') || text.includes('futuristic')) return 'dark'

  // Known light themes
  if (text.includes('beige') || text.includes('white') || text.includes('light') || text.includes('pastel')) return 'light'

  // Special (yellow/gold background with dark accents) behaves like light for text contrast
  if (text.includes('backgroundcolour') || text.includes('backgroundcolor')) return 'light'

  return 'unknown'
}

export function normalizeWeight(weight: unknown, fallback = 1): number {
  const n = typeof weight === 'number' ? weight : Number(weight)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return n
}

export function resolvePaletteKey(item: Pick<BackgroundItem, 'paletteKey' | 'name' | 'fileName' | 'src'>): BackgroundPaletteKey {
  if (item.paletteKey) return item.paletteKey
  return inferPaletteKeyFromText(item.name || item.fileName || item.src.ref)
}

export function decodeMaybe(uri: string): string {
  try {
    return decodeURI(uri)
  } catch {
    return uri
  }
}
