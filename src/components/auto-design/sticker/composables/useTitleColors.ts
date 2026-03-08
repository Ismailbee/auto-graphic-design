/**
 * Title Color System
 * 
 * Automatically selects title colors based on background palette
 * to ensure proper contrast and readability.
 */

import type { BackgroundPaletteKey } from '@/services/background/background.types'

/**
 * Color scheme for titles based on background palette
 */
export interface TitleColorScheme {
  primary: string      // Main title text color
  secondary: string    // Secondary/accent color (e.g., "Wedding" text)
  accent: string       // Subtle text color (e.g., "on your")
  shadow?: string      // Optional text shadow for extra contrast
}

/**
 * Title color schemes for each background palette
 * These colors are chosen for maximum readability and visual appeal
 */
export const TITLE_COLOR_SCHEMES: Record<BackgroundPaletteKey, TitleColorScheme> = {
  dark: {
    // Dark backgrounds (blue, green, black, navy)
    // Use light colors: white, gold, cream
    primary: '#FFFFFF',      // White - main title
    secondary: '#FFD700',    // Gold - "Wedding" highlight
    accent: '#F5DEB3',       // Wheat/cream - subtle text
    shadow: '2px 2px 4px rgba(0,0,0,0.5)'
  },
  light: {
    // Light backgrounds (beige, cream, white, pastel)
    // Use dark colors: black, brown, navy
    primary: '#1a1a1a',      // Near black - main title
    secondary: '#8B4513',    // Saddle brown - "Wedding" highlight
    accent: '#333333',       // Dark gray - subtle text
    shadow: '1px 1px 2px rgba(255,255,255,0.3)'
  },
  redGold: {
    // Red and gold backgrounds (Chinese style, elegant)
    // Use gold, white, cream
    primary: '#FFD700',      // Gold - main title
    secondary: '#FFFFFF',    // White - "Wedding" highlight
    accent: '#FFF8DC',       // Cornsilk - subtle text
    shadow: '2px 2px 4px rgba(0,0,0,0.6)'
  },
  unknown: {
    // Fallback - assume medium contrast needed
    primary: '#FFFFFF',
    secondary: '#FFD700',
    accent: '#F0F0F0',
    shadow: '2px 2px 4px rgba(0,0,0,0.5)'
  }
}

/**
 * Get the appropriate title color scheme for a background palette
 */
export function getTitleColorScheme(paletteKey: BackgroundPaletteKey): TitleColorScheme {
  return TITLE_COLOR_SCHEMES[paletteKey] || TITLE_COLOR_SCHEMES.unknown
}

/**
 * Apply title colors to an SVG element containing the title
 * @param titleGroup - The SVG group containing the title
 * @param paletteKey - The background palette key
 */
