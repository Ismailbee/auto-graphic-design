/**
 * Template Utilities
 * 
 * Extracted from StickerTemplatePanel.vue for better maintainability.
 * Handles SVG template loading and description processing.
 */

import { nextTick, type Ref } from 'vue'
import { applyTitleColors } from '../composables/useTitleColors'
import type { BackgroundPaletteKey } from '@/services/background/background.types'

// Types
export interface TitleMatch {
  svgPath: string
  fallbackText?: string
  position?: { x: number; y: number; width: number; height: number }
  scale?: number
}

export interface TitleImageConfig {
  svgPath: string
  targetElementIds: string[]
  position: { x: number; y: number; width: number; height: number }
  scale: number
  color: string
}

export interface TemplateContext {
  weddingPreviewContainer: Ref<HTMLDivElement | null>
  formData: { description: string; customSize?: string }
  accumulatedDescription: Ref<string>
  customHeading: Ref<string | null>
  selectedHeadingFont: Ref<string | null>
  selectedCategory: Ref<string | null>
  currentBackgroundFileName: Ref<string>
  currentBackgroundPaletteKey: Ref<BackgroundPaletteKey>
  
  // Functions
  resetReplacement: () => void
  getSVGElements: (svg: SVGSVGElement | null) => any
  findMatchingTitle: (text: string) => TitleMatch | null
  getTitleColorForBackground: () => string
  getFlourishColorForBackground: () => string
  replaceTitleWithImage: (svg: SVGSVGElement, config: TitleImageConfig) => Promise<void>
  restoreTitleTextElements: (svg: SVGSVGElement, ids: string[]) => void
  insertFlourishAboveNames: (svg: SVGSVGElement, color: string) => Promise<void>
  updateStickerText: (desc: string, elements: any) => Promise<any>
  updateValidationWarnings: (data: any) => void
  updateSVGWithImages: () => void
  applyCustomHeadingUtil: (svg: SVGSVGElement, heading: string | null) => void
  applyHeadingFontUtil: (svg: SVGSVGElement, font: string | null) => void
  
  // Auth store for notifications
  authStore: {
    showNotification: (opts: { title: string; message: string; type: string }) => void
  }
  
  // Mutable state for svgElements
  setSvgElements: (elements: any) => void
  getSvgElementsRef: () => any
}

// Cache keys to avoid expensive re-renders during real-time updates
let lastWeddingTitleRenderKey = ''
let lastWeddingFlourishRenderKey = ''

/**
 * Reset the title render cache keys
 */
export function resetTitleRenderCache(): void {
  lastWeddingTitleRenderKey = ''
  lastWeddingFlourishRenderKey = ''
}

/**
 * Load the wedding sticker SVG template
 */
