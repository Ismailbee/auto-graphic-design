/**
 * Tag Style 4 Generator (Blue Wave Design)
 * Based on tag4.svg template structure:
 * - White background
 * - Dark blue top section (#184A89) with wavy bottom edge at y=5356.12
 * - Light blue wave decoration (#298FB4)
 * - ViewBox: 0 0 6637.45 9381.6
 */

import { nextTick } from 'vue'
import type { TagFormData, ExtractedTagInfo } from '../types'
import { getSizeScale } from '../types'
import { centerText, wrapText, resetText, fitText, applyFieldOrder } from '../utils/tagTemplateUtils'

export interface Tag4Config {
  templateName: 'tag4.svg'
  displayName: 'Style 4 (Blue Wave)'
  
  // SVG dimensions from tag4.svg (updated)
  viewBox: '0 0 8515.29 12036.49'
  width: 8515.29
  height: 12036.49
  centerX: 4257.645  // width / 2
  
  // Blue/Green section from original SVG - actual colors from tag4.svg
  blueSectionY: 8089.28
  blueSectionColor: '#006633'  // Green (fil2)
  waveColor: '#4EC6E4'  // Cyan (fil1)
  
  // Colors - from tag4.svg: .fil1=#4EC6E4 (cyan), .fil2=#006633 (green), .fil0=white
  orgNameColor: string  // Organization name color
  themeColor: '#FFFFFF'  // White on colored background
  eventColor: '#006633'  // Green (fil2) on white background
  detailsColor: '#006633'  // Green on white background
  logoTitleColor: '#006633'  // Green
  
  // Font settings
  orgNameFont: 'Arial, Helvetica, sans-serif'
  themeFont: 'Bebas Neue, Bebas, Oswald, Impact, Arial Narrow, sans-serif'
  eventFont: 'Bebas Neue, Bebas, Oswald, Impact, Arial Narrow, sans-serif'
  detailsFont: 'Arial, Helvetica, sans-serif'
}

export const TAG4_CONFIG: Tag4Config = {
  templateName: 'tag4.svg',
  displayName: 'Style 4 (Blue Wave)',
  viewBox: '0 0 8515.29 12036.49',
  width: 8515.29,
  height: 12036.49,
  centerX: 4257.645,
  blueSectionY: 8089.28,
  blueSectionColor: '#006633',
  waveColor: '#4EC6E4',
  orgNameColor: '#FFFFFF',
  themeColor: '#FFFFFF',
  eventColor: '#006633',
  detailsColor: '#006633',
  logoTitleColor: '#006633',
  orgNameFont: 'Arial, Helvetica, sans-serif',
  themeFont: 'Bebas Neue, Bebas, Oswald, Impact, Arial Narrow, sans-serif',
  eventFont: 'Bebas Neue, Bebas, Oswald, Impact, Arial Narrow, sans-serif',
  detailsFont: 'Arial, Helvetica, sans-serif'
}

/**
 * Organization name font size
 */
function getOrgNameFontSize(charCount: number): number {
  // Reduced org name font sizes for better proportion
  if (charCount <= 10) return 500
  else if (charCount <= 15) return 460
  else if (charCount <= 20) return 420
  else if (charCount <= 25) return 380
  else if (charCount <= 30) return 340
  else return Math.max(250, 500 - (charCount * 8))
}

/**
 * Theme font size
 */
function getThemeFontSize(charCount: number): number {
  // Calibrated for default X6
  if (charCount <= 5) return 1901
  else if (charCount <= 10) return 1711
  else if (charCount <= 15) return 1521
  else if (charCount <= 25) return 1331
  else if (charCount <= 35) return 1204
  else if (charCount <= 45) return 1078
  else if (charCount <= 55) return 951
  else return Math.max(697, 1901 - (charCount * 13))
}

/**
 * Event type font size - dynamically reduces based on text length
 */
