// Lazy load Firebase to improve initial bundle size
let firebaseModule: typeof import('@/config/firebase') | null = null

const getFirebase = async () => {
  if (!firebaseModule) {
    firebaseModule = await import('@/config/firebase')
  }
  return firebaseModule
}

import type { BackgroundItem } from './background.types'
import { inferPaletteKeyFromText, normalizeWeight } from './background-utils'

export type BackgroundRef = string

type CachedPayload = {
  ts: number
  items: BackgroundItem[]
}

function cacheKey(category: string) {
  return `backgroundCatalogCache:v1:${category}`
}

function safeReadCache(category: string): CachedPayload | null {
  try {
    const raw = localStorage.getItem(cacheKey(category))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedPayload
    if (!parsed || typeof parsed.ts !== 'number' || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

function safeWriteCache(category: string, items: BackgroundItem[]) {
  try {
    const payload: CachedPayload = { ts: Date.now(), items }
    localStorage.setItem(cacheKey(category), JSON.stringify(payload))
  } catch {
    // ignore
  }
}

export function clearBackgroundCatalogCache(category: string) {
  try {
    localStorage.removeItem(cacheKey(category))
  } catch {
    // ignore
  }
}

/**
 * Loads a small pool of background items from Firestore and caches it.
 *
 * Cost control:
 * - returns cached values until TTL expires
 * - fetches only a limited page (default 50)
 *
 * Expected Firestore doc shape (collection: `backgrounds`):
 * - category: string
 * - active: boolean
 * - fullUrl or url: string (public https URL)
 * - name?: string
 * - paletteKey?: 'light'|'dark'|'redGold'|'unknown'
 * - weight?: number
 */
export async function getBackgroundItemsCached(
  category: string,
  options?: {
    ttlMs?: number
    limit?: number
  }
): Promise<BackgroundItem[]> {
  const ttlMs = options?.ttlMs ?? 12 * 60 * 60 * 1000 // 12 hours
  const maxDocs = options?.limit ?? 50

  const cached = safeReadCache(category)
  if (cached && Date.now() - cached.ts < ttlMs && cached.items.length > 0) {
    return cached.items
  }

  try {
    // Lazy load Firebase
    const { collection, getDocs, limit, query, where, db } = await getFirebase()
    
    const q = query(
      collection(db, 'backgrounds'),
      where('category', '==', category),
      where('active', '==', true),
      limit(maxDocs)
    )

    const snap = await getDocs(q)
    const items: BackgroundItem[] = []

    snap.forEach((docSnap) => {
      const data = docSnap.data() as any
      const url = (data?.fullUrl || data?.url) as unknown
      if (typeof url !== 'string' || url.length === 0) return

      const name = typeof data?.name === 'string' ? data.name : undefined
      const paletteKey = typeof data?.paletteKey === 'string'
        ? (data.paletteKey as any)
        : inferPaletteKeyFromText(name || url)

      const weight = normalizeWeight(data?.weight, 1)

      items.push({
        id: docSnap.id,
        category,
        name,
        paletteKey,
        weight,
        src: { type: 'remote', ref: url },
      })
    })

    if (items.length > 0) safeWriteCache(category, items)
    return items
  } catch {
    // If Firestore fails/offline, fall back to whatever cache we had
    return cached?.items ?? []
  }
}

/**
 * Backward-compatible helper: returns just the URLs.
 */
export async function getBackgroundRefsCached(
  category: string,
  options?: {
    ttlMs?: number
    limit?: number
  }
): Promise<BackgroundRef[]> {
  const items = await getBackgroundItemsCached(category, options)
  return items.map((it) => it.src.ref)
}
