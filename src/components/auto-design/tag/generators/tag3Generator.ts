/**
 * Tag Style 3 Generator (Clean Simple Layout)
 * Based on tag3.svg template structure:
 * - Gradient background (cream to white)
 * - Red bottom section starting at y=48019.31
 * - Border decoration
 * - ViewBox: 0 0 55711.75 78792.36
 */

import { nextTick } from 'vue'
import type { TagFormData, ExtractedTagInfo } from '../types'
import { getSizeScale } from '../types'
import { centerText, wrapText, resetText, fitText, applyFieldOrder } from '../utils/tagTemplateUtils'

export interface Tag3Config {
  templateName: 'tag3.svg'
  displayName: 'Style 3 (Official)'
  
  // SVG dimensions from tag3.svg
  viewBox: '0 0 3124.81 4419.38'
  width: 3124.81
  height: 4419.38
  centerX: 1562.405  // width / 2
  
  // Red section from original SVG
  redSectionY: 2898.35
  redSectionHeight: 1521.03
  
  // Colors - from tag3.svg: .fil1=red, .fil0=white, .fil2=red gradient
  orgNameColor: '#FF0000'  // Red (fil1)
  themeColor: '#000000'  // Black
  logoTitleColor: '#000000'  // Black
  eventColor: '#FFFFFF'  // White (fil0) on red background
  detailsColor: '#FFFFFF'  // White on red background
  
  // Font settings
  orgNameFont: 'Arial, Helvetica, sans-serif'
  themeFont: 'Arial, Helvetica, sans-serif'
  eventFont: 'Bebas Neue, Bebas, Oswald, Impact, Arial Narrow, sans-serif'
  detailsFont: 'Arial, Helvetica, sans-serif'
}

export const TAG3_CONFIG: Tag3Config = {
  templateName: 'tag3.svg',
  displayName: 'Style 3 (Official)',
  viewBox: '0 0 3124.81 4419.38',
  width: 3124.81,
  height: 4419.38,
  centerX: 1562.405,
  redSectionY: 2898.35,
  redSectionHeight: 1521.03,
  orgNameColor: '#FF0000',
  themeColor: '#000000',  // Black
  logoTitleColor: '#000000',  // Black
  eventColor: '#FFFFFF',
  detailsColor: '#FFFFFF',  // White
  orgNameFont: 'Arial, Helvetica, sans-serif',
  themeFont: 'Arial, Helvetica, sans-serif',
  eventFont: 'Bebas Neue, Bebas, Oswald, Impact, Arial Narrow, sans-serif',
  detailsFont: 'Arial, Helvetica, sans-serif'
}

/**
 * Organization name font size
 */
function getOrgNameFontSize(charCount: number): number {
  // Slightly reduced org name font for better proportion
  if (charCount <= 10) return 200
  else if (charCount <= 15) return 178
  else if (charCount <= 20) return 158
  else if (charCount <= 25) return 140
  else if (charCount <= 30) return 125
  else return Math.max(90, 200 - (charCount * 4))
}

/**
 * Theme font size
 */
function getThemeFontSize(charCount: number): number {
  // Calibrated for default X6
  if (charCount <= 5) return 1268
  else if (charCount <= 10) return 1115
  else if (charCount <= 15) return 786
  else if (charCount <= 25) return 621
  else if (charCount <= 35) return 659
  else if (charCount <= 45) return 532
  else if (charCount <= 55) return 469
  else return Math.max(355, 887 - (charCount * 5))
}

/**
 * Event type font size
 */
function getEventFontSize(charCount: number): number {
  // Reduced font sizes further
  if (charCount <= 8) return 740  // Reduced from 820
  else if (charCount <= 12) return 650  // Reduced from 720
  else if (charCount <= 16) return 560  // Reduced from 620
  else if (charCount <= 20) return 470  // Reduced from 520
  else return Math.max(290, 740 - (charCount * 23))
}

/**
 * Details font size
 */