export async function loadWeddingStickerTemplateUtil(ctx: TemplateContext): Promise<void> {
  if (!ctx.weddingPreviewContainer.value) {
    console.error('❌ loadWeddingStickerTemplateUtil: weddingPreviewContainer is null')
    return
  }

  try {
    // Reset replacement state when loading new template
    ctx.resetReplacement()

    // Load SVG template from external file
    console.log('📄 loadWeddingStickerTemplateUtil: fetching template...')
    const response = await fetch('/templates/wedding-sticker-base.svg')
    
    if (!response.ok) {
      console.error('❌ loadWeddingStickerTemplateUtil: fetch failed', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })
      return
    }
    
    const svgText = await response.text()
    console.log('✅ loadWeddingStickerTemplateUtil: template loaded', {
      length: svgText.length,
      startsWithSvg: svgText.trim().startsWith('<svg')
    })

    // Insert SVG into container
    ctx.weddingPreviewContainer.value.innerHTML = svgText
    
    // Force immediate DOM update
    await nextTick()
    await nextTick() // Double nextTick to ensure Vue has fully updated
    
    // Force a reflow to ensure the browser has rendered
    if (ctx.weddingPreviewContainer.value) {
      void ctx.weddingPreviewContainer.value.offsetHeight
    }

    // Get SVG element and its text elements
    const svgElement = ctx.weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    
    if (!svgElement) {
      return
    }
    
    // Set responsive dimensions based on viewBox aspect ratio
    const viewBox = svgElement.getAttribute('viewBox')
    if (viewBox) {
      const parts = viewBox.split(/\s+|,/).map(Number)
      if (parts.length >= 4) {
        svgElement.setAttribute('width', '100%')
        svgElement.removeAttribute('height')
        svgElement.setAttribute('data-original-viewbox', viewBox)
      }
    } else if (!svgElement.hasAttribute('viewBox')) {
      const width = svgElement.getAttribute('width') || '2996.9'
      const height = svgElement.getAttribute('height') || '1685.75'
      svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }

    const svgElements = ctx.getSVGElements(svgElement)
    console.log('🗓️ [loadTemplate] SVG Elements captured:', {
      dateText: svgElements.dateText,
      dateTextId: svgElements.dateText?.id,
      courtesyText: svgElements.courtesyText,
      courtesyTextId: svgElements.courtesyText?.id,
      directQueryDate: svgElement.querySelector('#date-text'),
      directQueryCourtesy: svgElement.querySelector('#courtesy-text')
    })
    ctx.setSvgElements(svgElements)

    // INJECT the stikertitle.svg title graphic
    // COMPLETELY REMOVE old text elements (not just hide)
    const titleElements = ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text']
    titleElements.forEach(id => {
      const el = svgElement.querySelector(`#${id}`)
      if (el) {
        el.remove()
      }
    })
    
    // Remove any existing title replacement and add new one
    const existingReplacement = svgElement.querySelector('#wedding-title-replacement')
    if (existingReplacement) {
      existingReplacement.remove()
    }
    
    // Inject the stikertitle.svg title
    try {
      console.log('🎯 Fetching stikertitle.svg...')
      const titleResponse = await fetch('/weddigTitles/stikertitle.svg')
      console.log('🎯 Title fetch response:', titleResponse.ok, titleResponse.status)
      
      if (titleResponse.ok) {
        const titleSvgText = await titleResponse.text()
        console.log('🎯 Title SVG text length:', titleSvgText.length)
        
        const parser = new DOMParser()
        const titleDoc = parser.parseFromString(titleSvgText, 'image/svg+xml')
        const titleSvg = titleDoc.querySelector('svg')
        
        console.log('🎯 Parsed title SVG:', !!titleSvg)
        
        if (titleSvg) {
          // Create a group to hold the title
          const titleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          titleGroup.setAttribute('id', 'wedding-title-replacement')
          
          // Position to match old title location
          // Old title centered at x=850.45, y from 280-710 (center ~495)
          // stikertitle.svg is 262.57 x 124.4
          // With scale(4): 1050 x 498
          // Moved slightly left for better centering
          titleGroup.setAttribute('transform', 'translate(280, 200) scale(4)')
          
          // Copy defs first if they exist (fonts, styles, etc.)
          const titleDefs = titleSvg.querySelector('defs')
          if (titleDefs) {
            let svgDefs = svgElement.querySelector('defs')
            if (!svgDefs) {
              svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
              svgElement.insertBefore(svgDefs, svgElement.firstChild)
            }
            // Copy all defs content
            Array.from(titleDefs.children).forEach(child => {
              svgDefs!.appendChild(child.cloneNode(true))
            })
            console.log('🎯 Copied defs from title SVG')
          }
          
          // Copy the main content group (Layer_x0020_1 or similar)
          const layerGroup = titleSvg.querySelector('g[id]')
          if (layerGroup) {
            titleGroup.appendChild(layerGroup.cloneNode(true))
            console.log('🎯 Copied layer group:', layerGroup.id)
          } else {
            // Copy all non-defs children
            Array.from(titleSvg.children).forEach(child => {
              if (child.tagName.toLowerCase() !== 'defs') {
                titleGroup.appendChild(child.cloneNode(true))
              }
            })
            console.log('🎯 Copied all non-defs children')
          }
          
          // Find insertion point - after defs but before other content
          const svgDefs = svgElement.querySelector('defs')
          if (svgDefs && svgDefs.nextSibling) {
            svgElement.insertBefore(titleGroup, svgDefs.nextSibling)
          } else {
            svgElement.appendChild(titleGroup)
          }
          
          console.log('🎯 Title group inserted with transform:', titleGroup.getAttribute('transform'))
          console.log('🎯 Title group children:', titleGroup.children.length)
          
          // Apply title colors based on current background palette
          const paletteKey = ctx.currentBackgroundPaletteKey?.value || 'dark'
          applyTitleColors(titleGroup, paletteKey)
          console.log('🎨 Title colors applied for palette:', paletteKey)
        }
      } else {
        console.warn('🎯 Failed to fetch stikertitle.svg:', titleResponse.status)
      }
    } catch (e) {
      console.warn('Could not load title SVG:', e)
    }

    // Insert flourish above names
    try {
      const flourishColor = ctx.getFlourishColorForBackground()
      await ctx.insertFlourishAboveNames(svgElement, flourishColor)
    } catch (e) {
      // Non-fatal
    }

    // Apply current description if any (for names, date, etc.)
    if (ctx.formData.description) {
      console.log('🗓️ [loadTemplate] Updating text with description:', ctx.formData.description.substring(0, 50))
      console.log('🗓️ [loadTemplate] svgElements.dateText:', svgElements.dateText)
      console.log('🗓️ [loadTemplate] svgElements.courtesyText:', svgElements.courtesyText)
      await ctx.updateStickerText(ctx.formData.description, svgElements)
      
      // Double-check: directly update date and courtesy elements if they exist in DOM
      const dateEl = svgElement.querySelector('#date-text') as SVGTextElement
      const courtesyEl = svgElement.querySelector('#courtesy-text') as SVGTextElement
      console.log('🗓️ [loadTemplate] Direct query after update - dateEl:', dateEl, 'content:', dateEl?.textContent)
      console.log('🗓️ [loadTemplate] Direct query after update - courtesyEl:', courtesyEl, 'content:', courtesyEl?.textContent)
    }
  } catch (error) {
    ctx.authStore.showNotification({
      title: 'Template Load Failed',
      message: 'Failed to load wedding sticker template.',
      type: 'error'
    })
  }
}

