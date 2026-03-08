/**
 * Year Concept SVG Utilities
 *
 * Loads decorative year concept SVGs from /templates/Tag/202-concept/
 * and inlines them directly into tag templates when the theme is a year
 * (e.g. "2026", "2028").
 *
 * KEY INSIGHT: The concept SVGs (exported from CorelDRAW) use SVG 1.1
 * embedded <font>/<glyph> elements. These are **NOT supported** by any
 * modern browser (Chrome dropped them in v38, ~2014; Firefox never
 * supported them). Additionally the fonts only define glyphs for digits
 * 0, 2, 6 — so even if they worked, year "2028" (needs "8") would be
 * broken.
 *
 * Our approach for each concept SVG:
 *
 *   A. **Web-font concepts** (t20-2 Montserrat Black, t20-4 Arial Bold):
 *      - Strip the useless <font> elements and SVG @font-face rules
 *      - Dynamically load the real web font (Montserrat wght 900)
 *      - Remap font-family names (e.g. "Montserrat Black" → "Montserrat")
 *      - Keep <text> elements — they render with real fonts for ANY digit
 *
 *   B. **Non-web-font concepts** (t20-3 Faktos):
 *      - Extract glyph path data from the <font> before removing it
 *      - Convert <text> elements to <path> elements using that data
 *      - Only used for years where all needed glyphs exist (mainly 2026)
 *
 *   C. **Path-based concepts** (t20-5):
 *      - All digits are already paths — only works for 2026
 *
 * Concept SVGs:
 *   t20-2.svg – Green brush-stroke style (Montserrat Black)
 *   t20-3.svg – Red wave & diamond       (Faktos — no web font)
 *   t20-4.svg – 3D perspective green     (Arial Bold)
 *   t20-5.svg – Circle gradient          (path-based — 2026 only)
 *
 * t20-1.svg is excluded (depends on missing external image).
 *
 * ~80 % of the time a concept SVG replaces the theme text;
 * ~20 % the year stays as normal text for variety.
 */

import type { TagTemplateType } from './tagTemplateUtils'

// ─── Concept SVG Metadata ────────────────────────────────────────────────────

interface ConceptSvgMeta {
  file: string
  /** true = digits are <text> elements whose content can be swapped */
  textBased: boolean
  /** true = the font is available as a web/system font (any digit works) */
  webFont: boolean
  /**
   * CSS font-family name used in the concept SVG's @font-face / .fntN class.
   * We'll remap this to webFontCssFamily when stripping SVG fonts.
   */
  svgFontFamily?: string
  /**
   * The actual CSS font-family name that the browser should use.
   * For Google Fonts, this is the family name in the API.
   */
  webFontCssFamily?: string
}

const YEAR_CONCEPT_SVGS: ConceptSvgMeta[] = [
  {
    file: 't20-2.svg',
    textBased: true,
    webFont: true,
    svgFontFamily: 'Montserrat Black',
    webFontCssFamily: 'Montserrat'       // Google Fonts: Montserrat wght@900
  },
  {
    file: 't20-3.svg',
    textBased: true,
    webFont: false                         // Faktos — no web source
  },
  {
    file: 't20-4.svg',
    textBased: true,
    webFont: true,
    svgFontFamily: 'Arial',
    webFontCssFamily: 'Arial'             // system font — universally available
  },
  {
    file: 't20-5.svg',
    textBased: false,
    webFont: false                         // paths only, no text
  }
]

const usedConcepts = new Set<string>()
const CONCEPT_USE_PROBABILITY = 0.80
let idCounter = 0
let montserratLoaded = false

// ─── Public API ──────────────────────────────────────────────────────────────

export function isYearTheme(theme: string): string | null {
  if (!theme) return null
  const cleaned = theme.trim()
  return /^20\d{2}$/.test(cleaned) ? cleaned : null
}

export function shouldUseYearConcept(): boolean {
  return Math.random() < CONCEPT_USE_PROBABILITY
}

export function resetUsedConcepts(): void {
  usedConcepts.clear()
}

/**
 * Overlay a year concept SVG onto the tag, replacing the theme text area.
 *
 * @returns true if the overlay was applied
 */
