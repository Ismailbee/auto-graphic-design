export function safeJsonParse<T>(text: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) as T }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Invalid JSON' }
  }
}

/**
 * Extracts the first JSON object/array substring from a response.
 * This helps when the model accidentally wraps JSON with extra text.
 */
export function extractFirstJsonBlock(text: string): string | null {
  if (!text) return null

  // Fast path
  const trimmed = text.trim()
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return trimmed
  }

  // Scan for the first *parseable* JSON object/array using bracket matching.
  // Models often include brace-like text earlier (e.g. "action": { ... }) which is not valid JSON.

  const startCandidates: number[] = []
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i]
    if (ch === '{' || ch === '[') startCandidates.push(i)
  }
  if (startCandidates.length === 0) return null

  for (const start of startCandidates) {
    const openChar = trimmed[start]
    const closeChar = openChar === '{' ? '}' : ']'

    let depth = 0
    let inString = false
    let escape = false

    for (let i = start; i < trimmed.length; i++) {
      const ch = trimmed[i]

      if (inString) {
        if (escape) {
          escape = false
        } else if (ch === '\\') {
          escape = true
        } else if (ch === '"') {
          inString = false
        }
        continue
      }

      if (ch === '"') {
        inString = true
        continue
      }

      if (ch === openChar) depth++
      if (ch === closeChar) depth--

      if (depth === 0) {
        const candidate = trimmed.slice(start, i + 1)
        const parsed = safeJsonParse(candidate)
        if (parsed.ok) return candidate
        break
      }
    }
  }

  return null
}
