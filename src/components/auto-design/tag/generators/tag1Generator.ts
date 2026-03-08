/**
 * Tag Style 1 Generator (Classic Green)
 * Generates preview based on tag.svg template design
 * Features: White background, green accents, red event type
 */

import { nextTick } from 'vue'
import type { TagFormData, ExtractedTagInfo } from '../types'
import { getSizeScale } from '../types'
import { getTagSVGElements, updateTagText, centerText, wrapText, resetText, setTwoLineTitle, fitText, applyFieldOrder } from '../utils/tagTemplateUtils'

export interface Tag1Config {
  // Template info
  templateName: 'tag.svg'
  displayName: 'Style 1 (Classic)'
  
  // Colors - based on NEW tag.svg
  primaryColor: '#068A4F'  // Green (updated from #00A859)
  eventTypeColor: '#ED3237'  // Red for event type
  detailsTextColor: '#FFFFFF'  // White for text on green bar
  backgroundColor: '#FFFFFF'  // White background
  
  // Layout - based on NEW tag.svg viewBox
  viewBox: '0 0 2030.75 2872.06'
  width: 2030.75
  height: 2872.06
  centerX: 1015.375  // width / 2
  maxWidth: 1726.1375  // 85% of width
  
  // Y positions from NEW tag.svg
  orgNameY: number  // Organization name position
  themeY: number   // Theme position  
  lineY: number    // Horizontal line position
  eventTypeY: number  // Event type position
  
  // Bottom bar settings (from NEW tag.svg)
  bottomBarY: 2309.57
  bottomBarHeight: 562.49
  bottomBarColor: '#068A4F'
  
  // Horizontal line (from NEW tag.svg)
  lineHeight: 18.31
  lineX: 0
  lineWidth: 2030.75
  
  // Font settings
  fontFamily: 'Bebas Neue, Bebas, Oswald, Impact, Arial Narrow, sans-serif'
}

export const TAG1_CONFIG: Tag1Config = {
  templateName: 'tag.svg',
  displayName: 'Style 1 (Classic)',
  primaryColor: '#068A4F',
  eventTypeColor: '#ED3237',
  detailsTextColor: '#FFFFFF',
  backgroundColor: '#FFFFFF',
  viewBox: '0 0 2030.75 2872.06',
  width: 2030.75,
  height: 2872.06,
  centerX: 1015.375,
  maxWidth: 1726.1375,
  orgNameY: 960,  // Organization name position (moved down)
  themeY: 1440,   // Theme position (adjusted for new scale)
  lineY: 1807.53,  // Horizontal line position from SVG
  eventTypeY: 1980,  // Event type position - moved up even more
  bottomBarY: 2309.57,  // From SVG
  bottomBarHeight: 562.49,  // From SVG
  bottomBarColor: '#068A4F',
  lineHeight: 18.31,  // From SVG
  lineX: 0,  // Full width line
  lineWidth: 2030.75,  // Full width
  fontFamily: 'Bebas Neue, Bebas, Oswald, Impact, Arial Narrow, sans-serif'
}

/**
 * Organization name font size - based on tag.svg (800.36px base)
 */
function getTitleFontSize(charCount: number): number {
  let baseSize: number
  // Much more aggressive reduction
  if (charCount <= 10) baseSize = 120  // Further reduced
  else if (charCount <= 15) baseSize = 105  // More aggressive
  else if (charCount <= 20) baseSize = 92   // More aggressive
  else if (charCount <= 25) baseSize = 80   // More aggressive
  else if (charCount <= 30) baseSize = 70   // More aggressive
  else if (charCount <= 40) baseSize = 60   // More aggressive
  else if (charCount <= 50) baseSize = 52   // More aggressive
  else baseSize = Math.max(45, 120 - (charCount * 2.8))  // Very aggressive
  return baseSize
}

/**
 * Theme font size - based on tag.svg (568.57px base)
 * Max 5 lines with dynamic reduction - FILLS AVAILABLE SPACE
 */
function getThemeFontSize(charCount: number): number {
  let baseSize: number
  // Calibrated for default X6
  if (charCount <= 5) baseSize = 634
  else if (charCount <= 10) baseSize = 571
  else if (charCount <= 15) baseSize = 507
  else if (charCount <= 25) baseSize = 444
  else if (charCount <= 35) baseSize = 380
  else if (charCount <= 45) baseSize = 343
  else if (charCount <= 55) baseSize = 311
  else if (charCount <= 70) baseSize = 279
  else if (charCount <= 90) baseSize = 254
  else if (charCount <= 110) baseSize = 235
  else if (charCount <= 130) baseSize = 216
  else baseSize = Math.max(190, 380 - (charCount * 0.85))
  return baseSize
}