export async function overlayYearConcept(
  svg: SVGSVGElement,
  year: string,
  _templateName: TagTemplateType
): Promise<boolean> {
  const svgNS = 'http://www.w3.org/2000/svg'

  try {
    // ── Pick a concept ─────────────────────────────────────────────────
    const available = getAvailableConcepts(year)
    if (available.length === 0) {
      console.log('⚠️ No suitable concept SVG for year ' + year)
      return false
    }

    const pick = available[Math.floor(Math.random() * available.length)]
    usedConcepts.add(pick.file)
    console.log(`🎆 Year concept: picked ${pick.file} for "${year}"`)

    // ── Load web font (Montserrat 900) if needed ───────────────────────
    if (pick.webFont && pick.webFontCssFamily === 'Montserrat') {
      await ensureMontserratBlackLoaded()
    }

    // ── Fetch & parse ──────────────────────────────────────────────────
    const res = await fetch(`/templates/Tag/202-concept/${pick.file}`)
    if (!res.ok) {
      console.error(`❌ Concept SVG fetch failed: ${res.status}`)
      return false
    }
    const svgText = await res.text()
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
    const conceptRoot = doc.documentElement
    if (!conceptRoot || conceptRoot.querySelector('parsererror')) {
      console.error('❌ Concept SVG parse error')
      return false
    }

    // ── Process fonts: strip SVG fonts, convert or remap ───────────────
    if (pick.webFont && pick.svgFontFamily && pick.webFontCssFamily) {
      // Strategy A: strip SVG font, remap to web/system font
      stripSvgFonts(conceptRoot)
      remapFontFamily(conceptRoot, pick.svgFontFamily, pick.webFontCssFamily)
      console.log(`🔤 Font remapped: "${pick.svgFontFamily}" → "${pick.webFontCssFamily}"`)
    } else if (pick.textBased) {
      // Strategy B: extract glyphs, convert text→path, strip SVG font
      const glyphMap = extractGlyphs(conceptRoot)
      convertTextToPaths(conceptRoot, glyphMap)
      stripSvgFonts(conceptRoot)
      console.log(`🔤 Text converted to paths (${glyphMap.size} glyphs)`)
    }

    // ── Concept dimensions from viewBox ────────────────────────────────
    let cOrigW = 1000, cOrigH = 500
    const vbConcept = conceptRoot.getAttribute('viewBox')
    if (vbConcept) {
      const p = vbConcept.split(/\s+/)
      if (p.length === 4) { cOrigW = parseFloat(p[2]); cOrigH = parseFloat(p[3]) }
    }

    // ── Modify digits for target year ──────────────────────────────────
    if (year !== '2026' && pick.textBased && pick.webFont) {
      modifyYearDigits(conceptRoot, year)
    }

    // ── Remove broken external images ──────────────────────────────────
    removeExternalImages(conceptRoot)

    // ── Prefix IDs to avoid clashes with parent tag SVG ────────────────
    prefixIds(conceptRoot)

    // ── Tag dimensions ─────────────────────────────────────────────────
    let tagW = 3125, tagH = 4420
    const vbTag = svg.getAttribute('viewBox')
    if (vbTag) {
      const p = vbTag.split(/\s+/)
      if (p.length === 4) { tagW = parseFloat(p[2]); tagH = parseFloat(p[3]) }
    }

    // ── Locate theme text for positioning ──────────────────────────────
    const themeText = svg.querySelector('#theme-text') as SVGTextElement | null
    if (!themeText) {
      console.log('⚠️ No #theme-text — cannot overlay concept')
      return false
    }
    const themeX = parseFloat(themeText.getAttribute('x') || String(tagW / 2))
    const themeY = parseFloat(themeText.getAttribute('y') || '1800')

    // ── Compute size & position ────────────────────────────────────────
    const aspect = cOrigW / cOrigH
    let cW = tagW * 0.70
    let cH = cW / aspect
    const maxH = tagH * 0.25
    if (cH > maxH) { cH = maxH; cW = cH * aspect }

    const cX = themeX - cW / 2
    const cY = themeY - cH * 0.55

    // ── Hide original theme text ───────────────────────────────────────
    themeText.setAttribute('display', 'none')

    // ── Remove previous overlay ────────────────────────────────────────
    svg.querySelector('#year-concept-overlay')?.remove()

    // ── Build nested <svg> from the concept ────────────────────────────
    const layerGroup = svg.querySelector('g#Layer_x0020_1') || svg

    const wrapperG = document.createElementNS(svgNS, 'g')
    wrapperG.setAttribute('id', 'year-concept-overlay')

    const nestedSvg = document.createElementNS(svgNS, 'svg')
    nestedSvg.setAttribute('x', String(Math.round(cX)))
    nestedSvg.setAttribute('y', String(Math.round(cY)))
    nestedSvg.setAttribute('width', String(Math.round(cW)))
    nestedSvg.setAttribute('height', String(Math.round(cH)))
    nestedSvg.setAttribute('viewBox', vbConcept || `0 0 ${cOrigW} ${cOrigH}`)
    nestedSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    nestedSvg.setAttribute('overflow', 'hidden')

    // Import all child nodes from parsed concept into the live nested <svg>
    while (conceptRoot.firstChild) {
      const imported = document.importNode(conceptRoot.firstChild, true)
      nestedSvg.appendChild(imported)
      conceptRoot.removeChild(conceptRoot.firstChild)
    }

    wrapperG.appendChild(nestedSvg)
    layerGroup.appendChild(wrapperG)

    console.log(
      `✅ Year concept INLINED: ${pick.file}  ${Math.round(cW)}×${Math.round(cH)} ` +
      `at (${Math.round(cX)},${Math.round(cY)})`
    )
    return true
  } catch (e) {
    console.error('❌ overlayYearConcept error:', e)
    return false
  }
}

