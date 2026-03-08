/**
 * Flourish System Composable
 * 
 * Manages decorative flourish elements for stickers.
 * Handles flourish selection, color matching, and SVG insertion.
 */

import { ref, type Ref } from 'vue'
import { useTitleLibrary } from './useTitleLibrary'
import type { BackgroundPaletteKey } from '@/services/background/background.types'

// ========================================
// TYPES
// ========================================
export interface FlourishConfig {
  position: { x: number; y: number; width: number; height: number }
  scale: number
}

// ========================================
// FLOURISH DATA
// ========================================
const AVAILABLE_FLOURISHES = [
  '/assets/flourish/Yellow Green Pastel Islamic Frame Islamic Perspective on Daily Life Presentation.svg',
]

const DEFAULT_FLOURISH_CONFIG: FlourishConfig = {
  position: { x: 150, y: 780, width: 1200, height: 300 }, // Larger size, positioned left, above names
  scale: 1.0
}

// ========================================
// COMPOSABLE
// ========================================
export function useFlourishSystem(
  currentBackgroundFileName?: Ref<string>,
  currentBackgroundPaletteKey?: Ref<BackgroundPaletteKey>
) {
  const { renderSvgToPng } = useTitleLibrary()
  
  /**
   * Get a random flourish SVG path
   */
  function getRandomFlourish(): string {
    const randomIndex = Math.floor(Math.random() * AVAILABLE_FLOURISHES.length)
    console.log(`🌸 Selected flourish ${randomIndex + 1}/${AVAILABLE_FLOURISHES.length}: ${AVAILABLE_FLOURISHES[randomIndex]}`)
    return AVAILABLE_FLOURISHES[randomIndex]
  }

  /**
   * Get flourish color based on current background
   * Returns a color that complements the background
   */
  function getFlourishColorForBackground(backgroundFileName?: string, paletteKey?: BackgroundPaletteKey): string {
    const bgRaw: any = backgroundFileName ?? currentBackgroundFileName?.value
    const bgFile = typeof bgRaw === 'string' ? bgRaw : String(bgRaw ?? '')
    const pk = paletteKey || currentBackgroundPaletteKey?.value
    if (!bgFile) {
      return '#FFD700' // Default gold
    }

    // If we know the palette, prefer it (works for remote URLs too)
    if (pk === 'dark') return '#FFD700' // Gold pops on dark
    if (pk === 'light') return '#B8860B' // Dark goldenrod on light
    if (pk === 'redGold') return '#FFD700' // Gold
    
    const lowerName = bgFile.toLowerCase()
    
    // Beige Gold Gradient - Dark gold/bronze
    if (lowerName.includes('beige gold gradient')) {
      return '#B8860B' // Dark Goldenrod
    }
    
    // Blue Futuristic - Cyan or electric blue
    if (lowerName.includes('blue futuristic')) {
      return '#00CED1' // Dark Turquoise
    }
    
    // Blue Yellow Modern - Yellow/amber accent
    if (lowerName.includes('blue yellow modern')) {
      return '#F59E0B' // Amber
    }
    
    // Deep Green - Gold
    if (lowerName.includes('deep green')) {
      return '#FFD700' // Gold
    }
    
    // Red and Gold Chinese themes - Gold
    if (lowerName.includes('red and gold chinese new year')) {
      return '#FFD700' // Gold
    }
    
    if (lowerName.includes('red and gold classic lunar chinese')) {
      return '#FFD700' // Gold
    }
    
    if (lowerName.includes('red and gold modern chinese')) {
      return '#FFD700' // Gold
    }
    
    // Red and Gold Simple Elegant - Gold
    if (lowerName.includes('red and gold simple elegant')) {
      return '#DAA520' // Goldenrod
    }
    
    // BackgroundColour.svg - Dark blue to contrast with yellow/gold background
    if (lowerName.includes('backgroundcolour')) {
      return '#000066' // Dark blue (matches the accent shapes in the background)
    }
    
    // Default: Gold
    return '#FFD700'
  }

  /**
   * Insert flourish SVG above the names
   * Renders SVG to PNG with the appropriate color for the background
   */
  async function insertFlourishAboveNames(
    svgElement: SVGSVGElement, 
    color?: string,
    config: FlourishConfig = DEFAULT_FLOURISH_CONFIG
  ): Promise<void> {
    console.log('🌸 Inserting flourish above names...')
    
    // Remove any existing flourish
    const existingFlourish = svgElement.querySelector('#wedding-flourish')
    if (existingFlourish) {
      existingFlourish.remove()
      console.log('🗑️ Removed existing flourish')
    }
    
    // Get the color based on background
    const flourishColor = color || getFlourishColorForBackground()
    console.log('🎨 Flourish color:', flourishColor)
    
    // Calculate final dimensions
    const finalWidth = config.position.width * config.scale
    const finalHeight = config.position.height * config.scale
    
    // Get a random flourish SVG
    const randomFlourishPath = getRandomFlourish()
    
    // Build full URL
    const fullUrl = randomFlourishPath.startsWith('/') 
      ? window.location.origin + randomFlourishPath 
      : randomFlourishPath
    
    try {
      // Render SVG to PNG with color
      const pngDataUrl = await renderSvgToPng(fullUrl, finalWidth, finalHeight, flourishColor)
      
      // Create image element
      const flourishImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      flourishImage.setAttribute('id', 'wedding-flourish')
      flourishImage.setAttribute('x', String(config.position.x))
      flourishImage.setAttribute('y', String(config.position.y))
      flourishImage.setAttribute('width', String(finalWidth))
      flourishImage.setAttribute('height', String(finalHeight))
      flourishImage.setAttribute('href', pngDataUrl)
      flourishImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', pngDataUrl)
      flourishImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      flourishImage.setAttribute('data-svg-path', randomFlourishPath)
      flourishImage.setAttribute('data-color', flourishColor)
      
      // Find the names group and insert flourish before it (above in visual layer)
      const namesGroup = svgElement.querySelector('#wedding-names-group')
      if (namesGroup) {
        svgElement.insertBefore(flourishImage, namesGroup)
        console.log('✅ Flourish inserted above names group')
      } else {
        // Fallback: append to SVG
        svgElement.appendChild(flourishImage)
        console.log('✅ Flourish appended to SVG (names group not found)')
      }
      
      console.log(`✅ Flourish inserted at (${config.position.x}, ${config.position.y}) size: ${finalWidth}x${finalHeight}`)
    } catch (error) {
      console.error('❌ Failed to insert flourish:', error)
    }
  }

  /**
   * Update flourish color (re-renders with new color)
   */
  async function updateFlourishColor(svgElement: SVGSVGElement, newColor: string): Promise<void> {
    const flourishImage = svgElement.querySelector('#wedding-flourish') as SVGImageElement
    if (!flourishImage) {
      console.log('⚠️ No flourish to update color')
      return
    }
    
    // Get the SVG path from the data attribute (stored when flourish was created)
    const svgPath = flourishImage.getAttribute('data-svg-path')
    if (!svgPath) {
      console.log('⚠️ Flourish missing SVG path, cannot update color')
      return
    }
    
    const width = parseFloat(flourishImage.getAttribute('width') || '1100')
    const height = parseFloat(flourishImage.getAttribute('height') || '275')
    
    const fullUrl = svgPath.startsWith('/') 
      ? window.location.origin + svgPath 
      : svgPath
    
    try {
      const pngDataUrl = await renderSvgToPng(fullUrl, width, height, newColor)
      flourishImage.setAttribute('href', pngDataUrl)
      flourishImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', pngDataUrl)
      flourishImage.setAttribute('data-color', newColor)
      console.log('✅ Flourish color updated to:', newColor)
    } catch (error) {
      console.error('❌ Failed to update flourish color:', error)
    }
  }

  /**
   * Remove flourish from SVG
   */
  function removeFlourish(svgElement: SVGSVGElement): void {
    const existingFlourish = svgElement.querySelector('#wedding-flourish')
    if (existingFlourish) {
      existingFlourish.remove()
      console.log('🗑️ Removed flourish')
    }
  }

  return {
    // Data
    AVAILABLE_FLOURISHES,
    DEFAULT_FLOURISH_CONFIG,
    
    // Functions
    getRandomFlourish,
    getFlourishColorForBackground,
    insertFlourishAboveNames,
    updateFlourishColor,
    removeFlourish,
  }
}
