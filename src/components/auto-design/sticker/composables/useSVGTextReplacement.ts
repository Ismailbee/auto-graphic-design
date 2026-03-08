/**
 * SVG Text Replacement Composable
 * 
 * Handles dynamic replacement of SVG text elements with SVG graphics
 * based on keywords in the description field.
 * 
 * Use Case: Replace "Alhamdulillahi ON YOUR WEDDING CEREMONY" text
 * with a decorative Nikkah SVG graphic when description contains
 * both "congratulation" and "nikkah" keywords.
 */

import { ref, Ref } from 'vue'
import { CGWC_TITLE_SVG } from './inlineSvgs'

// Map of SVG file paths to inline content
const INLINE_SVG_MAP: Record<string, string> = {
  '/svg/Header_tittle/CongratCeremony/cgwc.svg': CGWC_TITLE_SVG,
  '/weddigTitles/cgwc.svg': CGWC_TITLE_SVG,
  '/weddigTitles/stikertitle.svg': CGWC_TITLE_SVG
}

export interface ReplacementConfig {
  // Keywords to detect (case-insensitive)
  keywords: string[]
  // SVG files to choose from
  svgFiles: string[]
  // Element IDs to replace
  targetElementIds: string[]
  // Position and size for the replacement
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  // Optional: Scale factor for the SVG (default 1.0)
  scale?: number
  // Optional: Title color to apply (changes fill colors in injected SVG)
  titleColor?: string
}

export interface ReplacementState {
  isReplaced: boolean
  selectedSvgFile: string | null
  originalElements: Map<string, { element: SVGElement; parent: SVGElement | null }>
}