// ─── Concept Selection ───────────────────────────────────────────────────────

/**
 * Get concepts available for a given year.
 *
 * For 2026: all concepts work (all needed glyphs 0,2,6 exist even in Faktos,
 *           and path-based t20-5 was drawn for 2026).
 * For other years: only web-font concepts (Montserrat, Arial) since they can
 *                  render any digit. Non-web Faktos only has glyphs for 0,2,6.
 */
function getAvailableConcepts(year: string): ConceptSvgMeta[] {
  let pool: ConceptSvgMeta[]

  if (year === '2026') {
    pool = YEAR_CONCEPT_SVGS.filter(s => !usedConcepts.has(s.file))
  } else {
    // Only web-font concepts for non-2026 years (they can render any digit)
    pool = YEAR_CONCEPT_SVGS.filter(s => s.webFont && s.textBased && !usedConcepts.has(s.file))
  }

  if (pool.length === 0) {
    usedConcepts.clear()
    pool = year === '2026'
      ? [...YEAR_CONCEPT_SVGS]
      : YEAR_CONCEPT_SVGS.filter(s => s.webFont && s.textBased)
  }

  return pool
}

// ─── Web Font Loading ────────────────────────────────────────────────────────

/**
 * Dynamically load Montserrat weight 900 (Black) from Google Fonts.
 * The app already loads Montserrat 300–700 in index.html, but 900 is missing.
 */
async function ensureMontserratBlackLoaded(): Promise<void> {
  if (montserratLoaded) return
  try {
    // Check if already available (e.g. user has it installed as system font)
    const check = await document.fonts.load('900 48px "Montserrat"')
    if (check.length > 0) {
      montserratLoaded = true
      console.log('🔤 Montserrat 900 already available')
      return
    }
  } catch (_e) { /* ignore */ }

  try {
    // Load from Google Fonts
    if (!document.querySelector('link[data-year-concept-font]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap'
      link.setAttribute('data-year-concept-font', 'true')
      document.head.appendChild(link)
    }
    // Wait for the specific font face to be ready
    await document.fonts.load('900 48px "Montserrat"')
    montserratLoaded = true
    console.log('🔤 Montserrat 900 loaded from Google Fonts')
  } catch (e) {
    console.warn('⚠️ Could not load Montserrat 900:', e)
    montserratLoaded = true // Don't retry on failure
  }
}

// ─── SVG Font Processing ────────────────────────────────────────────────────

interface GlyphInfo {
  d: string
  horizAdvX: number
}

/**
 * Extract glyph path data from embedded <font> elements BEFORE stripping them.
 * Returns a map of character → glyph info.
 */
function extractGlyphs(svg: Element): Map<string, GlyphInfo> {
  const glyphs = new Map<string, GlyphInfo>()

  svg.querySelectorAll('font').forEach(fontEl => {
    const defaultAdvX = parseFloat(fontEl.getAttribute('horiz-adv-x') || '500')

    fontEl.querySelectorAll('glyph').forEach(glyph => {
      const unicode = glyph.getAttribute('unicode')
      // d can be on the <glyph> directly or on a child <path>
      const d = glyph.getAttribute('d')
        || glyph.querySelector('path')?.getAttribute('d')
        || ''
      const horizAdvX = parseFloat(glyph.getAttribute('horiz-adv-x') || String(defaultAdvX))
      if (unicode && d && d !== 'M0 0z') {
        glyphs.set(unicode, { d, horizAdvX })
      }
    })
  })

  return glyphs
}

/**
 * Remove all <font> elements and SVG-format @font-face CSS rules.
 * These are dead in modern browsers (Chrome 38+, Firefox, Edge).
 */
function stripSvgFonts(svg: Element): void {
  // Remove <font> elements from <defs>
  svg.querySelectorAll('font').forEach(f => f.remove())

  // Remove @font-face rules that reference SVG fonts
  svg.querySelectorAll('style').forEach(style => {
    let text = style.textContent || ''
    // Match @font-face { ... format(svg) ... } blocks
    text = text.replace(/@font-face\s*\{[^}]*format\(\s*svg\s*\)[^}]*\}/gi, '')
    style.textContent = text
  })
}