export function applyTitleColors(
  titleGroup: SVGGElement | null,
  paletteKey: BackgroundPaletteKey
): void {
  if (!titleGroup) return

  const scheme = getTitleColorScheme(paletteKey)
  console.log(`🎨 Applying title colors for palette: ${paletteKey}`, scheme)

  // Find text elements in the title group
  const textElements = titleGroup.querySelectorAll('text, tspan')
  console.log(`🎨 Found ${textElements.length} text elements in title group`)
  
  textElements.forEach((el, idx) => {
    const text = el.textContent?.toLowerCase().trim() || ''
    const svgEl = el as SVGElement
    const originalClass = el.getAttribute('class') || ''
    
    console.log(`🎨 Text element ${idx}: "${text.substring(0, 30)}" class="${originalClass}"`)
    
    // Remove any CSS class that sets fill color (fil0, fil1, fil2)
    el.classList.remove('fil0', 'fil1', 'fil2')
    
    let fillColor = scheme.primary
    
    // Determine which color to apply based on text content or original class
    // fil0 = "Congratulation on your" → accent (wheat)
    // fil1 = "Wedding" → secondary (gold)
    // fil2 = "Ceremony" → primary (white)
    if (text.includes('wedding') || originalClass.includes('fil1')) {
      // "Wedding" gets secondary (highlight) color - yellow/gold on dark
      fillColor = scheme.secondary
    } else if (text.includes('on your') || text.includes('congratulation') || originalClass.includes('fil0')) {
      // "on your" and "Congratulation" get accent color - wheat/cream on dark
      fillColor = scheme.accent
    } else if (text.includes('ceremony') || originalClass.includes('fil2')) {
      // "Ceremony" gets primary color - white on dark  
      fillColor = scheme.primary
    }
    
    console.log(`🎨 Applying color: ${fillColor} to "${text.substring(0, 20)}"`)
    
    // Apply fill using multiple methods to ensure it works
    el.setAttribute('fill', fillColor)
    svgEl.style.setProperty('fill', fillColor, 'important')
  })

  // Also handle path elements with direct fill attributes (for path-based title SVGs)
  const pathElements = titleGroup.querySelectorAll('path, polygon')
  console.log(`🎨 Found ${pathElements.length} path/polygon elements in title group`)
  
  pathElements.forEach((el) => {
    const svgEl = el as SVGElement
    // Apply primary color to all paths - they form the title text
    el.setAttribute('fill', scheme.primary)
    svgEl.style.setProperty('fill', scheme.primary, 'important')
  })

  // Also update ALL CSS style blocks inside the SVG
  // The title SVG styles might be copied into the main SVG's defs
  const svgRoot = titleGroup.closest('svg')
  if (svgRoot) {
    const styleElements = svgRoot.querySelectorAll('style')
    styleElements.forEach((styleEl, idx) => {
      let css = styleEl.textContent || ''
      // Check if this style element contains the fil classes
      if (css.includes('.fil0') || css.includes('.fil1') || css.includes('.fil2')) {
        // More flexible regex to handle various CSS formats
        // Handles: .fil0 {fill:black} or .fil0{fill:#000} etc.
        css = css.replace(/\.fil0\s*\{[^}]*\}/g, `.fil0 {fill:${scheme.accent} !important}`)
        css = css.replace(/\.fil1\s*\{[^}]*\}/g, `.fil1 {fill:${scheme.secondary} !important}`)
        css = css.replace(/\.fil2\s*\{[^}]*\}/g, `.fil2 {fill:${scheme.primary} !important}`)
        styleEl.textContent = css
        console.log(`🎨 Updated CSS style block #${idx} for palette: ${paletteKey}`)
        console.log(`🎨 New CSS:`, css.substring(0, 200))
      }
    })
  }

  // Apply text shadow via filter if specified
  if (scheme.shadow) {
    // Create or update a drop shadow filter
    const svgRoot = titleGroup.closest('svg')
    if (svgRoot) {
      let defs = svgRoot.querySelector('defs')
      if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
        svgRoot.insertBefore(defs, svgRoot.firstChild)
      }

      // Check if shadow filter exists
      if (!svgRoot.querySelector('#title-shadow-filter')) {
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
        filter.setAttribute('id', 'title-shadow-filter')
        filter.setAttribute('x', '-20%')
        filter.setAttribute('y', '-20%')
        filter.setAttribute('width', '140%')
        filter.setAttribute('height', '140%')
        
        filter.innerHTML = `
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.5"/>
        `
        defs.appendChild(filter)
      }

      // Apply filter to title group
      titleGroup.setAttribute('filter', 'url(#title-shadow-filter)')
    }
  }
}

/**
 * Color presets for specific title types
 * Can override the automatic selection
 */
export const TITLE_PRESETS = {
  alhamdulillah: {
    // Islamic/elegant style
    dark: { primary: '#FFD700', secondary: '#FFFFFF', accent: '#F0E68C' },
    light: { primary: '#006400', secondary: '#8B4513', accent: '#2F4F4F' },
    redGold: { primary: '#FFD700', secondary: '#FFFFFF', accent: '#FFF8DC' }
  },
  congratulation: {
    // Celebratory style
    dark: { primary: '#FFFFFF', secondary: '#FF6B6B', accent: '#FFE66D' },
    light: { primary: '#000000', secondary: '#DC143C', accent: '#333333' },
    redGold: { primary: '#FFD700', secondary: '#FFFFFF', accent: '#FFF8DC' }
  },
  nikkah: {
    // Traditional Islamic wedding
    dark: { primary: '#E6E6FA', secondary: '#FFD700', accent: '#F5F5DC' },
    light: { primary: '#2E8B57', secondary: '#8B4513', accent: '#006400' },
    redGold: { primary: '#FFD700', secondary: '#FFFFFF', accent: '#FFFACD' }
  }
}

/**
 * Get contrasting text color (simple black/white decision)
 * Used for dynamic color detection if needed
 */
export function getContrastColor(hexColor: string): 'black' | 'white' {
  // Remove # if present
  const hex = hexColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? 'black' : 'white'
}
