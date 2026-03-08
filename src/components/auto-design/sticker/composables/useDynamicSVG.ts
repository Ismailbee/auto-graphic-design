/**
 * Dynamic SVG Generator & Export System
 * 
 * A complete solution for creating responsive, print-ready SVG templates
 * that work on any mobile screen and export perfectly at any size.
 * 
 * CORE PRINCIPLES:
 * 1. NEVER use inches inside SVG - always convert to pixels
 * 2. ViewBox coordinates are the "design space" - all elements use these
 * 3. Display is responsive via CSS (width: 100%, height: auto)
 * 4. Export calculates exact pixel dimensions from inches × DPI
 * 
 * @example
 * const { createSVG, exportAsPNG } = useDynamicSVG()
 * const svg = createSVG({ widthInches: 6, heightInches: 4, dpi: 300 })
 * await exportAsPNG(svg, { filename: 'my-design.png' })
 */

export interface DynamicSVGConfig {
  /** Width in inches (user input) */
  widthInches: number
  /** Height in inches (user input) */
  heightInches: number
  /** DPI for print output (default: 300) */
  dpi?: number
  /** Background color (default: white) */
  backgroundColor?: string
  /** Optional: existing viewBox to preserve design coordinates */
  preserveViewBox?: { width: number; height: number }
}

export interface SVGDimensions {
  /** Pixel width at target DPI */
  widthPx: number
  /** Pixel height at target DPI */
  heightPx: number
  /** ViewBox width (design coordinate space) */
  viewBoxWidth: number
  /** ViewBox height (design coordinate space) */
  viewBoxHeight: number
  /** Original size in inches */
  widthInches: number
  heightInches: number
  /** Target DPI */
  dpi: number
  /** Scale factor from viewBox to export pixels */
  exportScale: number
  /** Scale factor from screen (96 DPI) to export */
  screenToExportScale: number
}

export interface ExportConfig {
  filename?: string
  format?: 'png' | 'jpeg' | 'pdf'
  quality?: number // 0-1 for JPEG
  /** Override DPI for this export (default: use SVG's configured DPI) */
  overrideDpi?: number
}

export interface ElementPosition {
  /** X position as percentage (0-100) of viewBox width */
  xPercent: number
  /** Y position as percentage (0-100) of viewBox height */
  yPercent: number
  /** Width as percentage of viewBox width (optional) */
  widthPercent?: number
  /** Height as percentage of viewBox height (optional) */
  heightPercent?: number
}

// Constants
const SCREEN_DPI = 96 // Standard screen resolution
const PRINT_DPI = 300 // Default print resolution