/**
 * Remap font-family names in <style> blocks and inline styles.
 * e.g. "Montserrat Black" → "Montserrat" (the Google Fonts name).
 */
function remapFontFamily(svg: Element, oldFamily: string, newFamily: string): void {
  if (oldFamily === newFamily) return

  // In <style> blocks
  svg.querySelectorAll('style').forEach(style => {
    let text = style.textContent || ''
    // Replace font-family:'Montserrat Black' → font-family:'Montserrat'
    const escaped = oldFamily.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    text = text.replace(
      new RegExp(`font-family:\\s*['"]?${escaped}['"]?`, 'gi'),
      `font-family:'${newFamily}'`
    )
    style.textContent = text
  })

  // On elements with inline font-family attribute
  svg.querySelectorAll('[font-family]').forEach(el => {
    const val = el.getAttribute('font-family') || ''
    if (val.includes(oldFamily)) {
      el.setAttribute('font-family', val.replace(oldFamily, newFamily))
    }
  })
}

// ─── Text to Path Conversion ────────────────────────────────────────────────

/**
 * Convert <text> elements to <path> elements using extracted glyph data.
 * This is used for non-web-font SVGs (e.g. Faktos) where we can't load
 * the real font. Only works if the needed glyphs are in the map.
 *
 * SVG font glyph coordinates: Y-axis is UP (opposite of SVG screen coords).
 * To render at text position (tx, ty) with fontSize f and unitsPerEm=1000:
 *   transform="translate(tx, ty) scale(f/1000, -f/1000)"
 */
function convertTextToPaths(svg: Element, glyphMap: Map<string, GlyphInfo>): void {
  const svgNS = 'http://www.w3.org/2000/svg'
  const unitsPerEm = 1000

  // Extract font-size values from CSS classes
  const fontSizeMap = parseFontSizesFromStyle(svg)

  const textEls = Array.from(svg.querySelectorAll('text'))
  let converted = 0

  for (const textEl of textEls) {
    const char = (textEl.textContent || '').trim()
    if (char.length !== 1) continue

    const glyph = glyphMap.get(char)
    if (!glyph) {
      console.warn(`⚠️ No glyph for "${char}" — leaving as text`)
      continue
    }

    // Get font-size from CSS class
    const className = textEl.getAttribute('class') || ''
    let fontSize = 1000
    for (const [cls, size] of fontSizeMap) {
      if (className.includes(cls)) { fontSize = size; break }
    }

    const tx = parseFloat(textEl.getAttribute('x') || '0')
    const ty = parseFloat(textEl.getAttribute('y') || '0')
    const scale = fontSize / unitsPerEm

    // Create <path> replacement
    const path = textEl.ownerDocument.createElementNS(svgNS, 'path')
    path.setAttribute('d', glyph.d)
    path.setAttribute(
      'transform',
      `translate(${tx}, ${ty}) scale(${scale}, ${-scale})`
    )

    // Copy visual CSS classes (fil0, str1, etc.) but drop font classes (fnt0, fnt1)
    const visualClasses = className.split(/\s+/).filter(c => !c.startsWith('fnt')).join(' ')
    if (visualClasses) path.setAttribute('class', visualClasses)

    // Replace text with path in the same parent
    const parent = textEl.parentElement
    if (parent) {
      parent.replaceChild(path, textEl)
      converted++
    }
  }

  console.log(`✏️ Converted ${converted}/${textEls.length} text elements to paths`)
}

/**
 * Parse <style> blocks to extract font-size from .fntN classes.
 * Returns Map<className, fontSize>.
 */
