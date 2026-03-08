/**
 * Title Library Composable
 * 
 * Manages pre-designed SVG titles for stickers.
 * Handles title matching, SVG-to-PNG rendering, and title image replacement.
 */

// ========================================
// TYPES
// ========================================
export interface TitleEntry {
  keywords: string[]       // Keywords to match (all must be present)
  svgPath: string          // Path to the SVG file (for color flexibility)
  fallbackText: string     // Text to show if image fails
  position?: { x: number; y: number; width: number; height: number }
  scale?: number
}

export interface TitleImageConfig {
  svgPath: string
  targetElementIds: string[]
  position: { x: number; y: number; width: number; height: number }
  scale: number
  color?: string  // Optional color override for the title
}

// ========================================
// TITLE LIBRARY DATA
// ========================================
// NOTE: Title library entries temporarily disabled to use base template text layout instead
// The pre-designed SVG graphics (cgwc.svg) have text baked in with fixed layout
// To restore graphic title injection, uncomment the entries below
const TITLE_LIBRARY: TitleEntry[] = [
  // DISABLED: These were injecting pre-designed graphics that override base template text
  // The base template (wedding-sticker-base.svg) now handles the text layout correctly:
  // - "ON YOUR" on same line
  // - "WEDDING" below
  // 
  // To re-enable, uncomment these entries:
  // {
  //   keywords: ['alhamdulillah', 'wedding'],
  //   svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
  //   fallbackText: 'Alhamdulillahi on Your Wedding Ceremony',
  //   position: { x: -100, y: -20, width: 1800, height: 900 },
  //   scale: 1.0
  // },
  // {
  //   keywords: ['wedding'],
  //   svgPath: '/assets/title/AlahamdulillahiWeddingCeremony/cgwc.svg',
  //   fallbackText: 'Alhamdulillahi on Your Wedding Ceremony',
  //   position: { x: -100, y: -20, width: 1800, height: 900 },
  //   scale: 1.0
  // },
]

// Cache for pre-rendered title images (keyed by svgPath + color)
const titleImageCache = new Map<string, string>()

