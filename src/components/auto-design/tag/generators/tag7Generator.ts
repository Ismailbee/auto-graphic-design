/**
 * Tag Style 7 Generator (Blue Fade)
 * REBUILT FROM SCRATCH - Following tag1Generator pattern exactly
 * Based on tag7.svg template with blue gradient fade design
 * 
 * ViewBox: 144188.19 x 203923.36 (71x larger than tag1's 2030.75 x 2872.06)
 * Scale Factor: 71 (all tag1 font sizes multiplied by this)
 */

import { nextTick } from 'vue'
import type { TagFormData, ExtractedTagInfo } from '../types'
import { getSizeScale } from '../types'
import { centerText, wrapText, resetText, fitText, applyFieldOrder } from '../utils/tagTemplateUtils'

// Scale factor for event text - MASSIVELY increased for huge text
const SCALE_FACTOR = 120  // Increased from 100 for larger theme text
const EVENT_SCALE_FACTOR = 750  // Increased from 600 for larger event text

export interface Tag7Config {
  templateName: 'tag7.svg'
  displayName: 'Style 7 (Blue Fade)'
  
  // Colors from tag7.svg - .fil3=#124C7A (dark blue), .fil0=white
  primaryColor: '#FFFFFF'       // White for logo title and organization name
  themeColor: '#124C7A'         // Dark blue (same as event) for theme text
  eventTypeColor: '#124C7A'     // Dark blue (fil3) for event type on white
  detailsColor: '#124C7A'       // Dark blue for details
  
  // Layout - from tag7.svg viewBox
  viewBox: '0 0 144188.19 203923.36'
  width: 144188.19
  height: 203923.36
  centerX: 72094.095
  maxWidth: 122560              // 85% of width
  
  // Font settings
  fontFamily: 'Montserrat, Arial, Helvetica, sans-serif'
}

export const TAG7_CONFIG: Tag7Config = {
  templateName: 'tag7.svg',
  displayName: 'Style 7 (Blue Fade)',
  primaryColor: '#FFFFFF',
  themeColor: '#124C7A',
  eventTypeColor: '#124C7A',
  detailsColor: '#124C7A',
  viewBox: '0 0 144188.19 203923.36',
  width: 144188.19,
  height: 203923.36,
  centerX: 72094.095,
  maxWidth: 122560,
  fontFamily: 'Montserrat, Arial, Helvetica, sans-serif'
}

/**
 * Title font size - tag1 base values × SCALE_FACTOR
 * Tag1 base: 120, 105, 92, 80, 70, 60, 52, 45
 */
function getTitleFontSize(charCount: number): number {
  let baseSize: number
  if (charCount <= 10) baseSize = 85  // Reduced from 120
  else if (charCount <= 15) baseSize = 75  // Reduced from 105
  else if (charCount <= 20) baseSize = 65  // Reduced from 92
  else if (charCount <= 25) baseSize = 57  // Reduced from 80
  else if (charCount <= 30) baseSize = 50  // Reduced from 70
  else if (charCount <= 40) baseSize = 43  // Reduced from 60
  else if (charCount <= 50) baseSize = 37  // Reduced from 52
  else baseSize = Math.max(32, 85 - (charCount * 2))
  
  return baseSize * SCALE_FACTOR
}

/**
 * Theme font size - tag1 base values × SCALE_FACTOR
 * Tag1 base: 1800 down to 710 (massively increased)
 */
function getThemeFontSize(charCount: number): number {
  let baseSize: number
  // Calibrated for default X6
  if (charCount <= 15) baseSize = 279
  else if (charCount <= 25) baseSize = 254
  else if (charCount <= 35) baseSize = 228
  else if (charCount <= 45) baseSize = 209
  else if (charCount <= 55) baseSize = 190
  else if (charCount <= 70) baseSize = 172
  else if (charCount <= 90) baseSize = 152
  else if (charCount <= 110) baseSize = 140
  else if (charCount <= 130) baseSize = 127
  else baseSize = Math.max(114, 279 - (charCount * 1.4))
  
  return baseSize * SCALE_FACTOR
}

