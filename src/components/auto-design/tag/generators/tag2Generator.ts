/**
 * Tag Style 2 Generator (Corporate Blue)
 * Generates preview for tag2.svg template
 */

import { nextTick } from 'vue'
import type { TagFormData, ExtractedTagInfo } from '../types'
import { getSizeScale } from '../types'
import { centerText, wrapText, resetText, setTwoLineTitle, fitText, applyFieldOrder } from '../utils/tagTemplateUtils'

export interface Tag2Config {
  // Template info
  templateName: 'tag2.svg'
  displayName: 'Style 2 (Corporate)'
  
  // Colors
  primaryColor: '#000000'  // Black
  eventTypeColor: '#FFFFFF'  // White (on dark background)
  accentColor: '#008FDC'  // Light Blue
  
  // Layout - Updated to match new SVG (viewBox 69828.69 x 98757.71)
  viewBox: '0 0 69828.69 98757.71'
  width: 69828.69
  height: 98757.71
  centerX: 34914.345
  maxWidth: 59354.39  // 85% of width
  startY: number  // Starting position for content
  
  // Font settings
  fontFamily: 'Impact, Arial Narrow, sans-serif'
  eventFontFamily: 'AlternateGothic2 BT, Impact, Arial Narrow, sans-serif'
  letterSpacing: {
    title: 120,
    theme: 80,
    eventType: 240
  }
  
  // Scale factor (relative to tag.svg) - new SVG is ~4x larger
  fontScale: 13.78
}

export const TAG2_CONFIG: Tag2Config = {
  templateName: 'tag2.svg',
  displayName: 'Style 2 (Corporate)',
  primaryColor: '#000000',  // Black for org name, theme, logo title
  eventTypeColor: '#FFFFFF',
  accentColor: '#008FDC',
  viewBox: '0 0 69828.69 98757.71',
  width: 69828.69,
  height: 98757.71,
  centerX: 34914.345,
  maxWidth: 59354.39,
  startY: 32000,  // Brought up for better spacing
  fontFamily: 'Impact, Arial Narrow, sans-serif',
  eventFontFamily: 'AlternateGothic2 BT, Impact, Arial Narrow, sans-serif',
  letterSpacing: {
    title: 120,
    theme: 80,
    eventType: 240
  },
  fontScale: 13.78
}

/**
 * Calculate font size based on character count (scaled for tag2)
 */
function getTitleFontSize(charCount: number, scale: number): number {
  let base: number
  // Reduced font sizes for organization name by 25%
  if (charCount <= 8) base = 195  // 25% reduction from 260
  else if (charCount <= 12) base = 180  // 25% reduction from 240
  else if (charCount <= 15) base = 165  // 25% reduction from 220
  else if (charCount <= 20) base = 150  // 25% reduction from 200
  else if (charCount <= 25) base = 139  // 25% reduction from 185
  else if (charCount <= 30) base = 128  // 25% reduction from 170
  else if (charCount <= 40) base = 116  // 25% reduction from 155
  else base = Math.max(98, 195 - (charCount * 3))  // 25% reduction
  
  return Math.round(base * scale)
}

function getThemeFontSize(charCount: number, scale: number): number {
  let base: number
  // Calibrated for default X6
  if (charCount <= 5) base = 585
  else if (charCount <= 10) base = 507
  else if (charCount <= 15) base = 423
  else if (charCount <= 20) base = 358
  else if (charCount <= 25) base = 299
  else if (charCount <= 35) base = 247
  else if (charCount <= 45) base = 208
  else if (charCount <= 55) base = 176
  else if (charCount <= 70) base = 150
  else if (charCount <= 90) base = 130
  else if (charCount <= 110) base = 114
  else if (charCount <= 130) base = 101
  else base = Math.max(78, 585 - (charCount * 3.3))
  
  return Math.round(base * scale)
}

function getEventFontSize(charCount: number, scale: number): number {
  let base: number
  // Reduced font sizes to match updated SVG (base ~1146 for 8 chars)
  if (charCount <= 8) base = 1146
  else if (charCount <= 12) base = 950
  else if (charCount <= 16) base = 800
  else if (charCount <= 20) base = 680
  else if (charCount <= 25) base = 560
  else if (charCount <= 30) base = 470
  else base = Math.max(350, 1000 - (charCount * 20))
  
  return Math.round(base * scale)
}

/**
 * Get element bottom position
 */
