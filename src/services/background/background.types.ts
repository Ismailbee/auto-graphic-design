export type BackgroundSourceType = 'bundled' | 'remote' | 'custom'

export type BackgroundPaletteKey = 'light' | 'dark' | 'redGold' | 'unknown'

export interface BackgroundItem {
  id: string
  category: string
  name?: string
  paletteKey?: BackgroundPaletteKey
  weight?: number
  src: {
    type: BackgroundSourceType
    /** Absolute URL (remote) or absolute path (bundled, e.g. /svg/background/foo.png) */
    ref: string
  }
  /** Optional original filename (useful for debugging/migration) */
  fileName?: string
}

export function backgroundPersistKey(item: BackgroundItem): string {
  return `${item.src.type}:${item.id}`
}

export function backgroundDisplayName(item: BackgroundItem): string {
  return item.name || item.fileName || item.id
}
