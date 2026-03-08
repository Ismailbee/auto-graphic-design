import type { BackgroundItem } from './background.types'
import { CDN_ENABLED, resolveBackgroundUrl } from './cdn-config'

const MAX_ENTRIES_DEFAULT = 150

function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  // unsigned -> hex
  return (hash >>> 0).toString(16)
}

function guessExtensionFromUrl(url: string): string {
  try {
    const u = new URL(url)
    const m = u.pathname.match(/\.(png|jpg|jpeg|webp|svg)$/i)
    if (m?.[1]) return m[1].toLowerCase()
  } catch {
    // ignore
  }
  return 'png'
}

function buildCachePath(remoteUrl: string): string {
  const ext = guessExtensionFromUrl(remoteUrl)
  const key = fnv1aHash(remoteUrl)
  return `backgrounds/${key}.${ext}`
}

type CacheEntry = {
  url: string
  path: string
  lastAccess: number
}

type CacheState = {
  version: 1
  entries: Record<string, CacheEntry>
}

const PREFS_KEY = 'backgroundImageCache:v1'

async function isNativePlatform(): Promise<boolean> {
  // Dynamic import keeps web builds light and avoids bundling issues.
  const { Capacitor } = await import('@capacitor/core')
  return Capacitor.isNativePlatform()
}

async function loadState(): Promise<CacheState> {
  const { Preferences } = await import('@capacitor/preferences')
  const res = await Preferences.get({ key: PREFS_KEY })
  if (!res.value) return { version: 1, entries: {} }
  try {
    const parsed = JSON.parse(res.value) as CacheState
    if (parsed?.version !== 1 || !parsed.entries) return { version: 1, entries: {} }
    return parsed
  } catch {
    return { version: 1, entries: {} }
  }
}

async function saveState(state: CacheState): Promise<void> {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.set({ key: PREFS_KEY, value: JSON.stringify(state) })
}

async function evictIfNeeded(state: CacheState, maxEntries: number): Promise<void> {
  const entries = Object.values(state.entries)
  if (entries.length <= maxEntries) return

  entries.sort((a, b) => a.lastAccess - b.lastAccess)
  const toRemove = entries.slice(0, Math.max(0, entries.length - maxEntries))

  const { Filesystem, Directory } = await import('@capacitor/filesystem')

  for (const entry of toRemove) {
    try {
      await Filesystem.deleteFile({ directory: Directory.Cache, path: entry.path })
    } catch {
      // ignore
    }
    delete state.entries[entry.url]
  }
}

async function fileExists(path: string): Promise<boolean> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem')
  try {
    await Filesystem.stat({ directory: Directory.Cache, path })
    return true
  } catch {
    return false
  }
}

async function toWebViewUrl(cachePath: string): Promise<string> {
  const { Filesystem, Directory } = await import('@capacitor/filesystem')
  const { Capacitor } = await import('@capacitor/core')

  // `getUri` returns a native file:// uri; convertFileSrc makes it usable in WebView.
  const uri = await Filesystem.getUri({ directory: Directory.Cache, path: cachePath })
  return Capacitor.convertFileSrc(uri.uri)
}

export async function getCachedRemoteImageUrl(remoteUrl: string, opts?: { maxEntries?: number }): Promise<string> {
  if (!(await isNativePlatform())) return remoteUrl

  const maxEntries = opts?.maxEntries ?? MAX_ENTRIES_DEFAULT
  const cachePath = buildCachePath(remoteUrl)

  const state = await loadState()
  const existing = state.entries[remoteUrl]

  // If we already have it and it exists, return it.
  if (existing?.path) {
    const exists = await fileExists(existing.path)
    if (exists) {
      existing.lastAccess = Date.now()
      await saveState(state)
      return toWebViewUrl(existing.path)
    }

    // Stale entry
    delete state.entries[remoteUrl]
    await saveState(state)
  }

  // Download to cache
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem')

    await Filesystem.downloadFile({
      url: remoteUrl,
      directory: Directory.Cache,
      path: cachePath,
      progress: false,
    })

    state.entries[remoteUrl] = { url: remoteUrl, path: cachePath, lastAccess: Date.now() }
    await evictIfNeeded(state, maxEntries)
    await saveState(state)

    return toWebViewUrl(cachePath)
  } catch {
    // If download fails, fall back to remote URL.
    return remoteUrl
  }
}

export async function resolveBackgroundImageUrl(background: BackgroundItem): Promise<string> {
  const ref = background?.src?.ref || ''
  if (!ref) return ref

  // For bundled backgrounds, use CDN if enabled for faster loading
  if (background.src.type === 'bundled') {
    return CDN_ENABLED ? resolveBackgroundUrl(ref) : ref
  }

  if (background.src.type !== 'remote') return ref
  return getCachedRemoteImageUrl(ref)
}