/**
 * Event type font size - MASSIVELY INCREASED
 * Using EVENT_SCALE_FACTOR = 350 for huge event text
 * Base 320 × 350 = 112,000 for short text like "OFFICIAL"
 * Base 280 × 350 = 98,000 for "CONFERENCE" (10 chars)
 */
function getEventFontSize(charCount: number): number {
  let baseSize: number
  if (charCount <= 8) baseSize = 320
  else if (charCount <= 12) baseSize = 280
  else if (charCount <= 16) baseSize = 245
  else if (charCount <= 20) baseSize = 215
  else if (charCount <= 25) baseSize = 190
  else if (charCount <= 30) baseSize = 165
  else if (charCount <= 35) baseSize = 145
  else if (charCount <= 40) baseSize = 130
  else baseSize = Math.max(110, 320 - (charCount * 10))
  
  return baseSize * EVENT_SCALE_FACTOR
}

/**
 * Details font size
 */
function getDetailsFontSize(): number {
  return 58 * SCALE_FACTOR  // Tag1's 58 scaled
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
 * Generate Tag Style 7
 * Clean implementation following tag1Generator pattern
 */
export async function generateTag7(
  svg: SVGSVGElement,
  formData: TagFormData,
  extractedInfo: ExtractedTagInfo,
  hasUserImage: boolean,
  userImageSrc: string | null
): Promise<void> {
  console.log('=== TAG7 GENERATOR v6.0 - REBUILT FROM SCRATCH ===')
  
  const config = TAG7_CONFIG
  const svgNS = 'http://www.w3.org/2000/svg'
  const layerGroup = svg.querySelector('g#Layer_x0020_1') || svg
  
  // Set viewBox
  svg.setAttribute('viewBox', config.viewBox)
  
  // Starting Y position (scaled from tag1's 540)
  let lastY = 440 * SCALE_FACTOR  // Moved up from 540
  
  // === LOGO ===
  if (hasUserImage && userImageSrc) {
    const logoSize = 200 * SCALE_FACTOR  // Reduced from 280 for smaller logo
    const logoY = 180 * SCALE_FACTOR     // Moved up from 290
    
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
    
    lastY = logoY + logoSize + (56 * SCALE_FACTOR)  // Logo bottom + spacing
  }
  
  // === LOGO TITLE ===
  if (extractedInfo.logoTitle) {
    const logoTitleY = lastY
    const logoTitleFontSize = Math.round(37 * SCALE_FACTOR * getSizeScale('logoTitle', extractedInfo.fieldSizes))  // Reduced from 52 for smaller text
    
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
    logoTitle.setAttribute('fill', config.primaryColor)
    logoTitle.textContent = extractedInfo.logoTitle
    
    await nextTick()
    // Shrink logo title font if it overflows the tag width
    fitText(logoTitle, config.maxWidth * 0.85, 24 * SCALE_FACTOR, logoTitleFontSize)
    await nextTick()
    lastY = getElementBottom(logoTitle) + (80 * SCALE_FACTOR)
  }
  
  // === ORGANIZATION NAME (White on colored section) ===
  const orgText = (formData.tagTitle || '').toUpperCase()
  let orgName = svg.querySelector('#org-name') as SVGTextElement | null
  if (orgText) {
    const orgNameY = lastY || (400 * SCALE_FACTOR)

    if (!orgName) {
      orgName = document.createElementNS(svgNS, 'text') as SVGTextElement
      orgName.setAttribute('id', 'org-name')
      orgName.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(orgName)
    }

    const orgCharCount = orgText.length
    let orgFontSize = getTitleFontSize(orgCharCount)
    orgFontSize = Math.round(orgFontSize * getSizeScale('tagTitle', extractedInfo.fieldSizes))
    const maxWidth = config.maxWidth * 0.9

    orgName.setAttribute('x', String(config.centerX))
    orgName.setAttribute('y', String(orgNameY))
    orgName.setAttribute('font-size', String(orgFontSize))
    orgName.setAttribute('font-family', config.fontFamily)
    orgName.setAttribute('font-weight', 'bold')
    orgName.setAttribute('fill', config.primaryColor)
    orgName.textContent = orgText

    await nextTick()

    const orgLineHeight = orgFontSize * 1.1
    wrapText(orgName, maxWidth, config.centerX, orgLineHeight)
    await nextTick()

    let tspanCount = orgName.querySelectorAll('tspan').length
    const minOrgFontSize = 24 * SCALE_FACTOR
    while (tspanCount > 2 && orgFontSize > minOrgFontSize) {
      orgFontSize -= 4 * SCALE_FACTOR
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
    lastY = getElementBottom(orgName) + (80 * SCALE_FACTOR)
  } else if (orgName) {
    orgName.remove()
  }
  
  // === THEME (White on colored section) ===
  const themeText = (formData.theme || '').toUpperCase()
  let theme = svg.querySelector('#theme-text') as SVGTextElement | null
  if (themeText) {
    const themeCharCount = themeText.length
    let themeFontSize = getThemeFontSize(themeCharCount)
    themeFontSize = Math.round(themeFontSize * getSizeScale('theme', extractedInfo.fieldSizes))
    const themeY = lastY + Math.round(themeFontSize * 0.7)

    if (!theme) {
      theme = document.createElementNS(svgNS, 'text') as SVGTextElement
      theme.setAttribute('id', 'theme-text')
      theme.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(theme)
    }

    const themeMaxWidth = config.maxWidth * 0.70

    theme.setAttribute('x', String(config.centerX))
    theme.setAttribute('y', String(themeY))
    theme.setAttribute('font-size', String(themeFontSize))
    theme.setAttribute('font-family', config.fontFamily)
    theme.setAttribute('font-weight', 'bold')
    theme.setAttribute('fill', config.themeColor)
    theme.textContent = themeText

    await nextTick()

    const themeLineHeight = themeFontSize * 0.95
    wrapText(theme, themeMaxWidth, config.centerX, themeLineHeight)
    await nextTick()

    let tspanCount = theme.querySelectorAll('tspan').length
    const minThemeFontSize = 40 * SCALE_FACTOR
    let iterations = 0
    while (tspanCount > 4 && themeFontSize > minThemeFontSize && iterations < 60) {
      themeFontSize -= 12 * SCALE_FACTOR
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
    lastY = getElementBottom(theme) + (themeFontSize * 0.5)
  } else if (theme) {
    theme.remove()
  }

  // === SUBTHEME ===
  if (extractedInfo.subtheme) {
    const subthemeText = extractedInfo.subtheme
    const subCharCount = subthemeText.length
    let subFontSize: number
    if (subCharCount <= 15) subFontSize = 129 * SCALE_FACTOR
    else if (subCharCount <= 30) subFontSize = 108 * SCALE_FACTOR
    else if (subCharCount <= 50) subFontSize = 93 * SCALE_FACTOR
    else if (subCharCount <= 80) subFontSize = 79 * SCALE_FACTOR
    else subFontSize = 65 * SCALE_FACTOR
    subFontSize = Math.round(subFontSize * getSizeScale('subtheme', extractedInfo.fieldSizes))

    const subMaxWidth = config.width * 0.55
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
    subthemeEl.setAttribute('fill', config.primaryColor)
    subthemeEl.textContent = subthemeText

    await nextTick()

    const subLineHeight = subFontSize * 1.2
    wrapText(subthemeEl, subMaxWidth, config.centerX, subLineHeight)
    await nextTick()

    let subTspanCount = subthemeEl.querySelectorAll('tspan').length
    const minSubFontSize = 30 * SCALE_FACTOR
    let subIter = 0
    while (subTspanCount > 4 && subFontSize > minSubFontSize && subIter < 30) {
      subFontSize -= 8 * SCALE_FACTOR
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
    lastY = getElementBottom(subthemeEl) + (50 * SCALE_FACTOR)
  } else {
    const oldSubtheme = svg.querySelector('#subtheme-text')
    if (oldSubtheme) oldSubtheme.remove()
  }
  
  // === EVENT TYPE (Dark blue on white section) ===
  const eventText = (formData.eventType || '').toUpperCase()
  let eventType = svg.querySelector('#event-type') as SVGTextElement | null
  if (eventText) {
    const eventStartY = Math.max(lastY + (50 * SCALE_FACTOR), 135000)

    if (!eventType) {
      eventType = document.createElementNS(svgNS, 'text') as SVGTextElement
      eventType.setAttribute('id', 'event-type')
      eventType.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(eventType)
    }

    const eventCharCount = eventText.length
    let eventFontSize = getEventFontSize(eventCharCount)
    eventFontSize = Math.round(eventFontSize * getSizeScale('eventType', extractedInfo.fieldSizes))
    const eventMaxWidth = config.maxWidth * 0.70

    eventType.setAttribute('x', String(config.centerX))
    eventType.setAttribute('y', String(eventStartY))
    eventType.setAttribute('font-size', String(eventFontSize))
    eventType.setAttribute('font-family', config.fontFamily)
    eventType.setAttribute('font-weight', 'bold')
    eventType.setAttribute('fill', config.eventTypeColor)
    eventType.textContent = eventText

    console.log('Tag7 Event: text="' + eventText + '", chars=' + eventCharCount + ', fontSize=' + eventFontSize)

    await nextTick()

    const eventWords = eventText.trim().split(/\s+/)
    if (eventWords.length > 1) {
      const eventLineHeight = eventFontSize * 1.1
      wrapText(eventType, eventMaxWidth, config.centerX, eventLineHeight)
      await nextTick()

      let eventTspanCount = eventType.querySelectorAll('tspan').length
      let eventIterations = 0
      const minEventFontSize = 48 * EVENT_SCALE_FACTOR
      while (eventTspanCount > 2 && eventFontSize > minEventFontSize && eventIterations < 50) {
        eventFontSize -= 8 * SCALE_FACTOR
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
    } else {
      fitText(eventType, eventMaxWidth, 48 * EVENT_SCALE_FACTOR, eventFontSize)
      await nextTick()
    }

    centerText(eventType, config.centerX)
    await nextTick()
    lastY = getElementBottom(eventType) + (eventFontSize * 0.3)
  } else if (eventType) {
    eventType.remove()
  }

  // === BASE TEXT ===
  if (extractedInfo.baseText) {
    const baseTextContent = extractedInfo.baseText
    const baseCharCount = baseTextContent.length
    let baseFontSize: number
    if (baseCharCount <= 30) baseFontSize = 68 * SCALE_FACTOR
    else if (baseCharCount <= 60) baseFontSize = 57 * SCALE_FACTOR
    else if (baseCharCount <= 100) baseFontSize = 50 * SCALE_FACTOR
    else baseFontSize = 43 * SCALE_FACTOR
    baseFontSize = Math.round(baseFontSize * getSizeScale('baseText', extractedInfo.fieldSizes))

    const baseMaxWidth = config.width * 0.75
    const baseLineHeight = baseFontSize * 1.3

    let baseTextGroup = svg.querySelector('#base-text-group') as SVGGElement
    if (!baseTextGroup) {
      baseTextGroup = document.createElementNS(svgNS, 'g') as SVGGElement
      baseTextGroup.setAttribute('id', 'base-text-group')
      layerGroup.appendChild(baseTextGroup)
    } else {
      baseTextGroup.innerHTML = ''
    }

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

    const baseStartY = lastY + (40 * SCALE_FACTOR)

    baseLines.forEach((line, i) => {
      const txt = document.createElementNS(svgNS, 'text') as SVGTextElement
      txt.setAttribute('x', String(config.centerX))
      txt.setAttribute('y', String(baseStartY + (i * baseLineHeight)))
      txt.setAttribute('text-anchor', 'middle')
      txt.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
      txt.setAttribute('font-weight', 'bold')
      txt.setAttribute('font-size', String(baseFontSize))
      txt.setAttribute('fill', config.detailsColor)
      txt.textContent = line
      baseTextGroup.appendChild(txt)
    })

    lastY = baseStartY + (baseLines.length * baseLineHeight)
  } else {
    const oldBaseText = svg.querySelector('#base-text-group')
    if (oldBaseText) oldBaseText.remove()
  }
  
  // === EVENT DETAILS (Date, Time, Venue) ===
  const detailsFontSize = Math.round(getDetailsFontSize() * getSizeScale('venue', extractedInfo.fieldSizes))
  const detailsLineHeight = detailsFontSize * 1.3
  
  let detailsGroup = svg.querySelector('#event-details-group') as SVGGElement
  if (!detailsGroup) {
    detailsGroup = document.createElementNS(svgNS, 'g') as SVGGElement
    detailsGroup.setAttribute('id', 'event-details-group')
    layerGroup.appendChild(detailsGroup)
  } else {
    detailsGroup.innerHTML = ''
  }
  
  const detailsStartY = Math.max(lastY, 145000)
  let currentDetailY = detailsStartY
  
  if (extractedInfo.date) {
    const dateText = document.createElementNS(svgNS, 'text') as SVGTextElement
    dateText.setAttribute('x', String(config.centerX))
    dateText.setAttribute('y', String(currentDetailY))
    dateText.setAttribute('text-anchor', 'middle')
    dateText.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    dateText.setAttribute('font-weight', 'normal')
    dateText.setAttribute('font-size', String(detailsFontSize))
    dateText.setAttribute('fill', config.detailsColor)
    dateText.textContent = `Date: ${extractedInfo.date}`
    detailsGroup.appendChild(dateText)
    await nextTick()
    fitText(dateText, config.width * 0.8, 24 * SCALE_FACTOR, detailsFontSize)
    await nextTick()
    currentDetailY += detailsLineHeight
  }
  
  if (extractedInfo.time) {
    const timeText = document.createElementNS(svgNS, 'text') as SVGTextElement
    timeText.setAttribute('x', String(config.centerX))
    timeText.setAttribute('y', String(currentDetailY))
    timeText.setAttribute('text-anchor', 'middle')
    timeText.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    timeText.setAttribute('font-weight', 'normal')
    timeText.setAttribute('font-size', String(detailsFontSize))
    timeText.setAttribute('fill', config.detailsColor)
    timeText.textContent = `Time: ${extractedInfo.time}`
    detailsGroup.appendChild(timeText)
    await nextTick()
    fitText(timeText, config.width * 0.8, 24 * SCALE_FACTOR, detailsFontSize)
    await nextTick()
    currentDetailY += detailsLineHeight
  }
  
  if (extractedInfo.venue) {
    const venueText = document.createElementNS(svgNS, 'text') as SVGTextElement
    venueText.setAttribute('x', String(config.centerX))
    venueText.setAttribute('y', String(currentDetailY))
    venueText.setAttribute('text-anchor', 'middle')
    venueText.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    venueText.setAttribute('font-weight', 'normal')
    venueText.setAttribute('font-size', String(detailsFontSize))
    venueText.setAttribute('fill', config.detailsColor)
    venueText.textContent = `Venue: ${extractedInfo.venue}`
    detailsGroup.appendChild(venueText)
    await nextTick()
    wrapText(venueText, config.width * 0.8, config.centerX, detailsLineHeight)
    await nextTick()
  }
  
  // Apply field order reordering
  applyFieldOrder(svg, extractedInfo.fieldOrder)

  await nextTick()
  console.log('=== TAG7 GENERATION COMPLETE ===')
}
