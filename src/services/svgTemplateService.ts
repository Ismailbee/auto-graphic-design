/**
 * SVG Template Service
 * Handles loading and rendering of letterhead SVG templates with dynamic data
 */

export interface LetterHeadData {
  organizationName?: string
  registrationNumber?: string
  headOffice?: string
  otherAddress?: string
  phones?: string[]
  email?: string
  logoDataUrl?: string
  referenceFields?: {
    ref?: string
    date?: string
    [key: string]: string | undefined
  }
}

/**
 * Convert text to title case
 */
function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Template cache to avoid redundant network requests
let cachedTemplate: string | null = null
let templateLoadPromise: Promise<string> | null = null

/**
 * Load the letter head SVG template from the public directory
 * Includes caching to improve performance on subsequent loads
 */
export async function loadLetterHeadTemplate(): Promise<string> {
  // Return cached template if available
  if (cachedTemplate) {
    console.log('📦 Using cached SVG template')
    return cachedTemplate
  }

  // Return existing promise if template is being loaded
  if (templateLoadPromise) {
    console.log('⏳ Template load in progress, reusing promise')
    return templateLoadPromise
  }

  // Load template and cache result
  templateLoadPromise = (async () => {
    try {
      console.log('📥 Loading SVG template from server')
      const response = await fetch('/templates/letterhead/letter head.svg')
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`)
      }
      cachedTemplate = await response.text()
      console.log('✅ SVG template loaded and cached')
      return cachedTemplate
    } catch (error) {
      console.error('Failed to load letter head template:', error)
      throw error
    } finally {
      // Clear promise after load completes
      templateLoadPromise = null
    }
  })()

  return templateLoadPromise
}

/**
 * Render letterhead with provided data
 */
export async function renderLetterHead(data: LetterHeadData): Promise<string> {
  try {
    const template = await loadLetterHeadTemplate()
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(template, 'image/svg+xml')
    
    // Check for parsing errors
    const parserError = svgDoc.querySelector('parsererror')
    if (parserError) {
      throw new Error('Failed to parse SVG template')
    }

    const svg = svgDoc.documentElement as unknown as SVGElement

    // Update text elements based on their positions (approximate line numbers from SVG)
    // We'll search for specific text patterns and replace them

    // Find and update organization name (split across two text elements)
    if (data.organizationName) {
      // Convert organization name to uppercase
      const orgNameUpper = data.organizationName.toUpperCase()
      
      // Calculate center position of the SVG (viewBox width / 2)
      const centerX = 4133.86 // 8267.72 / 2
      
      // Replace "WILLMIKE &" and "SONS NIG .LTD" with centered organization name
      const orgTexts = svg.querySelectorAll('text')
      let orgTextElement: SVGTextElement | null = null
      
      for (let i = 0; i < orgTexts.length; i++) {
        const text = orgTexts[i]
        if (text.textContent?.includes('WILLMIKE')) {
          // Replace with org name in uppercase and center it
          text.textContent = orgNameUpper
          text.setAttribute('x', centerX.toString())
          text.setAttribute('text-anchor', 'middle')
          orgTextElement = text as SVGTextElement
          
          // Hide the second part if it exists
          if (i + 1 < orgTexts.length && orgTexts[i + 1].textContent?.includes('SONS')) {
            orgTexts[i + 1].textContent = ''
          }
          break
        }
      }
      
      // Find and update registration number - position above last 3 letters of org name
      if (data.registrationNumber && data.registrationNumber !== 'N/A' && orgTextElement) {
        const texts = svg.querySelectorAll('text')
        for (const text of texts) {
          if (text.textContent?.includes('RC NO.')) {
            text.textContent = `RC NO. ${data.registrationNumber}`
            
            // Get the actual bounding box of the organization name text
            try {
              const bbox = orgTextElement.getBBox()
              // Calculate position above the last 3 characters
              const textWidth = bbox.width
              const orgNameLength = orgNameUpper.length
              const charWidth = textWidth / orgNameLength
              
              // Calculate X position for center of last 3 characters
              // Organization name is centered at centerX
              // Right edge of text is at: centerX + (textWidth / 2)
              // Last 3 chars start at: right edge - (3 * charWidth)
              // Center of last 3 chars: right edge - (1.5 * charWidth)
              const rcX = centerX + (textWidth / 2) - (charWidth * 1.5)
              
              text.setAttribute('x', rcX.toString())
              text.setAttribute('y', '522.2') // Above organization name
              text.setAttribute('text-anchor', 'middle') // Center the RC text
            } catch (e) {
              // Fallback if getBBox fails
              const charWidth = 70
              const orgNameLength = orgNameUpper.length
              const totalWidth = orgNameLength * charWidth
              const rcX = centerX + (totalWidth / 2) - (charWidth * 1.5)
              text.setAttribute('x', rcX.toString())
              text.setAttribute('y', '522.2')
              text.setAttribute('text-anchor', 'middle')
            }
            break
          }
        }
      } else if (!data.registrationNumber || data.registrationNumber === 'N/A') {
        // Remove the entire RC number line if not provided
        const texts = svg.querySelectorAll('text')
        for (const text of texts) {
          if (text.textContent?.includes('RC NO.')) {
            text.textContent = ''
          }
        }
      }
    } else {
      // If no organization name, just handle RC number removal if needed
      if (!data.registrationNumber || data.registrationNumber === 'N/A') {
        const texts = svg.querySelectorAll('text')
        for (const text of texts) {
          if (text.textContent?.includes('RC NO.')) {
            text.textContent = ''
          }
        }
      }
    }

    // Calculate center position of the SVG (viewBox width / 2)
    const centerX = 4133.86 // 8267.72 / 2

    // Find and update other address FIRST - inline flex layout left-aligned
    if (data.otherAddress && data.otherAddress !== 'N/A') {
      const otherAddressTitleCase = toTitleCase(data.otherAddress)
      const allTexts = Array.from(svg.querySelectorAll('text'))
      
      // Left-aligned inline layout
      const startX = 2273  // Start position from template
      const contentX = 3239  // Content position from template
      const addressRowY = 1098.88  // Y position from template
      
      // Update the "Address:" label to be red and left-aligned
      for (const text of allTexts) {
        const content = text.textContent || ''
        if (content.includes('Address:')) {
          text.textContent = 'Address:'
          text.setAttribute('x', startX.toString())
          text.setAttribute('y', addressRowY.toString())
          text.setAttribute('text-anchor', 'start')  // Left-align
          text.setAttribute('class', 'fil9 fnt7') // Red bold styling
          break
        }
      }
      
      // Update the address content - on same line
      for (const text of allTexts) {
        const content = text.textContent || ''
        if (content.includes('Hydro') || content.includes('Minna')) {
          text.textContent = otherAddressTitleCase
          text.setAttribute('x', contentX.toString())
          text.setAttribute('y', addressRowY.toString())
          text.setAttribute('text-anchor', 'start')  // Left-align
          text.setAttribute('class', 'fil2 fnt8') // Black text styling
          break
        }
      }
    } else {
      // Remove the entire other address line if not provided
      const texts = svg.querySelectorAll('text')
      for (const text of texts) {
        const content = text.textContent || ''
        if (content.includes('Address:')) {
          text.textContent = ''
        }
        if (content.includes('Hydro') || content.includes('Minna')) {
          text.textContent = ''
        }
      }
    }

    // Find and update head office SECOND - inline flex layout, aligned with Address
    if (data.headOffice) {
      const headOfficeTitleCase = toTitleCase(data.headOffice)
      
      // Use exact same X positions as Address for perfect column alignment
      const labelX = 2273  // Same as Address label
      const contentX = 3240  // Adjusted slightly right to align with Address content visually
      const headOfficeRowY = 1170  // Below Address row with proper spacing
      
      // Query fresh text elements for Head Office section
      const headOfficeTexts = Array.from(svg.querySelectorAll('text'))
      
      // Update the "Head Office:" label - left-aligned
      for (const text of headOfficeTexts) {
        const content = text.textContent || ''
        const trimmedContent = content.trim()
        if (trimmedContent === 'Head' || (content.includes('Head') && !content.includes(':'))) {
          
          // CRITICAL: Remove from transform group FIRST
          const parent = text.parentElement
          if (parent?.tagName === 'g' && parent.getAttribute('transform')) {
            const svgRoot = svg.querySelector('svg > g') || svg.querySelector('svg')
            if (svgRoot) {
              svgRoot.appendChild(text)
            }
          }
          
          // NOW update the attributes
          text.textContent = 'Head Office:'
          text.setAttribute('x', labelX.toString())
          text.setAttribute('y', headOfficeRowY.toString())
          text.setAttribute('text-anchor', 'start')  // Left-align
          text.setAttribute('class', 'fil9 fnt5') // Red bold styling
          break
        }
      }
      
      // Remove the separate "Office:" text if it exists
      for (const text of headOfficeTexts) {
        const content = text.textContent || ''
        if (content.trim() === 'Office:') {
          const parent = text.parentElement
          if (parent?.tagName === 'g' && parent.getAttribute('transform')) {
            parent.removeChild(text)
          } else {
            text.textContent = ''
          }
        }
      }
      
      // Update the head office content - on same line as label
      const contentTexts = Array.from(svg.querySelectorAll('text'))
      for (const text of contentTexts) {
        const content = text.textContent || ''
        if ((content.includes('Enogie') || content.includes('Benin')) && 
            !content.includes('Head Office:') && 
            content.length > 10) {
          
          // CRITICAL: Remove from transform group FIRST
          const parent = text.parentElement
          if (parent?.tagName === 'g' && parent.getAttribute('transform')) {
            const svgRoot = svg.querySelector('svg > g') || svg.querySelector('svg')
            if (svgRoot) {
              svgRoot.appendChild(text)
            }
          }
          
          // NOW update the attributes - match Address content exactly
          text.textContent = headOfficeTitleCase
          text.setAttribute('x', contentX.toString())
          text.setAttribute('y', headOfficeRowY.toString())
          text.setAttribute('text-anchor', 'start')  // Left-align
          text.setAttribute('class', 'fil2 fnt8') // Same font class as Address content
          break
        }
      }
    }

    // Handle phones - replace the template phone numbers with user's numbers
    if (data.phones && data.phones.length > 0) {
      const texts = svg.querySelectorAll('text')
      
      // Remove any "Phone:" text that was previously added
      const textsToRemove = Array.from(texts).filter(text => 
        text.textContent?.includes('Phone:')
      )
      textsToRemove.forEach(text => text.remove())
      
      // Find and replace the template phone numbers (08035976700, 08074383622)
      for (const text of texts) {
        const content = text.textContent || ''
        if (content.includes('08035976700') || content.includes('08074383622')) {
          text.textContent = data.phones.join(', ')
          break
        }
      }
    }

    // Email is on the left side - update the existing email text
    if (data.email) {
      // Find and update the email text (after "Email:" label)
      const texts = svg.querySelectorAll('text')
      for (let i = 0; i < texts.length; i++) {
        if (texts[i].textContent?.includes('mathewuzzy@gmail')) {
          texts[i].textContent = data.email
          break
        }
      }
    }

    // Update reference fields
    if (data.referenceFields) {
      if (data.referenceFields.ref) {
        updateTextByPattern(svg, /REF:/i, `REF: ${data.referenceFields.ref}`)
      }
      if (data.referenceFields.date) {
        updateTextByPattern(svg, /DATE:/i, `DATE: ${data.referenceFields.date}`)
      }
    }

    // Always remove the template logo, then add user logo if provided
    removeTemplateLogo(svg)
    if (data.logoDataUrl) {
      await injectLogo(svg, data.logoDataUrl)
    }

    // Serialize the updated SVG
    const serializer = new XMLSerializer()
    return serializer.serializeToString(svg)
  } catch (error) {
    console.error('Error rendering letterhead:', error)
    throw error
  }
}

/**
 * Add new text element to SVG
 */
function addTextToSVG(svg: Element, content: string, x: number, y: number, className: string): void {
  const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  textElement.setAttribute('x', x.toString())
  textElement.setAttribute('y', y.toString())
  textElement.setAttribute('class', className)
  textElement.textContent = content
  svg.appendChild(textElement)
}

/**
 * Update text element by exact content match
 */
function updateTextByContent(svg: Element, searchText: string, newText: string): boolean {
  const textElements = svg.querySelectorAll('text, tspan')
  
  for (const element of textElements) {
    if (element.textContent?.trim() === searchText.trim()) {
      element.textContent = newText
      return true
    }
  }
  
  return false
}

/**
 * Update text element by pattern match (supports partial matches)
 */
function updateTextByPattern(svg: Element, pattern: RegExp, newText: string): boolean {
  const textElements = svg.querySelectorAll('text, tspan')
  
  for (const element of textElements) {
    if (element.textContent && pattern.test(element.textContent)) {
      element.textContent = newText
      return true
    }
  }
  
  return false
}

/**
 * Remove the template logo from SVG
 */
function removeTemplateLogo(svg: Element): void {
  // Remove the template logo (paths with classes fil3, fil4, fil6, fil7, fil8)
  const templateLogoPaths = svg.querySelectorAll('path.fil3, path.fil4, path.fil6, path.fil7, path.fil8')
  templateLogoPaths.forEach(path => path.remove())
  
  // Remove the "S" text element that's part of the template logo
  const texts = svg.querySelectorAll('text')
  for (const text of texts) {
    if (text.classList.contains('fil5') && text.classList.contains('fnt4') && text.textContent?.trim() === 'S') {
      text.remove()
      break
    }
  }
  
  // Also remove any existing user-uploaded logos
  const existingLogos = svg.querySelectorAll('image.letterhead-logo')
  existingLogos.forEach(img => img.remove())
}

/**
 * Inject logo image into SVG
 */
async function injectLogo(svg: Element, logoDataUrl: string): Promise<void> {
  // Create new logo image element
  // Position it in the center where the template logo was (around x=712, y=411)
  // Template logo is approximately 617x563 pixels (from paths)
  const newImage = document.createElementNS('http://www.w3.org/2000/svg', 'image')
  newImage.setAttribute('class', 'letterhead-logo')
  newImage.setAttribute('x', '712')  // Left edge of template logo area
  newImage.setAttribute('y', '411')  // Top edge of template logo area
  newImage.setAttribute('width', '617')  // Match template logo width
  newImage.setAttribute('height', '563')  // Match template logo height
  newImage.setAttribute('href', logoDataUrl)
  newImage.setAttribute('xlink:href', logoDataUrl)
  newImage.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  
  // Insert into the main group
  const mainGroup = svg.querySelector('g')
  if (mainGroup && mainGroup.firstChild) {
    mainGroup.insertBefore(newImage, mainGroup.firstChild)
  } else if (mainGroup) {
    mainGroup.appendChild(newImage)
  } else {
    // Fallback: add to SVG root after defs
    const defs = svg.querySelector('defs')
    if (defs && defs.nextSibling) {
      svg.insertBefore(newImage, defs.nextSibling)
    } else {
      svg.appendChild(newImage)
    }
  }
}

/**
 * Download SVG as file
 */
export function downloadSVG(svgContent: string, filename: string = 'letterhead.svg'): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Convert SVG to PNG
 */
export async function convertSvgToPng(svgContent: string, width: number = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const aspectRatio = img.height / img.width
      canvas.width = width
      canvas.height = width * aspectRatio

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }

    img.src = url
  })
}

/**
 * Download PNG version of letterhead
 */
export async function downloadAsPng(svgContent: string, filename: string = 'letterhead.png'): Promise<void> {
  try {
    const pngDataUrl = await convertSvgToPng(svgContent)
    const link = document.createElement('a')
    link.href = pngDataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error converting to PNG:', error)
    throw error
  }
}

/**
 * Convert SVG to JPEG data URL
 */
async function convertSvgToJpeg(svgContent: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    const img = new Image()
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      // Fill with white background for JPEG
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      
      // Convert to JPEG with high quality
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95)
      resolve(jpegDataUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }

    img.src = url
  })
}

/**
 * Download JPEG version of letterhead
 */
export async function downloadAsJpeg(svgContent: string, filename: string = 'letterhead.jpg'): Promise<void> {
  try {
    const jpegDataUrl = await convertSvgToJpeg(svgContent)
    const link = document.createElement('a')
    link.href = jpegDataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error converting to JPEG:', error)
    throw error
  }
}

/**
 * Download PDF version of letterhead
 */
export async function downloadAsPdf(svgContent: string, filename: string = 'letterhead.pdf'): Promise<void> {
  try {
    // Convert SVG to PNG first for better compatibility
    const pngDataUrl = await convertSvgToPng(svgContent)
    
    // Create a temporary canvas to get image dimensions
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = pngDataUrl
    })
    
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf')
    
    // Create PDF with A4 dimensions (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Calculate dimensions to fit the image on A4
    const pdfWidth = 210
    const pdfHeight = 297
    const imgWidth = img.width
    const imgHeight = img.height
    
    // Calculate aspect ratios
    const imgRatio = imgWidth / imgHeight
    const pageRatio = pdfWidth / pdfHeight
    
    let finalWidth = pdfWidth
    let finalHeight = pdfHeight
    
    if (imgRatio > pageRatio) {
      // Image is wider than page
      finalHeight = pdfWidth / imgRatio
    } else {
      // Image is taller than page
      finalWidth = pdfHeight * imgRatio
    }
    
    // Center the image
    const xOffset = (pdfWidth - finalWidth) / 2
    const yOffset = (pdfHeight - finalHeight) / 2
    
    // Add image to PDF
    pdf.addImage(pngDataUrl, 'PNG', xOffset, yOffset, finalWidth, finalHeight)
    
    // Save the PDF
    pdf.save(filename)
  } catch (error) {
    console.error('Error converting to PDF:', error)
    throw error
  }
}

/**
 * Get preview SVG with sample data
 */
export async function getPreviewSvg(): Promise<string> {
  const sampleData: LetterHeadData = {
    organizationName: 'Your Company Name',
    registrationNumber: '123456',
    headOffice: 'Your Head Office Address Here',
    otherAddress: 'Your Other Office Address Here',
    phones: ['+234-XXX-XXXX-XXX', '+234-XXX-XXXX-XXX'],
    email: 'info@yourcompany.com',
    referenceFields: {
      ref: 'REF/2024/001',
      date: new Date().toLocaleDateString()
    }
  }

  return await renderLetterHead(sampleData)
}