/**
 * Event type font size - based on tag.svg (1880.86px base)
 */
function getEventFontSize(charCount: number): number {
  let baseSize: number
  // Much smaller event sizes
  if (charCount <= 8) baseSize = 320    // Much smaller
  else if (charCount <= 12) baseSize = 280   // Much smaller
  else if (charCount <= 16) baseSize = 245   // Much smaller
  else if (charCount <= 20) baseSize = 215   // Much smaller
  else if (charCount <= 25) baseSize = 190   // Much smaller
  else if (charCount <= 30) baseSize = 165   // Much smaller
  else if (charCount <= 35) baseSize = 145   // Much smaller
  else if (charCount <= 40) baseSize = 130   // Much smaller
  else baseSize = Math.max(110, 320 - (charCount * 10))  // Much smaller
  return baseSize
}

/**
 * Details font size for bottom bar
 */
function getDetailsFontSize(): number {
  return 58  // Reduced more for smaller details
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
 * Generate Tag Style 1 preview
 * Uses TAG1_CONFIG for layout and colors based on tag.svg design
 */
export async function generateTag1(
  svg: SVGSVGElement,
  formData: TagFormData,
  extractedInfo: ExtractedTagInfo,
  hasUserImage: boolean,
  userImageSrc: string | null
): Promise<void> {
  console.log('🟢🟢🟢 TAG1 GENERATOR V5.0 LOADED - Jan 23 2026 🟢🟢🟢')
  const config = TAG1_CONFIG
  const svgNS = 'http://www.w3.org/2000/svg'
  const layerGroup = svg.querySelector('g#Layer_x0020_1') || svg

  // Set viewBox
  svg.setAttribute('viewBox', config.viewBox)
  
  let lastY = 540  // Start Y position

  // === LOGO ===
  if (hasUserImage && userImageSrc) {
    const logoSize = 280  // Increased from 240
    const logoY = 290

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
    
    lastY = logoY + logoSize + 56  // Logo bottom + spacing
  }

  // === LOGO TITLE ===
  if (extractedInfo.logoTitle) {
    const logoTitleY = lastY
    const logoTitleFontSize = Math.round(52 * getSizeScale('logoTitle', extractedInfo.fieldSizes))

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
    fitText(logoTitle, config.maxWidth * 0.85, 24, logoTitleFontSize)
    await nextTick()
    lastY = getElementBottom(logoTitle) + 80  // Increased from 56 to bring org name down
  }

  // === ORGANIZATION NAME (Red, Arial Bold) ===
  const orgText = (formData.tagTitle || '').toUpperCase()
  let orgName = svg.querySelector('#org-name') as SVGTextElement | null
  if (orgText) {
    const orgNameY = lastY || 580

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
    orgName.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    orgName.setAttribute('font-weight', 'bold')
    orgName.setAttribute('fill', config.eventTypeColor)
    orgName.textContent = orgText

    await nextTick()

    const orgLineHeight = orgFontSize * 1.1
    wrapText(orgName, maxWidth, config.centerX, orgLineHeight)
    await nextTick()

    let tspanCount = orgName.querySelectorAll('tspan').length
    let minOrgFontSize = 24
    while (tspanCount > 2 && orgFontSize > minOrgFontSize) {
      orgFontSize -= 4
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
    lastY = getElementBottom(orgName) + 100
  } else if (orgName) {
    orgName.remove()
  }

  // === THEME (Green, Bebas Neue) ===
  const themeText = (formData.theme || '').toUpperCase()
  let theme = svg.querySelector('#theme-text') as SVGTextElement | null
  if (themeText) {
    const themeCharCount = themeText.length
    let themeFontSize = getThemeFontSize(themeCharCount)
    themeFontSize = Math.round(themeFontSize * getSizeScale('theme', extractedInfo.fieldSizes))
    const themeMaxWidth = themeCharCount > 30 ? config.maxWidth * 0.85 : config.maxWidth * 0.70
    const themeY = lastY + Math.round(themeFontSize * 0.7)

    if (!theme) {
      theme = document.createElementNS(svgNS, 'text') as SVGTextElement
      theme.setAttribute('id', 'theme-text')
      theme.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(theme)
    }

    theme.setAttribute('x', String(config.centerX))
    theme.setAttribute('y', String(themeY))
    theme.setAttribute('font-size', String(themeFontSize))
    theme.setAttribute('font-family', config.fontFamily)
    theme.setAttribute('font-weight', 'bold')
    theme.setAttribute('fill', config.primaryColor)
    theme.textContent = themeText

    await nextTick()

    const themeLineHeight = themeFontSize * 0.95
    wrapText(theme, themeMaxWidth, config.centerX, themeLineHeight)
    await nextTick()

    let tspanCount = theme.querySelectorAll('tspan').length
    let minThemeFontSize = 40
    let iterations = 0
    while (tspanCount > 4 && themeFontSize > minThemeFontSize && iterations < 60) {
      themeFontSize -= 12
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
    lastY = getElementBottom(theme) + 60
  } else if (theme) {
    theme.remove()
  }

  // === SUBTHEME ===
  if (extractedInfo.subtheme) {
    const subthemeText = extractedInfo.subtheme
    const subCharCount = subthemeText.length
    let subFontSize: number
    if (subCharCount <= 15) subFontSize = 186
    else if (subCharCount <= 30) subFontSize = 157
    else if (subCharCount <= 50) subFontSize = 131
    else if (subCharCount <= 80) subFontSize = 108
    else subFontSize = 85
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
    const minSubFontSize = 40
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
  } else {
    const oldSubtheme = svg.querySelector('#subtheme-text')
    if (oldSubtheme) oldSubtheme.remove()
  }

  // === HORIZONTAL LINE (decoration) - Dynamic position based on content ===
  const lineY = Math.max(lastY, config.lineY)
  const horizontalLine = svg.querySelectorAll('rect.fil2')[0] as SVGRectElement
  if (horizontalLine) {
    horizontalLine.setAttribute('y', String(lineY))
    horizontalLine.setAttribute('x', String(config.lineX))
    horizontalLine.setAttribute('width', String(config.lineWidth))
    horizontalLine.setAttribute('height', String(config.lineHeight))
    horizontalLine.setAttribute('fill', config.primaryColor)
  }
  lastY = lineY + config.lineHeight + 80

  // === EVENT TYPE (Red, below the line) ===
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

    const eventMaxWidth = config.maxWidth * 0.70

    eventType.setAttribute('x', String(config.centerX))
    eventType.setAttribute('y', String(eventStartY))
    eventType.setAttribute('font-size', String(eventFontSize))
    eventType.setAttribute('font-family', 'Montserrat, Arial, Helvetica, sans-serif')
    eventType.setAttribute('font-weight', 'bold')
    eventType.setAttribute('fill', config.eventTypeColor)
    eventType.textContent = eventText

    await nextTick()

    const eventLineHeight = eventFontSize * 1.1
    wrapText(eventType, eventMaxWidth, config.centerX, eventLineHeight)
    await nextTick()

    let eventTspanCount = eventType.querySelectorAll('tspan').length
    let eventIterations = 0
    let minEventFontSize = 48
    while (eventTspanCount > 2 && eventFontSize > minEventFontSize && eventIterations < 50) {
      eventFontSize -= 8
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

  // === BASE TEXT ===
  if (extractedInfo.baseText) {
    const baseTextContent = extractedInfo.baseText
    const baseCharCount = baseTextContent.length
    let baseFontSize: number
    if (baseCharCount <= 30) baseFontSize = 95
    else if (baseCharCount <= 60) baseFontSize = 81
    else if (baseCharCount <= 100) baseFontSize = 70
    else baseFontSize = 61
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

    const baseStartY = Math.max(config.bottomBarY + 80, lastY + 60)
    // Compute total height to ensure it fits inside the green bar
    const totalBaseHeight = baseLines.length * baseLineHeight
    // If it would overflow the green bar, push start up to fit
    const greenBarEnd = config.bottomBarY + config.bottomBarHeight - 40
    const adjustedStartY = (baseStartY + totalBaseHeight > greenBarEnd)
      ? greenBarEnd - totalBaseHeight
      : baseStartY

    baseLines.forEach((line, i) => {
      const txt = document.createElementNS(svgNS, 'text') as SVGTextElement
      txt.setAttribute('x', String(config.centerX))
      txt.setAttribute('y', String(adjustedStartY + (i * baseLineHeight)))
      txt.setAttribute('text-anchor', 'middle')
      txt.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
      txt.setAttribute('font-weight', 'bold')
      txt.setAttribute('font-size', String(baseFontSize))
      txt.setAttribute('fill', '#FFFFFF')
      txt.textContent = line
      baseTextGroup.appendChild(txt)
    })

    lastY = adjustedStartY + (baseLines.length * baseLineHeight)
  } else {
    const oldBaseText = svg.querySelector('#base-text-group')
    if (oldBaseText) oldBaseText.remove()
  }

  // === EVENT DETAILS (Date, Time, Venue) - White on green ===
  const detailsFontSize = Math.round(getDetailsFontSize() * getSizeScale('venue', extractedInfo.fieldSizes))
  const detailsLineHeight = detailsFontSize * 1.3  // Reduced line height
  
  let detailsGroup = svg.querySelector('#event-details-group') as SVGGElement
  if (!detailsGroup) {
    detailsGroup = document.createElementNS(svgNS, 'g') as SVGGElement
    detailsGroup.setAttribute('id', 'event-details-group')
    layerGroup.appendChild(detailsGroup)
  } else {
    detailsGroup.innerHTML = ''
  }
  
  const detailsStartY = config.bottomBarY + (config.bottomBarHeight * 0.18)  // Position higher in bottom bar
  let currentDetailY = detailsStartY
  
  if (extractedInfo.date) {
    const dateText = document.createElementNS(svgNS, 'text') as SVGTextElement
    dateText.setAttribute('x', String(config.centerX))
    dateText.setAttribute('y', String(currentDetailY))
    dateText.setAttribute('text-anchor', 'middle')
    dateText.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    dateText.setAttribute('font-weight', 'bold')
    dateText.setAttribute('font-size', String(detailsFontSize))
    dateText.setAttribute('fill', '#FFFFFF')  // White color
    dateText.textContent = `Date: ${extractedInfo.date}`
    detailsGroup.appendChild(dateText)
    await nextTick()
    // Shrink date text if it overflows
    fitText(dateText, config.maxWidth * 0.8, 24, detailsFontSize)
    await nextTick()
    currentDetailY += detailsLineHeight
  }
  
  if (extractedInfo.time) {
    const timeText = document.createElementNS(svgNS, 'text') as SVGTextElement
    timeText.setAttribute('x', String(config.centerX))
    timeText.setAttribute('y', String(currentDetailY))
    timeText.setAttribute('text-anchor', 'middle')
    timeText.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    timeText.setAttribute('font-weight', 'bold')
    timeText.setAttribute('font-size', String(detailsFontSize))
    timeText.setAttribute('fill', '#FFFFFF')  // White color
    timeText.textContent = `Time: ${extractedInfo.time}`
    detailsGroup.appendChild(timeText)
    await nextTick()
    // Shrink time text if it overflows
    fitText(timeText, config.maxWidth * 0.8, 24, detailsFontSize)
    await nextTick()
    currentDetailY += detailsLineHeight
  }
  
  if (extractedInfo.venue) {
    const venueText = document.createElementNS(svgNS, 'text') as SVGTextElement
    venueText.setAttribute('x', String(config.centerX))
    venueText.setAttribute('y', String(currentDetailY))
    venueText.setAttribute('text-anchor', 'middle')
    venueText.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    venueText.setAttribute('font-weight', 'bold')
    venueText.setAttribute('font-size', String(detailsFontSize))
    venueText.setAttribute('fill', '#FFFFFF')  // White color
    venueText.textContent = `Venue: ${extractedInfo.venue}`
    detailsGroup.appendChild(venueText)
    await nextTick()
    // Wrap venue if too long
    wrapText(venueText, config.maxWidth * 0.8, config.centerX, detailsLineHeight)
    await nextTick()
  }

  // === BOTTOM BAR - Green ===
  const bottomBar = svg.querySelectorAll('rect.fil1')[0] as SVGRectElement
  if (bottomBar) {
    bottomBar.setAttribute('y', String(config.bottomBarY))
    bottomBar.setAttribute('height', String(config.bottomBarHeight))
    bottomBar.setAttribute('width', String(config.width))
    bottomBar.setAttribute('fill', config.bottomBarColor)
  }

  // Apply field order reordering
  applyFieldOrder(svg, extractedInfo.fieldOrder)

  await nextTick()
}