function getDetailsFontSize(): number {
  return 95
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
 * Generate Tag Style 3 preview
 */
export async function generateTag3(
  svg: SVGSVGElement,
  formData: TagFormData,
  extractedInfo: ExtractedTagInfo,
  hasUserImage: boolean,
  userImageSrc: string | null
): Promise<void> {
  const config = TAG3_CONFIG
  const svgNS = 'http://www.w3.org/2000/svg'
  const layerGroup = svg.querySelector('g#Layer_x0020_1') || svg
  
  // Set viewBox
  svg.setAttribute('viewBox', config.viewBox)
  
  let lastY = 1350  // Start Y position
  
  // === LOGO ===
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
    logoTitle.setAttribute('fill', '#000000')  // Black color
    logoTitle.textContent = extractedInfo.logoTitle
    await nextTick()
    // Shrink logo title font if it overflows the tag width
    fitText(logoTitle, config.width * 0.85, 40, logoTitleFontSize)
    await nextTick()
    lastY = getElementBottom(logoTitle) + 80
  }
  
  // === ORGANIZATION NAME (Red, Arial Bold) ===
  const orgText = (formData.tagTitle || '').toUpperCase()
  let orgName = svg.querySelector('#org-name') as SVGTextElement | null
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
    orgName.setAttribute('font-family', 'Arial, Helvetica, sans-serif')
    orgName.setAttribute('font-weight', 'normal')
    orgName.setAttribute('fill', config.orgNameColor)
    orgName.textContent = orgText

    await nextTick()

    // Wrap if needed (max 2 lines)
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

  // === THEME (Green, Bebas Neue) ===
  const themeText = (formData.theme || '').toUpperCase()
  let theme = svg.querySelector('#theme-text') as SVGTextElement | null
  if (themeText) {
    const themeCharCount = themeText.length
    let themeFontSize = getThemeFontSize(themeCharCount)
    themeFontSize = Math.round(themeFontSize * getSizeScale('theme', extractedInfo.fieldSizes))
    // Dynamic Y from previous element with ascent offset
    const themeY = lastY + Math.round(themeFontSize * 0.7)

    if (!theme) {
      theme = document.createElementNS(svgNS, 'text') as SVGTextElement
      theme.setAttribute('id', 'theme-text')
      theme.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(theme)
    }

    const themeMaxWidth = config.width * 0.70

    theme.setAttribute('x', String(config.centerX))
    theme.setAttribute('y', String(themeY))
    theme.setAttribute('font-size', String(themeFontSize))
    theme.setAttribute('font-family', config.eventFont)
    theme.setAttribute('font-weight', 'bold')
    theme.setAttribute('fill', '#000000')
    theme.textContent = themeText

    await nextTick()

    // Wrap if needed (max 4 lines) - tighter line spacing for short text
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
    lastY = getElementBottom(theme) + (themeFontSize * 0.5)
  } else if (theme) {
    theme.remove()
  }

  // === SUBTHEME ===
  if (extractedInfo.subtheme) {
    const subthemeText = extractedInfo.subtheme
    const subCharCount = subthemeText.length
    let subFontSize: number
    if (subCharCount <= 15) subFontSize = 287
    else if (subCharCount <= 30) subFontSize = 245
    else if (subCharCount <= 50) subFontSize = 203
    else if (subCharCount <= 80) subFontSize = 165
    else subFontSize = 135
    subFontSize = Math.round(subFontSize * getSizeScale('subtheme', extractedInfo.fieldSizes))

    const subMaxWidth = config.width * 0.55
    // Fixed subtheme position — anchored relative to redSectionY, stays put regardless of content
    const subFixedY = config.redSectionY - Math.round(subFontSize * 1.2)
    const subY = Math.min(lastY - Math.round(subFontSize * 0.40), subFixedY)

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
    subthemeEl.setAttribute('font-family', config.detailsFont)
    subthemeEl.setAttribute('font-weight', 'bold')
    subthemeEl.setAttribute('fill', config.themeColor)
    subthemeEl.textContent = subthemeText

    await nextTick()

    const subLineHeight = subFontSize * 1.2
    wrapText(subthemeEl, subMaxWidth, config.centerX, subLineHeight)
    await nextTick()

    let subTspanCount = subthemeEl.querySelectorAll('tspan').length
    const minSubFontSize = 65
    let subIter = 0
    while (subTspanCount > 4 && subFontSize > minSubFontSize && subIter < 30) {
      subFontSize -= 12
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
    lastY = getElementBottom(subthemeEl) + 80
  } else {
    const oldSubtheme = svg.querySelector('#subtheme-text')
    if (oldSubtheme) oldSubtheme.remove()
  }

  // === EVENT TYPE (White on red, positioned in red section) ===
  const eventText = (formData.eventType || '').toUpperCase()
  const hasEventType = !!(eventText && eventText.trim())
  let eventType = svg.querySelector('#event-type') as SVGTextElement | null

  // Move red rect down when no event input
  const redRect = svg.querySelector('rect.fil1') as SVGRectElement
  if (redRect) {
    const redRectY = hasEventType ? config.redSectionY : config.redSectionY + 600
    redRect.setAttribute('y', String(redRectY))
  }

  if (eventText) {
    // Position dynamically: at least in the red section, or below previous content
    const eventStartY = Math.max(lastY + 100, config.redSectionY + 200)

    if (!eventType) {
      eventType = document.createElementNS(svgNS, 'text') as SVGTextElement
      eventType.setAttribute('id', 'event-type')
      eventType.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(eventType)
    }

    const eventCharCount = eventText.length
    let eventFontSize = getEventFontSize(eventCharCount)
    eventFontSize = Math.round(eventFontSize * getSizeScale('eventType', extractedInfo.fieldSizes))
    eventType.setAttribute('x', String(config.centerX))
    eventType.setAttribute('y', String(eventStartY))
    eventType.setAttribute('font-size', String(eventFontSize))
    eventType.setAttribute('font-family', config.eventFont)
    eventType.setAttribute('font-weight', 'normal')
    eventType.setAttribute('fill', config.eventColor)
    eventType.textContent = eventText

    await nextTick()

    // Wrap event if too long (max 2 lines)
    const eventMaxWidth = config.width * 0.70
    const eventLineHeight = eventFontSize * 1.1
    wrapText(eventType, eventMaxWidth, config.centerX, eventLineHeight)
    await nextTick()

    // Enforce max 2 lines
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

  // === BASE TEXT ===
  if (extractedInfo.baseText) {
    const baseTextContent = extractedInfo.baseText
    const baseCharCount = baseTextContent.length
    let baseFontSize: number
    if (baseCharCount <= 30) baseFontSize = 146
    else if (baseCharCount <= 60) baseFontSize = 124
    else if (baseCharCount <= 100) baseFontSize = 108
    else baseFontSize = 95
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

    const baseStartY = Math.max(lastY + 150, config.redSectionY + 300)

    baseLines.forEach((line, i) => {
      const txt = document.createElementNS(svgNS, 'text') as SVGTextElement
      txt.setAttribute('x', String(config.centerX))
      txt.setAttribute('y', String(baseStartY + (i * baseLineHeight)))
      txt.setAttribute('text-anchor', 'middle')
      txt.setAttribute('font-family', config.detailsFont)
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

  // === EVENT DETAILS (Date, Time, Venue) - White on red ===
  const detailsFontSize = Math.round(getDetailsFontSize() * getSizeScale('venue', extractedInfo.fieldSizes))
  const detailsLineHeight = detailsFontSize * 1.2

  let detailsGroup = svg.querySelector('#event-details-group') as SVGGElement
  if (!detailsGroup) {
    detailsGroup = document.createElementNS(svgNS, 'g') as SVGGElement
    detailsGroup.setAttribute('id', 'event-details-group')
    layerGroup.appendChild(detailsGroup)
  } else {
    detailsGroup.innerHTML = ''
  }

  // Position details dynamically below event type (or below last element if no event)
  const detailsStartY = Math.max(lastY, config.redSectionY + 300)
  let currentDetailY = detailsStartY

  if (extractedInfo.date) {
    const dateText = document.createElementNS(svgNS, 'text') as SVGTextElement
    dateText.setAttribute('x', String(config.centerX))
    dateText.setAttribute('y', String(currentDetailY))
    dateText.setAttribute('text-anchor', 'middle')
    dateText.setAttribute('font-family', config.detailsFont)
    dateText.setAttribute('font-weight', 'bold')
    dateText.setAttribute('font-size', String(detailsFontSize))
    dateText.setAttribute('fill', '#FFFFFF')
    dateText.textContent = `Date: ${extractedInfo.date}`
    detailsGroup.appendChild(dateText)
    await nextTick()
    fitText(dateText, config.width * 0.8, 40, detailsFontSize)
    await nextTick()
    currentDetailY += detailsLineHeight
  }

  if (extractedInfo.time) {
    const timeText = document.createElementNS(svgNS, 'text') as SVGTextElement
    timeText.setAttribute('x', String(config.centerX))
    timeText.setAttribute('y', String(currentDetailY))
    timeText.setAttribute('text-anchor', 'middle')
    timeText.setAttribute('font-family', config.detailsFont)
    timeText.setAttribute('font-weight', 'bold')
    timeText.setAttribute('font-size', String(detailsFontSize))
    timeText.setAttribute('fill', '#FFFFFF')
    timeText.textContent = `Time: ${extractedInfo.time}`
    detailsGroup.appendChild(timeText)
    await nextTick()
    fitText(timeText, config.width * 0.8, 40, detailsFontSize)
    await nextTick()
    currentDetailY += detailsLineHeight
  }

  if (extractedInfo.venue) {
    const venueText = document.createElementNS(svgNS, 'text') as SVGTextElement
    venueText.setAttribute('x', String(config.centerX))
    venueText.setAttribute('y', String(currentDetailY))
    venueText.setAttribute('text-anchor', 'middle')
    venueText.setAttribute('font-family', config.detailsFont)
    venueText.setAttribute('font-weight', 'bold')
    venueText.setAttribute('font-size', String(detailsFontSize))
    venueText.setAttribute('fill', '#FFFFFF')
    venueText.textContent = `Venue: ${extractedInfo.venue}`
    detailsGroup.appendChild(venueText)
    await nextTick()
    wrapText(venueText, config.width * 0.8, config.centerX, detailsLineHeight)
    await nextTick()
  }

  // Apply field order reordering
  applyFieldOrder(svg, extractedInfo.fieldOrder)

  await nextTick()
}