function getEventFontSize(charCount: number): number {
  if (charCount <= 8) return 2000
  else if (charCount <= 12) return 1750
  else if (charCount <= 16) return 1450
  else if (charCount <= 20) return 1150
  else if (charCount <= 25) return 950
  else if (charCount <= 30) return 800
  else if (charCount <= 35) return 680
  else if (charCount <= 40) return 580
  else return Math.max(450, 2000 - (charCount * 70))
}

/**
 * Details font size
 */
function getDetailsFontSize(): number {
  return 250
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
 * Generate Tag Style 4 preview
 */
export async function generateTag4(
  svg: SVGSVGElement,
  formData: TagFormData,
  extractedInfo: ExtractedTagInfo,
  hasUserImage: boolean,
  userImageSrc: string | null
): Promise<void> {
  const config = TAG4_CONFIG
  const svgNS = 'http://www.w3.org/2000/svg'
  const layerGroup = svg.querySelector('g#Layer_x0020_1') || svg
  
  // Set viewBox
  svg.setAttribute('viewBox', config.viewBox)
  
  let lastY = 1000  // Start Y position in blue section
  
  // === LOGO (in blue section) ===
  if (hasUserImage && userImageSrc) {
    const logoSize = 1000
    const logoY = 950
    
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
    
    lastY = logoY + logoSize + 400
  }
  
  // === LOGO TITLE (in blue section) ===
  if (extractedInfo.logoTitle) {
    const logoTitleY = lastY
    const logoTitleFontSize = Math.round(270 * getSizeScale('logoTitle', extractedInfo.fieldSizes))
    
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
    logoTitle.setAttribute('fill', config.themeColor)
    logoTitle.textContent = extractedInfo.logoTitle
    await nextTick()
    fitText(logoTitle, config.width * 0.85, 80, logoTitleFontSize)
    await nextTick()
    lastY = getElementBottom(logoTitle) + 200
  }
  
  // === ORGANIZATION NAME (Red, Arial Bold, in blue section) ===
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
    orgName.setAttribute('font-family', config.orgNameFont)
    orgName.setAttribute('font-weight', 'bold')
    orgName.setAttribute('fill', config.orgNameColor)
    orgName.textContent = orgText

    await nextTick()

    const orgLineHeight = orgFontSize * 1.1
    wrapText(orgName, maxWidth, config.centerX, orgLineHeight)
    await nextTick()

    let tspanCount = orgName.querySelectorAll('tspan').length
    let minOrgFontSize = 150
    while (tspanCount > 2 && orgFontSize > minOrgFontSize) {
      orgFontSize -= 20
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
    lastY = getElementBottom(orgName) + 200
  } else if (orgName) {
    orgName.remove()
  }

  // === THEME (White, Bebas Neue, in blue section) ===
  const themeText = (formData.theme || '').toUpperCase()
  let theme = svg.querySelector('#theme-text') as SVGTextElement | null
  if (themeText) {
    const themeCharCount = themeText.length
    let themeFontSize = getThemeFontSize(themeCharCount)
    themeFontSize = Math.round(themeFontSize * getSizeScale('theme', extractedInfo.fieldSizes))
    // Add font ascent offset so theme text doesn't extend above lastY and overlap orgName
    const themeY = lastY + Math.round(themeFontSize * 0.7)
    const themeMaxWidth = config.width * 0.70

    if (!theme) {
      theme = document.createElementNS(svgNS, 'text') as SVGTextElement
      theme.setAttribute('id', 'theme-text')
      theme.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(theme)
    }

    theme.setAttribute('x', String(config.centerX))
    theme.setAttribute('y', String(themeY))
    theme.setAttribute('font-size', String(themeFontSize))
    theme.setAttribute('font-family', 'Montserrat, Arial, Helvetica, sans-serif')
    theme.setAttribute('font-weight', 'bold')
    theme.setAttribute('fill', config.themeColor)
    theme.textContent = themeText

    await nextTick()

    const themeLineHeight = themeFontSize * 0.95
    wrapText(theme, themeMaxWidth, config.centerX, themeLineHeight)
    await nextTick()

    let tspanCount = theme.querySelectorAll('tspan').length
    let minThemeFontSize = 350
    let iterations = 0
    while (tspanCount > 5 && themeFontSize > minThemeFontSize && iterations < 50) {
      themeFontSize -= 35
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

  // === SUBTHEME (White, in blue section, wrapping with narrow width) ===
  if (extractedInfo.subtheme) {
    const subthemeText = extractedInfo.subtheme
    const subCharCount = subthemeText.length
    let subFontSize: number
    if (subCharCount <= 15) subFontSize = 503
    else if (subCharCount <= 30) subFontSize = 431
    else if (subCharCount <= 50) subFontSize = 359
    else if (subCharCount <= 80) subFontSize = 287
    else subFontSize = 245
    subFontSize = Math.round(subFontSize * getSizeScale('subtheme', extractedInfo.fieldSizes))

    // Narrower width so text wraps to second line earlier (away from tag edges)
    const subMaxWidth = config.width * 0.55
    const subY = lastY + 100

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
    subthemeEl.setAttribute('fill', config.themeColor)  // White
    subthemeEl.textContent = subthemeText

    await nextTick()

    const subLineHeight = subFontSize * 1.2
    wrapText(subthemeEl, subMaxWidth, config.centerX, subLineHeight)
    await nextTick()

    // Enforce max 4 lines
    let subTspanCount = subthemeEl.querySelectorAll('tspan').length
    const minSubFontSize = 120
    let subIter = 0
    while (subTspanCount > 4 && subFontSize > minSubFontSize && subIter < 30) {
      subFontSize -= 15
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
    lastY = getElementBottom(subthemeEl) + 100
    console.log(`📏 Tag4 Subtheme: chars=${subCharCount}, fontSize=${subFontSize}, lines=${subTspanCount}`)
  } else {
    // Remove subtheme element when empty
    const oldSubtheme = svg.querySelector('#subtheme-text')
    if (oldSubtheme) oldSubtheme.remove()
  }

  // === EVENT TYPE (on white background below waves) ===
  const eventText = (formData.eventType || '').toUpperCase()
  let eventType = svg.querySelector('#event-type') as SVGTextElement | null
  if (eventText) {
    // Position dynamically: at least in the white section below waves, or below previous content
    const eventStartY = Math.max(lastY + 400, config.blueSectionY + 1200)

    if (!eventType) {
      eventType = document.createElementNS(svgNS, 'text') as SVGTextElement
      eventType.setAttribute('id', 'event-type')
      eventType.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(eventType)
    }

    const eventCharCount = eventText.length
    let eventFontSize = getEventFontSize(eventCharCount)
    eventFontSize = Math.round(eventFontSize * getSizeScale('eventType', extractedInfo.fieldSizes))
    const eventMaxWidth = config.width * 0.9

    eventType.setAttribute('x', String(config.centerX))
    eventType.setAttribute('y', String(eventStartY))
    eventType.setAttribute('font-size', String(eventFontSize))
    eventType.setAttribute('font-family', config.eventFont)
    eventType.setAttribute('font-weight', 'normal')
    eventType.setAttribute('fill', config.eventColor)
    eventType.textContent = eventText

    await nextTick()

    const eventLineHeight = eventFontSize * 1.1
    wrapText(eventType, eventMaxWidth, config.centerX, eventLineHeight)
    await nextTick()

    let eventTspanCount = eventType.querySelectorAll('tspan').length
    let minEventFontSize = 350
    while (eventTspanCount > 2 && eventFontSize > minEventFontSize) {
      eventFontSize -= 35
      eventFontSize = Math.max(minEventFontSize, eventFontSize)
      resetText(eventType)
      eventType.textContent = eventText
      eventType.setAttribute('font-size', String(eventFontSize))
      centerText(eventType, config.centerX)
      await nextTick()
      wrapText(eventType, eventMaxWidth, config.centerX, eventFontSize * 1.1)
      await nextTick()
      eventTspanCount = eventType.querySelectorAll('tspan').length
    }

    centerText(eventType, config.centerX)
    await nextTick()
    lastY = getElementBottom(eventType) + 200
  } else if (eventType) {
    eventType.remove()
  }

  // === BASE TEXT (Green, wrapping) ===
  if (extractedInfo.baseText) {
    const baseTextContent = extractedInfo.baseText
    const baseCharCount = baseTextContent.length
    let baseFontSize: number
    if (baseCharCount <= 30) baseFontSize = 270
    else if (baseCharCount <= 60) baseFontSize = 236
    else if (baseCharCount <= 100) baseFontSize = 203
    else baseFontSize = 176
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

    // Split into wrapped lines
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

    // Position below last section
    const baseStartY = Math.max(lastY + 200, config.blueSectionY + 1600)

    baseLines.forEach((line, i) => {
      const txt = document.createElementNS(svgNS, 'text') as SVGTextElement
      txt.setAttribute('x', String(config.centerX))
      txt.setAttribute('y', String(baseStartY + (i * baseLineHeight)))
      txt.setAttribute('text-anchor', 'middle')
      txt.setAttribute('font-family', config.detailsFont)
      txt.setAttribute('font-weight', 'bold')
      txt.setAttribute('font-size', String(baseFontSize))
      txt.setAttribute('fill', config.detailsColor)  // Deep green (#006633)
      txt.textContent = line
      baseTextGroup.appendChild(txt)
    })

    lastY = baseStartY + (baseLines.length * baseLineHeight)
    console.log(`📏 Tag4 Base Text: ${baseLines.length} lines, green`)
  } else {
    // Remove base text group when empty
    const oldBaseText = svg.querySelector('#base-text-group')
    if (oldBaseText) oldBaseText.remove()
  }

  // === EVENT DETAILS (Date, Time, Venue) ===
  const detailsFontSize = Math.round(getDetailsFontSize() * getSizeScale('venue', extractedInfo.fieldSizes))
  const detailsLineHeight = detailsFontSize * 1.5

  let detailsGroup = svg.querySelector('#event-details-group') as SVGGElement
  if (!detailsGroup) {
    detailsGroup = document.createElementNS(svgNS, 'g') as SVGGElement
    detailsGroup.setAttribute('id', 'event-details-group')
    layerGroup.appendChild(detailsGroup)
  } else {
    detailsGroup.innerHTML = ''
  }

  // Position details dynamically below event type (or below last element)
  const detailsStartY = Math.max(lastY + 200, config.blueSectionY + 1600)
  let currentDetailY = detailsStartY

  if (extractedInfo.date) {
    const dateText = document.createElementNS(svgNS, 'text') as SVGTextElement
    dateText.setAttribute('x', String(config.centerX))
    dateText.setAttribute('y', String(currentDetailY))
    dateText.setAttribute('text-anchor', 'middle')
    dateText.setAttribute('font-family', config.detailsFont)
    dateText.setAttribute('font-weight', 'bold')
    dateText.setAttribute('font-size', String(detailsFontSize))
    dateText.setAttribute('fill', config.detailsColor)
    dateText.textContent = `Date: ${extractedInfo.date}`
    detailsGroup.appendChild(dateText)
    await nextTick()
    fitText(dateText, config.width * 0.8, 80, detailsFontSize)
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
    timeText.setAttribute('fill', config.detailsColor)
    timeText.textContent = `Time: ${extractedInfo.time}`
    detailsGroup.appendChild(timeText)
    await nextTick()
    fitText(timeText, config.width * 0.8, 80, detailsFontSize)
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
}
