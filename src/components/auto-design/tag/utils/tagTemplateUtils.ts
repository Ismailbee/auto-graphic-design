/**
 * Tag Template Utilities
 * Clean implementation for tag.svg template manipulation
 */

import { nextTick } from 'vue'
import type { TagFormData, OrderableField } from '../types'
import { DEFAULT_FIELD_ORDER } from '../types'

export interface TagSVGElements {
  svg: SVGSVGElement | null
  mainTitle: SVGTextElement | null
  subtitleLine1: SVGTextElement | null
  subtitleLine2: SVGTextElement | null
  eventType: SVGTextElement | null
}

// Available tag templates (tag6.svg and tag7.svg suspended)
export const TAG_TEMPLATES = ['tag.svg', 'tag2.svg', 'tag3.svg', 'tag4.svg', 'tag5.svg', 'tag8.svg'] as const
export type TagTemplateType = typeof TAG_TEMPLATES[number]

/**
 * Convert CSS class-based fills to inline styles to prevent conflicts between templates
 * This is necessary because different SVG templates use the same class names (fil0, fil1, etc.)
 * with different color values, causing style conflicts when multiple templates are on the page
 */
function inlineSvgStyles(svg: SVGSVGElement): void {
  // Parse the embedded style from the SVG
  const styleElement = svg.querySelector('style')
  if (!styleElement) return
  
  const styleText = styleElement.textContent || ''
  
  // Extract fill rules from the CSS - handle CDATA and various formats
  const fillRules: Map<string, string> = new Map()
  
  // Match patterns like: .fil0 {fill:#129BCF} or .fil0{fill: #129BCF} or .fil0 { fill : url(#id0) }
  const ruleRegex = /\.(\w+)\s*\{([^}]*)\}/g
  let ruleMatch
  
  while ((ruleMatch = ruleRegex.exec(styleText)) !== null) {
    const className = ruleMatch[1]
    const ruleContent = ruleMatch[2]
    
    // Extract fill value from the rule content
    const fillMatch = ruleContent.match(/fill\s*:\s*([^;}\s]+(?:\([^)]*\))?)/i)
    if (fillMatch) {
      const fillValue = fillMatch[1].trim()
      fillRules.set(className, fillValue)
    }
  }
  
  console.log(`🎨 Found ${fillRules.size} fill rules:`, Object.fromEntries(fillRules))
  
  // Apply inline fills to all elements with these classes
  fillRules.forEach((fillValue, className) => {
    const elements = svg.querySelectorAll(`.${className}`)
    elements.forEach(el => {
      // Set fill attribute (overwrites any existing)
      el.setAttribute('fill', fillValue)
      // Also remove the class to prevent CSS from overriding
      el.classList.remove(className)
    })
    console.log(`  Applied fill="${fillValue}" to ${elements.length} .${className} elements`)
  })
  
  // Remove the style element to prevent any CSS conflicts
  styleElement.remove()
  
  console.log(`✅ Inlined ${fillRules.size} fill styles and removed <style> element`)
}

/**
 * Load tag template SVG
 * @param container - The container element to render the SVG into
 * @param templateName - The template file name (defaults to 'tag.svg')
 */
export async function loadTagTemplate(
  container: HTMLElement | null, 
  templateName: TagTemplateType = 'tag.svg'
): Promise<SVGSVGElement | null> {
  if (!container) {
    console.error('❌ Container is null')
    return null
  }

  try {
    // Load the actual template file
    const templatePath = `/templates/Tag/${templateName}`
    
    console.log(`📥 Loading tag template: ${templatePath}...`)
    const response = await fetch(templatePath)
    
    if (!response.ok) {
      console.error('❌ Failed to fetch template:', response.status)
      return null
    }

    const svgText = await response.text()
    container.innerHTML = svgText
    
    await nextTick()
    
    const svg = container.querySelector('svg') as SVGSVGElement
    if (!svg) {
      console.error('❌ SVG element not found')
      return null
    }

    // Convert CSS class fills to inline styles to prevent conflicts between templates
    inlineSvgStyles(svg)

    console.log(`✅ Template ${templatePath} loaded successfully`)
    return svg
  } catch (error) {
    console.error('❌ Error loading template:', error)
    return null
  }
}

/**
 * Get the next template in rotation
 */