function getElementBottom(el: SVGGraphicsElement): number {
  try {
    const box = el.getBBox()
    return box.y + box.height
  } catch {
    const y = parseFloat(el.getAttribute('y') || '0')
    const fontSize = parseFloat(el.getAttribute('font-size') || '0')
    return y + fontSize
  }
}

/**
 * Create dynamic text elements for tag2 (which only has event type in the SVG)
 */
function createTag2TextElements(svg: SVGSVGElement, config: Tag2Config) {
  const svgNS = 'http://www.w3.org/2000/svg'
  const layerGroup = svg.querySelector('g#Layer_x0020_1') || svg
  const darkRect = svg.querySelector('rect.fil1')
  
  // Create main title element
  let mainTitle = svg.querySelector('#main-title') as SVGTextElement
  if (!mainTitle) {
    mainTitle = document.createElementNS(svgNS, 'text') as SVGTextElement
    mainTitle.setAttribute('id', 'main-title')
    mainTitle.setAttribute('x', String(config.centerX))
    mainTitle.setAttribute('y', String(config.startY))
    mainTitle.setAttribute('text-anchor', 'middle')
    mainTitle.setAttribute('fill', config.primaryColor)
    
    if (darkRect) {
      layerGroup.insertBefore(mainTitle, darkRect)
    } else {
      layerGroup.appendChild(mainTitle)
    }
  }
  
  // Create theme element
  let subtitleLine1 = svg.querySelector('#theme-text') as SVGTextElement
  if (!subtitleLine1) {
    subtitleLine1 = document.createElementNS(svgNS, 'text') as SVGTextElement
    subtitleLine1.setAttribute('id', 'theme-text')
    subtitleLine1.setAttribute('x', String(config.centerX))
    subtitleLine1.setAttribute('y', String(config.startY + 1500))  // Will be repositioned dynamically
    subtitleLine1.setAttribute('text-anchor', 'middle')
    subtitleLine1.setAttribute('fill', config.primaryColor)
    
    if (darkRect) {
      layerGroup.insertBefore(subtitleLine1, darkRect)
    } else {
      layerGroup.appendChild(subtitleLine1)
    }
  }
  
  // Get existing event type element
  const eventType = svg.querySelector('text.fil0.fnt0') || svg.querySelector('text:not(#main-title):not(#theme-text)') as SVGTextElement
  
  return {
    svg,
    mainTitle,
    subtitleLine1,
    subtitleLine2: null,
    eventType: eventType as SVGTextElement | null
  }
}

/**
 * Generate Tag Style 2 preview
 */
