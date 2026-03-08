/**
 * Tag Style 5 Generator (Clean Blue Accents)
 * REBUILT from scratch - Feb 1 2026
 * Based on tag5.svg template: Simple white background with two blue triangle accents
 * ViewBox: 0 0 5883.24 8320.59 (updated smaller dimensions)
 */

import { nextTick } from 'vue'
import type { TagFormData, ExtractedTagInfo } from '../types'
import { getSizeScale } from '../types'
import { centerText, wrapText, resetText, fitText, applyFieldOrder } from '../utils/tagTemplateUtils'

console.log('🔵🔵🔵 TAG5 GENERATOR V4.0 REBUILT - Jan 23 2026 🔵🔵🔵')

export interface Tag5Config {
  templateName: 'tag5.svg'
  displayName: 'Style 5 (Clean Blue)'
  
  // Colors
  primaryColor: string      // Red for org name
  themeColor: string        // Blue for theme text
  eventTypeColor: string    // Red for event text
  detailsColor: string      // Red for date/time/venue
  accentColor: string       // Blue for decorative triangles
  
  // Layout - from tag5.svg viewBox
  viewBox: string
  width: number
  height: number
  centerX: number
  maxWidth: number
  
  // Font settings
  fontFamily: string
  eventFontFamily: string
}

export const TAG5_CONFIG: Tag5Config = {
  templateName: 'tag5.svg',
  displayName: 'Style 5 (Clean Blue)',
  primaryColor: '#ED3237',      // Red for org name
  themeColor: '#008FDC',        // Blue for theme
  eventTypeColor: '#ED3237',    // Red for event
  detailsColor: '#ED3237',      // Red for details
  accentColor: '#008FDC',       // Blue triangles
  viewBox: '0 0 5883.24 8320.59',  // Updated smaller dimensions
  width: 5883.24,
  height: 8320.59,
  centerX: 2941.62,             // width / 2
  maxWidth: 5000.75,            // 85% of width
  fontFamily: 'Arial, Helvetica, sans-serif',
  eventFontFamily: 'Impact, Arial Narrow, sans-serif'
}

// Font size functions - scaled for new viewBox (5883.24 x 8320.59)
// Scale factor: ~8x smaller than original
function getOrgFontSize(charCount: number): number {
  if (charCount <= 10) return 260
  if (charCount <= 15) return 232
  if (charCount <= 20) return 200
  if (charCount <= 25) return 178
  if (charCount <= 30) return 158
  if (charCount <= 40) return 138
  return Math.max(112, 260 - (charCount * 4))
}

function getThemeFontSize(charCount: number): number {
  // Calibrated for default X6
  if (charCount <= 5) return 1521
  if (charCount <= 10) return 1331
  if (charCount <= 15) return 1103
  if (charCount <= 20) return 951
  if (charCount <= 30) return 786
  if (charCount <= 40) return 710
  if (charCount <= 60) return 558
  if (charCount <= 80) return 469
  if (charCount <= 100) return 405
  return Math.max(349, 887 - (charCount * 5))
}

function getEventFontSize(charCount: number): number {
  if (charCount <= 8) return 688
  if (charCount <= 12) return 588
  if (charCount <= 16) return 500
  if (charCount <= 20) return 425
  if (charCount <= 25) return 363
  return Math.max(288, 688 - (charCount * 19))
}

function getDetailsFontSize(): number {
  return 188  // Scaled from 1500
}

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
 * Generate Tag Style 5 preview
 * Simple layout: Logo -> LogoTitle -> OrgName -> Theme -> Event -> Details
 */