export function getNextTemplate(currentTemplate: TagTemplateType): TagTemplateType {
  const currentIndex = TAG_TEMPLATES.indexOf(currentTemplate)
  const nextIndex = (currentIndex + 1) % TAG_TEMPLATES.length
  return TAG_TEMPLATES[nextIndex]
}

/**
 * Get a random template from available templates
 */
export function getRandomTemplate(): TagTemplateType {
  const randomIndex = Math.floor(Math.random() * TAG_TEMPLATES.length)
  return TAG_TEMPLATES[randomIndex]
}

/**
 * Get all text elements from SVG (indexed in order: 0=title, 1=subtitle1, 2=eventType)
 */
export function getTagSVGElements(svg: SVGSVGElement | null): TagSVGElements {
  if (!svg) {
    return {
      svg: null,
      mainTitle: null,
      subtitleLine1: null,
      subtitleLine2: null,
      eventType: null
    }
  }

  const textElements = svg.querySelectorAll('text')
  
  return {
    svg,
    mainTitle: textElements[0] as SVGTextElement || null,
    subtitleLine1: textElements[1] as SVGTextElement || null,
    subtitleLine2: null, // Not used in current template
    eventType: textElements[2] as SVGTextElement || null // "OFFICIAL" text
  }
}

/**
 * Update tag text elements
 */
export function updateTagText(formData: TagFormData, elements: TagSVGElements): void {
  if (!elements.svg) {
    console.error('❌ SVG is null')
    return
  }

  console.log('📝 Updating text elements...')

  // Clear ALL default text first
  if (elements.mainTitle) elements.mainTitle.textContent = ''
  if (elements.subtitleLine1) elements.subtitleLine1.textContent = ''
  if (elements.subtitleLine2) elements.subtitleLine2.textContent = ''
  if (elements.eventType) elements.eventType.textContent = ''

  // Update with user data
  if (elements.mainTitle && formData.tagTitle) {
    elements.mainTitle.textContent = formData.tagTitle
  }
  
  if (elements.subtitleLine1 && formData.theme) {
    elements.subtitleLine1.textContent = formData.theme
  }
  
  if (elements.subtitleLine2 && formData.organizationLine2) {
    elements.subtitleLine2.textContent = formData.organizationLine2
  }
  
  if (elements.eventType && formData.eventType) {
    elements.eventType.textContent = formData.eventType
  }

  console.log('✅ Text updated')
}

/**
 * Center text element
 */
export function centerText(element: SVGTextElement | null, centerX: number): void {
  if (!element) return
  element.setAttribute('text-anchor', 'middle')
  element.setAttribute('x', String(centerX))
}

/**
 * Fit text by reducing font size
 */
export function fitText(element: SVGTextElement | null, maxWidth: number, minSize: number = 13, initialSize: number = 1800): void {
  if (!element) return
  
  let size = initialSize
  element.setAttribute('font-size', String(size))
  
  // Use proportional decrement (2% of current size, min 1) for efficiency with large font sizes
  let attempts = 0
  while (element.getComputedTextLength && element.getComputedTextLength() > maxWidth && size > minSize && attempts < 200) {
    const decrement = Math.max(1, Math.round(size * 0.02))
    size = Math.max(minSize, size - decrement)
    element.setAttribute('font-size', String(size))
    attempts++
  }
}

/**
 * Reset text element (critical before wrapping)
 */
export function resetText(element: SVGTextElement | null): void {
  if (!element) return
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
  element.textContent = element.textContent || ''
}

/**
 * Set two-line title manually (professional approach for main titles)
 */
export function setTwoLineTitle(
  element: SVGTextElement | null,
  line1: string,
  line2: string,
  centerX: number,
  startY: number,
  fontSize: number
): void {
  if (!element) return
  
  // Clear existing content
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
  
  element.setAttribute('x', String(centerX))
  element.setAttribute('y', String(startY))
  element.setAttribute('text-anchor', 'middle')
  element.setAttribute('font-size', String(fontSize))
  
  // First line
  const tspan1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspan1.setAttribute('x', String(centerX))
  tspan1.setAttribute('dy', '0')
  tspan1.textContent = line1
  
  // Second line - tighter line height (reduced from 1.6 to 1.0)
  const tspan2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspan2.setAttribute('x', String(centerX))
  tspan2.setAttribute('dy', String(fontSize * 1.0))
  tspan2.textContent = line2
  
  element.appendChild(tspan1)
  element.appendChild(tspan2)
}