/**
 * Apply custom heading and font to the SVG heading elements
 */
export function applyCustomHeadingAndFont(
  svgElement: SVGSVGElement,
  customHeading: string | null,
  selectedHeadingFont: string | null,
  applyCustomHeadingUtil: (svg: SVGSVGElement, heading: string | null) => void,
  applyHeadingFontUtil: (svg: SVGSVGElement, font: string | null) => void
): void {
  if (!customHeading && !selectedHeadingFont) return
  applyCustomHeadingUtil(svgElement, customHeading)
  applyHeadingFontUtil(svgElement, selectedHeadingFont)
}

/**
 * Process description input and update SVG in real-time
 */
export async function processDescriptionInputUtil(ctx: TemplateContext): Promise<void> {
  const svgElements = ctx.getSvgElementsRef()
  
  // Perform validation even if SVG elements are not loaded yet
  if (ctx.selectedCategory.value === 'wedding' && !svgElements) {
    // Pass null elements structure to avoid errors while validating
    const stickerData = await ctx.updateStickerText(ctx.formData.description, ctx.getSVGElements(null))
    ctx.updateValidationWarnings(stickerData)
  }
  
  // Update wedding sticker preview in real-time
  if (ctx.selectedCategory.value === 'wedding' && svgElements) {
    const svgElement = ctx.weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      // The old title elements have been removed and replaced with stikertitle.svg
      // No need to hide them since they're already removed in loadWeddingStickerTemplateUtil
      
      // Debug: Check date element
      console.log('🗓️ [processDescription] svgElements.dateText:', svgElements.dateText)
      console.log('🗓️ [processDescription] Direct query #date-text:', svgElement.querySelector('#date-text'))
      
      // Insert flourish above names with matching color
      const flourishColor = ctx.getFlourishColorForBackground()
      const flourishCacheKey = [flourishColor, ctx.currentBackgroundFileName.value || ''].join('|')
      const hasFlourish = !!svgElement.querySelector('#wedding-flourish')
      if (!hasFlourish || flourishCacheKey !== lastWeddingFlourishRenderKey) {
        lastWeddingFlourishRenderKey = flourishCacheKey
        await ctx.insertFlourishAboveNames(svgElement, flourishColor)
      }
      
      // Update text content (names, date, courtesy, blessing, occasion, event type, ceremony)
      // Re-query elements to ensure we have fresh references
      const freshElements = ctx.getSVGElements(svgElement)
      console.log('🗓️ [processDescription] freshElements.dateText:', freshElements.dateText)
      const stickerData = await ctx.updateStickerText(ctx.formData.description, freshElements)
      
      // Double-check date and courtesy after update
      const dateEl = svgElement.querySelector('#date-text') as SVGTextElement
      const courtesyEl = svgElement.querySelector('#courtesy-text') as SVGTextElement  
      console.log('🗓️ [processDescription] After update - dateEl content:', dateEl?.textContent)
      console.log('🗓️ [processDescription] After update - courtesyEl content:', courtesyEl?.textContent)
      
      // Update validation warnings
      if (stickerData) {
        ctx.updateValidationWarnings(stickerData)
      }

      // Apply custom heading and font if set
      applyCustomHeadingAndFont(
        svgElement,
        ctx.customHeading.value,
        ctx.selectedHeadingFont.value,
        ctx.applyCustomHeadingUtil,
        ctx.applyHeadingFontUtil
      )
    }
  }

  // Update SVG with embedded images in real-time
  ctx.updateSVGWithImages()
}
