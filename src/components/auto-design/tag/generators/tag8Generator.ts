/**
 * Tag Style 8 Generator (Dynamic Background)
 * Based on tag3 layout with randomly changing backgrounds from new-wall folder
 * Background changes on regenerate or "Try different style"
 */

import { nextTick } from 'vue'
import type { TagFormData, ExtractedTagInfo } from '../types'
import { getSizeScale } from '../types'
import { centerText, wrapText, resetText, fitText, applyFieldOrder } from '../utils/tagTemplateUtils'

/**
 * Convert an image URL to a base64 data URL for embedding in SVG
 */
async function imageToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Failed to convert image to base64:', error)
    return url // Fallback to original URL
  }
}

// Available backgrounds from public/images/new-wall folder
const BACKGROUND_IMAGES = [
  '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg',
  '9.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg',
  'AwardCertificate.jpg', 'BeigeNeutralModernBorder.jpg', 'BiruKuning.jpg',
  'BiruOranye.jpg', 'BiruOranyeVintage.jpg', 'BiruPutihAbstrak.jpg',
  'Blue-and-Grey.jpg', 'BusinessLetter.jpg', 'Clipart.jpg', 'Construction.jpg',
  'ElegantWhite.jpg', 'Latarbelakang.jpg', 'NikahnamaTemplate.jpg',
  'PutihBiru.jpg', 'Stylishgeometric.jpg', 'sunrisestudio.jpg',
  'White-and-Blue-Gradient.jpg'
]

// Black-to-red color palette — randomly picked per generation
const BLACK_RED_PALETTE = [
  '#000000',  // Pure black
  '#1A0000',  // Near-black with red tint
  '#330000',  // Very dark red
  '#4D0000',  // Dark maroon
  '#660000',  // Deep maroon
  '#800000',  // Maroon
  '#8B0000',  // Dark red
  '#A00000',  // Medium-dark red
  '#B22222',  // Firebrick
  '#CC0000',  // Strong red
  '#DC143C',  // Crimson
  '#E00000',  // Bright red
]

/** Pick a random color from the black-red palette. */
function getRandomBlackRedColor(): string {
  return BLACK_RED_PALETTE[Math.floor(Math.random() * BLACK_RED_PALETTE.length)]
}

export interface Tag8Config {
  templateName: 'tag8.svg'
  displayName: 'Style 8 (Dynamic Background)'
  
  // SVG dimensions (same as tag3)
  viewBox: '0 0 3124.81 4419.38'
  width: 3124.81
  height: 4419.38
  centerX: 1562.405
  
  // Colors
  logoTitleColor: '#000000' // Black
  
  // Font settings
  orgNameFont: 'Arial, Helvetica, sans-serif'
  themeFont: 'Arial, Helvetica, sans-serif'
  eventFont: 'Bebas Neue, Bebas, Oswald, Impact, Arial Narrow, sans-serif'
  detailsFont: 'Arial, Helvetica, sans-serif'
}

export const TAG8_CONFIG: Tag8Config = {
  templateName: 'tag8.svg',
  displayName: 'Style 8 (Dynamic Background)',
  viewBox: '0 0 3124.81 4419.38',
  width: 3124.81,
  height: 4419.38,
  centerX: 1562.405,
  logoTitleColor: '#000000',
  orgNameFont: 'Arial, Helvetica, sans-serif',
  themeFont: 'Arial, Helvetica, sans-serif',
  eventFont: 'Bebas Neue, Bebas, Oswald, Impact, Arial Narrow, sans-serif',
  detailsFont: 'Arial, Helvetica, sans-serif'
}

// Track used backgrounds to prevent repeats
const usedBackgrounds = new Set<string>()

/**
 * Get random background image with cache-busting
 */
function getRandomBackground(): string {
  const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length)
  return BACKGROUND_IMAGES[randomIndex]
}

/**
 * Get a different background each time - no repeats
 */
function getNextBackground(): string {
  // Get available backgrounds (not yet used)
  const availableBackgrounds = BACKGROUND_IMAGES.filter(bg => !usedBackgrounds.has(bg))
  
  if (availableBackgrounds.length === 0) {
    // All backgrounds used - reset and start over
    usedBackgrounds.clear()
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length)
    const selected = BACKGROUND_IMAGES[randomIndex]
    usedBackgrounds.add(selected)
    console.log('🔄 All backgrounds used, resetting. Selected:', selected)
    return selected
  }
  
  // Pick random from available
  const randomIndex = Math.floor(Math.random() * availableBackgrounds.length)
  const selected = availableBackgrounds[randomIndex]
  usedBackgrounds.add(selected)
  console.log(`🖼️ Background selected: ${selected} (${usedBackgrounds.size}/${BACKGROUND_IMAGES.length} used)`)
  return selected
}