/**
 * Wrap text into multiple lines using dy (relative positioning) for proper spacing
 */
export function wrapText(element: SVGTextElement | null, maxWidth: number, centerX: number, lineHeight: number): void {
  if (!element || !element.textContent) return
  
  const originalText = element.textContent
  const words = originalText.split(' ').filter(w => w.trim() !== '')
  
  // Clear all existing content
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }

  const y = parseFloat(element.getAttribute('y') || '0');

  let currentLine = '';
  const lines: string[] = [];
  
  // Create a temporary tspan for measuring
  const tempTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  tempTspan.setAttribute('x', String(centerX));
  element.appendChild(tempTspan);
  
  // Build lines by measuring
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
    tempTspan.textContent = testLine;
    
    if (tempTspan.getComputedTextLength && tempTspan.getComputedTextLength() > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Remove temp tspan
  tempTspan.remove();
  
  // Create final tspans with dy-based spacing
  lines.forEach((line, index) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan.setAttribute('x', String(centerX));
    
    if (index === 0) {
      // First line: no dy
      tspan.setAttribute('dy', '0');
    } else {
      // Subsequent lines: use dy for relative spacing
      tspan.setAttribute('dy', String(lineHeight));
    }
    
    tspan.textContent = line;
    element.appendChild(tspan);
  });
}

/**
 * Map orderable field names to SVG element IDs
 */
const FIELD_ELEMENT_IDS: Record<string, string> = {
  theme: 'theme-text',
  subtheme: 'subtheme-text',
  eventType: 'event-type',
  baseText: 'base-text-group',
}

/**
 * Shift an SVG element and all its children with 'y' attributes by dy pixels
 */
function shiftElementY(el: Element, dy: number): void {
  if (el.hasAttribute('y')) {
    const y = parseFloat(el.getAttribute('y') || '0')
    el.setAttribute('y', String(Math.round(y + dy)))
  }
  el.querySelectorAll('[y]').forEach(child => {
    const cy = parseFloat(child.getAttribute('y') || '0')
    child.setAttribute('y', String(Math.round(cy + dy)))
  })
}

/**
 * Apply field order by repositioning rendered SVG elements according to the user's
 * preferred field order. Call this AFTER all sections have been rendered.
 * 
 * @param svg - The SVG element
 * @param fieldOrder - User's desired field order (from extractedInfo.fieldOrder)
 */
export function applyFieldOrder(svg: SVGSVGElement, fieldOrder?: OrderableField[]): void {
  if (!fieldOrder || fieldOrder.length === 0) return

  // Collect rendered elements with their bounding boxes
  type SectionInfo = { field: string; el: Element; topY: number; height: number }
  const sections: SectionInfo[] = []

  for (const field of DEFAULT_FIELD_ORDER) {
    const elId = FIELD_ELEMENT_IDS[field]
    if (!elId) continue
    const el = svg.querySelector(`#${elId}`)
    if (!el) continue
    try {
      const bbox = (el as SVGGraphicsElement).getBBox()
      if (bbox.height > 0) {
        sections.push({ field, el, topY: bbox.y, height: bbox.height })
      }
    } catch {
      // Element not measurable, skip
    }
  }

  if (sections.length < 2) return

  // Sort by current Y to determine current rendering order
  sections.sort((a, b) => a.topY - b.topY)

  // Get desired order (only fields that actually exist in this render)
  const existingFields = sections.map(s => s.field)
  const desiredFields = fieldOrder.filter(f => existingFields.includes(f))

  // Check if already in correct order
  if (JSON.stringify(existingFields) === JSON.stringify(desiredFields)) return

  // Compute gaps between sections
  const gaps: number[] = []
  for (let i = 1; i < sections.length; i++) {
    gaps.push(sections[i].topY - (sections[i - 1].topY + sections[i - 1].height))
  }

  // Rebuild positions: start from the original top position, place sections in desired order
  let currentYPos = sections[0].topY
  for (let i = 0; i < desiredFields.length; i++) {
    const field = desiredFields[i]
    const section = sections.find(s => s.field === field)
    if (!section) continue

    if (i > 0 && gaps[i - 1] !== undefined) {
      currentYPos += Math.max(gaps[i - 1], 20) // Maintain at least 20px gap
    }

    const dy = currentYPos - section.topY
    if (Math.abs(dy) > 1) {
      shiftElementY(section.el, dy)
    }
    currentYPos += section.height
  }
}