// ========================================
// COMPOSABLE
// ========================================
export function useTitleLibrary() {
  
  /**
   * Clear title image cache (call when background changes to force re-render with new color)
   */
  function clearTitleImageCache(): void {
    titleImageCache.clear()
    console.log('🗑️ Title image cache cleared')
  }

  /**
   * Find matching title SVG based on user input
   * More specific matches (more keywords) take priority
   */
  function findMatchingTitle(input: string): TitleEntry | null {
    // Ensure input is a string
    if (!input || typeof input !== 'string') {
      console.log('⚠️ findMatchingTitle called with invalid input:', input)
      return null
    }
    const normalizedInput = input.toLowerCase()
    
    // Sort by number of keywords (descending) to prioritize more specific matches
    const sortedLibrary = [...TITLE_LIBRARY].sort((a, b) => b.keywords.length - a.keywords.length)
    
    for (const entry of sortedLibrary) {
      // Check if ALL keywords are present in the input
      const allKeywordsMatch = entry.keywords.every(keyword => {
        const kw = typeof keyword === 'string' ? keyword : String((keyword as any) ?? '')
        return normalizedInput.includes(kw.toLowerCase())
      })
      
      if (allKeywordsMatch) {
        console.log('🎯 Title Library Match:', entry.fallbackText, 'for input:', input)
        return entry
      }
    }
    
    console.log('⚠️ No title library match found for:', input)
    return null
  }

  /**
   * Render SVG to PNG with optional color modification
   */
  async function renderSvgToPng(svgUrl: string, width: number, height: number, color?: string): Promise<string> {
    const cacheKey = `${svgUrl}-${color || 'default'}-${width}x${height}`
    
    // Check cache first
    if (titleImageCache.has(cacheKey)) {
      console.log('📦 Using cached title PNG:', cacheKey)
      return titleImageCache.get(cacheKey)!
    }
    
    console.log('🎨 Rendering SVG to PNG:', svgUrl, 'color:', color, 'size:', width, 'x', height)
    
    // Fetch the SVG
    const response = await fetch(svgUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.status}`)
    }
    let svgText = await response.text()
    
    // Parse and modify SVG for color if specified
    if (color) {
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
      const svgElement = svgDoc.querySelector('svg')
      
      if (svgElement) {
        // Update fill colors in styles (CSS within SVG)
        const styles = svgElement.querySelectorAll('style')
        styles.forEach(style => {
          if (style.textContent) {
            style.textContent = style.textContent
              .replace(/fill:\s*#[0-9A-Fa-f]{3,8}/gi, `fill:${color}`)
              .replace(/fill:\s*rgb\([^)]+\)/gi, `fill:${color}`)
              .replace(/fill:\s*rgba\([^)]+\)/gi, `fill:${color}`)
          }
        })
        
        // Update fill attributes on ALL elements with fill attribute
        const fillElements = svgElement.querySelectorAll('[fill]')
        fillElements.forEach(el => {
          const currentFill = el.getAttribute('fill')
          // Replace any color (hex, rgb, named) except 'none' and gradients
          if (currentFill && currentFill !== 'none' && !currentFill.startsWith('url(')) {
            el.setAttribute('fill', color)
          }
        })
        
        // Also update any inline style fill colors
        const styledElements = svgElement.querySelectorAll('[style]')
        styledElements.forEach(el => {
          const style = el.getAttribute('style')
          if (style && style.includes('fill')) {
            const newStyle = style
              .replace(/fill:\s*#[0-9A-Fa-f]{3,8}/gi, `fill:${color}`)
              .replace(/fill:\s*rgb\([^)]+\)/gi, `fill:${color}`)
              .replace(/fill:\s*rgba\([^)]+\)/gi, `fill:${color}`)
            el.setAttribute('style', newStyle)
          }
        })
        
        // Handle g (group) elements that may have fill
        const gElements = svgElement.querySelectorAll('g[fill]')
        gElements.forEach(g => {
          const currentFill = g.getAttribute('fill')
          if (currentFill && currentFill !== 'none' && !currentFill.startsWith('url(')) {
            g.setAttribute('fill', color)
          }
        })
        
        // Serialize back
        const serializer = new XMLSerializer()
        svgText = serializer.serializeToString(svgElement)
      }
    }
    
    // Create blob URL from (possibly modified) SVG
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const svgBlobUrl = URL.createObjectURL(svgBlob)
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(svgBlobUrl)
        reject(new Error('SVG to PNG render timeout'))
      }, 10000)
      
      img.onload = () => {
        clearTimeout(timeout)
        try {
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            URL.revokeObjectURL(svgBlobUrl)
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          ctx.drawImage(img, 0, 0, width, height)
          const pngDataUrl = canvas.toDataURL('image/png')
          
          URL.revokeObjectURL(svgBlobUrl)
          
          // Cache the result
          titleImageCache.set(cacheKey, pngDataUrl)
          console.log('✅ SVG rendered to PNG, size:', pngDataUrl.length, 'bytes')
          
          resolve(pngDataUrl)
        } catch (e) {
          URL.revokeObjectURL(svgBlobUrl)
          reject(e)
        }
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        URL.revokeObjectURL(svgBlobUrl)
        reject(new Error('Failed to load SVG for rendering'))
      }
      
      img.src = svgBlobUrl
    })
  }

  /**
   * Replace title text elements with a pre-rendered PNG image
   */
  async function replaceTitleWithImage(svgElement: SVGSVGElement, config: TitleImageConfig): Promise<void> {
    console.log('🖼️ Replacing title with pre-rendered PNG:', config.svgPath)
    
    // Remove any existing title replacement
    const existingReplacement = svgElement.querySelector('#wedding-title-replacement')
    if (existingReplacement) {
      existingReplacement.remove()
      console.log('🗑️ Removed existing title replacement')
    }
    
    // Hide original text elements (do NOT remove; removal makes custom headings impossible later)
    config.targetElementIds.forEach(id => {
      const element = svgElement.querySelector(`#${id}`) as SVGGraphicsElement | null
      if (element) {
        if (!element.hasAttribute('data-orig-display')) {
          element.setAttribute('data-orig-display', element.getAttribute('display') ?? '')
        }
        element.setAttribute('display', 'none')
        element.setAttribute('data-title-hidden', 'true')
        console.log(`🙈 Hiding original title text: #${id}`)
      }
    })
    
    // Calculate final dimensions
    const finalWidth = config.position.width * config.scale
    const finalHeight = config.position.height * config.scale
    
    // Build full URL for the SVG
    const fullUrl = config.svgPath.startsWith('/') 
      ? window.location.origin + config.svgPath 
      : config.svgPath
    
    try {
      // Render SVG to PNG with optional color
      const pngDataUrl = await renderSvgToPng(fullUrl, finalWidth, finalHeight, config.color)
      
      // Create image element with the PNG data URL
      const titleImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      titleImage.setAttribute('id', 'wedding-title-replacement')
      titleImage.setAttribute('x', String(config.position.x))
      titleImage.setAttribute('y', String(config.position.y))
      titleImage.setAttribute('width', String(finalWidth))
      titleImage.setAttribute('height', String(finalHeight))
      titleImage.setAttribute('href', pngDataUrl)
      titleImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', pngDataUrl)
      titleImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      
      // Store the SVG path for potential color updates later
      titleImage.setAttribute('data-svg-path', config.svgPath)
      titleImage.setAttribute('data-color', config.color || '')
      
      // Insert the image into the SVG
      const namesGroup = svgElement.querySelector('#wedding-names-group')
      if (namesGroup) {
        svgElement.insertBefore(titleImage, namesGroup)
      } else {
        svgElement.appendChild(titleImage)
      }
      
      console.log('✅ Title PNG image inserted into SVG')
    } catch (error) {
      console.error('❌ Failed to render title:', error)
      // Fallback: use SVG directly (may not export properly but will show in preview)
      const titleImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      titleImage.setAttribute('id', 'wedding-title-replacement')
      titleImage.setAttribute('x', String(config.position.x))
      titleImage.setAttribute('y', String(config.position.y))
      titleImage.setAttribute('width', String(finalWidth))
      titleImage.setAttribute('height', String(finalHeight))
      titleImage.setAttribute('href', fullUrl)
      titleImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', fullUrl)
      titleImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      
      const namesGroup = svgElement.querySelector('#wedding-names-group')
      if (namesGroup) {
        svgElement.insertBefore(titleImage, namesGroup)
      } else {
        svgElement.appendChild(titleImage)
      }
      console.log('⚠️ Fallback: Using SVG URL directly')
    }
  }

  /**
   * Restore original title text elements (remove replacement image)
   */
  function restoreTitleTextElements(svgElement: SVGSVGElement, targetElementIds: string[]): void {
    // Remove any existing title replacement image
    const existingReplacement = svgElement.querySelector('#wedding-title-replacement')
    if (existingReplacement) {
      existingReplacement.remove()
      console.log('🗑️ Removed title replacement (restoring text heading)')
    }

    // Restore original title text elements visibility
    targetElementIds.forEach(id => {
      const element = svgElement.querySelector(`#${id}`) as SVGGraphicsElement | null
      if (!element) return

      const origDisplay = element.getAttribute('data-orig-display')
      if (origDisplay === null) {
        element.removeAttribute('display')
      } else if (origDisplay === '') {
        element.removeAttribute('display')
      } else {
        element.setAttribute('display', origDisplay)
      }

      element.removeAttribute('data-title-hidden')
    })
  }

  /**
   * Update the title color (re-renders the title with new color)
   */
  async function updateTitleColor(svgElement: SVGSVGElement, newColor: string): Promise<void> {
    const titleImage = svgElement.querySelector('#wedding-title-replacement') as SVGImageElement
    if (!titleImage) {
      console.log('⚠️ No title image to update color')
      return
    }
    
    const svgPath = titleImage.getAttribute('data-svg-path')
    if (!svgPath) {
      console.log('⚠️ Title image missing SVG path, cannot update color')
      return
    }
    
    const width = parseFloat(titleImage.getAttribute('width') || '1800')
    const height = parseFloat(titleImage.getAttribute('height') || '900')
    
    const fullUrl = svgPath.startsWith('/') 
      ? window.location.origin + svgPath 
      : svgPath
    
    try {
      const pngDataUrl = await renderSvgToPng(fullUrl, width, height, newColor)
      titleImage.setAttribute('href', pngDataUrl)
      titleImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', pngDataUrl)
      titleImage.setAttribute('data-color', newColor)
      console.log('✅ Title color updated to:', newColor)
    } catch (error) {
      console.error('❌ Failed to update title color:', error)
    }
  }

  return {
    // Data
    TITLE_LIBRARY,
    
    // Functions
    findMatchingTitle,
    renderSvgToPng,
    replaceTitleWithImage,
    restoreTitleTextElements,
    updateTitleColor,
    clearTitleImageCache,
  }
}