/**
 * Check if more unique backgrounds are available
 */
export function hasMoreBackgrounds(): boolean {
  return usedBackgrounds.size < BACKGROUND_IMAGES.length
}

/**
 * Get count of remaining backgrounds
 */
export function getRemainingBackgroundCount(): number {
  return BACKGROUND_IMAGES.length - usedBackgrounds.size
}

/**
 * Get total background count
 */
export function getTotalBackgroundCount(): number {
  return BACKGROUND_IMAGES.length
}

/**
 * Reset used backgrounds
 */
export function resetUsedBackgrounds(): void {
  usedBackgrounds.clear()
}

/**
 * Organization name font size (reduced from tag3)
 */
function getOrgNameFontSize(charCount: number): number {
  if (charCount <= 10) return 200  // Reduced from 240
  else if (charCount <= 15) return 175  // Reduced from 210
  else if (charCount <= 20) return 150  // Reduced from 180
  else if (charCount <= 25) return 135  // Reduced from 160
  else if (charCount <= 30) return 120  // Reduced from 140
  else return Math.max(85, 200 - (charCount * 4))  // Reduced from 100, 240
}

/**
 * Theme font size (same as tag3) - reduced for long text
 */
function getThemeFontSize(charCount: number): number {
  // Calibrated for default X6
  if (charCount <= 5) return 1014
  else if (charCount <= 10) return 887
  else if (charCount <= 15) return 710
  else if (charCount <= 25) return 608
  else if (charCount <= 35) return 532
  else if (charCount <= 45) return 456
  else if (charCount <= 55) return 393
  else return Math.max(304, 761 - (charCount * 5))
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
 * Event type font size
 */
function getEventFontSize(charCount: number): number {
  if (charCount <= 8) return 740
  else if (charCount <= 12) return 650
  else if (charCount <= 16) return 560
  else if (charCount <= 20) return 470
  else return Math.max(290, 740 - (charCount * 23))
}

/**
 * Details font size
 */
function getDetailsFontSize(): number {
  return 95
}

/**
 * Generate Tag Style 8 with dynamic background
 */
export async function generateTag8(
  svg: SVGSVGElement,
  formData: TagFormData,
  extractedInfo: ExtractedTagInfo,
  hasUserImage: boolean,
  userImageSrc: string | null
): Promise<void> {
  const config = TAG8_CONFIG
  const svgNS = 'http://www.w3.org/2000/svg'
  const layerGroup = svg.querySelector('g#Layer_x0020_1') || svg
  
  console.log('🎨 TAG8 GENERATOR - Dynamic Background Style')
  
  // Set viewBox
  svg.setAttribute('viewBox', config.viewBox)
  
  // === BACKGROUND IMAGE ===
  // First, remove any existing white rect from the layer (the template has a white rect that covers everything)
  // The template loader inlines the fill style and may remove the class, so we need to find it by multiple methods
  let whiteRect = layerGroup.querySelector('rect.fil0') as Element | null
  if (!whiteRect) {
    // Try finding by fill attribute (after template loader inlines styles)
    whiteRect = layerGroup.querySelector('rect[fill="white"]') as Element | null
  }
  if (!whiteRect) {
    // Try finding first rect in layer group
    whiteRect = layerGroup.querySelector('rect') as Element | null
  }
  if (whiteRect) {
    whiteRect.remove()
    console.log('🗑️ Removed white background rect from template')
  } else {
    console.log('⚠️ No white rect found to remove')
  }
  
  // Remove any existing background elements
  const existingBg = svg.querySelector('#background-group')
  if (existingBg) {
    existingBg.remove()
  }
  const existingBgImage = svg.querySelector('#bg-image')
  if (existingBgImage) {
    existingBgImage.remove()
  }
  
  // Create background group inside the layer group (like tag5)
  let bgGroup = svg.querySelector('#background-group') as SVGGElement
  if (!bgGroup) {
    bgGroup = document.createElementNS(svgNS, 'g') as SVGGElement
    bgGroup.setAttribute('id', 'background-group')
    // Insert at beginning of layer group (before other content)
    const firstChild = layerGroup.firstChild
    if (firstChild) {
      layerGroup.insertBefore(bgGroup, firstChild)
    } else {
      layerGroup.appendChild(bgGroup)
    }
  } else {
    bgGroup.innerHTML = ''
  }
  
  // Get random background image (changes each time generator runs)
  const backgroundFile = getNextBackground()
  const timestamp = Date.now()
  // Fetch and embed the background as base64 so it survives SVG export
  const backgroundUrl = `${window.location.origin}/images/new-wall/${backgroundFile}?t=${timestamp}`
  console.log('🖼️ Tag8 Background:', backgroundFile, 'URL:', backgroundUrl)
  
  const base64Url = await imageToBase64(backgroundUrl)
  console.log('🖼️ Tag8 Background embedded as base64:', base64Url.substring(0, 60) + '...')
  
  const bgImage = document.createElementNS(svgNS, 'image') as SVGImageElement
  bgImage.setAttribute('id', 'bg-image')
  bgImage.setAttribute('href', base64Url)
  bgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', base64Url)
  bgImage.setAttribute('x', '0')
  bgImage.setAttribute('y', '0')
  bgImage.setAttribute('width', String(config.width))
  bgImage.setAttribute('height', String(config.height))
  bgImage.setAttribute('preserveAspectRatio', 'xMidYMid slice')
  bgImage.setAttribute('style', 'image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;')
  bgGroup.appendChild(bgImage)

  let lastY = 1350
  
  // === LOGO === (Same positioning as tag3)
  if (hasUserImage && userImageSrc) {
    const logoSize = 390
    const logoY = 720
    
    let logoImg = svg.querySelector('#user-logo') as SVGImageElement
    if (!logoImg) {
      logoImg = document.createElementNS(svgNS, 'image') as SVGImageElement
      logoImg.setAttribute('id', 'user-logo')
      logoImg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      layerGroup.appendChild(logoImg)
    }
    logoImg.setAttribute('x', String(config.centerX - logoSize / 2))
    logoImg.setAttribute('y', String(logoY))
    logoImg.setAttribute('width', String(logoSize))
    logoImg.setAttribute('height', String(logoSize))
    logoImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', userImageSrc)
    
    lastY = logoY + logoSize + 140
  }
  
  // === LOGO TITLE ===
  if (extractedInfo.logoTitle) {
    const logoTitleY = lastY
    const logoTitleFontSize = Math.round(105 * getSizeScale('logoTitle', extractedInfo.fieldSizes))
    
    let logoTitle = svg.querySelector('#logo-title') as SVGTextElement
    if (!logoTitle) {
      logoTitle = document.createElementNS(svgNS, 'text') as SVGTextElement
      logoTitle.setAttribute('id', 'logo-title')
      logoTitle.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(logoTitle)
    }
    logoTitle.setAttribute('x', String(config.centerX))
    logoTitle.setAttribute('y', String(logoTitleY))
    logoTitle.setAttribute('font-size', String(logoTitleFontSize))
    logoTitle.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    logoTitle.setAttribute('font-weight', 'normal')
    logoTitle.setAttribute('fill', config.logoTitleColor)
    logoTitle.textContent = extractedInfo.logoTitle
    await nextTick()
    // Shrink logo title font if it overflows the tag width
    fitText(logoTitle, config.width * 0.85, 40, logoTitleFontSize)
    await nextTick()
    lastY = getElementBottom(logoTitle) + 80
  }
  
  // === ORGANIZATION NAME ===
  const orgText = (formData.tagTitle || '').toUpperCase()
  let orgName = svg.querySelector('#org-name') as SVGTextElement | null
  const tagTextColor = getRandomBlackRedColor()
  console.log(`🎨 Tag8 text color: ${tagTextColor}`)
  if (orgText) {
    const orgNameY = lastY

    if (!orgName) {
      orgName = document.createElementNS(svgNS, 'text') as SVGTextElement
      orgName.setAttribute('id', 'org-name')
      orgName.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(orgName)
    }

    const orgCharCount = orgText.length
    let orgFontSize = getOrgNameFontSize(orgCharCount)
    orgFontSize = Math.round(orgFontSize * getSizeScale('tagTitle', extractedInfo.fieldSizes))
    const maxWidth = config.width * 0.85

    orgName.setAttribute('x', String(config.centerX))
    orgName.setAttribute('y', String(orgNameY))
    orgName.setAttribute('font-size', String(orgFontSize))
    orgName.setAttribute('font-family', config.orgNameFont)
    orgName.setAttribute('font-weight', 'normal')
    orgName.setAttribute('fill', tagTextColor)
    orgName.textContent = orgText

    await nextTick()

    const orgLineHeight = orgFontSize * 1.1
    wrapText(orgName, maxWidth, config.centerX, orgLineHeight)
    await nextTick()

    let tspanCount = orgName.querySelectorAll('tspan').length
    let minOrgFontSize = 85
    while (tspanCount > 2 && orgFontSize > minOrgFontSize) {
      orgFontSize -= 10
      orgFontSize = Math.max(minOrgFontSize, orgFontSize)
      resetText(orgName)
      orgName.textContent = orgText
      orgName.setAttribute('font-size', String(orgFontSize))
      centerText(orgName, config.centerX)
      await nextTick()
      wrapText(orgName, maxWidth, config.centerX, orgFontSize * 1.1)
      await nextTick()
      tspanCount = orgName.querySelectorAll('tspan').length
    }

    centerText(orgName, config.centerX)
    await nextTick()
    lastY = getElementBottom(orgName) + 80
  } else if (orgName) {
    orgName.remove()
  }
  
  // === THEME ===
  const themeText = (formData.theme || '').toUpperCase()
  const hasEventType = !!(formData.eventType && formData.eventType.trim())
  let theme = svg.querySelector('#theme-text') as SVGTextElement | null
  if (themeText) {
    const themeCharCount = themeText.length

    if (!theme) {
      theme = document.createElementNS(svgNS, 'text') as SVGTextElement
      theme.setAttribute('id', 'theme-text')
      theme.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(theme)
    }

    let themeFontSize = getThemeFontSize(themeCharCount)
    themeFontSize = Math.round(themeFontSize * getSizeScale('theme', extractedInfo.fieldSizes))
    const themeMaxWidth = config.width * 0.70
    // Add font ascent offset so theme text doesn't extend above lastY and overlap orgName
    // When no event type, push theme down for better visual balance
    const noEventExtra = hasEventType ? 0 : 200
    const themeY = lastY + Math.round(themeFontSize * 0.7) + noEventExtra

    theme.setAttribute('x', String(config.centerX))
    theme.setAttribute('y', String(themeY))
    theme.setAttribute('font-size', String(themeFontSize))
    theme.setAttribute('font-family', config.eventFont)
    theme.setAttribute('font-weight', 'bold')
    theme.setAttribute('fill', tagTextColor)
    theme.textContent = themeText

    await nextTick()

    const themeLineHeight = themeCharCount <= 20 ? themeFontSize * 0.80 : themeFontSize * 0.95
    wrapText(theme, themeMaxWidth, config.centerX, themeLineHeight)
    await nextTick()

    let tspanCount = theme.querySelectorAll('tspan').length
    let minThemeFontSize = 180
    let iterations = 0
    while (tspanCount > 4 && themeFontSize > minThemeFontSize && iterations < 50) {
      themeFontSize -= 20
      themeFontSize = Math.max(minThemeFontSize, themeFontSize)
      resetText(theme)
      theme.textContent = themeText
      theme.setAttribute('font-size', String(themeFontSize))
      centerText(theme, config.centerX)
      await nextTick()
      wrapText(theme, themeMaxWidth, config.centerX, themeFontSize * 0.95)
      await nextTick()
      tspanCount = theme.querySelectorAll('tspan').length
      iterations++
    }

    centerText(theme, config.centerX)
    await nextTick()
    lastY = getElementBottom(theme) + 40
  } else if (theme) {
    theme.remove()
  }
  
  // === SUBTHEME (close to theme, just below) ===
  if (extractedInfo.subtheme) {
    const subthemeText = extractedInfo.subtheme
    const subCharCount = subthemeText.length
    // Smaller than theme font
    let subFontSize: number
    if (subCharCount <= 15) subFontSize = 259
    else if (subCharCount <= 30) subFontSize = 216
    else if (subCharCount <= 50) subFontSize = 172
    else if (subCharCount <= 80) subFontSize = 144
    else subFontSize = 123
    subFontSize = Math.round(subFontSize * getSizeScale('subtheme', extractedInfo.fieldSizes))

    const subMaxWidth = config.width * 0.75
    // Place subtheme tight below theme with ascent offset
    const subY = lastY + Math.round(subFontSize * 0.7)

    let subthemeEl = svg.querySelector('#subtheme-text') as SVGTextElement
    if (!subthemeEl) {
      subthemeEl = document.createElementNS(svgNS, 'text') as SVGTextElement
      subthemeEl.setAttribute('id', 'subtheme-text')
      subthemeEl.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(subthemeEl)
    }

    subthemeEl.setAttribute('x', String(config.centerX))
    subthemeEl.setAttribute('y', String(subY))
    subthemeEl.setAttribute('font-size', String(subFontSize))
    subthemeEl.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    subthemeEl.setAttribute('font-weight', 'bold')
    subthemeEl.setAttribute('fill', '#000000')  // Black
    subthemeEl.textContent = subthemeText

    await nextTick()

    const subLineHeight = subFontSize * 1.2
    wrapText(subthemeEl, subMaxWidth, config.centerX, subLineHeight)
    await nextTick()

    // Enforce max 4 lines
    let subTspanCount = subthemeEl.querySelectorAll('tspan').length
    const minSubFontSize = 70
    let subIter = 0
    while (subTspanCount > 4 && subFontSize > minSubFontSize && subIter < 30) {
      subFontSize -= 8
      subFontSize = Math.max(minSubFontSize, subFontSize)
      resetText(subthemeEl)
      subthemeEl.textContent = subthemeText
      subthemeEl.setAttribute('font-size', String(subFontSize))
      centerText(subthemeEl, config.centerX)
      await nextTick()
      wrapText(subthemeEl, subMaxWidth, config.centerX, subFontSize * 1.2)
      await nextTick()
      subTspanCount = subthemeEl.querySelectorAll('tspan').length
      subIter++
    }

    centerText(subthemeEl, config.centerX)
    await nextTick()
    lastY = getElementBottom(subthemeEl) + 60
    console.log(`📏 Tag8 Subtheme: chars=${subCharCount}, fontSize=${subFontSize}, lines=${subTspanCount}`)
  }
  
  // === EVENT TYPE (Black-Red color) ===
  const eventText = (formData.eventType || '').toUpperCase()
  let eventType = svg.querySelector('#event-type') as SVGTextElement | null
  if (eventText) {
    const eventCharCount = eventText.length
    let eventFontSize = getEventFontSize(eventCharCount)
    eventFontSize = Math.round(eventFontSize * getSizeScale('eventType', extractedInfo.fieldSizes))
    const eventStartY = lastY + Math.round(eventFontSize * 0.7)

    if (!eventType) {
      eventType = document.createElementNS(svgNS, 'text') as SVGTextElement
      eventType.setAttribute('id', 'event-type')
      eventType.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(eventType)
    }

    eventType.setAttribute('x', String(config.centerX))
    eventType.setAttribute('y', String(eventStartY))
    eventType.setAttribute('font-size', String(eventFontSize))
    eventType.setAttribute('font-family', config.eventFont)
    eventType.setAttribute('font-weight', 'normal')
    eventType.setAttribute('fill', tagTextColor)
    eventType.textContent = eventText

    await nextTick()

    const eventMaxWidth = config.width * 0.70
    const eventLineHeight = eventFontSize * 1.1
    wrapText(eventType, eventMaxWidth, config.centerX, eventLineHeight)
    await nextTick()

    let eventTspanCount = eventType.querySelectorAll('tspan').length
    let eventIterations = 0
    let minEventFontSize = 220
    while (eventTspanCount > 2 && eventFontSize > minEventFontSize && eventIterations < 50) {
      eventFontSize -= 20
      eventFontSize = Math.max(minEventFontSize, eventFontSize)
      resetText(eventType)
      eventType.textContent = eventText
      eventType.setAttribute('font-size', String(eventFontSize))
      centerText(eventType, config.centerX)
      await nextTick()
      wrapText(eventType, eventMaxWidth, config.centerX, eventFontSize * 1.1)
      await nextTick()
      eventTspanCount = eventType.querySelectorAll('tspan').length
      eventIterations++
    }

    await nextTick()
    lastY = getElementBottom(eventType) + 60
  } else if (eventType) {
    eventType.remove()
  }
  
  // === EVENT DETAILS or BASE TEXT at the bottom ===
  if (extractedInfo.baseText) {
    // === BASE TEXT (Black, at bottom, wrapping) ===
    const baseTextContent = extractedInfo.baseText
    const baseCharCount = baseTextContent.length
    let baseFontSize: number
    if (baseCharCount <= 30) baseFontSize = 135
    else if (baseCharCount <= 60) baseFontSize = 122
    else if (baseCharCount <= 100) baseFontSize = 108
    else baseFontSize = 95
    baseFontSize = Math.round(baseFontSize * getSizeScale('baseText', extractedInfo.fieldSizes))

    const baseMaxWidth = config.width * 0.80
    const baseLineHeight = baseFontSize * 1.3

    let baseTextGroup = svg.querySelector('#base-text-group') as SVGGElement
    if (!baseTextGroup) {
      baseTextGroup = document.createElementNS(svgNS, 'g') as SVGGElement
      baseTextGroup.setAttribute('id', 'base-text-group')
      layerGroup.appendChild(baseTextGroup)
    } else {
      baseTextGroup.innerHTML = ''
    }

    // Split into multiple wrapped lines
    const baseWords = baseTextContent.split(/\s+/)
    const baseLines: string[] = []
    let curLine = ''
    for (const word of baseWords) {
      const testLine = curLine ? curLine + ' ' + word : word
      const testWidth = testLine.length * baseFontSize * 0.55
      if (testWidth > baseMaxWidth && curLine) {
        baseLines.push(curLine)
        curLine = word
      } else {
        curLine = testLine
      }
    }
    if (curLine) baseLines.push(curLine)

    // Position at bottom of tag, or closer to content when no event type
    const totalBaseHeight = baseLines.length * baseLineHeight
    const baseStartY = hasEventType
      ? config.height - 350 - totalBaseHeight
      : lastY + 250

    baseLines.forEach((line, i) => {
      const txt = document.createElementNS(svgNS, 'text') as SVGTextElement
      txt.setAttribute('x', String(config.centerX))
      txt.setAttribute('y', String(baseStartY + (i * baseLineHeight)))
      txt.setAttribute('text-anchor', 'middle')
      txt.setAttribute('font-family', config.detailsFont)
      txt.setAttribute('font-weight', 'bold')
      txt.setAttribute('font-size', String(baseFontSize))
      txt.setAttribute('fill', '#000000')  // Black
      txt.textContent = line
      baseTextGroup.appendChild(txt)
    })

    console.log(`📏 Tag8 Base Text: ${baseLines.length} lines, black at bottom`)
  } else if (extractedInfo.date || extractedInfo.time || extractedInfo.venue) {
  // === EVENT DETAILS (Date, Time, Venue) - Black-Red labels, black values ===
    const venueLength = (extractedInfo.venue || '').length
    let baseFontSize = 95
    if (venueLength > 100) {
      baseFontSize = 75
    } else if (venueLength > 80) {
      baseFontSize = 80
    } else if (venueLength > 60) {
      baseFontSize = 85
    }
    const detailsFontSize = Math.round(baseFontSize * getSizeScale('venue', extractedInfo.fieldSizes))
    const detailsLineHeight = detailsFontSize * 1.3
    
    let detailsGroup = svg.querySelector('#event-details-group') as SVGGElement
    if (!detailsGroup) {
      detailsGroup = document.createElementNS(svgNS, 'g') as SVGGElement
      detailsGroup.setAttribute('id', 'event-details-group')
      layerGroup.appendChild(detailsGroup)
    } else {
      detailsGroup.innerHTML = ''
    }
    
    const venueText = extractedInfo.venue || ''
    let widthFactor = 0.70
    if (venueLength > 100) {
      widthFactor = 0.60
    } else if (venueLength > 80) {
      widthFactor = 0.65
    } else if (venueLength > 60) {
      widthFactor = 0.68
    }
    const maxVenueWidth = config.width * widthFactor
    const venueLines: string[] = []
    
    if (venueText) {
      const words = venueText.split(' ')
      let currentLine = 'Venue: '
      
      for (const word of words) {
        const testLine = currentLine + word + ' '
        const testWidth = testLine.length * detailsFontSize * 0.55
        
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
    
    const detailsStartY = lastY
    let lineIndex = 0
    
    // Date line
    if (extractedInfo.date) {
      const dateText = document.createElementNS(svgNS, 'text') as SVGTextElement
      dateText.setAttribute('id', `event-detail-${lineIndex}`)
      dateText.setAttribute('x', String(config.centerX))
      dateText.setAttribute('y', String(detailsStartY + (lineIndex * detailsLineHeight)))
      dateText.setAttribute('text-anchor', 'middle')
      dateText.setAttribute('font-family', config.detailsFont)
      dateText.setAttribute('font-weight', 'bold')
      dateText.setAttribute('font-size', String(detailsFontSize))
      
      const dateLabelSpan = document.createElementNS(svgNS, 'tspan') as SVGTSpanElement
      dateLabelSpan.setAttribute('fill', tagTextColor)  // Black-red label
      dateLabelSpan.textContent = 'Date: '
      
      const dateValueSpan = document.createElementNS(svgNS, 'tspan') as SVGTSpanElement
      dateValueSpan.setAttribute('fill', '#000000')
      dateValueSpan.textContent = extractedInfo.date
      
      dateText.appendChild(dateLabelSpan)
      dateText.appendChild(dateValueSpan)
      detailsGroup.appendChild(dateText)
      await nextTick()
      // Shrink date text if it overflows
      fitText(dateText, config.width * 0.75, 30, detailsFontSize)
      await nextTick()
      lineIndex++
    }
    
    // Time line
    if (extractedInfo.time) {
      const timeText = document.createElementNS(svgNS, 'text') as SVGTextElement
      timeText.setAttribute('id', `event-detail-${lineIndex}`)
      timeText.setAttribute('x', String(config.centerX))
      timeText.setAttribute('y', String(detailsStartY + (lineIndex * detailsLineHeight)))
      timeText.setAttribute('text-anchor', 'middle')
      timeText.setAttribute('font-family', config.detailsFont)
      timeText.setAttribute('font-weight', 'bold')
      timeText.setAttribute('font-size', String(detailsFontSize))
      
      const timeLabelSpan = document.createElementNS(svgNS, 'tspan') as SVGTSpanElement
      timeLabelSpan.setAttribute('fill', tagTextColor)  // Black-red label
      timeLabelSpan.textContent = 'Time: '
      
      const timeValueSpan = document.createElementNS(svgNS, 'tspan') as SVGTSpanElement
      timeValueSpan.setAttribute('fill', '#000000')
      timeValueSpan.textContent = extractedInfo.time
      
      timeText.appendChild(timeLabelSpan)
      timeText.appendChild(timeValueSpan)
      detailsGroup.appendChild(timeText)
      await nextTick()
      // Shrink time text if it overflows
      fitText(timeText, config.width * 0.75, 30, detailsFontSize)
      await nextTick()
      lineIndex++
    }
    
    // Venue lines
    venueLines.forEach((line, vIndex) => {
      const detailText = document.createElementNS(svgNS, 'text') as SVGTextElement
      detailText.setAttribute('id', `event-detail-${lineIndex}`)
      detailText.setAttribute('x', String(config.centerX))
      detailText.setAttribute('y', String(detailsStartY + (lineIndex * detailsLineHeight)))
      detailText.setAttribute('text-anchor', 'middle')
      detailText.setAttribute('font-family', config.detailsFont)
      detailText.setAttribute('font-weight', 'bold')
      detailText.setAttribute('font-size', String(detailsFontSize))
      
      if (vIndex === 0 && line.startsWith('Venue:')) {
        const colonIndex = line.indexOf(':')
        const label = line.substring(0, colonIndex + 1)
        const value = line.substring(colonIndex + 1).trim()
        
        const labelSpan = document.createElementNS(svgNS, 'tspan') as SVGTSpanElement
        labelSpan.setAttribute('fill', tagTextColor)  // Black-red label
        labelSpan.textContent = label + ' '
        
        const valueSpan = document.createElementNS(svgNS, 'tspan') as SVGTSpanElement
        valueSpan.setAttribute('fill', '#000000')
        valueSpan.textContent = value
        
        detailText.appendChild(labelSpan)
        detailText.appendChild(valueSpan)
      } else {
        detailText.setAttribute('fill', '#000000')
        detailText.textContent = line
      }
      
      detailsGroup.appendChild(detailText)
      lineIndex++
    })
    
    console.log(`📏 Tag8 Event Details: ${lineIndex} lines, labels in ${tagTextColor}`)
  }
  
  // Apply field order reordering
  applyFieldOrder(svg, extractedInfo.fieldOrder)

  console.log('✅ Tag8 generation complete with background:', backgroundFile)
}