function parseFontSizesFromStyle(svg: Element): Map<string, number> {
  const result = new Map<string, number>()

  svg.querySelectorAll('style').forEach(style => {
    const text = style.textContent || ''
    // Match patterns like: .fnt0 {font-weight:900;font-size:1292.6px;font-family:...}
    const re = /\.(fnt\d+)\s*\{[^}]*font-size:\s*([\d.]+)px[^}]*\}/gi
    let m
    while ((m = re.exec(text)) !== null) {
      result.set(m[1], parseFloat(m[2]))
    }
  })

  return result
}

// ─── Digit Modification ─────────────────────────────────────────────────────

/**
 * Find all single-digit <text> elements, sort left→right
 * (accounting for parent transforms), and replace with the target year's digits.
 */
function modifyYearDigits(svg: Element, year: string): void {
  const digits = year.split('')
  const found: { el: Element; x: number }[] = []

  for (const el of Array.from(svg.querySelectorAll('text'))) {
    const txt = (el.textContent || '').trim()
    if (!/^\d$/.test(txt)) continue

    let x = parseFloat(el.getAttribute('x') || '0')
    let p = el.parentElement
    while (p && p !== svg) {
      const t = p.getAttribute('transform') || ''
      const mat = t.match(/matrix\(([^)]+)\)/)
      if (mat) {
        const vals = mat[1].trim().split(/[\s,]+/)
        if (vals.length >= 5) x += parseFloat(vals[4])
      }
      const tr = t.match(/translate\(\s*([^,)\s]+)/)
      if (tr) x += parseFloat(tr[1])
      p = p.parentElement
    }
    found.push({ el, x })
  }

  found.sort((a, b) => a.x - b.x)
  console.log(`🔢 ${found.length} digit elements for year "${year}"`)

  if (found.length >= 4) {
    for (let i = 0; i < 4; i++) found[i].el.textContent = digits[i]
  } else if (found.length === 3) {
    for (let i = 0; i < 3; i++) found[i].el.textContent = digits[i + 1]
  } else if (found.length === 2) {
    for (let i = 0; i < 2; i++) found[i].el.textContent = digits[i + 2]
  }
}

// ─── Cleanup Helpers ────────────────────────────────────────────────────────

/**
 * Remove <image> elements pointing to external files (CorelDRAW artefacts).
 */
function removeExternalImages(svg: Element): void {
  svg.querySelectorAll('image').forEach(img => {
    const href = img.getAttribute('href')
      || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
      || ''
    if (href && !href.startsWith('data:')) {
      const parent = img.parentElement
      img.remove()
      if (parent && parent.children.length === 0) {
        const gp = parent.parentElement
        parent.remove()
        if (gp && gp.children.length === 0 && gp.id) gp.remove()
      }
    }
  })
}

/**
 * Prefix every id in the SVG and all references to those IDs so the
 * concept SVG's definitions never collide with the parent tag SVG.
 */
function prefixIds(svg: Element): void {
  const prefix = `yc${++idCounter}_`

  const ids: string[] = []
  svg.querySelectorAll('[id]').forEach(el => {
    ids.push(el.getAttribute('id')!)
  })
  if (ids.length === 0) return

  // Rename all id attributes
  svg.querySelectorAll('[id]').forEach(el => {
    el.setAttribute('id', prefix + el.getAttribute('id'))
  })

  // Update url(#…) references in presentation attributes
  const refAttrs = ['clip-path', 'fill', 'stroke', 'filter', 'mask',
    'marker-start', 'marker-mid', 'marker-end']
  svg.querySelectorAll('*').forEach(el => {
    for (const attr of refAttrs) {
      const val = el.getAttribute(attr)
      if (val && val.includes('url(#')) {
        el.setAttribute(attr, val.replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${prefix}${id})`))
      }
    }
    const href = el.getAttribute('href')
    if (href && href.startsWith('#')) {
      el.setAttribute('href', '#' + prefix + href.slice(1))
    }
    const xhref = el.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
    if (xhref && xhref.startsWith('#')) {
      el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + prefix + xhref.slice(1))
    }
  })

  // Update references inside <style> blocks
  svg.querySelectorAll('style').forEach(style => {
    let text = style.textContent || ''
    text = text.replace(/url\(#([^)]+)\)/g, (_m, id) => {
      if (ids.includes(id)) return `url(#${prefix}${id})`
      return _m
    })
    text = text.replace(/url\("?#([^")]+)"?\)/g, (_m, id) => {
      if (ids.includes(id)) return `url("#${prefix}${id}")`
      return _m
    })
    style.textContent = text
  })

  console.log(`🏷️ Prefixed ${ids.length} IDs with "${prefix}"`)
}