export function useSVGTextReplacement() {
  // Version: 2025-11-12-15:30 - FORCE BROWSER CACHE REFRESH
  const replacementState = ref<ReplacementState>({
    isReplaced: false,
    selectedSvgFile: null,
    originalElements: new Map()
  })

  /**
   * Check if description contains all required keywords (case-insensitive)
   */
  const hasAllKeywords = (description: string, keywords: string[]): boolean => {
    const safeDesc = typeof description === 'string' ? description : String((description as any) ?? '')
    const safeKeywords = Array.isArray(keywords)
      ? keywords.map(k => (typeof k === 'string' ? k : String((k as any) ?? '')))
      : []

    if (!safeDesc || safeKeywords.length === 0) {
      console.log(`❌ hasAllKeywords: Invalid input - description: "${safeDesc}", keywords:`, safeKeywords)
      return false
    }

    const lowerDesc = safeDesc.toLowerCase()
    console.log(`🔍 hasAllKeywords checking description: "${lowerDesc}"`)
    console.log(`🔍 Keywords to check:`, safeKeywords)
    
    const result = safeKeywords.every(keyword => {
      const keywordLower = keyword.toLowerCase()
      const found = lowerDesc.includes(keywordLower)
      console.log(`  - Checking keyword "${keyword}": ${found ? '✅ FOUND' : '❌ NOT FOUND'}`)
      return found
    })
    
    console.log(`📊 hasAllKeywords result: ${result ? '✅ ALL KEYWORDS FOUND' : '❌ SOME KEYWORDS MISSING'}`)
    return result
  }

  /**
   * Select a random SVG file from the available options
   */
  const selectRandomSvg = (svgFiles: string[]): string => {
    if (svgFiles.length === 0) {
      throw new Error('No SVG files available for replacement')
    }
    
    const randomIndex = Math.floor(Math.random() * svgFiles.length)
    return svgFiles[randomIndex]
  }

  /**
   * Store original elements before replacement for potential restoration
   */
  const storeOriginalElements = (
    svgElement: SVGSVGElement,
    elementIds: string[]
  ): void => {
    replacementState.value.originalElements.clear()
    
    elementIds.forEach(id => {
      const element = svgElement.querySelector(`#${id}`) as SVGElement
      if (element) {
        replacementState.value.originalElements.set(id, {
          element: element.cloneNode(true) as SVGElement,
          parent: element.parentElement
        })
      }
    })
  }

  /**
   * Calculate scaled dimensions for the replacement SVG
   * to fit within the target space while maintaining aspect ratio
   */
  const calculateScaledDimensions = (
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number
  ): { width: number; height: number; scale: number } => {
    const scaleX = targetWidth / originalWidth
    const scaleY = targetHeight / originalHeight
    const scale = Math.min(scaleX, scaleY) // Use smaller scale to fit within bounds
    
    return {
      width: originalWidth * scale,
      height: originalHeight * scale,
      scale
    }
  }

  /**
   * Replace text elements with an SVG image element
   */
  const replaceWithSvgImage = async (
    svgElement: SVGSVGElement,
    config: ReplacementConfig
  ): Promise<boolean> => {
    try {
      console.log('🎨 Starting SVG replacement process... VERSION: 2025-12-14-FIX-DUPLICATES')
      console.log('🔗 SVG Path to fetch:', config.svgFiles[0])
      
      // CRITICAL: Remove any existing title replacement group FIRST to prevent duplicates
      const existingReplacement = svgElement.querySelector('#wedding-title-replacement')
      if (existingReplacement) {
        console.log('🗑️ Removing existing title replacement group to prevent duplicates')
        existingReplacement.remove()
      }
      
      // Also remove existing title styles
      const existingStyles = svgElement.querySelector('#wedding-title-styles')
      if (existingStyles) {
        existingStyles.remove()
      }
      
      // Store original elements first
      storeOriginalElements(svgElement, config.targetElementIds)

      // ALWAYS use the SVG file from config - don't use cached value
      const selectedSvg = config.svgFiles[0]
      replacementState.value.selectedSvgFile = selectedSvg
      console.log('📁 Selected SVG file:', selectedSvg)

      // Check if we have an inline SVG for this path
      let svgText: string
      if (INLINE_SVG_MAP[selectedSvg]) {
        console.log('✅ Using inline SVG for:', selectedSvg)
        svgText = INLINE_SVG_MAP[selectedSvg]
      } else {
        // Fetch the SVG file content with full URL
        // In development, paths like /svg/Header_tittle/CongratCeremony/cgwc.svg are served from public folder
        const fullUrl = selectedSvg.startsWith('/') ? window.location.origin + selectedSvg : selectedSvg
        console.log('🔗 Full URL to fetch:', fullUrl)
        
        let response: Response
        try {
          response = await fetch(fullUrl, { 
            method: 'GET',
            cache: 'no-cache',
            headers: { 'Accept': 'image/svg+xml, */*' }
          })
        } catch (fetchError) {
          console.error(`❌ Network error fetching SVG: ${fullUrl}`, fetchError)
          return false
        }
        
        if (!response.ok) {
          console.error(`❌ Failed to fetch SVG: ${fullUrl}`, response.status, response.statusText)
          return false
        }

        svgText = await response.text()
      }
      console.log('✅ SVG content loaded, length:', svgText.length)
      console.log('📄 First 300 chars:', svgText.substring(0, 300))
      
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
      const fetchedSvg = svgDoc.querySelector('svg')

      // Check for parsing errors
      const parserError = svgDoc.querySelector('parsererror')
      if (parserError) {
        console.error('❌ XML parsing error:', parserError.textContent)
        return false
      }

      if (!fetchedSvg) {
        console.error('❌ Invalid SVG file - no <svg> element found')
        console.log('📄 Document body:', svgDoc.documentElement?.outerHTML?.substring(0, 500))
        return false
      }

      console.log('✅ SVG parsed successfully')
      
      // Get the viewBox to understand the content's coordinate system
      const viewBoxAttr = fetchedSvg.getAttribute('viewBox')
      let viewBoxOffsetX = 0
      let viewBoxOffsetY = 0
      let svgWidth = parseFloat(fetchedSvg.getAttribute('width') || '0')
      let svgHeight = parseFloat(fetchedSvg.getAttribute('height') || '0')
      
      if (viewBoxAttr) {
        const parts = viewBoxAttr.split(/[\s,]+/).map(Number)
        if (parts.length >= 4) {
          viewBoxOffsetX = parts[0] // min-x
          viewBoxOffsetY = parts[1] // min-y
          svgWidth = parts[2] // width
          svgHeight = parts[3] // height
        }
        console.log('📐 ViewBox parsed:', { viewBoxOffsetX, viewBoxOffsetY, svgWidth, svgHeight })
      }

      // Remove original text elements - use AGGRESSIVE removal to ensure no duplicates
      console.log('🗑️ Removing original text elements:', config.targetElementIds)
      config.targetElementIds.forEach(id => {
        // Try multiple selector approaches to ensure we find the element
        const element = svgElement.querySelector(`#${id}`) || 
                       svgElement.querySelector(`[id="${id}"]`)
        if (element) {
          console.log(`  ✅ Removing element: #${id}`)
          // First hide it as a failsafe
          ;(element as HTMLElement).style.display = 'none'
          ;(element as HTMLElement).style.visibility = 'hidden'
          element.setAttribute('opacity', '0')
          // Then remove it completely
          element.remove()
        } else {
          console.log(`  ⚠️ Element not found: #${id}`)
        }
      })

      // Create a group element to hold the embedded SVG content
      const groupElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      groupElement.setAttribute('id', 'wedding-title-replacement')
      
      // Calculate the correct position accounting for viewBox offset
      // The position.x and position.y are where we want the content to appear in the parent SVG
      // We need to offset by the negative of the viewBox min values to align content at 0,0 first
      const translateX = config.position.x - viewBoxOffsetX
      const translateY = config.position.y - viewBoxOffsetY
      
      // Get scale factor (default to 1.0 if not specified)
      const scaleFactor = config.scale || 1.0
      
      // Set transform to position and scale the group
      // Order matters: translate first, then scale
      groupElement.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scaleFactor})`)
      
      console.log('📐 Created group element with transform:', groupElement.getAttribute('transform'), 
                  { positionX: config.position.x, positionY: config.position.y, viewBoxOffsetX, viewBoxOffsetY, scaleFactor })

      // Copy all child elements from the fetched SVG into the group
      // First, handle styles separately - move them to parent SVG's defs
      Array.from(fetchedSvg.children).forEach(child => {
        if (child.tagName.toLowerCase() === 'style') {
          // Rename classes in the style content to avoid conflicts
          let styleContent = child.textContent || ''
          
          // Prefix all class names with 'title-' to avoid conflicts
          styleContent = styleContent.replace(/\.fil0/g, '.title-fil0')
          styleContent = styleContent.replace(/\.fil1/g, '.title-fil1')
          styleContent = styleContent.replace(/\.fil2/g, '.title-fil2')
          styleContent = styleContent.replace(/\.fnt0/g, '.title-fnt0')
          styleContent = styleContent.replace(/\.fnt1/g, '.title-fnt1')
          
          // IMPORTANT: Override fill colors if titleColor is specified
          // This changes the injected title SVG colors to match the background
          if (config.titleColor) {
            console.log(`🎨 Applying title color override: ${config.titleColor}`)
            // Replace fill colors in style rules (common patterns in title SVGs)
            // Match fill:#XXXXXX or fill: #XXXXXX patterns
            styleContent = styleContent.replace(/fill:\s*#[0-9A-Fa-f]{3,6}/g, `fill:${config.titleColor}`)
            // Also handle rgb() colors
            styleContent = styleContent.replace(/fill:\s*rgb\([^)]+\)/g, `fill:${config.titleColor}`)
          }
          
          console.log('📝 Processing title SVG styles with prefixed classes')
          
          // Create new style element for the parent SVG
          const newStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style')
          newStyle.setAttribute('id', 'wedding-title-styles')
          newStyle.textContent = styleContent
          
          // Remove any existing title styles first
          const existingTitleStyle = svgElement.querySelector('#wedding-title-styles')
          if (existingTitleStyle) {
            existingTitleStyle.remove()
          }
          
          // Add to parent SVG defs or directly to SVG if no defs
          let defs = svgElement.querySelector('defs')
          if (defs) {
            defs.appendChild(newStyle)
          } else {
            // Insert at beginning of SVG
            svgElement.insertBefore(newStyle, svgElement.firstChild)
          }
          console.log('✅ Title SVG styles added to parent SVG')
        }
      })
      
      // Now copy non-style children to the group
      Array.from(fetchedSvg.children).forEach(child => {
        // Skip style elements as they're already handled
        if (child.tagName.toLowerCase() === 'style') {
          return
        }
        
        const clonedChild = child.cloneNode(true)
        
        // Recursively update class attributes to use prefixed names
        // AND apply title color override to inline fill attributes
        const updateElementAttributes = (el: Element) => {
          // Update class names with prefix
          if (el.hasAttribute('class')) {
            let cls = el.getAttribute('class') || ''
            cls = cls.replace(/\bfil0\b/g, 'title-fil0')
            cls = cls.replace(/\bfil1\b/g, 'title-fil1')
            cls = cls.replace(/\bfil2\b/g, 'title-fil2')
            cls = cls.replace(/\bfnt0\b/g, 'title-fnt0')
            cls = cls.replace(/\bfnt1\b/g, 'title-fnt1')
            el.setAttribute('class', cls)
          }
          
          // Override inline fill attribute if titleColor is specified
          if (config.titleColor && el.hasAttribute('fill')) {
            const currentFill = el.getAttribute('fill')
            // Only override if it's a color value (not 'none' or a URL reference like 'url(#gradient)')
            if (currentFill && currentFill !== 'none' && !currentFill.startsWith('url(')) {
              el.setAttribute('fill', config.titleColor)
            }
          }
          
          // Also check for style attribute with fill
          if (config.titleColor && el.hasAttribute('style')) {
            let style = el.getAttribute('style') || ''
            style = style.replace(/fill:\s*#[0-9A-Fa-f]{3,6}/g, `fill:${config.titleColor}`)
            style = style.replace(/fill:\s*rgb\([^)]+\)/g, `fill:${config.titleColor}`)
            el.setAttribute('style', style)
          }
          
          Array.from(el.children).forEach(updateElementAttributes)
        }
        updateElementAttributes(clonedChild as Element)
        
        groupElement.appendChild(clonedChild)
      })
      
      console.log('✅ Copied', fetchedSvg.children.length, 'child elements into group')

      // Insert the group element
      const firstOriginal = replacementState.value.originalElements.get(config.targetElementIds[0])
      console.log('📍 Insertion point:', { 
        hasFirstOriginal: !!firstOriginal, 
        hasParent: !!firstOriginal?.parent,
        parentTagName: firstOriginal?.parent?.tagName
      })
      
      if (firstOriginal?.parent) {
        firstOriginal.parent.appendChild(groupElement)
        console.log('✅ Group appended to original parent:', firstOriginal.parent.tagName)
      } else {
        svgElement.appendChild(groupElement)
        console.log('✅ Group appended to SVG root')
      }

      replacementState.value.isReplaced = true
      console.log(`✅ SVG text replaced with embedded content from: ${selectedSvg}`)
      
      return true
    } catch (error) {
      console.error('❌ Error replacing SVG text:', error)
      return false
    }
  }

  /**
   * Restore original text elements
   */
  const restoreOriginalElements = (svgElement: SVGSVGElement): void => {
    if (!replacementState.value.isReplaced) return

    // Remove replacement group
    const replacementGroup = svgElement.querySelector('#wedding-title-replacement')
    if (replacementGroup) {
      replacementGroup.remove()
      console.log('🗑️ Removed replacement group')
    }

    // Restore original elements
    replacementState.value.originalElements.forEach((data, id) => {
      if (data.parent) {
        data.parent.appendChild(data.element.cloneNode(true))
        console.log(`✅ Restored element: #${id}`)
      }
    })

    replacementState.value.isReplaced = false
    replacementState.value.selectedSvgFile = null
    console.log('🔄 Original text elements restored')
  }

  /**
   * Main function to handle replacement based on description
   */
  const handleReplacement = async (
    description: string,
    svgElement: SVGSVGElement,
    config: ReplacementConfig
  ): Promise<void> => {
    const shouldReplace = hasAllKeywords(description, config.keywords)

    console.log('🔍 useSVGTextReplacement.handleReplacement:', {
      description,
      keywords: config.keywords,
      shouldReplace,
      isAlreadyReplaced: replacementState.value.isReplaced,
      currentSvgFile: replacementState.value.selectedSvgFile,
      newSvgFile: config.svgFiles[0]
    })

    if (shouldReplace) {
      // Check if we need to replace with a different SVG
      const needsReplacement = !replacementState.value.isReplaced || 
                              replacementState.value.selectedSvgFile !== config.svgFiles[0]
      
      if (needsReplacement) {
        // If already replaced with a different SVG, restore first
        if (replacementState.value.isReplaced && replacementState.value.selectedSvgFile !== config.svgFiles[0]) {
          console.log('🔄 Restoring before replacing with new SVG')
          restoreOriginalElements(svgElement)
        }
        
        // Replace text with SVG
        console.log(`🎨 Replacing with: ${config.svgFiles[0]}`)
        await replaceWithSvgImage(svgElement, config)
      } else {
        // Already replaced with same SVG - but check if color needs updating
        if (config.titleColor) {
          console.log(`🎨 Updating title color to: ${config.titleColor}`)
          updateTitleColor(svgElement, config.titleColor)
        } else {
          console.log('✅ Already replaced with the same SVG, skipping')
        }
      }
    } else if (!shouldReplace && replacementState.value.isReplaced) {
      // Restore original text
      console.log('🔄 Restoring original text elements')
      restoreOriginalElements(svgElement)
    } else {
      console.log('❌ Conditions not met for replacement')
    }
  }

  /**
   * Update the color of an already-injected title SVG
   * Used when background changes and title color needs to match
   */
  const updateTitleColor = (svgElement: SVGSVGElement, newColor: string): void => {
    if (!replacementState.value.isReplaced) {
      console.log('⚠️ No title SVG injected, cannot update color')
      return
    }

    console.log(`🎨 Updating injected title SVG color to: ${newColor}`)

    // Update the style element if it exists
    const titleStyles = svgElement.querySelector('#wedding-title-styles')
    if (titleStyles) {
      let styleContent = titleStyles.textContent || ''
      // Replace fill colors in style rules
      styleContent = styleContent.replace(/fill:\s*#[0-9A-Fa-f]{3,6}/g, `fill:${newColor}`)
      styleContent = styleContent.replace(/fill:\s*rgb\([^)]+\)/g, `fill:${newColor}`)
      titleStyles.textContent = styleContent
      console.log('✅ Updated title styles')
    }

    // Update inline fill attributes in the title group
    const titleGroup = svgElement.querySelector('#wedding-title-replacement')
    if (titleGroup) {
      const updateFillColors = (el: Element) => {
        if (el.hasAttribute('fill')) {
          const currentFill = el.getAttribute('fill')
          if (currentFill && currentFill !== 'none' && !currentFill.startsWith('url(')) {
            el.setAttribute('fill', newColor)
          }
        }
        // Also check style attribute
        if (el.hasAttribute('style')) {
          let style = el.getAttribute('style') || ''
          style = style.replace(/fill:\s*#[0-9A-Fa-f]{3,6}/g, `fill:${newColor}`)
          style = style.replace(/fill:\s*rgb\([^)]+\)/g, `fill:${newColor}`)
          el.setAttribute('style', style)
        }
        Array.from(el.children).forEach(updateFillColors)
      }
      updateFillColors(titleGroup)
      console.log('✅ Updated title group fill colors')
    }
  }

  /**
   * Reset replacement state (useful when loading a new template)
   */
  const resetReplacement = (): void => {
    replacementState.value = {
      isReplaced: false,
      selectedSvgFile: null,
      originalElements: new Map()
    }
  }

  return {
    replacementState,
    hasAllKeywords,
    handleReplacement,
    restoreOriginalElements,
    resetReplacement,
    updateTitleColor
  }
}