export function useDynamicSVG() {
  
  /**
   * Calculate all dimensions for SVG creation and export
   * This is the CORE function that ensures distortion-free output
   */
  function calculateDimensions(config: DynamicSVGConfig): SVGDimensions {
    const dpi = config.dpi || PRINT_DPI
    
    // Convert inches to pixels at target DPI
    // This is the ACTUAL size the exported file will be
    const widthPx = Math.round(config.widthInches * dpi)
    const heightPx = Math.round(config.heightInches * dpi)
    
    // ViewBox dimensions - this is the "design coordinate space"
    // If preserving existing design, keep those coordinates
    // Otherwise, use the pixel dimensions as viewBox (1:1 mapping)
    let viewBoxWidth: number
    let viewBoxHeight: number
    
    if (config.preserveViewBox) {
      // Preserve existing design coordinates but adjust height for new aspect ratio
      viewBoxWidth = config.preserveViewBox.width
      viewBoxHeight = viewBoxWidth * (config.heightInches / config.widthInches)
    } else {
      // New design: viewBox matches pixel dimensions
      viewBoxWidth = widthPx
      viewBoxHeight = heightPx
    }
    
    // Calculate scale factors
    const exportScale = widthPx / viewBoxWidth
    const screenToExportScale = dpi / SCREEN_DPI
    
    return {
      widthPx,
      heightPx,
      viewBoxWidth,
      viewBoxHeight,
      widthInches: config.widthInches,
      heightInches: config.heightInches,
      dpi,
      exportScale,
      screenToExportScale
    }
  }

  /**
   * Create a new dynamic SVG element with proper dimensions
   * 
   * @example
   * const svg = createSVG({ widthInches: 6, heightInches: 4 })
   * // Returns SVG ready for mobile display and 300 DPI export
   */
  function createSVG(config: DynamicSVGConfig): SVGSVGElement {
    const dims = calculateDimensions(config)
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    
    // Set viewBox - this defines the coordinate system for all child elements
    svg.setAttribute('viewBox', `0 0 ${dims.viewBoxWidth} ${dims.viewBoxHeight}`)
    
    // CRITICAL: preserveAspectRatio ensures no distortion
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    
    // For display: width="100%" makes it responsive
    // height="auto" is implicit when using viewBox
    svg.setAttribute('width', '100%')
    svg.removeAttribute('height') // Let viewBox control aspect ratio
    
    // Store metadata for export
    svg.setAttribute('data-width-inches', String(config.widthInches))
    svg.setAttribute('data-height-inches', String(config.heightInches))
    svg.setAttribute('data-dpi', String(dims.dpi))
    svg.setAttribute('data-export-width-px', String(dims.widthPx))
    svg.setAttribute('data-export-height-px', String(dims.heightPx))
    
    // Add background if specified
    if (config.backgroundColor) {
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      bg.setAttribute('width', '100%')
      bg.setAttribute('height', '100%')
      bg.setAttribute('fill', config.backgroundColor)
      svg.appendChild(bg)
    }
    
    console.log(`📐 Created dynamic SVG:`, {
      size: `${config.widthInches}" × ${config.heightInches}"`,
      exportPixels: `${dims.widthPx} × ${dims.heightPx}px`,
      viewBox: `0 0 ${dims.viewBoxWidth} ${dims.viewBoxHeight}`,
      dpi: dims.dpi
    })
    
    return svg
  }

  /**
   * Update an existing SVG to new dimensions while preserving content
   * Elements positioned with percentages/viewBox coords will scale correctly
   */
  function resizeSVG(
    svg: SVGSVGElement, 
    newWidthInches: number, 
    newHeightInches: number,
    dpi: number = PRINT_DPI
  ): SVGDimensions {
    // Get current viewBox
    const currentViewBox = svg.getAttribute('viewBox')?.split(/\s+|,/).map(Number) || [0, 0, 1800, 1200]
    const currentViewBoxWidth = currentViewBox[2]
    
    // Calculate new dimensions
    const dims = calculateDimensions({
      widthInches: newWidthInches,
      heightInches: newHeightInches,
      dpi,
      preserveViewBox: { width: currentViewBoxWidth, height: currentViewBox[3] }
    })
    
    // Update viewBox (preserves width, adjusts height for new aspect ratio)
    svg.setAttribute('viewBox', `0 0 ${dims.viewBoxWidth} ${dims.viewBoxHeight}`)
    
    // Update metadata
    svg.setAttribute('data-width-inches', String(newWidthInches))
    svg.setAttribute('data-height-inches', String(newHeightInches))
    svg.setAttribute('data-dpi', String(dpi))
    svg.setAttribute('data-export-width-px', String(dims.widthPx))
    svg.setAttribute('data-export-height-px', String(dims.heightPx))
    
    // Ensure responsive display
    svg.setAttribute('width', '100%')
    svg.removeAttribute('height')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    
    console.log(`📐 Resized SVG to ${newWidthInches}" × ${newHeightInches}" (${dims.widthPx} × ${dims.heightPx}px at ${dpi} DPI)`)
    
    return dims
  }

  /**
   * Convert percentage position to viewBox coordinates
   * Use this for positioning elements relative to SVG size
   * 
   * @example
   * // Position text at 50% from left, 25% from top
   * const pos = percentToViewBox(svg, { xPercent: 50, yPercent: 25 })
   * textElement.setAttribute('x', String(pos.x))
   * textElement.setAttribute('y', String(pos.y))
   */
  function percentToViewBox(
    svg: SVGSVGElement, 
    position: ElementPosition
  ): { x: number; y: number; width?: number; height?: number } {
    const viewBox = svg.getAttribute('viewBox')?.split(/\s+|,/).map(Number) || [0, 0, 1800, 1200]
    const viewBoxWidth = viewBox[2]
    const viewBoxHeight = viewBox[3]
    
    const result: { x: number; y: number; width?: number; height?: number } = {
      x: (position.xPercent / 100) * viewBoxWidth,
      y: (position.yPercent / 100) * viewBoxHeight
    }
    
    if (position.widthPercent !== undefined) {
      result.width = (position.widthPercent / 100) * viewBoxWidth
    }
    if (position.heightPercent !== undefined) {
      result.height = (position.heightPercent / 100) * viewBoxHeight
    }
    
    return result
  }

  /**
   * Add an image element with proper aspect ratio handling
   * Uses preserveAspectRatio="xMidYMid slice" for cropping
   */
  function addImage(
    svg: SVGSVGElement,
    imageUrl: string,
    position: ElementPosition,
    options: {
      clipPath?: string
      preserveAspectRatio?: string
      opacity?: number
    } = {}
  ): SVGImageElement {
    const coords = percentToViewBox(svg, position)
    
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    image.setAttribute('x', String(coords.x))
    image.setAttribute('y', String(coords.y))
    
    if (coords.width) image.setAttribute('width', String(coords.width))
    if (coords.height) image.setAttribute('height', String(coords.height))
    
    // CRITICAL: preserveAspectRatio for images
    // 'xMidYMid slice' = center and crop to fill container
    // 'xMidYMid meet' = center and fit within container (may have gaps)
    image.setAttribute('preserveAspectRatio', options.preserveAspectRatio || 'xMidYMid slice')
    
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imageUrl)
    image.setAttribute('href', imageUrl)
    
    if (options.clipPath) {
      image.setAttribute('clip-path', options.clipPath)
    }
    if (options.opacity !== undefined) {
      image.setAttribute('opacity', String(options.opacity))
    }
    
    svg.appendChild(image)
    return image
  }

  /**
   * Add text element with viewBox-relative positioning
   */
  function addText(
    svg: SVGSVGElement,
    text: string,
    position: ElementPosition,
    options: {
      fontSize?: number  // In viewBox units
      fontFamily?: string
      fontWeight?: string
      fill?: string
      textAnchor?: 'start' | 'middle' | 'end'
    } = {}
  ): SVGTextElement {
    const coords = percentToViewBox(svg, position)
    const viewBox = svg.getAttribute('viewBox')?.split(/\s+|,/).map(Number) || [0, 0, 1800, 1200]
    
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textEl.setAttribute('x', String(coords.x))
    textEl.setAttribute('y', String(coords.y))
    
    // Font size relative to viewBox height (default: 5% of height)
    const fontSize = options.fontSize || viewBox[3] * 0.05
    textEl.setAttribute('font-size', String(fontSize))
    
    if (options.fontFamily) textEl.setAttribute('font-family', options.fontFamily)
    if (options.fontWeight) textEl.setAttribute('font-weight', options.fontWeight)
    if (options.fill) textEl.setAttribute('fill', options.fill)
    if (options.textAnchor) textEl.setAttribute('text-anchor', options.textAnchor)
    
    textEl.textContent = text
    svg.appendChild(textEl)
    
    return textEl
  }

  /**
   * Export SVG as PNG at exact dimensions
   * Uses SVG → Canvas → PNG pipeline for perfect quality
   */
  async function exportAsPNG(
    svg: SVGSVGElement,
    config: ExportConfig = {}
  ): Promise<Blob> {
    // Get stored dimensions or calculate from attributes
    const storedWidthPx = svg.getAttribute('data-export-width-px')
    const storedHeightPx = svg.getAttribute('data-export-height-px')
    const storedDpi = svg.getAttribute('data-dpi')
    
    let canvasWidth: number
    let canvasHeight: number
    
    if (storedWidthPx && storedHeightPx) {
      canvasWidth = parseInt(storedWidthPx, 10)
      canvasHeight = parseInt(storedHeightPx, 10)
    } else {
      // Fallback: calculate from viewBox and DPI
      const viewBox = svg.getAttribute('viewBox')?.split(/\s+|,/).map(Number) || [0, 0, 1800, 1200]
      const dpi = config.overrideDpi || parseInt(storedDpi || '300', 10)
      const scale = dpi / SCREEN_DPI
      canvasWidth = Math.round(viewBox[2] * scale)
      canvasHeight = Math.round(viewBox[3] * scale)
    }
    
    console.log(`🖼️ Exporting PNG at ${canvasWidth} × ${canvasHeight}px`)
    
    // Clone SVG for export
    const exportSVG = svg.cloneNode(true) as SVGSVGElement
    
    // Set explicit dimensions for canvas rendering
    exportSVG.setAttribute('width', String(canvasWidth))
    exportSVG.setAttribute('height', String(canvasHeight))
    
    // Serialize SVG
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(exportSVG)
    
    // Ensure proper XML declaration
    if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    
    // Create blob URL
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        // Create canvas at exact export dimensions
        const canvas = document.createElement('canvas')
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(svgUrl)
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        // Draw SVG at exact size (no scaling!)
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
        
        // Convert to PNG
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(svgUrl)
          
          if (blob) {
            console.log(`✅ PNG exported: ${(blob.size / 1024).toFixed(1)}KB`)
            resolve(blob)
          } else {
            reject(new Error('Failed to create PNG blob'))
          }
        }, 'image/png')
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl)
        reject(new Error('Failed to load SVG for export'))
      }
      
      img.src = svgUrl
    })
  }

  /**
   * Export SVG as JPEG at exact dimensions
   */
  async function exportAsJPEG(
    svg: SVGSVGElement,
    config: ExportConfig = {}
  ): Promise<Blob> {
    const quality = config.quality || 0.92
    
    // Similar to PNG export but with white background and JPEG output
    const storedWidthPx = svg.getAttribute('data-export-width-px')
    const storedHeightPx = svg.getAttribute('data-export-height-px')
    
    let canvasWidth = storedWidthPx ? parseInt(storedWidthPx, 10) : 1800
    let canvasHeight = storedHeightPx ? parseInt(storedHeightPx, 10) : 1200
    
    const exportSVG = svg.cloneNode(true) as SVGSVGElement
    exportSVG.setAttribute('width', String(canvasWidth))
    exportSVG.setAttribute('height', String(canvasHeight))
    
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(exportSVG)
    
    if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(svgUrl)
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        // White background for JPEG
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
        
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(svgUrl)
          
          if (blob) {
            console.log(`✅ JPEG exported: ${(blob.size / 1024).toFixed(1)}KB (quality: ${quality})`)
            resolve(blob)
          } else {
            reject(new Error('Failed to create JPEG blob'))
          }
        }, 'image/jpeg', quality)
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl)
        reject(new Error('Failed to load SVG for export'))
      }
      
      img.src = svgUrl
    })
  }

  /**
   * Download blob as file
   */
  function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Cleanup after delay
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  /**
   * Get CSS styles for responsive SVG display on mobile
   * Apply these to the SVG container
   */
  function getResponsiveStyles(): string {
    return `
      /* Container styles */
      .svg-container {
        width: 100%;
        max-width: 100%;
        overflow: hidden;
      }
      
      /* SVG responsive rules */
      .svg-container svg {
        width: 100%;
        height: auto;
        max-width: 100%;
        display: block;
      }
      
      /* Prevent any transform scaling on mobile */
      @media (max-width: 768px) {
        .svg-container svg {
          width: 100%;
          height: auto;
        }
      }
    `
  }

  /**
   * Validate SVG is properly configured for export
   */
  function validateForExport(svg: SVGSVGElement): { valid: boolean; issues: string[] } {
    const issues: string[] = []
    
    if (!svg.getAttribute('viewBox')) {
      issues.push('Missing viewBox attribute')
    }
    
    if (!svg.getAttribute('preserveAspectRatio')) {
      issues.push('Missing preserveAspectRatio attribute')
    }
    
    if (!svg.getAttribute('data-export-width-px') || !svg.getAttribute('data-export-height-px')) {
      issues.push('Missing export dimension metadata (data-export-width-px, data-export-height-px)')
    }
    
    const images = svg.querySelectorAll('image')
    images.forEach((img, i) => {
      if (!img.getAttribute('preserveAspectRatio')) {
        issues.push(`Image #${i + 1} missing preserveAspectRatio`)
      }
    })
    
    return {
      valid: issues.length === 0,
      issues
    }
  }

  /**
   * Common print sizes with dimensions
   */
  const PRINT_SIZES = {
    // Photo sizes
    '4x6': { widthInches: 4, heightInches: 6, name: '4×6 Photo' },
    '5x7': { widthInches: 5, heightInches: 7, name: '5×7 Photo' },
    '8x10': { widthInches: 8, heightInches: 10, name: '8×10 Photo' },
    
    // Card sizes
    'business-card': { widthInches: 3.5, heightInches: 2, name: 'Business Card' },
    'postcard': { widthInches: 6, heightInches: 4, name: 'Postcard' },
    'id-card': { widthInches: 3.375, heightInches: 2.125, name: 'ID Card' },
    
    // Paper sizes (landscape)
    'a4-landscape': { widthInches: 11.69, heightInches: 8.27, name: 'A4 Landscape' },
    'a4-portrait': { widthInches: 8.27, heightInches: 11.69, name: 'A4 Portrait' },
    'a5-landscape': { widthInches: 8.27, heightInches: 5.83, name: 'A5 Landscape' },
    'a5-portrait': { widthInches: 5.83, heightInches: 8.27, name: 'A5 Portrait' },
    'letter-landscape': { widthInches: 11, heightInches: 8.5, name: 'Letter Landscape' },
    'letter-portrait': { widthInches: 8.5, heightInches: 11, name: 'Letter Portrait' },
  } as const

  return {
    // Core functions
    calculateDimensions,
    createSVG,
    resizeSVG,
    
    // Element helpers
    percentToViewBox,
    addImage,
    addText,
    
    // Export functions
    exportAsPNG,
    exportAsJPEG,
    downloadBlob,
    
    // Utilities
    getResponsiveStyles,
    validateForExport,
    
    // Constants
    PRINT_SIZES,
    SCREEN_DPI,
    PRINT_DPI
  }
}