export async function generateTag5(
  svg: SVGSVGElement,
  formData: TagFormData,
  extractedInfo: ExtractedTagInfo,
  hasUserImage: boolean,
  userImageSrc: string | null
): Promise<void> {
  console.log('🔵🔵🔵 TAG5 GENERATOR V5.0 WITH BACKGROUND - Jan 23 2026 🔵🔵🔵')
  
  const config = TAG5_CONFIG
  const svgNS = 'http://www.w3.org/2000/svg'
  const layerGroup = svg.querySelector('g#Layer_x0020_1') || svg
  
  // Set viewBox
  svg.setAttribute('viewBox', config.viewBox)
  
  // === BACKGROUND IMAGE ===
  // Remove white rect background (but preserve blue polygon triangles)
  let whiteRect = layerGroup.querySelector('rect.fil0') as Element | null
  if (!whiteRect) {
    whiteRect = layerGroup.querySelector('rect[fill="white"]') as Element | null
  }
  if (!whiteRect) {
    // Try finding first rect only (not polygon)
    whiteRect = layerGroup.querySelector('rect') as Element | null
  }
  if (whiteRect) {
    whiteRect.remove()
    console.log('🗑️ Removed white background rect from template')
  } else {
    console.log('⚠️ No white rect found to remove')
  }
  
  // Add background image
  let bgGroup = svg.querySelector('#background-group') as SVGGElement
  if (!bgGroup) {
    bgGroup = document.createElementNS(svgNS, 'g') as SVGGElement
    bgGroup.setAttribute('id', 'background-group')
    // Insert at beginning (before other content)
    const firstChild = layerGroup.firstChild
    if (firstChild) {
      layerGroup.insertBefore(bgGroup, firstChild)
    } else {
      layerGroup.appendChild(bgGroup)
    }
  } else {
    bgGroup.innerHTML = ''
  }
  
  // Wallpaper IS the background - 100% opacity, no white layer
  const bgImage = document.createElementNS(svgNS, 'image') as SVGImageElement
  // Use absolute URL for wallpaper to work in all contexts
  const wallpaperUrl = `${window.location.origin}/images/wallpaper1.jpg`
  console.log('🖼️ Tag5 Wallpaper URL:', wallpaperUrl)
  bgImage.setAttribute('href', wallpaperUrl)
  bgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', wallpaperUrl)
  bgImage.setAttribute('x', '0')
  bgImage.setAttribute('y', '0')
  bgImage.setAttribute('width', String(config.width))
  bgImage.setAttribute('height', String(config.height))
  bgImage.setAttribute('preserveAspectRatio', 'xMidYMid slice')
  bgImage.setAttribute('opacity', '0.3')  // High transparency - background won't display clearly
  bgImage.setAttribute('style', 'image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;')
  bgGroup.appendChild(bgImage)
  
  // Starting Y position for logo (scaled for new viewBox)
  let currentY = 1125  // Was 9000, scaled by 8
  
  // === LOGO ===
  if (hasUserImage && userImageSrc) {
    const logoSize = 813  // Was 6500, scaled by 8
    
    let logoImg = svg.querySelector('#user-logo') as SVGImageElement
    if (!logoImg) {
      logoImg = document.createElementNS(svgNS, 'image') as SVGImageElement
      logoImg.setAttribute('id', 'user-logo')
      logoImg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      layerGroup.appendChild(logoImg)
    }
    
    logoImg.setAttribute('x', String(config.centerX - logoSize / 2))
    logoImg.setAttribute('y', String(currentY))
    logoImg.setAttribute('width', String(logoSize))
    logoImg.setAttribute('height', String(logoSize))
    logoImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', userImageSrc)
    
    currentY += logoSize + 225  // Was 1800, scaled by 8
  }
  
  // === LOGO TITLE ===
  if (extractedInfo.logoTitle) {
    const logoTitleFontSize = Math.round(169 * getSizeScale('logoTitle', extractedInfo.fieldSizes))  // Was 1350, scaled by 8
    
    let logoTitle = svg.querySelector('#logo-title') as SVGTextElement
    if (!logoTitle) {
      logoTitle = document.createElementNS(svgNS, 'text') as SVGTextElement
      logoTitle.setAttribute('id', 'logo-title')
      logoTitle.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(logoTitle)
    }
    
    logoTitle.setAttribute('x', String(config.centerX))
    logoTitle.setAttribute('y', String(currentY))
    logoTitle.setAttribute('font-size', String(logoTitleFontSize))
    logoTitle.setAttribute('font-family', config.fontFamily)
    logoTitle.setAttribute('font-weight', 'normal')
    logoTitle.setAttribute('fill', config.accentColor)  // Blue
    logoTitle.textContent = extractedInfo.logoTitle
    
    await nextTick()
    // Shrink logo title font if it overflows the tag width
    fitText(logoTitle, config.maxWidth * 0.85, 50, logoTitleFontSize)
    await nextTick()
    currentY = getElementBottom(logoTitle) + 188  // Was 1500, scaled by 8
  }
  
  // === ORGANIZATION NAME ===
  const orgText = (formData.tagTitle || '').toUpperCase()
  let orgName = svg.querySelector('#org-name') as SVGTextElement | null
  if (orgText) {
    const orgFontSize = Math.round(getOrgFontSize(orgText.length) * getSizeScale('tagTitle', extractedInfo.fieldSizes))

    if (!orgName) {
      orgName = document.createElementNS(svgNS, 'text') as SVGTextElement
      orgName.setAttribute('id', 'org-name')
      orgName.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(orgName)
    }

    orgName.setAttribute('x', String(config.centerX))
    orgName.setAttribute('y', String(currentY))
    orgName.setAttribute('font-size', String(orgFontSize))
    orgName.setAttribute('font-family', config.fontFamily)
    orgName.setAttribute('font-weight', 'bold')
    orgName.setAttribute('fill', config.primaryColor)
    orgName.textContent = orgText

    await nextTick()

    wrapText(orgName, config.maxWidth * 0.9, config.centerX, orgFontSize * 1.1)
    await nextTick()

    let orgTspanCount = orgName.querySelectorAll('tspan').length
    let orgIterations = 0
    let currentOrgFontSize = orgFontSize
    const minOrgFontSize = 80
    while (orgTspanCount > 2 && currentOrgFontSize > minOrgFontSize && orgIterations < 50) {
      currentOrgFontSize -= 8
      currentOrgFontSize = Math.max(minOrgFontSize, currentOrgFontSize)
      resetText(orgName)
      orgName.textContent = orgText
      orgName.setAttribute('font-size', String(currentOrgFontSize))
      centerText(orgName, config.centerX)
      await nextTick()
      wrapText(orgName, config.maxWidth * 0.9, config.centerX, currentOrgFontSize * 1.1)
      await nextTick()
      orgTspanCount = orgName.querySelectorAll('tspan').length
      orgIterations++
    }

    currentY = getElementBottom(orgName) + 200
  } else if (orgName) {
    orgName.remove()
  }
  
  // === THEME ===
  const themeText = (formData.theme || '').toUpperCase()
  let theme = svg.querySelector('#theme-text') as SVGTextElement | null
  if (themeText) {
    let themeFontSize = getThemeFontSize(themeText.length)
    themeFontSize = Math.round(themeFontSize * getSizeScale('theme', extractedInfo.fieldSizes))
    const themeCharCount = themeText.length
    const themeMaxWidth = themeCharCount <= 15 ? config.maxWidth * 0.50 : (themeCharCount <= 30 ? config.maxWidth * 0.65 : config.maxWidth * 0.85)

    if (!theme) {
      theme = document.createElementNS(svgNS, 'text') as SVGTextElement
      theme.setAttribute('id', 'theme-text')
      theme.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(theme)
    }

    theme.setAttribute('x', String(config.centerX))
    const themeY = currentY + Math.round(themeFontSize * 0.7) + 400
    theme.setAttribute('y', String(themeY))
    theme.setAttribute('font-size', String(themeFontSize))
    theme.setAttribute('font-family', 'Impact, Arial Narrow, sans-serif')
    theme.setAttribute('font-weight', 'bold')
    theme.setAttribute('fill', config.themeColor)
    theme.textContent = themeText

    await nextTick()

    const themeLineHeight = themeFontSize * 0.95
    wrapText(theme, themeMaxWidth, config.centerX, themeLineHeight)
    await nextTick()

    let tspanCount = theme.querySelectorAll('tspan').length
    let iterations = 0
    while (tspanCount > 5 && themeFontSize > 100 && iterations < 20) {
      themeFontSize -= 13
      resetText(theme)
      theme.textContent = themeText
      theme.setAttribute('font-size', String(themeFontSize))
      await nextTick()
      wrapText(theme, themeMaxWidth, config.centerX, themeFontSize * 0.95)
      await nextTick()
      tspanCount = theme.querySelectorAll('tspan').length
      iterations++
    }

    centerText(theme, config.centerX)
    await nextTick()
    currentY = getElementBottom(theme) + 200
  } else if (theme) {
    theme.remove()
  }

  // === SUBTHEME ===
  if (extractedInfo.subtheme) {
    const subthemeText = extractedInfo.subtheme
    const subCharCount = subthemeText.length
    let subFontSize: number
    if (subCharCount <= 15) subFontSize = 539
    else if (subCharCount <= 30) subFontSize = 452
    else if (subCharCount <= 50) subFontSize = 374
    else if (subCharCount <= 80) subFontSize = 309
    else subFontSize = 252
    subFontSize = Math.round(subFontSize * getSizeScale('subtheme', extractedInfo.fieldSizes))

    const subMaxWidth = config.width * 0.55
    // Ensure subtheme is at least at the polygon/triangle level (~Y 4400)
    const subY = Math.max(currentY + Math.round(subFontSize * 0.7), 4400)

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
    subthemeEl.setAttribute('font-family', config.fontFamily)
    subthemeEl.setAttribute('font-weight', 'bold')
    subthemeEl.setAttribute('fill', config.themeColor)
    subthemeEl.textContent = subthemeText

    await nextTick()

    const subLineHeight = subFontSize * 1.2
    wrapText(subthemeEl, subMaxWidth, config.centerX, subLineHeight)
    await nextTick()

    let subTspanCount = subthemeEl.querySelectorAll('tspan').length
    const minSubFontSize = 100
    let subIter = 0
    while (subTspanCount > 4 && subFontSize > minSubFontSize && subIter < 30) {
      subFontSize -= 20
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
    currentY = getElementBottom(subthemeEl) + 150
  } else {
    const oldSubtheme = svg.querySelector('#subtheme-text')
    if (oldSubtheme) oldSubtheme.remove()
  }
  
  // === EVENT TYPE ===
  const eventText = (formData.eventType || '').toUpperCase()
  let eventType = svg.querySelector('#event-type') as SVGTextElement | null
  if (eventText) {
    const eventFontSize = Math.round((getEventFontSize(eventText.length) + 63) * getSizeScale('eventType', extractedInfo.fieldSizes))
    const eventY = currentY + Math.round(eventFontSize * 0.7)

    if (!eventType) {
      eventType = document.createElementNS(svgNS, 'text') as SVGTextElement
      eventType.setAttribute('id', 'event-type')
      eventType.setAttribute('text-anchor', 'middle')
      layerGroup.appendChild(eventType)
    }

    eventType.setAttribute('x', String(config.centerX))
    eventType.setAttribute('y', String(eventY))
    eventType.setAttribute('font-size', String(eventFontSize))
    eventType.setAttribute('font-family', 'Montserrat, Arial Black, Arial, Helvetica, sans-serif')
    eventType.setAttribute('font-weight', '900')
    eventType.setAttribute('fill', config.eventTypeColor)
    eventType.textContent = eventText

    await nextTick()
    centerText(eventType, config.centerX)
    await nextTick()

    const eventMaxWidth = config.maxWidth * 0.70
    wrapText(eventType, eventMaxWidth, config.centerX, eventFontSize * 1.1)
    await nextTick()

    let eventTspanCount = eventType.querySelectorAll('tspan').length
    let eventIterations = 0
    let currentEventFontSize = eventFontSize
    const minEventFontSize = 150
    while (eventTspanCount > 2 && currentEventFontSize > minEventFontSize && eventIterations < 50) {
      currentEventFontSize -= 20
      currentEventFontSize = Math.max(minEventFontSize, currentEventFontSize)
      resetText(eventType)
      eventType.textContent = eventText
      eventType.setAttribute('font-size', String(currentEventFontSize))
      centerText(eventType, config.centerX)
      await nextTick()
      wrapText(eventType, eventMaxWidth, config.centerX, currentEventFontSize * 1.1)
      await nextTick()
      eventTspanCount = eventType.querySelectorAll('tspan').length
      eventIterations++
    }

    await nextTick()
    currentY = getElementBottom(eventType) + 150
  } else if (eventType) {
    eventType.remove()
  }

  // === BASE TEXT ===
  if (extractedInfo.baseText) {
    const baseTextContent = extractedInfo.baseText
    const baseCharCount = baseTextContent.length
    let baseFontSize: number
    if (baseCharCount <= 30) baseFontSize = 270
    else if (baseCharCount <= 60) baseFontSize = 230
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

    // Anchor baseText near the bottom (base) of the tag
    const totalBaseHeight = baseLines.length * baseLineHeight
    const baseStartY = Math.max(currentY + 100, config.height - 1400 - totalBaseHeight)

    baseLines.forEach((line, i) => {
      const txt = document.createElementNS(svgNS, 'text') as SVGTextElement
      txt.setAttribute('x', String(config.centerX))
      txt.setAttribute('y', String(baseStartY + (i * baseLineHeight)))
      txt.setAttribute('text-anchor', 'middle')
      txt.setAttribute('font-family', config.fontFamily)
      txt.setAttribute('font-weight', 'bold')
      txt.setAttribute('font-size', String(baseFontSize))
      txt.setAttribute('fill', config.primaryColor)
      txt.textContent = line
      baseTextGroup.appendChild(txt)
    })

    currentY = baseStartY + (baseLines.length * baseLineHeight)
  } else {
    const oldBaseText = svg.querySelector('#base-text-group')
    if (oldBaseText) oldBaseText.remove()
  }
  
  // === EVENT DETAILS ===
  const detailsFontSize = Math.round(getDetailsFontSize() * getSizeScale('venue', extractedInfo.fieldSizes))
  const detailsLineHeight = detailsFontSize * 1.4
  
  let detailsGroup = svg.querySelector('#event-details-group') as SVGGElement
  if (!detailsGroup) {
    detailsGroup = document.createElementNS(svgNS, 'g') as SVGGElement
    detailsGroup.setAttribute('id', 'event-details-group')
    layerGroup.appendChild(detailsGroup)
  } else {
    detailsGroup.innerHTML = ''
  }
  
  let currentDetailY = currentY
  
  if (extractedInfo.date) {
    const dateText = document.createElementNS(svgNS, 'text') as SVGTextElement
    dateText.setAttribute('x', String(config.centerX))
    dateText.setAttribute('y', String(currentDetailY))
    dateText.setAttribute('text-anchor', 'middle')
    dateText.setAttribute('font-family', config.fontFamily)
    dateText.setAttribute('font-weight', 'bold')
    dateText.setAttribute('font-size', String(detailsFontSize))
    dateText.setAttribute('fill', '#000000')  // Black color
    dateText.textContent = `Date: ${extractedInfo.date}`
    detailsGroup.appendChild(dateText)
    await nextTick()
    fitText(dateText, config.maxWidth * 0.85, 60, detailsFontSize)
    await nextTick()
    currentDetailY += detailsLineHeight
  }
  
  if (extractedInfo.time) {
    const timeText = document.createElementNS(svgNS, 'text') as SVGTextElement
    timeText.setAttribute('x', String(config.centerX))
    timeText.setAttribute('y', String(currentDetailY))
    timeText.setAttribute('text-anchor', 'middle')
    timeText.setAttribute('font-family', config.fontFamily)
    timeText.setAttribute('font-weight', 'bold')
    timeText.setAttribute('font-size', String(detailsFontSize))
    timeText.setAttribute('fill', '#000000')  // Black color
    timeText.textContent = `Time: ${extractedInfo.time}`
    detailsGroup.appendChild(timeText)
    await nextTick()
    fitText(timeText, config.maxWidth * 0.85, 60, detailsFontSize)
    await nextTick()
    currentDetailY += detailsLineHeight
  }
  
  if (extractedInfo.venue) {
    const venueText = document.createElementNS(svgNS, 'text') as SVGTextElement
    venueText.setAttribute('x', String(config.centerX))
    venueText.setAttribute('y', String(currentDetailY))
    venueText.setAttribute('text-anchor', 'middle')
    venueText.setAttribute('font-family', config.fontFamily)
    venueText.setAttribute('font-weight', 'bold')
    venueText.setAttribute('font-size', String(detailsFontSize))
    venueText.setAttribute('fill', '#000000')  // Black color
    venueText.textContent = `Venue: ${extractedInfo.venue}`
    detailsGroup.appendChild(venueText)
    await nextTick()
    wrapText(venueText, config.maxWidth * 0.85, config.centerX, detailsLineHeight)
  }
  
  console.log('🔵 Tag5 V3.0 - Generation complete')

  // Apply field order reordering
  applyFieldOrder(svg, extractedInfo.fieldOrder)
  
  await nextTick()
}