export async function generateTag2(
  svg: SVGSVGElement,
  formData: TagFormData,
  extractedInfo: ExtractedTagInfo,
  hasUserImage: boolean,
  userImageSrc: string | null
): Promise<void> {
  const config = TAG2_CONFIG
  
  // Keep the white background rectangle as base
  const whiteRect = svg.querySelector('rect.fil0') as SVGRectElement
  if (whiteRect) {
    whiteRect.setAttribute('fill', '#FFFFFF')  // White background
    whiteRect.setAttribute('fill-opacity', '1')
  }
  
  // Add background image on top of white with opacity
  const svgNS = 'http://www.w3.org/2000/svg'
  let backgroundImg = svg.querySelector('#background-image') as SVGImageElement
  if (!backgroundImg) {
    backgroundImg = document.createElementNS(svgNS, 'image') as SVGImageElement
    backgroundImg.setAttribute('id', 'background-image')
    backgroundImg.setAttribute('x', '0')
    backgroundImg.setAttribute('y', '0')
    backgroundImg.setAttribute('width', String(config.width))
    backgroundImg.setAttribute('height', String(config.height))
    backgroundImg.setAttribute('preserveAspectRatio', 'xMidYMid slice')
    backgroundImg.setAttribute('opacity', '0.25')  // Faded wallpaper on white
    // Insert after white rect but before other elements
    const layerGroup = svg.querySelector('g#Layer_x0020_1')
    if (layerGroup && whiteRect && whiteRect.nextSibling) {
      layerGroup.insertBefore(backgroundImg, whiteRect.nextSibling)
    } else if (layerGroup) {
      layerGroup.insertBefore(backgroundImg, layerGroup.firstChild)
    }
  }
  backgroundImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/wallpaper1.jpg')
  
  // Create dynamic text elements for tag2
  const elements = createTag2TextElements(svg, config)
  const layerGroup = svg.querySelector('g#Layer_x0020_1') || svg

  // === LOGO (render first so we know its bottom Y) ===
  const logoSize = Math.round(800 * config.fontScale)
  let lastY = 14000  // Start at logo area

  if (hasUserImage && userImageSrc) {
    const logoY = 14000
    let logoImg = svg.querySelector('#user-logo') as SVGImageElement
    if (!logoImg) {
      logoImg = document.createElementNS(svgNS, 'image') as SVGImageElement
      logoImg.setAttribute('id', 'user-logo')
      logoImg.setAttribute('x', String(config.centerX - logoSize / 2))
      logoImg.setAttribute('y', String(logoY))
      logoImg.setAttribute('width', String(logoSize))
      logoImg.setAttribute('height', String(logoSize))
      logoImg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      layerGroup.appendChild(logoImg)
    }
    logoImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', userImageSrc)
    lastY = logoY + logoSize + 1500
  } else {
    // Remove logo if no image
    const oldLogo = svg.querySelector('#user-logo')
    if (oldLogo) oldLogo.remove()
    lastY = 14000
  }

  // === LOGO TITLE (positioned directly under logo) ===
  if (extractedInfo.logoTitle) {
    const logoTitleFontSize = Math.round(150 * config.fontScale * getSizeScale('logoTitle', extractedInfo.fieldSizes))
    let logoTitle = svg.querySelector('#logo-title') as SVGTextElement
    if (!logoTitle) {
      logoTitle = document.createElementNS(svgNS, 'text') as SVGTextElement
      logoTitle.setAttribute('id', 'logo-title')
      logoTitle.setAttribute('x', String(config.centerX))
      logoTitle.setAttribute('text-anchor', 'middle')
      logoTitle.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
      logoTitle.setAttribute('font-weight', 'bold')
      logoTitle.setAttribute('font-size', String(logoTitleFontSize))
      logoTitle.setAttribute('fill', '#000000')
      layerGroup.appendChild(logoTitle)
    }
    logoTitle.setAttribute('y', String(lastY))
    logoTitle.setAttribute('font-size', String(logoTitleFontSize))
    logoTitle.textContent = extractedInfo.logoTitle
    await nextTick()
    fitText(logoTitle, config.maxWidth * 0.85, Math.round(60 * config.fontScale), logoTitleFontSize)
    await nextTick()
    lastY = getElementBottom(logoTitle) + 2000
  } else {
    // Remove logoTitle if empty
    const oldLogoTitle = svg.querySelector('#logo-title')
    if (oldLogoTitle) oldLogoTitle.remove()
  }

  // Ensure orgName starts at reasonable Y even without logo
  lastY = Math.max(lastY, config.startY)

  // === MAIN TITLE (Organization Name) ===
  if (elements.mainTitle && formData.tagTitle) {
    elements.mainTitle.removeAttribute('class')
    elements.mainTitle.setAttribute('fill', '#ED3237')  // Red color
    elements.mainTitle.style.display = ''
    
    const titleText = formData.tagTitle
    const words = titleText.split(' ')
    const titleCharCount = titleText.length
    const fontSize = Math.round(getTitleFontSize(titleCharCount, config.fontScale) * getSizeScale('tagTitle', extractedInfo.fieldSizes))
    const availableTitleWidth = config.maxWidth * 0.9
    
    // Set font attributes first
    elements.mainTitle.setAttribute('letter-spacing', String(config.letterSpacing.title))
    elements.mainTitle.setAttribute('font-family', 'Arial, Helvetica, sans-serif')  // Arial Bold
    elements.mainTitle.setAttribute('font-weight', 'bold')
    elements.mainTitle.removeAttribute('font-stretch')
    elements.mainTitle.setAttribute('font-size', String(fontSize))
    
    if (words.length >= 4 || titleCharCount > 25) {
      // Long text - use wrapping
      elements.mainTitle.setAttribute('y', String(lastY))
      centerText(elements.mainTitle, config.centerX)
      elements.mainTitle.textContent = titleText.toUpperCase()
      
      await nextTick()
      
      // Wrap text with line height
      const titleLineHeight = fontSize * 1.1
      wrapText(elements.mainTitle, availableTitleWidth, config.centerX, titleLineHeight)
      await nextTick()
      
      // If still too many lines, reduce font size aggressively
      let tspanCount = elements.mainTitle.querySelectorAll('tspan').length
      let currentFontSize = fontSize
      const minTitleFontSize = Math.round(100 * config.fontScale)
      
      // Enforce max 2 lines strictly by reducing font size
      while (tspanCount > 2 && currentFontSize > minTitleFontSize) {
        currentFontSize -= Math.round(15 * config.fontScale)
        currentFontSize = Math.max(minTitleFontSize, currentFontSize)
        
        resetText(elements.mainTitle)
        elements.mainTitle.textContent = titleText.toUpperCase()
        elements.mainTitle.setAttribute('font-size', String(currentFontSize))
        centerText(elements.mainTitle, config.centerX)
        await nextTick()
        
        wrapText(elements.mainTitle, availableTitleWidth, config.centerX, currentFontSize * 1.1)
        await nextTick()
        
        tspanCount = elements.mainTitle.querySelectorAll('tspan').length
      }
    } else {
      // Short text - single line
      elements.mainTitle.setAttribute('y', String(lastY))
      centerText(elements.mainTitle, config.centerX)
      elements.mainTitle.textContent = titleText.toUpperCase()
    }
    
    console.log(`📏 Tag2 Main Title: chars=${titleCharCount}, fontSize=${fontSize}`)
    
    await nextTick()
    lastY = getElementBottom(elements.mainTitle) + (fontSize * 1.5)
  } else if (elements.mainTitle) {
    // Hide mainTitle when tagTitle is empty
    elements.mainTitle.textContent = ''
    elements.mainTitle.style.display = 'none'
  }

  // === THEME ===
  if (elements.subtitleLine1 && formData.theme) {
    elements.subtitleLine1.removeAttribute('class')
    elements.subtitleLine1.setAttribute('fill', '#006633')  // Deep green color
    elements.subtitleLine1.style.display = ''
    
    resetText(elements.subtitleLine1)
    const themeText = formData.theme.toUpperCase()
    elements.subtitleLine1.textContent = themeText
    
    // For short text, push theme down a bit to center it better
    const charCount = themeText.length
    let themeFontSize = getThemeFontSize(charCount, config.fontScale)
    themeFontSize = Math.round(themeFontSize * getSizeScale('theme', extractedInfo.fieldSizes))
    const minThemeFontSize = Math.round(80 * config.fontScale)
    // Fixed theme position — stays at same Y regardless of text size/length
    const themeFixedY = Math.round(config.height * 0.45)
    const themeAscentOffset = Math.round(themeFontSize * 0.7)
    elements.subtitleLine1.setAttribute('y', String(Math.max(lastY + themeAscentOffset, themeFixedY)))
    centerText(elements.subtitleLine1, config.centerX)
    // For short text, use narrower width to force wrapping into multiple lines
    const availableWidth = charCount <= 15 ? config.maxWidth * 0.45 : (charCount <= 25 ? config.maxWidth * 0.60 : config.maxWidth * 0.85)
    const maxLines = 3  // Max 3 wrap lines
    
    elements.subtitleLine1.setAttribute('font-size', String(themeFontSize))
    // No letter-spacing on theme (same as tag5) for clean tight wrapping
    elements.subtitleLine1.removeAttribute('letter-spacing')
    // Use Impact font (same as tag5) for clean tight look
    const themeFont = 'Impact, Arial Narrow, sans-serif'
    elements.subtitleLine1.setAttribute('font-family', themeFont)
    elements.subtitleLine1.setAttribute('font-weight', 'normal')  // Impact is already bold-looking
    elements.subtitleLine1.setAttribute('fill', '#010066')  // Deep blue color
    elements.subtitleLine1.removeAttribute('font-stretch')  // Remove condensed style
    
    await nextTick()
    
    // Consistent readable line spacing for all text lengths
    const themeLineHeight = themeFontSize * 1.0
    wrapText(elements.subtitleLine1, availableWidth, config.centerX, themeLineHeight)
    await nextTick()
    
    let tspanCount = elements.subtitleLine1.querySelectorAll('tspan').length
    let iterations = 0
    
    // Enforce max 3 lines strictly by reducing font size aggressively
    while (tspanCount > maxLines && themeFontSize > minThemeFontSize && iterations < 50) {
      themeFontSize -= Math.round(15 * config.fontScale)  // Reduced from 20 for more granular adjustment
      themeFontSize = Math.max(minThemeFontSize, themeFontSize)
      
      resetText(elements.subtitleLine1)
      elements.subtitleLine1.textContent = themeText  // Already uppercase from above
      elements.subtitleLine1.setAttribute('font-size', String(themeFontSize))
      elements.subtitleLine1.setAttribute('font-family', themeFont)
      elements.subtitleLine1.setAttribute('font-weight', 'normal')
      centerText(elements.subtitleLine1, config.centerX)
      await nextTick()
      
      // Consistent readable line spacing
      wrapText(elements.subtitleLine1, availableWidth, config.centerX, themeFontSize * 1.0)
      await nextTick()
      
      tspanCount = elements.subtitleLine1.querySelectorAll('tspan').length
      iterations++
    }
    
    console.log(`📏 Tag2 Theme: chars=${charCount}, fontSize=${themeFontSize}, lines=${tspanCount}`)
    
    lastY = getElementBottom(elements.subtitleLine1) + Math.round(150 * config.fontScale)
  } else if (elements.subtitleLine1) {
    // Hide theme when empty
    elements.subtitleLine1.textContent = ''
    elements.subtitleLine1.style.display = 'none'
  }

  // === SUBTHEME (Black, wrapping) ===
  if (extractedInfo.subtheme) {
    const svgNS = 'http://www.w3.org/2000/svg'
    const layerGroup = svg.querySelector('g#Layer_x0020_1') || svg
    const darkRect = svg.querySelector('rect.fil1')

    let subthemeEl = svg.querySelector('#subtheme-text') as SVGTextElement
    if (!subthemeEl) {
      subthemeEl = document.createElementNS(svgNS, 'text') as SVGTextElement
      subthemeEl.setAttribute('id', 'subtheme-text')
      subthemeEl.setAttribute('text-anchor', 'middle')
      if (darkRect) {
        layerGroup.insertBefore(subthemeEl, darkRect)
      } else {
        layerGroup.appendChild(subthemeEl)
      }
    }

    const subthemeText = extractedInfo.subtheme
    const subCharCount = subthemeText.length
    // Smaller than theme, readable size — reduced to avoid appearing bigger than expected
    let subFontSize: number
    if (subCharCount <= 20) subFontSize = Math.round(387 * config.fontScale)
    else if (subCharCount <= 40) subFontSize = Math.round(322 * config.fontScale)
    else if (subCharCount <= 60) subFontSize = Math.round(267 * config.fontScale)
    else if (subCharCount <= 80) subFontSize = Math.round(221 * config.fontScale)
    else subFontSize = Math.round(189 * config.fontScale)
    subFontSize = Math.round(subFontSize * getSizeScale('subtheme', extractedInfo.fieldSizes))

    const subMaxWidth = config.maxWidth * 0.92
    const subY = lastY + Math.round(100 * config.fontScale)

    subthemeEl.setAttribute('x', String(config.centerX))
    subthemeEl.setAttribute('y', String(subY))
    subthemeEl.setAttribute('font-size', String(subFontSize))
    subthemeEl.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    subthemeEl.setAttribute('font-weight', 'bold')
    subthemeEl.setAttribute('fill', '#FFFFFF')  // White
    subthemeEl.textContent = subthemeText

    await nextTick()

    const subLineHeight = subFontSize * 1.15
    wrapText(subthemeEl, subMaxWidth, config.centerX, subLineHeight)
    await nextTick()

    // Enforce max 4 lines
    let subTspanCount = subthemeEl.querySelectorAll('tspan').length
    const minSubFontSize = Math.round(180 * config.fontScale)
    let subIter = 0
    while (subTspanCount > 4 && subFontSize > minSubFontSize && subIter < 30) {
      subFontSize -= Math.round(12 * config.fontScale)
      subFontSize = Math.max(minSubFontSize, subFontSize)
      resetText(subthemeEl)
      subthemeEl.textContent = subthemeText
      subthemeEl.setAttribute('font-size', String(subFontSize))
      centerText(subthemeEl, config.centerX)
      await nextTick()
      wrapText(subthemeEl, subMaxWidth, config.centerX, subFontSize * 1.15)
      await nextTick()
      subTspanCount = subthemeEl.querySelectorAll('tspan').length
      subIter++
    }

    centerText(subthemeEl, config.centerX)
    await nextTick()
    lastY = getElementBottom(subthemeEl) + Math.round(100 * config.fontScale)
    console.log(`📏 Tag2 Subtheme: chars=${subCharCount}, fontSize=${subFontSize}, lines=${subTspanCount}`)
  } else {
    // Remove subtheme element when empty
    const oldSubtheme = svg.querySelector('#subtheme-text')
    if (oldSubtheme) oldSubtheme.remove()
  }

  // === EVENT TYPE (white on dark blue background) ===
  if (elements.eventType && formData.eventType) {
    elements.eventType.removeAttribute('class')
    elements.eventType.setAttribute('fill', config.eventTypeColor)
    elements.eventType.style.display = ''
    
    const parentGroup = elements.eventType.parentElement
    if (parentGroup && parentGroup.tagName === 'g') {
      parentGroup.removeAttribute('transform')
    }
    
    // Dark bar position - dynamic based on lastY so it doesn't overlap content above
    const darkBar = svg.querySelector('rect.fil1') as SVGRectElement
    const darkBarGap = Math.round(300 * config.fontScale)
    const newBarY = Math.max(lastY + darkBarGap, 58398.73)
    const newBarHeight = 16609.12
    if (darkBar) {
      darkBar.setAttribute('y', String(newBarY))
      darkBar.setAttribute('height', String(newBarHeight))
      darkBar.style.display = ''
    }
    
    // Blue arrow polygons - class fil3 in updated SVG
    const polygons = svg.querySelectorAll('polygon.fil3')
    polygons.forEach(p => (p as SVGElement).style.display = '')
    
    // Position event type text centered in the dark bar
    const eventY = newBarY + newBarHeight * 0.65
    elements.eventType.setAttribute('y', String(eventY))
    elements.eventType.setAttribute('x', String(config.centerX))
    elements.eventType.setAttribute('text-anchor', 'middle')
    centerText(elements.eventType, config.centerX)
    
    const eventText = formData.eventType.toUpperCase()
    const eventCharCount = eventText.length
    const eventFontSize = Math.round(getEventFontSize(eventCharCount, config.fontScale) * getSizeScale('eventType', extractedInfo.fieldSizes))
    
    elements.eventType.textContent = eventText
    elements.eventType.setAttribute('font-size', String(eventFontSize))
    elements.eventType.setAttribute('letter-spacing', String(config.letterSpacing.eventType))
    elements.eventType.setAttribute('font-family', config.eventFontFamily)
    elements.eventType.setAttribute('font-weight', '700')
    elements.eventType.setAttribute('font-stretch', 'condensed')
    
    await nextTick()
    // Wrap event type if too long and auto-shrink to max 2 lines
    const eventMaxWidth = config.maxWidth * 0.70
    wrapText(elements.eventType, eventMaxWidth, config.centerX, eventFontSize * 1.1)
    await nextTick()
    
    let eventTspanCount = elements.eventType.querySelectorAll('tspan').length
    let eventIterations = 0
    let currentEventFontSize = eventFontSize
    const minEventFontSize = Math.round(80 * config.fontScale)
    while (eventTspanCount > 2 && currentEventFontSize > minEventFontSize && eventIterations < 50) {
      currentEventFontSize -= Math.round(15 * config.fontScale)
      currentEventFontSize = Math.max(minEventFontSize, currentEventFontSize)
      resetText(elements.eventType)
      elements.eventType.textContent = eventText
      elements.eventType.setAttribute('font-size', String(currentEventFontSize))
      centerText(elements.eventType, config.centerX)
      await nextTick()
      wrapText(elements.eventType, eventMaxWidth, config.centerX, currentEventFontSize * 1.1)
      await nextTick()
      eventTspanCount = elements.eventType.querySelectorAll('tspan').length
      eventIterations++
    }
    
    console.log(`📏 Tag2 Event Type: chars=${eventCharCount}, fontSize=${currentEventFontSize}`)
  } else if (elements.eventType) {
    // Hide event type, dark bar, and arrows when eventType is empty
    elements.eventType.textContent = ''
    elements.eventType.style.display = 'none'
    const darkBar = svg.querySelector('rect.fil1') as SVGRectElement
    if (darkBar) darkBar.style.display = 'none'
    const polygons = svg.querySelectorAll('polygon.fil3')
    polygons.forEach(p => (p as SVGElement).style.display = 'none')
  }

  // === DATE, TIME, VENUE (Event Details) - At Bottom in Black ===
  // Only show if there is NO baseText (baseText replaces date/time/venue)
  
  if (extractedInfo.baseText) {
    // === BASE TEXT (Black, at bottom, wrapping) ===
    const baseTextContent = extractedInfo.baseText
    const baseCharCount = baseTextContent.length
    let baseFontSize = Math.round(270 * config.fontScale)
    if (baseCharCount > 100) baseFontSize = Math.round(200 * config.fontScale)
    else if (baseCharCount > 70) baseFontSize = Math.round(220 * config.fontScale)
    else if (baseCharCount > 40) baseFontSize = Math.round(245 * config.fontScale)
    baseFontSize = Math.round(baseFontSize * getSizeScale('baseText', extractedInfo.fieldSizes))

    const baseMaxWidth = config.maxWidth * 0.85
    const baseLineHeight = baseFontSize * 1.25

    let baseTextGroup = svg.querySelector('#base-text-group') as SVGGElement
    if (!baseTextGroup) {
      baseTextGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
      baseTextGroup.setAttribute('id', 'base-text-group')
      svg.appendChild(baseTextGroup)
    } else {
      baseTextGroup.innerHTML = ''
    }

    // Split into lines
    const baseWords = baseTextContent.split(/\s+/)
    const baseLines: string[] = []
    let curLine = ''
    for (const word of baseWords) {
      const testLine = curLine ? curLine + ' ' + word : word
      const testWidth = testLine.length * baseFontSize * 0.5
      if (testWidth > baseMaxWidth && curLine) {
        baseLines.push(curLine)
        curLine = word
      } else {
        curLine = testLine
      }
    }
    if (curLine) baseLines.push(curLine)

    const totalBaseHeight = baseLines.length * baseLineHeight
    const baseStartY = config.height - 7000 - totalBaseHeight - 2000

    baseLines.forEach((line, i) => {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text') as SVGTextElement
      txt.setAttribute('x', String(config.centerX))
      txt.setAttribute('y', String(baseStartY + (i * baseLineHeight)))
      txt.setAttribute('text-anchor', 'middle')
      txt.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
      txt.setAttribute('font-weight', 'bold')
      txt.setAttribute('font-size', String(baseFontSize))
      txt.setAttribute('fill', '#000000')  // Black
      txt.textContent = line
      baseTextGroup.appendChild(txt)
    })

    console.log(`📏 Tag2 Base Text: ${baseLines.length} lines, black`)
  } else if (extractedInfo.date || extractedInfo.time || extractedInfo.venue) {
    // Dynamic font size based on venue length
    const venueLength = (extractedInfo.venue || '').length
    let baseFontSize = 180
    if (venueLength > 100) {
      baseFontSize = 150  // Smaller font for very long text
    } else if (venueLength > 80) {
      baseFontSize = 160  // Medium-small font
    } else if (venueLength > 60) {
      baseFontSize = 170  // Slightly smaller font
    }
    const detailsFontSize = Math.round(baseFontSize * config.fontScale * getSizeScale('venue', extractedInfo.fieldSizes))
    const detailsLineHeight = detailsFontSize * 1.2  // Reduced line spacing from 1.3 to 1.2
    
    // Create or get event details container
    let detailsGroup = svg.querySelector('#event-details-group') as SVGGElement
    if (!detailsGroup) {
      detailsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
      detailsGroup.setAttribute('id', 'event-details-group')
      svg.appendChild(detailsGroup)
    } else {
      detailsGroup.innerHTML = ''
    }
    
    // Calculate venue lines for height calculation
    const venueText = extractedInfo.venue || ''
    // Dynamically reduce width when text is long to prevent touching frame
    // venueLength already declared above, reuse it
    let widthFactor = 0.95
    if (venueLength > 100) {
      widthFactor = 0.80  // Reduce to 80% for very long text
    } else if (venueLength > 80) {
      widthFactor = 0.85  // Reduce to 85% for long text
    } else if (venueLength > 60) {
      widthFactor = 0.90  // Reduce to 90% for medium text
    }
    const maxVenueWidth = config.maxWidth * widthFactor
    const venueLines: string[] = []
    
    if (venueText) {
      // Split venue into lines that fit within maxWidth
      const words = venueText.split(' ')
      let currentLine = 'Venue: '
      
      for (const word of words) {
        const testLine = currentLine + word + ' '
        // Approximate character width (font size * 0.5 for Arial Bold)
        const testWidth = testLine.length * detailsFontSize * 0.5
        
        if (testWidth > maxVenueWidth && currentLine !== 'Venue: ') {
          venueLines.push(currentLine.trim())
          currentLine = word + ' '
        } else {
          currentLine = testLine
        }
      }
      if (currentLine.trim()) {
        venueLines.push(currentLine.trim())
      }
    }
    
    // Date & Time on same line = 1 line, plus venue lines
    const hasDateTime = extractedInfo.date || extractedInfo.time
    const totalLines = (hasDateTime ? 1 : 0) + venueLines.length
    const totalDetailsHeight = totalLines * detailsLineHeight
    const detailsStartY = config.height - 7000 - totalDetailsHeight - 2000  // Date, time, venue position (moved down more - changed from 8000 to 7000)
    
    let lineIndex = 0
    
    // Add Date and Time on the same line with spacing
    if (hasDateTime) {
      const dateTimeText = document.createElementNS('http://www.w3.org/2000/svg', 'text') as SVGTextElement
      dateTimeText.setAttribute('id', `event-detail-${lineIndex}`)
      dateTimeText.setAttribute('x', String(config.centerX))
      dateTimeText.setAttribute('y', String(detailsStartY + (lineIndex * detailsLineHeight)))
      dateTimeText.setAttribute('text-anchor', 'middle')
      dateTimeText.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
      dateTimeText.setAttribute('font-weight', 'bold')
      dateTimeText.setAttribute('font-size', String(detailsFontSize))
      
      // Add Date: label and value
      if (extractedInfo.date) {
        const dateLabelSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan') as SVGTSpanElement
        dateLabelSpan.setAttribute('fill', '#ED3237')  // Red color for label
        dateLabelSpan.textContent = 'Date: '
        
        const dateValueSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan') as SVGTSpanElement
        dateValueSpan.setAttribute('fill', '#000000')  // Black color for value
        dateValueSpan.textContent = extractedInfo.date
        
        dateTimeText.appendChild(dateLabelSpan)
        dateTimeText.appendChild(dateValueSpan)
      }
      
      // Add spacing and Time: label and value
      if (extractedInfo.time) {
        // Add spacing between Date and Time (7 spaces)
        if (extractedInfo.date) {
          const spacerSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan') as SVGTSpanElement
          spacerSpan.textContent = '       '  // 7 spaces
          dateTimeText.appendChild(spacerSpan)
        }
        
        const timeLabelSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan') as SVGTSpanElement
        timeLabelSpan.setAttribute('fill', '#ED3237')  // Red color for label
        timeLabelSpan.textContent = 'Time: '
        
        const timeValueSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan') as SVGTSpanElement
        timeValueSpan.setAttribute('fill', '#000000')  // Black color for value
        timeValueSpan.textContent = extractedInfo.time
        
        dateTimeText.appendChild(timeLabelSpan)
        dateTimeText.appendChild(timeValueSpan)
      }
      
      detailsGroup.appendChild(dateTimeText)
      await nextTick()
      // Shrink date+time line if it overflows
      fitText(dateTimeText, config.maxWidth * 0.85, Math.round(80 * config.fontScale), detailsFontSize)
      await nextTick()
      lineIndex++
    }
    
    // Add wrapped venue lines with red label on first line, black values
    venueLines.forEach((line, vIndex) => {
      const detailText = document.createElementNS('http://www.w3.org/2000/svg', 'text') as SVGTextElement
      detailText.setAttribute('id', `event-detail-${lineIndex}`)
      detailText.setAttribute('x', String(config.centerX))
      detailText.setAttribute('y', String(detailsStartY + (lineIndex * detailsLineHeight)))
      detailText.setAttribute('text-anchor', 'middle')
      detailText.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
      detailText.setAttribute('font-weight', 'bold')
      detailText.setAttribute('font-size', String(detailsFontSize))
      
      // First venue line has "Venue:" label
      if (vIndex === 0 && line.startsWith('Venue:')) {
        const colonIndex = line.indexOf(':')
        const label = line.substring(0, colonIndex + 1)
        const value = line.substring(colonIndex + 1).trim()
        
        const labelSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan') as SVGTSpanElement
        labelSpan.setAttribute('fill', '#ED3237')  // Red color for label
        labelSpan.textContent = label + ' '
        
        const valueSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan') as SVGTSpanElement
        valueSpan.setAttribute('fill', '#000000')  // Black color for value
        valueSpan.textContent = value
        
        detailText.appendChild(labelSpan)
        detailText.appendChild(valueSpan)
      } else {
        detailText.setAttribute('fill', '#000000')  // Black color for continuation lines
        detailText.textContent = line
      }
      
      detailsGroup.appendChild(detailText)
      lineIndex++
    })
    
    console.log(`📏 Tag2 Event Details: ${totalLines} lines in black at bottom`)
  }

  // Apply field order reordering
  applyFieldOrder(svg, extractedInfo.fieldOrder)

  await nextTick()
}
