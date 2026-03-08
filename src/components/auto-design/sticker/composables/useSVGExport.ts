import type { SVGImage } from './useSVGImageManager'

/**
 * SVG Export Composable
 * Handles exporting SVG with embedded images and dynamic text content
 */

export interface ExportOptions {
  filename?: string
  includeImages?: boolean
  includeText?: boolean
  format?: 'svg' | 'png'
  pngResolution?: number // DPI for PNG export, default 300
}

const DEFAULT_EXPORT_OPTIONS: Required<ExportOptions> = {
  filename: `wedding-sticker-${new Date().toISOString().split('T')[0]}.svg`,
  includeImages: true,
  includeText: true,
  format: 'svg',
  pngResolution: 300
}

export function useSVGExport() {
  /**
   * Convert an external image URL to base64 data URL
   * Tries Image loading first, falls back to fetch for CORS issues
   */
  async function imageUrlToBase64(url: string): Promise<string> {
    // If already a data URL, return as-is
    if (url.startsWith('data:')) {
      console.log('✅ Already a data URL, using as-is')
      return url
    }
    
    // Construct full URL for relative paths
    const fullUrl = url.startsWith('/') ? window.location.origin + url : url
    console.log('🔄 imageUrlToBase64 processing:', fullUrl)
    
    // Try fetch approach first (more reliable for same-origin resources)
    try {
      const response = await fetch(fullUrl, { cache: 'no-cache' })
      if (response.ok) {
        const blob = await response.blob()
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result as string
            console.log('✅ Converted via fetch:', url.substring(0, 50) + '...')
            resolve(result)
          }
          reader.onerror = () => {
            console.warn('FileReader error, falling back to Image method')
            resolve(imageUrlViaImageElement(fullUrl))
          }
          reader.readAsDataURL(blob)
        })
      }
    } catch (fetchError) {
      console.warn('Fetch failed, trying Image method:', fetchError)
    }
    
    // Fallback to Image element method
    return imageUrlViaImageElement(fullUrl)
  }
  
  /**
   * Convert image URL to base64 using Image element (fallback method)
   */
  function imageUrlViaImageElement(url: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn('Image load timeout for:', url)
        resolve(url) // Return original URL as fallback
      }, 10000) // 10 second timeout
      
      img.onload = () => {
        clearTimeout(timeout)
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth || img.width || 100
          canvas.height = img.naturalHeight || img.height || 100
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            console.warn('Failed to get canvas context for:', url)
            resolve(url)
            return
          }
          
          // IMPORTANT: Clear the canvas first to ensure transparency is preserved
          // Without this, transparent areas may render as black
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          
          const dataUrl = canvas.toDataURL('image/png')
          console.log('✅ Converted via Image element:', url.substring(0, 50) + '...')
          resolve(dataUrl)
        } catch (e) {
          console.warn('Failed to convert image to base64 (CORS?):', url, e)
          resolve(url) // Return original URL as fallback
        }
      }
      
      img.onerror = (e) => {
        clearTimeout(timeout)
        console.warn('Failed to load image for base64 conversion:', url, e)
        resolve(url) // Return original URL as fallback
      }
      
      img.src = url
    })
  }

  /**
   * Convert all external images in SVG to base64
   */
  async function embedExternalImages(svgElement: SVGSVGElement): Promise<void> {
    // Find all image elements in the SVG
    const imageElements = svgElement.querySelectorAll('image')
    
    const promises = Array.from(imageElements).map(async (imgEl) => {
      const href = imgEl.getAttribute('href') || imgEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
      
      if (href && !href.startsWith('data:')) {
        try {
          console.log('🔄 Converting external image to base64:', href)
          const base64 = await imageUrlToBase64(href)
          imgEl.setAttribute('href', base64)
          imgEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', base64)
          console.log('✅ Image embedded successfully')
        } catch (error) {
          console.warn('Failed to embed image:', href, error)
        }
      }
    })
    
    await Promise.all(promises)
  }

  /**
   * Embed images into SVG element
   */
  function embedImagesInSVG(svgElement: SVGSVGElement, images: SVGImage[]): SVGSVGElement {
    // Clone the SVG to avoid modifying the original
    const clonedSVG = svgElement.cloneNode(true) as SVGSVGElement

    // Sort images by z-index to maintain layer order
    const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex)

    // Find the insertion point (after background elements, before text elements)
    // We'll insert images right before the first text element
    const firstTextElement = clonedSVG.querySelector('text')
    const insertionPoint = firstTextElement || clonedSVG

    // Get the viewBox to understand the SVG dimensions
    const viewBox = clonedSVG.getAttribute('viewBox')?.split(/\s+|,/).map(Number) || [0, 0, 2996.9, 1685.75]
    const svgHeight = viewBox[3]
    
    // Get the clip path rect to understand the image area
    const clipRect = clonedSVG.querySelector('clipPath#imageClip rect, defs clipPath#imageClip rect')
    let clipX = 1400, clipY = 0, clipWidth = 1580, clipHeight = svgHeight
    if (clipRect) {
      clipX = parseFloat(clipRect.getAttribute('x') || '1400')
      clipY = parseFloat(clipRect.getAttribute('y') || '0')
      clipWidth = parseFloat(clipRect.getAttribute('width') || '1580')
      clipHeight = parseFloat(clipRect.getAttribute('height') || String(svgHeight))
    }

    // Add each image as an <image> element
    sortedImages.forEach(img => {
      // Check if there's a placeholder/userImage element to update first
      const userImageElement = clonedSVG.querySelector('#userImage') || clonedSVG.querySelector('#placeholder-image')
      
      if (userImageElement) {
        // For user images, position them to fill the clip area completely
        // Use the clip rect dimensions to ensure full coverage
        userImageElement.setAttribute('x', String(clipX))
        userImageElement.setAttribute('y', String(clipY))
        userImageElement.setAttribute('width', String(clipWidth))
        userImageElement.setAttribute('height', String(clipHeight))
        userImageElement.setAttribute('opacity', (img.opacity / 100).toString())
        userImageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
        userImageElement.setAttribute('href', img.dataUrl)
        
        // Apply rotation if needed
        if (img.rotation !== 0) {
          const centerX = clipX + clipWidth / 2
          const centerY = clipY + clipHeight / 2
          userImageElement.setAttribute('transform', `rotate(${img.rotation} ${centerX} ${centerY})`)
        } else {
          userImageElement.removeAttribute('transform')
        }
        
        // Ensure clip-path and preserveAspectRatio are set correctly
        if (userImageElement.id === 'userImage') {
             if (!userImageElement.hasAttribute('clip-path')) {
                userImageElement.setAttribute('clip-path', 'url(#imageClip)')
             }
             // Use xMidYMid slice to fill the clip area while maintaining aspect ratio
             // The image will be cropped but not stretched
             userImageElement.setAttribute('preserveAspectRatio', 'xMidYMid slice')
        }
        
        console.log(`📸 User image positioned to fill clip area: x=${clipX}, y=${clipY}, w=${clipWidth}, h=${clipHeight}`)
        
        return // Skip creating new element
      }

      const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
      
      // Set attributes
      imageElement.setAttribute('id', img.id)
      imageElement.setAttribute('x', img.x.toString())
      imageElement.setAttribute('y', img.y.toString())
      imageElement.setAttribute('width', img.width.toString())
      imageElement.setAttribute('height', img.height.toString())
      imageElement.setAttribute('opacity', (img.opacity / 100).toString())
      imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)

      // Apply rotation if needed
      if (img.rotation !== 0) {
        const centerX = img.x + img.width / 2
        const centerY = img.y + img.height / 2
        imageElement.setAttribute('transform', `rotate(${img.rotation} ${centerX} ${centerY})`)
      }

      // Insert before first text element or append to SVG
      if (firstTextElement) {
        clonedSVG.insertBefore(imageElement, firstTextElement)
      } else {
        clonedSVG.appendChild(imageElement)
      }
    })

    return clonedSVG
  }

  /**
   * Google Fonts URLs for Cinzel Decorative Bold
   * latin and latin-ext subsets
   */
  const CINZEL_FONT_URLS = {
    latin: 'https://fonts.gstatic.com/s/cinzeldecorative/v19/daaHSScvJGqLYhG8nNt8KPPswUAPniZoadlESTE.woff2',
    latinExt: 'https://fonts.gstatic.com/s/cinzeldecorative/v19/daaHSScvJGqLYhG8nNt8KPPswUAPniZoadlKSTG7lQ.woff2'
  }
  
  // Unique font family name to avoid conflicts with any existing registrations
  const CINZEL_CANVAS_FONT = 'CinzelDecorativeCanvas'

  // Cache for the fetched font
  let cachedCinzelFontBase64: string | null = null
  let cinzelFontLoaded = false
  let cinzelFontFace: FontFace | null = null

  /**
   * Load Cinzel Decorative font into the document for canvas rendering
   * Uses a unique font family name to ensure it's correctly loaded
   */
  async function loadCinzelFontForCanvas(): Promise<boolean> {
    if (cinzelFontLoaded && cinzelFontFace) {
      console.log('✅ Cinzel font already loaded, reusing')
      // Double-check it's still available
      await document.fonts.ready
      const stillAvailable = document.fonts.check(`700 48px "${CINZEL_CANVAS_FONT}"`)
      if (stillAvailable) {
        return true
      }
      console.log('⚠️ Font was unloaded, reloading...')
      cinzelFontLoaded = false
    }

    try {
      console.log('📥 Loading Cinzel Decorative font for canvas...')
      console.log('   Target font family name:', CINZEL_CANVAS_FONT)
      
      // Fetch the font file
      console.log('   Fetching from:', CINZEL_FONT_URLS.latin)
      const response = await fetch(CINZEL_FONT_URLS.latin, {
        mode: 'cors',
        cache: 'force-cache'
      })
      
      if (!response.ok) {
        console.warn(`Failed to fetch Cinzel font: ${response.status} ${response.statusText}`)
        return false
      }

      const fontData = await response.arrayBuffer()
      console.log(`   Font data received: ${(fontData.byteLength / 1024).toFixed(1)}KB`)
      
      // Create a FontFace object with our unique name
      cinzelFontFace = new FontFace(CINZEL_CANVAS_FONT, fontData, {
        weight: '700',
        style: 'normal',
        display: 'swap'
      })
      
      console.log('   Loading FontFace...')
      await cinzelFontFace.load()
      
      console.log('   Adding to document.fonts...')
      document.fonts.add(cinzelFontFace)
      
      // Wait for fonts to be ready
      await document.fonts.ready
      
      // Small delay to ensure browser has registered the font
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Verify the font is now available
      const isAvailable = document.fonts.check(`700 48px "${CINZEL_CANVAS_FONT}"`)
      console.log(`   Font availability check for "${CINZEL_CANVAS_FONT}": ${isAvailable}`)
      
      // List all loaded fonts for debugging
      console.log('   All loaded fonts:')
      document.fonts.forEach(font => {
        console.log(`      - ${font.family} (${font.weight}, ${font.style}) - ${font.status}`)
      })
      
      cinzelFontLoaded = isAvailable
      
      if (isAvailable) {
        console.log(`✅ ${CINZEL_CANVAS_FONT} font successfully loaded into document.fonts`)
      } else {
        console.warn('⚠️ Font was added but availability check failed')
        // Force it to be considered loaded anyway since we added it
        cinzelFontLoaded = true
      }
      
      return true
    } catch (error) {
      console.error('❌ Error loading Cinzel font:', error)
      return false
    }
  }

  /**
   * Fetch Cinzel Decorative font from Google Fonts and convert to Base64
   */
  async function fetchCinzelFontAsBase64(): Promise<string | null> {
    // Return cached version if available
    if (cachedCinzelFontBase64) {
      console.log('✅ Using cached Cinzel Decorative font')
      return cachedCinzelFontBase64
    }

    try {
      console.log('📥 Fetching Cinzel Decorative font from Google Fonts...')
      
      // Fetch the latin subset (covers most common characters)
      const response = await fetch(CINZEL_FONT_URLS.latin, {
        mode: 'cors',
        cache: 'force-cache'
      })
      
      if (!response.ok) {
        console.warn(`Failed to fetch font: ${response.status}`)
        return null
      }

      const blob = await response.blob()
      
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          cachedCinzelFontBase64 = base64
          console.log(`✅ Cinzel Decorative font loaded and cached (${(base64.length / 1024).toFixed(1)}KB)`)
          resolve(base64)
        }
        reader.onerror = () => {
          console.warn('Failed to read font as base64')
          resolve(null)
        }
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.warn('Error fetching Cinzel font:', error)
      return null
    }
  }

  /**
   * Render name text on canvas with Cinzel Decorative font
   * This is called after the main SVG is drawn to add properly styled names
   */
  async function renderNamesOnCanvas(
    ctx: CanvasRenderingContext2D, 
    svgElement: SVGSVGElement,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> {
    // Load the font first
    const fontLoaded = await loadCinzelFontForCanvas()
    console.log(`🎨 Font loaded status: ${fontLoaded}`)
    
    // Check what fonts are available
    if (document.fonts) {
      const cinzelCheck = document.fonts.check(`700 48px "${CINZEL_CANVAS_FONT}"`)
      console.log(`   ${CINZEL_CANVAS_FONT} available in document.fonts: ${cinzelCheck}`)
    }
    
    // Get viewBox for scaling
    const viewBox = svgElement.getAttribute('viewBox')?.split(/\s+|,/).map(Number) || [0, 0, 2996.9, 1685.75]
    const svgWidth = viewBox[2]
    const svgHeight = viewBox[3]
    const scaleX = canvasWidth / svgWidth
    const scaleY = canvasHeight / svgHeight
    
    console.log(`📐 Scale factors: scaleX=${scaleX.toFixed(3)}, scaleY=${scaleY.toFixed(3)}`)

    // Find ALL text elements and filter for name-related ones
    const allTexts = svgElement.querySelectorAll('text')
    console.log(`📝 Total text elements in SVG: ${allTexts.length}`)
    
    // Log all text elements for debugging
    allTexts.forEach((t, i) => {
      const id = t.getAttribute('id') || ''
      const cls = t.getAttribute('class') || ''
      const opacity = t.getAttribute('opacity') || '1'
      const text = t.textContent?.substring(0, 20) || ''
      console.log(`   ${i}: id="${id}" class="${cls}" opacity="${opacity}" text="${text}"`)
    })

    // Find name text elements using multiple selectors
    const nameTexts = Array.from(allTexts).filter(textEl => {
      const id = textEl.getAttribute('id') || ''
      const cls = textEl.getAttribute('class') || ''
      const dataRender = textEl.getAttribute('data-render-on-canvas')
      const dataIsName = textEl.getAttribute('data-is-name-text')
      
      return (
        id.startsWith('name1') || 
        id.startsWith('name2') || 
        id === 'name-separator' ||
        cls.includes('name-fnt') ||
        dataRender === 'true' ||
        dataIsName === 'true'
      )
    })

    if (nameTexts.length === 0) {
      console.warn('⚠️ No name text elements found to render on canvas!')
      console.log('   Looking for elements with: id^="name1", id^="name2", id="name-separator", class*="name-fnt", data-render-on-canvas="true"')
      return
    }

    console.log(`🎨 Rendering ${nameTexts.length} name texts with ${CINZEL_CANVAS_FONT} font...`)

    // Wait for font to be fully ready
    if (document.fonts) {
      await document.fonts.ready
    }

    for (const textEl of nameTexts) {
      const text = textEl.textContent || ''
      if (!text.trim()) continue

      let x = parseFloat(textEl.getAttribute('x') || '0')
      let y = parseFloat(textEl.getAttribute('y') || '0')
      let fontSize = parseFloat(textEl.getAttribute('font-size') || '84.15')
      const fill = textEl.getAttribute('fill') || '#000000'
      const id = textEl.getAttribute('id') || ''

      console.log(`   Processing "${text}": original pos (${x}, ${y}), fontSize=${fontSize}`)

      // Scale to canvas coordinates
      const scaledX = x * scaleX
      const scaledY = y * scaleY
      const scaledFontSize = fontSize * Math.min(scaleX, scaleY)

      // Set font - use our loaded Cinzel font with unique name
      // The font string format: [font-style] [font-weight] font-size font-family
      const fontString = `700 ${scaledFontSize}px "${CINZEL_CANVAS_FONT}", "Cinzel Decorative", Georgia, serif`
      ctx.font = fontString
      ctx.fillStyle = fill
      ctx.textBaseline = 'alphabetic'
      
      console.log(`   Setting ctx.font = "${fontString}"`)
      console.log(`   Actual ctx.font after set = "${ctx.font}"`)
      
      // Draw the text
      ctx.fillText(text, scaledX, scaledY)
      console.log(`   ✅ Drew "${text}" at (${scaledX.toFixed(0)}, ${scaledY.toFixed(0)}) with fontSize=${scaledFontSize.toFixed(0)}px, fill=${fill}`)
    }
    
    console.log('🎨 Name text rendering complete')
  }

  /**
   * Preload Google Fonts before export to ensure they're available
   */
  async function preloadFonts(): Promise<void> {
    const fontsToLoad = [
      { family: 'Cinzel Decorative', weight: '700' },
      { family: 'Playfair Display', weight: '700' },
      { family: 'Lato', weight: '400' }
    ]

    try {
      // Check if document.fonts API is available
      if ('fonts' in document) {
        for (const font of fontsToLoad) {
          try {
            await document.fonts.load(`${font.weight} 48px "${font.family}"`)
            console.log(`✅ Font preloaded: ${font.family} ${font.weight}`)
          } catch (e) {
            console.warn(`⚠️ Could not preload font: ${font.family}`, e)
          }
        }
        // Wait for all fonts to be ready
        await document.fonts.ready
        console.log('✅ All fonts ready')
      }
    } catch (error) {
      console.warn('Font preloading not supported:', error)
    }
  }

  /**
   * Embed fonts directly in SVG as base64 @font-face declarations
   * This ensures fonts work when SVG is rendered to canvas
   */
  async function embedFontsInSVG(svgElement: SVGSVGElement): Promise<void> {
    // First, try to preload fonts
    await preloadFonts()

    // Find or create defs element
    let defs = svgElement.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svgElement.insertBefore(defs, svgElement.firstChild)
    }

    // Remove existing @import styles (they don't work in canvas)
    const existingStyles = svgElement.querySelectorAll('style')
    existingStyles.forEach(style => {
      if (style.textContent?.includes('@import')) {
        style.remove()
      }
    })

    // Add embedded font-face declaration
    const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    styleElement.setAttribute('type', 'text/css')
    styleElement.textContent = `
      @font-face {
        font-family: 'Cinzel Decorative Embedded';
        font-weight: 700;
        src: url('https://fonts.gstatic.com/s/cinzeldecorative/v16/daaHSScvJGqLYhG8nNt8KPPswUAPniZoadlES.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Playfair Display';
        font-weight: 700;
        src: url('https://fonts.gstatic.com/s/playfairdisplay/v36/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vXDTbtPY_Q.woff2') format('woff2');
      }
      .name-fnt0 { 
        font-weight: 700; 
        font-family: 'Georgia', 'Times New Roman', serif;
      }
    `
    defs.insertBefore(styleElement, defs.firstChild)
  }

  /**
   * Flatten group transforms by applying them directly to child elements
   * This improves compatibility with canvas rendering which sometimes doesn't
   * handle SVG group transforms correctly
   */
  function flattenGroupTransforms(svgElement: SVGSVGElement): void {
    // Find the wedding-names-group which has transform that needs to be flattened
    const namesGroup = svgElement.querySelector('#wedding-names-group') as SVGGElement
    if (!namesGroup) return

    const transform = namesGroup.getAttribute('transform')
    if (!transform) return

    // Parse translate and scale from transform
    const translateMatch = transform.match(/translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/)
    const scaleMatch = transform.match(/scale\(\s*([-\d.]+)\s*\)/)

    if (!translateMatch) return

    const tx = parseFloat(translateMatch[1])
    const ty = parseFloat(translateMatch[2])
    const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1

    console.log(`🔄 Flattening transform: translate(${tx}, ${ty}) scale(${scale})`)

    // Apply transform to all text elements inside the group
    const textElements = namesGroup.querySelectorAll('text')
    textElements.forEach(text => {
      const x = parseFloat(text.getAttribute('x') || '0')
      const y = parseFloat(text.getAttribute('y') || '0')
      const fontSize = parseFloat(text.getAttribute('font-size') || '84.15')

      // Apply scale and translate: newX = x * scale + tx, newY = y * scale + ty
      const newX = x * scale + tx
      const newY = y * scale + ty
      const newFontSize = fontSize * scale

      text.setAttribute('x', String(newX))
      text.setAttribute('y', String(newY))
      text.setAttribute('font-size', String(newFontSize))
      
      // Mark as a name text element for later identification
      text.setAttribute('data-is-name-text', 'true')
      
      // Use Cinzel Decorative font (will be embedded as Base64)
      // The font is fetched from Google Fonts and embedded in ensureFontsEmbedded
      text.setAttribute('font-family', "'Cinzel Decorative', Georgia, serif")
      text.setAttribute('font-weight', '700')

      console.log(`   Text "${text.textContent?.substring(0, 10)}": (${x}, ${y}) → (${newX}, ${newY}), font: ${fontSize} → ${newFontSize}`)
    })

    // Move the text elements out of the group to the root level (before the group)
    const parent = namesGroup.parentElement
    if (parent) {
      // Clone text elements and add them before the group
      textElements.forEach(text => {
        const clonedText = text.cloneNode(true) as SVGTextElement
        // Ensure the marker attribute is preserved
        clonedText.setAttribute('data-is-name-text', 'true')
        parent.insertBefore(clonedText, namesGroup)
      })

      // Remove the original group (or just clear it)
      namesGroup.remove()
      console.log('✅ Group transforms flattened and elements moved to root')
    }
  }

  /**
   * Rasterize the title group to an image for reliable export
   * Complex SVGs with clip-paths, filters, and embedded images don't render well via canvas
   */
  async function rasterizeTitleGroup(titleGroup: SVGGElement, parentSvg: SVGSVGElement): Promise<{dataUrl: string, width: number, height: number, offsetX: number, offsetY: number, scale: number} | null> {
    try {
      // Get the bounding box of the title group
      const transform = titleGroup.getAttribute('transform') || ''
      
      // Parse transform to get position and scale
      let scale = 1
      const scaleMatch = transform.match(/scale\s*\(\s*([-\d.]+)\s*\)/)
      if (scaleMatch) {
        scale = parseFloat(scaleMatch[1]) || 1
      }
      
      console.log('🎨 Rasterizing title with scale:', scale)
      
      // Create a temporary SVG with just the title content
      const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      tempSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      tempSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      
      // Get the title styles from the parent SVG and include them
      const titleStyles = parentSvg.querySelector('#wedding-title-styles')
      if (titleStyles) {
        tempSvg.appendChild(titleStyles.cloneNode(true))
      }
      
      // IMPORTANT: The title group contains the defs from the original title SVG
      // These include filters, clip-paths, etc. that are needed for rendering
      // We need to extract them and put them in the temp SVG
      const titleDefs = titleGroup.querySelector('defs')
      if (titleDefs) {
        console.log('📦 Found title defs with', titleDefs.children.length, 'definitions')
        tempSvg.appendChild(titleDefs.cloneNode(true))
      }
      
      // Also copy parent SVG defs as fallback (might have additional definitions)
      const parentDefs = parentSvg.querySelector('defs')
      if (parentDefs) {
        // Merge into existing defs or create new
        let existingDefs = tempSvg.querySelector('defs')
        if (!existingDefs) {
          tempSvg.appendChild(parentDefs.cloneNode(true))
        } else {
          // Append children from parent defs to existing defs
          Array.from(parentDefs.children).forEach(child => {
            existingDefs!.appendChild(child.cloneNode(true))
          })
        }
      }
      
      // Clone the title group content WITHOUT the transform
      const titleClone = titleGroup.cloneNode(true) as SVGGElement
      titleClone.removeAttribute('transform')
      titleClone.removeAttribute('id')
      
      // Remove defs from clone since we already extracted them to the root
      const cloneDefs = titleClone.querySelector('defs')
      if (cloneDefs) {
        cloneDefs.remove()
      }
      
      tempSvg.appendChild(titleClone)
      
      // The title SVG dimensions come from the known cgwc.svg viewBox="0 0 72 36.000001"
      // Since the inner SVG element is NOT preserved during injection, we use defaults
      // Future: Could store these in a data attribute during injection for dynamic retrieval
      let viewBoxX = 0
      let viewBoxY = 0
      let viewBoxWidth = 72  // Default based on known title SVG viewBox
      let viewBoxHeight = 36
      let contentOffsetX = 0  // Actual content offset for positioning
      let contentOffsetY = 0
      
      // Try to get actual bounding box of the title content for more accurate sizing
      // This requires the element to be in the DOM
      let bboxMeasured = false
      try {
        // Temporarily add to DOM to measure
        document.body.appendChild(tempSvg)
        tempSvg.style.position = 'absolute'
        tempSvg.style.left = '-9999px'
        tempSvg.style.visibility = 'hidden'
        
        // Set initial viewBox large enough to measure content without clipping
        tempSvg.setAttribute('width', '2000')
        tempSvg.setAttribute('height', '1000')
        tempSvg.setAttribute('viewBox', '0 0 200 100')
        
        const bbox = titleClone.getBBox()
        if (bbox && bbox.width > 0 && bbox.height > 0) {
          // Store actual content offset for positioning calculation
          contentOffsetX = bbox.x
          contentOffsetY = bbox.y
          
          // Use the actual content bounds with a small padding for viewBox
          const padding = 1
          viewBoxX = Math.floor(bbox.x - padding)
          viewBoxY = Math.floor(bbox.y - padding)
          viewBoxWidth = Math.ceil(bbox.width + padding * 2)
          viewBoxHeight = Math.ceil(bbox.height + padding * 2)
          bboxMeasured = true
          console.log(`📐 BBox measured: x=${bbox.x.toFixed(2)}, y=${bbox.y.toFixed(2)}, w=${bbox.width.toFixed(2)}, h=${bbox.height.toFixed(2)}`)
          console.log(`📐 ViewBox adjusted: ${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`)
        } else {
          console.log('📐 BBox returned empty/zero dimensions')
        }
        
        document.body.removeChild(tempSvg)
      } catch (e) {
        console.log('📐 Could not measure BBox:', e)
        // Clean up if still attached
        if (tempSvg.parentNode) {
          tempSvg.parentNode.removeChild(tempSvg)
        }
      }
      
      // If BBox measurement failed, use default viewBox (covers full title SVG area)
      if (!bboxMeasured) {
        console.log('📐 Using default viewBox: 0 0 72 36')
        viewBoxX = 0
        viewBoxY = 0
        viewBoxWidth = 72
        viewBoxHeight = 36
        contentOffsetX = 0
        contentOffsetY = 0
      }
      
      console.log(`📐 Using title viewBox: ${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`)
      
      // Render at scaled size for quality (multiply by scale factor)
      const renderWidth = Math.round(viewBoxWidth * scale)
      const renderHeight = Math.round(viewBoxHeight * scale)
      
      // Update viewBox to match measured content bounds
      tempSvg.setAttribute('width', String(renderWidth))
      tempSvg.setAttribute('height', String(renderHeight))
      tempSvg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`)
      
      console.log(`📐 Title rasterization: ${renderWidth}x${renderHeight}px (scale: ${scale}, viewBox: ${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight})`)
      
      // Serialize and convert to image
      const serializer = new XMLSerializer()
      let svgString = serializer.serializeToString(tempSvg)
      
      // Ensure proper namespace
      if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
      }
      
      // Create blob URL
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      
      // Capture values for closure
      const capturedOffsetX = contentOffsetX  // Use actual content offset, not viewBox
      const capturedOffsetY = contentOffsetY
      const capturedScale = scale
      
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(svgUrl)
          console.warn('⚠️ Title rasterization timeout, using fallback')
          resolve(null)
        }, 5000)
        
        img.onload = () => {
          clearTimeout(timeout)
          try {
            const canvas = document.createElement('canvas')
            canvas.width = renderWidth
            canvas.height = renderHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
              // Clear canvas first to preserve transparency
              ctx.clearRect(0, 0, renderWidth, renderHeight)
              ctx.drawImage(img, 0, 0, renderWidth, renderHeight)
              const dataUrl = canvas.toDataURL('image/png')
              URL.revokeObjectURL(svgUrl)
              console.log('✅ Title rasterized successfully:', renderWidth, 'x', renderHeight)
              resolve({ 
                dataUrl, 
                width: renderWidth, 
                height: renderHeight,
                offsetX: capturedOffsetX,
                offsetY: capturedOffsetY,
                scale: capturedScale
              })
            } else {
              URL.revokeObjectURL(svgUrl)
              resolve(null)
            }
          } catch (e) {
            console.warn('⚠️ Title rasterization failed:', e)
            URL.revokeObjectURL(svgUrl)
            resolve(null)
          }
        }
        
        img.onerror = () => {
          clearTimeout(timeout)
          URL.revokeObjectURL(svgUrl)
          console.warn('⚠️ Title image load failed')
          resolve(null)
        }
        
        img.src = svgUrl
      })
    } catch (error) {
      console.warn('⚠️ Title rasterization error:', error)
      return null
    }
  }

  /**
   * Handle title replacement for export
   * The title is now pre-rendered as a PNG image element (id="wedding-title-replacement")
   * This function ensures original text elements are removed and the image is visible
   * @param svgElement - The cloned SVG element for export
   * @param originalSvgElement - Optional original SVG element (unused, kept for compatibility)
   */
  async function handleTitleReplacementForExport(svgElement: SVGSVGElement, originalSvgElement?: SVGSVGElement): Promise<void> {
    // Check if there's a wedding-title-replacement (could be IMAGE or G element)
    const titleReplacement = svgElement.querySelector('#wedding-title-replacement')
    
    if (titleReplacement) {
      const tagName = titleReplacement.tagName.toLowerCase()
      console.log('🎯 Found title replacement:', tagName)
      
      // If it's an IMAGE element with data URL, it's already in the best format for export!
      if (tagName === 'image') {
        const href = titleReplacement.getAttribute('href') || titleReplacement.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
        if (href?.startsWith('data:image/png')) {
          console.log('✅ Title is already a PNG data URL - perfect for export!')
        } else {
          console.log('📎 Title image href:', href?.substring(0, 100))
        }
        
        // Ensure the image element is visible
        titleReplacement.removeAttribute('style')
        titleReplacement.setAttribute('opacity', '1')
        
        // Log image position for debugging
        const x = titleReplacement.getAttribute('x')
        const y = titleReplacement.getAttribute('y')
        const width = titleReplacement.getAttribute('width')
        const height = titleReplacement.getAttribute('height')
        console.log(`📍 Title image at (${x}, ${y}) size: ${width}x${height}`)
      } else if (tagName === 'g') {
        // Handle GROUP element - the title SVG is injected as a group with embedded SVG fonts
        // The fonts are defined as <font> elements with vector glyphs - these should render correctly
        // as long as the font definitions are included in the SVG defs
        console.log('✅ Title is a group element with SVG content and embedded fonts')
        const textCount = titleReplacement.querySelectorAll('text').length
        console.log(`   Contains ${textCount} text elements`)
        
        // Ensure the group is visible
        titleReplacement.removeAttribute('style')
        titleReplacement.setAttribute('opacity', '1')
        
        // Log transform for debugging
        const transform = titleReplacement.getAttribute('transform')
        console.log(`📍 Title group transform: ${transform}`)
        
        // Ensure the embedded font definitions are in the main SVG's defs
        // The title SVG's fonts (Agraham, Campton Book) are defined as <font> elements
        const defs = svgElement.querySelector('defs')
        if (defs) {
          const fontDefs = defs.querySelectorAll('font')
          console.log(`   Found ${fontDefs.length} embedded font definitions in defs`)
        }
      }
      
      // Remove original text elements that should have been replaced by the title
      // IMPORTANT: Only remove elements that are NOT inside the title replacement group
      const originalTitleElementIds = ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text']
      
      originalTitleElementIds.forEach(id => {
        const elements = svgElement.querySelectorAll(`#${id}`)
        elements.forEach(element => {
          // Skip if this element is inside the title replacement group
          if (element.closest('#wedding-title-replacement')) {
            console.log(`  ✓ Keeping element inside title group: #${id}`)
            return
          }
          console.log(`  🗑️ Removing original element: #${id}`)
          element.remove()
        })
      })
      
      // Also remove any text elements with title-related IDs or content
      // BUT exclude text elements that are inside the wedding-title-replacement group
      const allTextElements = svgElement.querySelectorAll('text')
      allTextElements.forEach(text => {
        // CRITICAL: Skip text elements that are inside the title replacement group
        if (text.closest('#wedding-title-replacement')) {
          return // Don't remove title group text!
        }
        
        const id = text.getAttribute('id') || ''
        const content = text.textContent?.toLowerCase() || ''
        
        // Remove text elements with title-related IDs or patterns
        if (id.includes('blessing') || id.includes('occasion') || 
            id.includes('event') || id.includes('ceremony')) {
          console.log(`  🗑️ Removing title-related text by ID: ${id}`)
          text.remove()
          return
        }
        
        // Also remove by content - these are the default template texts
        const titleKeywords = ['alhamdulillahi', 'on your', 'wedding', 'ceremony', 'nikkah', 'fatiha']
        if (titleKeywords.some(keyword => content.includes(keyword))) {
          console.log(`  🗑️ Removing title-related text by content: "${content.substring(0, 30)}"`)
          text.remove()
        }
      })
      
      console.log('✅ Title replacement processed for export')
    } else {
      console.log('⚠️ No title replacement found - original text elements will be exported as-is')
    }
  }

  /**
   * Ensure fonts are embedded in SVG
   * For canvas export, hides name texts (will be drawn separately with correct font)
   */
  async function ensureFontsEmbedded(svgElement: SVGSVGElement, forCanvas: boolean = false): Promise<void> {
    // For canvas export, we hide the name texts so they can be drawn with correct font
    if (forCanvas) {
      console.log('🎨 Preparing SVG for canvas export (hiding name texts for overlay)...')
      
      // Load the Cinzel font for canvas use
      await loadCinzelFontForCanvas()

      // Remove existing @import styles (they don't work in canvas)
      const existingStyles = svgElement.querySelectorAll('style')
      existingStyles.forEach(style => {
        if (style.textContent?.includes('@import')) {
          style.remove()
        }
      })
      
      // HIDE name text elements - they will be rendered on canvas with correct font
      // We set opacity to 0 instead of removing so we can still read their positions
      const nameTexts = svgElement.querySelectorAll(
        'text.name-fnt0, text[class*="name-fnt"], text[id^="name1"], text[id^="name2"], text[id="name-separator"], text[data-is-name-text="true"]'
      )
      console.log(`   Found ${nameTexts.length} name text elements to hide`)
      nameTexts.forEach(text => {
        text.setAttribute('opacity', '0')
        text.setAttribute('data-render-on-canvas', 'true')
        console.log(`   Hidden for canvas overlay: id="${text.getAttribute('id') || 'none'}" text="${text.textContent?.substring(0, 15)}..."`)
      })
        
      // Also handle text elements inside the wedding-names-group
      const groupTexts = svgElement.querySelectorAll('#wedding-names-group text')
      groupTexts.forEach(text => {
        text.setAttribute('opacity', '0')
        text.setAttribute('data-render-on-canvas', 'true')
      })

      // Remove remaining @import styles that might cause issues
      const remainingStyles = svgElement.querySelectorAll('defs style, style')
      remainingStyles.forEach(style => {
        if (style.textContent?.includes('@import')) {
          // Remove the @import line but keep other styles
          style.textContent = style.textContent.replace(/@import[^;]+;?/g, '')
        }
      })

      // Convert remaining non-name text elements to use system fonts
      // IMPORTANT: Exclude text elements inside the wedding-title-replacement group
      // The title group has embedded SVG fonts that should be preserved
      const otherTextElements = svgElement.querySelectorAll('text:not([data-render-on-canvas]):not([id^="name"]):not(.name-fnt0):not([class*="name-fnt"]), tspan')
      otherTextElements.forEach(el => {
        // Skip text elements inside the title replacement group - they have embedded fonts
        if (el.closest('#wedding-title-replacement')) {
          return
        }
        
        const currentFont = el.getAttribute('font-family') || ''
        
        // Map known fonts to system fallbacks for non-name text
        let targetFont = 'Arial, sans-serif'
        if (currentFont.includes('Playfair')) {
          targetFont = 'Georgia, "Times New Roman", serif'
        } else if (currentFont.includes('Lato') || currentFont.includes('Montserrat')) {
          targetFont = 'Arial, Helvetica, sans-serif'
        }
        
        el.setAttribute('font-family', targetFont)
      })

      console.log('📝 SVG prepared for canvas export')
      return
    }

    // Check if fonts are already embedded
    const existingStyle = svgElement.querySelector('defs style')
    if (existingStyle && existingStyle.textContent?.includes('@import')) {
      // Fonts already embedded
      return
    }

    // Add font imports to defs (only for SVG export, not canvas)
    let defs = svgElement.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svgElement.insertBefore(defs, svgElement.firstChild)
    }

    const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    styleElement.setAttribute('type', 'text/css')
    styleElement.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&display=swap');
      
      text {
        font-family: 'Lato', 'Arial', 'Helvetica', sans-serif;
      }
      
      .serif-font {
        font-family: 'Playfair Display', 'Times New Roman', 'Georgia', serif;
      }
    `
    defs.insertBefore(styleElement, defs.firstChild)
  }

  /**
   * Convert text elements to SVG paths to preserve font styling
   * This is the only reliable way to maintain decorative fonts in canvas export
   */
  async function convertTextToPaths(svgElement: SVGSVGElement): Promise<void> {
    // Find all text elements with decorative font classes or name IDs
    // The wedding sticker names have classes like "name-fnt0" and IDs like "name1-first", "name2-first"
    const decorativeTexts = svgElement.querySelectorAll(
      'text.name-fnt0, text.name-fnt1, text[class*="name-fnt"], ' +
      'text[id^="name1"], text[id^="name2"], text[id="name-separator"], ' +
      'text[font-family*="Cinzel"], text[font-family*="Decorative"]'
    )
    
    if (decorativeTexts.length === 0) {
      console.log('No decorative name text elements found to convert')
      // Also check inside groups for nested text
      const nestedTexts = svgElement.querySelectorAll('g text')
      console.log(`Found ${nestedTexts.length} nested text elements`)
      nestedTexts.forEach((t, i) => {
        console.log(`  ${i}: id="${t.id}", class="${t.className}", text="${t.textContent?.substring(0, 20)}"`)
      })
      return
    }

    console.log(`🔤 Converting ${decorativeTexts.length} decorative text elements...`)

    for (const textEl of decorativeTexts) {
      try {
        const text = textEl.textContent || ''
        if (!text.trim()) continue

        const x = parseFloat(textEl.getAttribute('x') || '0')
        const y = parseFloat(textEl.getAttribute('y') || '0')
        const fontSize = parseFloat(textEl.getAttribute('font-size') || '84.15')
        const fill = textEl.getAttribute('fill') || '#000000'
        const id = textEl.getAttribute('id') || ''
        const className = textEl.getAttribute('class') || ''
        
        console.log(`  Converting: "${text}" (id=${id}, class=${className}, x=${x}, y=${y}, size=${fontSize})`)
        
        // Create a new text element with inline styling that will work on canvas
        const newText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        newText.setAttribute('x', String(x))
        newText.setAttribute('y', String(y))
        newText.setAttribute('font-size', String(fontSize))
        newText.setAttribute('fill', fill)
        newText.setAttribute('data-converted', 'true')
        if (id) newText.setAttribute('id', id)
        
        // Use decorative serif system fonts that closely match Cinzel Decorative
        // These fonts have the elegant, classic look suitable for wedding stickers
        // Priority: Palatino variants (most similar), then Georgia, then Times New Roman
        newText.setAttribute('font-family', '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, "Times New Roman", serif')
        newText.setAttribute('font-weight', '700')
        newText.setAttribute('letter-spacing', '0.03em')
        newText.setAttribute('font-variant', 'small-caps')
        
        // Copy other attributes
        const fontStyle = textEl.getAttribute('font-style')
        if (fontStyle) newText.setAttribute('font-style', fontStyle)
        
        const textAnchor = textEl.getAttribute('text-anchor')
        if (textAnchor) newText.setAttribute('text-anchor', textAnchor)
        
        const dominantBaseline = textEl.getAttribute('dominant-baseline')
        if (dominantBaseline) newText.setAttribute('dominant-baseline', dominantBaseline)
        
        // Preserve transform if any
        const transform = textEl.getAttribute('transform')
        if (transform) newText.setAttribute('transform', transform)
        
        newText.textContent = text
        
        // Replace original text with new styled text
        const parent = textEl.parentElement
        if (parent) {
          parent.insertBefore(newText, textEl)
          textEl.remove()
          console.log(`    ✅ Converted to Palatino serif with font-variant: small-caps`)
        }
      } catch (error) {
        console.warn('Error converting text element:', error)
      }
    }
  }

  /**
   * Serialize SVG to string with optional cleanup for canvas export
   */
  function serializeSVG(svgElement: SVGSVGElement, forCanvas: boolean = false): string {
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(svgElement)

    // Ensure the SVG has proper namespace declarations
    if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    if (!svgString.includes('xmlns:xlink') && svgString.includes('xlink:href')) {
      svgString = svgString.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
    }

    // For canvas export, do additional cleanup of any remaining problematic content
    if (forCanvas) {
      // Remove any @import statements that might have slipped through
      svgString = svgString.replace(/@import\s+url\([^)]+\)\s*;?/gi, '')
      
      // Replace web font references in CSS with system fonts
      // NOTE: Do NOT replace Agraham or Campton Book - these are embedded SVG fonts from the title SVG
      svgString = svgString.replace(/font-family:\s*['"]?Lato['"]?[^;'"}\n]*/gi, 'font-family: Arial, sans-serif')
      svgString = svgString.replace(/font-family:\s*['"]?Playfair[^;'"}\n]*/gi, 'font-family: "Times New Roman", serif')
      svgString = svgString.replace(/font-family:\s*['"]?Cinzel[^;'"}\n]*/gi, 'font-family: "Times New Roman", serif')
      svgString = svgString.replace(/font-family:\s*['"]?Montserrat[^;'"}\n]*/gi, 'font-family: Arial, sans-serif')
      svgString = svgString.replace(/font-family:\s*['"]?Great Day[^;'"}\n]*/gi, 'font-family: cursive')
      
      // Remove empty style tags that might cause issues
      // BUT preserve style blocks that contain embedded SVG font definitions (Agraham, Campton)
      svgString = svgString.replace(/<style[^>]*>\s*<\/style>/gi, '')
      
      // Note: The title SVG uses embedded SVG fonts defined as <font> elements in <defs>
      // These fonts (Agraham, Campton Book) should be preserved and will render correctly
      // Do NOT remove <font> definitions from <defs>
    }

    // Add XML declaration
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString

    return svgString
  }

  /**
   * Download file - works on both web and mobile/native platforms
   * On native platforms, saves file to device storage first, then offers share option
   */
  async function downloadFile(content: string | Blob, filename: string, mimeType: string) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })

    const lowerFilename = filename.toLowerCase()
    const isSvg = mimeType.includes('image/svg') || lowerFilename.endsWith('.svg')
    const isPdf = mimeType.includes('application/pdf') || lowerFilename.endsWith('.pdf')
    const isRasterImage =
      mimeType.startsWith('image/') && !isSvg && (lowerFilename.endsWith('.png') || lowerFilename.endsWith('.jpg') || lowerFilename.endsWith('.jpeg') || lowerFilename.endsWith('.webp'))
    
    // Check if we're on a native Capacitor platform
    const isNativePlatform = typeof (window as any).Capacitor !== 'undefined' && 
      (window as any).Capacitor.isNativePlatform && 
      (window as any).Capacitor.isNativePlatform()
    
    // Check if we're on a mobile browser
    const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    console.log('📥 Download initiated:', { filename, mimeType, isNativePlatform, isMobileBrowser })
    
    if (isNativePlatform) {
      // For native Capacitor apps, save to device storage using Filesystem
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem')
        const { Share } = await import('@capacitor/share')
        
        // Convert blob to base64 string (without data URL prefix)
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            // Remove the data URL prefix (e.g., "data:image/png;base64,")
            const base64 = result.split(',')[1] || result
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        
        // Generate unique filename with timestamp
        const timestamp = Date.now()
        const uniqueFilename = filename.replace(/(\.[^.]+)$/, `-${timestamp}$1`)

        // Save to an appropriate public folder.
        // - Raster images (png/jpg/webp): Pictures/DCIM so it appears in Gallery
        // - SVG/PDF/others: Download/Documents so user can find it in Files app
        let savedFile
        try {
          // First attempt: best-known public folder per file type
          const primaryPath = isRasterImage
            ? `Pictures/SmartDesignPro/${uniqueFilename}`
            : `Download/SmartDesignPro/${uniqueFilename}`

          savedFile = await Filesystem.writeFile({
            path: primaryPath,
            data: base64Data,
            directory: Directory.ExternalStorage,
            recursive: true
          })
          console.log('✅ File saved:', savedFile.uri)
        } catch (picturesError) {
          console.warn('Primary folder failed, trying fallback folders:', picturesError)
          try {
            // Fallback: for images, DCIM; for other files, Documents
            const fallbackPath = isRasterImage
              ? `DCIM/SmartDesignPro/${uniqueFilename}`
              : `Documents/SmartDesignPro/${uniqueFilename}`

            savedFile = await Filesystem.writeFile({
              path: fallbackPath,
              data: base64Data,
              directory: Directory.ExternalStorage,
              recursive: true
            })
            console.log('✅ File saved (fallback):', savedFile.uri)
          } catch (dcimError) {
            console.warn('Fallback folder failed, trying External:', dcimError)
            // Final fallback to External directory
            savedFile = await Filesystem.writeFile({
              path: `SmartDesignPro/${uniqueFilename}`,
              data: base64Data,
              directory: Directory.External,
              recursive: true
            })
            console.log('✅ File saved to External storage:', savedFile.uri)
          }
        }
        
        // Trigger media scanner only for raster images (Gallery)
        if (isRasterImage) {
          try {
            // @ts-ignore - Native bridge call
            if ((window as any).Capacitor?.Plugins?.MediaScanner) {
              await (window as any).Capacitor.Plugins.MediaScanner.scanFile({ path: savedFile.uri })
            }
          } catch (scanError) {
            console.log('Media scan not available, image will appear in gallery after refresh')
          }
        }
        
        const locationHint = isRasterImage
          ? 'Photos/Gallery app'
          : (isSvg || isPdf ? 'Files app (Downloads)' : 'Files app')

        // Show success alert with option to share
        const confirmShare = confirm(
          `✅ File saved successfully!\n\nFile: ${uniqueFilename}\n\nCheck your ${locationHint}.\n\nWould you like to share it?`
        )
        
        if (confirmShare) {
          await Share.share({
            title: filename,
            text: 'My wedding sticker design from SmartDesignPro',
            url: savedFile.uri,
            dialogTitle: 'Share Your Design'
          })
          console.log('✅ Design shared successfully')
        }
        
        return
      } catch (error) {
        console.error('Native save failed:', error)
        alert('❌ Failed to save design. Please check app storage permissions and try again.')
        return
      }
    }
    
    const url = URL.createObjectURL(blob)
    
    if (isMobileBrowser) {
      // For mobile browsers, try Web Share API first
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], filename, { type: mimeType })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: filename,
            })
            URL.revokeObjectURL(url)
            console.log('✅ Web Share completed')
            return
          }
        } catch (err) {
          console.log('Web Share failed, falling back to download:', err)
        }
      }
      
      // Fallback: trigger download
      triggerDownload(url, filename)
    } else {
      // Desktop download
      triggerDownload(url, filename)
    }
    
    // Clean up after delay
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
  
  function triggerDownload(url: string, filename: string) {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Export SVG as SVG file
   */
  async function exportAsSVG(
    svgElement: SVGSVGElement,
    images: SVGImage[],
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const config = { ...DEFAULT_EXPORT_OPTIONS, ...options }

    try {
      // Clone and embed images
      let exportSVG = svgElement.cloneNode(true) as SVGSVGElement

      if (config.includeImages && images.length > 0) {
        exportSVG = embedImagesInSVG(exportSVG, images)
      }

      // Convert all external images (including background) to base64
      await embedExternalImages(exportSVG)

      // Handle title replacement group - ensure original text elements are removed
      // Pass original svgElement so we can copy styles if they're missing in the clone
      await handleTitleReplacementForExport(exportSVG, svgElement)

      // Ensure fonts are embedded
      await ensureFontsEmbedded(exportSVG)

      // Serialize to string
      const svgString = serializeSVG(exportSVG)

      // Download
      downloadFile(svgString, config.filename, 'image/svg+xml')

      console.log('✅ SVG exported successfully:', config.filename)
    } catch (error) {
      console.error('❌ Failed to export SVG:', error)
      throw error
    }
  }

  /**
   * Compress a base64 data URL image to reduce size
   * Uses PNG format to preserve transparency
   */
  async function compressDataUrl(dataUrl: string, maxWidth: number = 1200, quality: number = 0.85): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Scale down if too large
        if (width > maxWidth) {
          const ratio = maxWidth / width
          width = maxWidth
          height = Math.round(height * ratio)
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(dataUrl)
          return
        }
        
        // Clear canvas to preserve transparency
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        
        // Use PNG to preserve transparency (not JPEG which has black backgrounds)
        const compressed = canvas.toDataURL('image/png')
        console.log(`📉 Compressed image: ${(dataUrl.length / 1024).toFixed(0)}KB → ${(compressed.length / 1024).toFixed(0)}KB`)
        resolve(compressed)
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    })
  }

  /**
   * Export SVG as PNG file
   */
  async function exportAsPNG(
    svgElement: SVGSVGElement,
    images: SVGImage[],
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const config = { ...DEFAULT_EXPORT_OPTIONS, ...options }

    try {
      // Clone and embed images
      let exportSVG = svgElement.cloneNode(true) as SVGSVGElement
      
      // Debug: Check if title replacement exists in ORIGINAL SVG
      const originalTitleGroup = svgElement.querySelector('#wedding-title-replacement')
      console.log('🔍 Original SVG has title replacement group:', !!originalTitleGroup)
      if (originalTitleGroup) {
        console.log('   Original transform:', originalTitleGroup.getAttribute('transform'))
        console.log('   Original children:', originalTitleGroup.children.length)
      }
      
      // Debug: Check if title replacement exists in CLONED SVG
      const clonedTitleGroup = exportSVG.querySelector('#wedding-title-replacement')
      console.log('🔍 Cloned SVG has title replacement group:', !!clonedTitleGroup)
      if (clonedTitleGroup) {
        console.log('   Cloned transform:', clonedTitleGroup.getAttribute('transform'))
        console.log('   Cloned children:', clonedTitleGroup.children.length)
      }

      if (config.includeImages && images.length > 0) {
        exportSVG = embedImagesInSVG(exportSVG, images)
      }

      // Convert all external images (including background) to base64
      // This is CRITICAL for PNG export - external URLs won't render on canvas
      await embedExternalImages(exportSVG)
      
      // Handle title replacement group - ensure original text elements are removed
      // This must be done before flattening transforms
      // Pass original svgElement so we can copy styles if they're missing in the clone
      await handleTitleReplacementForExport(exportSVG, svgElement)
      
      // Flatten group transforms for better canvas compatibility
      // Some browsers don't render SVG group transforms correctly when drawing to canvas
      flattenGroupTransforms(exportSVG)
      
      // Fix image aspect ratio - ensure user images maintain their proportions
      const userImage = exportSVG.querySelector('#userImage') as SVGImageElement
      if (userImage) {
        // Use xMidYMid meet to maintain aspect ratio without stretching
        // 'meet' ensures the entire image is visible, 'slice' would crop
        userImage.setAttribute('preserveAspectRatio', 'xMidYMid slice')
        console.log('📸 User image aspect ratio set to xMidYMid slice')

      }
      
      // For PNG export, compress embedded images to reduce SVG size
      // Large base64 images (>5MB total) can cause canvas rendering to fail
      const imageElements = exportSVG.querySelectorAll('image[href^="data:"]')
      let totalSize = 0
      imageElements.forEach(img => {
        const href = img.getAttribute('href') || ''
        totalSize += href.length
      })
      
      console.log(`📊 Total embedded image size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)
      
      // If images are too large, compress them
      if (totalSize > 3 * 1024 * 1024) { // > 3MB
        console.log('🔧 Compressing embedded images for PNG export...')
        for (const img of imageElements) {
          const href = img.getAttribute('href') || ''
          if (href.length > 500 * 1024) { // Images > 500KB
            const compressed = await compressDataUrl(href, 1500, 0.8)
            img.setAttribute('href', compressed)
          }
        }
      }

      // Ensure fonts use system fallbacks for canvas rendering
      // (external fonts via @import won't work when SVG is drawn to canvas)
      await ensureFontsEmbedded(exportSVG, true)

      // Clean up potential duplicate or orphaned text elements at the ROOT level only
      // Text elements inside groups (like wedding-names-group) may have negative/small coords
      // because they're positioned relative to their parent group's transform
      const rootTextElements = Array.from(exportSVG.children).filter(
        child => child.tagName.toLowerCase() === 'text'
      ) as SVGTextElement[]
      
      rootTextElements.forEach(textEl => {
        const x = parseFloat(textEl.getAttribute('x') || '0')
        const y = parseFloat(textEl.getAttribute('y') || '0')
        const id = textEl.getAttribute('id') || ''
        
        // Skip legitimate text elements (those with proper IDs)
        if (id && (id.includes('text') || id.includes('name') || id.includes('separator') || 
                   id.includes('blessing') || id.includes('occasion') || id.includes('event') ||
                   id.includes('ceremony') || id.includes('date') || id.includes('courtesy'))) {
          return
        }
        
        // Remove text elements at near-zero positions that don't have standard IDs
        // These are likely debugging artifacts or improperly positioned duplicates
        // Only check direct children of SVG root to avoid removing group children
        if (x < 10 && y < 50 && !id) {
          console.log(`🧹 Removing orphaned text element at (${x}, ${y}): "${textEl.textContent?.substring(0, 20)}"`)
          textEl.remove()
        }
      })

      // Check for stored export dimensions (in pixels)
      const exportWidthPx = exportSVG.getAttribute('data-export-width-px')
      const exportHeightPx = exportSVG.getAttribute('data-export-height-px')

      let canvasWidth: number
      let canvasHeight: number

      if (exportWidthPx && exportHeightPx) {
        // Use the pre-calculated pixel dimensions
        canvasWidth = parseFloat(exportWidthPx)
        canvasHeight = parseFloat(exportHeightPx)
        console.log(`📏 Using stored export dimensions: ${canvasWidth}x${canvasHeight}px`)
      } else {
        // Fallback to viewBox-based calculation
        const viewBox = exportSVG.getAttribute('viewBox')?.split(/\s+|,/).map(Number) || [0, 0, 800, 600]
        const svgWidth = viewBox[2]
        const svgHeight = viewBox[3]

        // Calculate canvas dimensions based on DPI
        const scale = config.pngResolution / 96 // 96 DPI is standard screen resolution
        canvasWidth = svgWidth * scale
        canvasHeight = svgHeight * scale
        console.log(`📏 Using viewBox dimensions: ${canvasWidth}x${canvasHeight}px (scale: ${scale})`)
      }

      // Set explicit dimensions on the SVG for proper rendering
      exportSVG.setAttribute('width', String(canvasWidth))
      exportSVG.setAttribute('height', String(canvasHeight))
      
      // CRITICAL: Ensure preserveAspectRatio matches the canvas dimensions
      // Use 'none' to prevent any scaling/fitting - we want exact pixel-to-pixel match
      exportSVG.setAttribute('preserveAspectRatio', 'none')

      // Serialize SVG with canvas-specific cleanup (removes @import, web fonts, etc.)
      const svgString = serializeSVG(exportSVG, true)
      
      const svgSizeMB = svgString.length / 1024 / 1024
      console.log('📊 SVG export size:', svgSizeMB.toFixed(2), 'MB')
      
      // Log wedding names group to verify transform is preserved
      const namesGroup = exportSVG.querySelector('#wedding-names-group')
      if (namesGroup) {
        console.log('📍 Wedding names group found:')
        console.log('   Transform:', namesGroup.getAttribute('transform'))
        console.log('   Children:', namesGroup.children.length)
        Array.from(namesGroup.querySelectorAll('text')).forEach((text, i) => {
          console.log(`   Name text ${i+1}: x="${text.getAttribute('x')}" y="${text.getAttribute('y')}" content="${text.textContent}"`)
        })
      } else {
        console.warn('⚠️ Wedding names group NOT found in export SVG!')
      }
      
      // Log title replacement group to verify it exists
      const titleGroup = exportSVG.querySelector('#wedding-title-replacement')
      if (titleGroup) {
        console.log('📍 Wedding title replacement group found:')
        console.log('   Transform:', titleGroup.getAttribute('transform'))
        console.log('   Children count:', titleGroup.children.length)
        console.log('   First child tag:', titleGroup.firstElementChild?.tagName || 'none')
      } else {
        console.warn('⚠️ Wedding title replacement group NOT found in export SVG!')
      }
      
      // Log text elements to verify names are included
      const textElements = exportSVG.querySelectorAll('text')
      console.log(`📝 Found ${textElements.length} text elements in SVG:`)
      textElements.forEach((el, i) => {
        const id = el.getAttribute('id') || 'no-id'
        const content = el.textContent?.substring(0, 30) || '(empty)'
        const parent = el.parentElement?.id || el.parentElement?.tagName || 'unknown'
        console.log(`   ${i+1}. #${id} (parent: ${parent}): "${content}"`)
      })
      
      // CRITICAL: Check if original title text elements are still present (they shouldn't be!)
      const originalTitleIds = ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text']
      originalTitleIds.forEach(id => {
        const el = exportSVG.querySelector(`#${id}`)
        if (el) {
          console.error(`❌ ORIGINAL TEXT STILL PRESENT: #${id} with content: "${el.textContent}"`)
        }
      })
      
      // For very large SVGs (>5MB), use alternative rendering approach
      // This avoids the Image element limitation with large data URLs
      if (svgSizeMB > 5) {
        console.log('📊 Large SVG detected, using direct canvas rendering...')
        await exportLargeSVGAsPNG(exportSVG, canvasWidth, canvasHeight, config.filename)
        return
      }
      
      // For large SVGs (>5MB), the base64 data URL approach may fail
      // Use Blob URL instead which handles large data better
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create image from SVG
      const img = new Image()
      img.width = canvasWidth
      img.height = canvasHeight
      
      // Important: Set crossOrigin before setting src
      img.crossOrigin = 'anonymous'

      await new Promise<void>((resolve, reject) => {
        // Set a timeout in case image loading hangs
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(svgUrl)
          console.warn('⏱️ PNG export timeout - trying alternative method...')
          // Try alternative approach for large files
          exportLargeSVGAsPNG(exportSVG, canvasWidth, canvasHeight, config.filename)
            .then(resolve)
            .catch(reject)
        }, 30000) // 30 second timeout, then try alternative

        img.onload = async () => {
          clearTimeout(timeout)
          try {
            // Create canvas
            const canvas = document.createElement('canvas')
            canvas.width = canvasWidth
            canvas.height = canvasHeight

            const ctx = canvas.getContext('2d')
            if (!ctx) {
              URL.revokeObjectURL(svgUrl)
              reject(new Error('Failed to get canvas context'))
              return
            }

            // Clear canvas to ensure transparency is preserved
            ctx.clearRect(0, 0, canvasWidth, canvasHeight)
            
            // Draw SVG on canvas (this will have wrong/fallback fonts for names)
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
            
            // Clean up blob URL
            URL.revokeObjectURL(svgUrl)
            
            // Now overlay the name texts with the correct Cinzel Decorative font
            // This renders the names properly using the loaded font
            await renderNamesOnCanvas(ctx, exportSVG, canvasWidth, canvasHeight)

            // Convert to PNG blob
            canvas.toBlob((blob) => {
              if (blob) {
                const pngFilename = config.filename.replace(/\.svg$/, '.png')
                downloadFile(blob, pngFilename, 'image/png')
                console.log('✅ PNG exported successfully:', pngFilename)
                resolve()
              } else {
                reject(new Error('Failed to create PNG blob'))
              }
            }, 'image/png')
          } catch (drawError) {
            URL.revokeObjectURL(svgUrl)
            console.error('Canvas draw error:', drawError)
            reject(new Error('Failed to draw SVG on canvas'))
          }
        }

        img.onerror = async (e) => {
          clearTimeout(timeout)
          URL.revokeObjectURL(svgUrl)
          console.error('❌ Image load error:', e)
          console.log('📊 Trying alternative PNG export method...')
          
          try {
            // Try alternative approach for large files
            await exportLargeSVGAsPNG(exportSVG, canvasWidth, canvasHeight, config.filename)
            resolve()
          } catch (altError) {
            console.error('Alternative method also failed:', altError)
            reject(new Error('Failed to export PNG - file may be too large. Try downloading as SVG instead.'))
          }
        }

        img.src = svgUrl
      })
    } catch (error) {
      console.error('❌ Failed to export PNG:', error)
      throw error
    }
  }
  
  /**
   * Alternative PNG export for large SVGs
   * Renders each element directly to canvas instead of loading entire SVG
   */
  async function exportLargeSVGAsPNG(
    svgElement: SVGSVGElement, 
    width: number, 
    height: number, 
    filename: string
  ): Promise<void> {
    console.log('🔧 Using direct canvas rendering for large SVG...')
    
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }
    
    // Get viewBox for coordinate transformation
    const viewBox = svgElement.getAttribute('viewBox')?.split(/\s+|,/).map(Number) || [0, 0, width, height]
    const scaleX = width / viewBox[2]
    const scaleY = height / viewBox[3]
    
    // Fill background if there's a rect background
    const bgRect = svgElement.querySelector('rect')
    if (bgRect) {
      const fill = bgRect.getAttribute('fill') || '#ffffff'
      if (fill && fill !== 'none') {
        ctx.fillStyle = fill
        ctx.fillRect(0, 0, width, height)
      }
    }
    
    // Draw paths (for decorative elements like waves)
    const pathElements = svgElement.querySelectorAll('path')
    for (const pathEl of pathElements) {
      const fill = pathEl.getAttribute('fill')
      if (fill && fill !== 'none') {
        ctx.fillStyle = fill
        const d = pathEl.getAttribute('d')
        if (d) {
          const path2D = new Path2D(d)
          ctx.save()
          ctx.scale(scaleX, scaleY)
          ctx.fill(path2D)
          ctx.restore()
        }
      }
    }
    
    // Draw images directly to canvas
    const imageElements = svgElement.querySelectorAll('image')
    for (const imgEl of imageElements) {
      const href = imgEl.getAttribute('href') || imgEl.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
      if (!href) continue
      
      // Get image position and size
      const x = parseFloat(imgEl.getAttribute('x') || '0') * scaleX
      const y = parseFloat(imgEl.getAttribute('y') || '0') * scaleY
      const imgWidth = parseFloat(imgEl.getAttribute('width') || '100') * scaleX
      const imgHeight = parseFloat(imgEl.getAttribute('height') || '100') * scaleY
      
      try {
        await drawImageToCanvas(ctx, href, x, y, imgWidth, imgHeight)
      } catch (imgError) {
        console.warn('Failed to draw image:', imgError)
      }
    }
    
    // Draw text elements (including those inside groups)
    await drawAllTextElements(ctx, svgElement, scaleX, scaleY)
    
    // Export as PNG
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const pngFilename = filename.replace(/\.svg$/, '.png')
          downloadFile(blob, pngFilename, 'image/png')
          console.log('✅ PNG exported via direct canvas rendering:', pngFilename)
          resolve()
        } else {
          reject(new Error('Failed to create PNG blob'))
        }
      }, 'image/png')
    })
  }
  
  /**
   * Draw all text elements including those inside groups with transforms
   */
  async function drawAllTextElements(
    ctx: CanvasRenderingContext2D, 
    svgElement: SVGSVGElement, 
    scaleX: number, 
    scaleY: number
  ): Promise<void> {
    // Load the Cinzel font first for name texts
    await loadCinzelFontForCanvas()
    
    // First draw direct text elements (not in groups)
    const directTextElements = Array.from(svgElement.querySelectorAll(':scope > text'))
    for (const textEl of directTextElements) {
      drawTextElement(ctx, textEl as SVGTextElement, 0, 0, 1, scaleX, scaleY)
    }
    
    // Then draw text elements inside groups (handling transforms)
    const groups = svgElement.querySelectorAll('g')
    for (const group of groups) {
      const transform = group.getAttribute('transform') || ''
      let translateX = 0, translateY = 0, groupScale = 1
      
      // Parse translate
      const translateMatch = transform.match(/translate\s*\(\s*([-\d.]+)\s*,?\s*([-\d.]+)?\s*\)/)
      if (translateMatch) {
        translateX = parseFloat(translateMatch[1]) || 0
        translateY = parseFloat(translateMatch[2]) || 0
      }
      
      // Parse scale
      const scaleMatch = transform.match(/scale\s*\(\s*([-\d.]+)\s*(?:,?\s*([-\d.]+))?\s*\)/)
      if (scaleMatch) {
        groupScale = parseFloat(scaleMatch[1]) || 1
      }
      
      // Draw text elements inside this group
      const textElements = group.querySelectorAll('text')
      for (const textEl of textElements) {
        drawTextElement(ctx, textEl as SVGTextElement, translateX, translateY, groupScale, scaleX, scaleY)
      }
    }
  }
  
  /**
   * Draw a single text element to canvas with proper transforms
   */
  function drawTextElement(
    ctx: CanvasRenderingContext2D,
    textEl: SVGTextElement,
    groupTranslateX: number,
    groupTranslateY: number,
    groupScale: number,
    viewBoxScaleX: number,
    viewBoxScaleY: number
  ): void {
    const localX = parseFloat(textEl.getAttribute('x') || '0')
    const localY = parseFloat(textEl.getAttribute('y') || '0')
    
    // Apply group transform then viewBox scale
    const x = (groupTranslateX + localX * groupScale) * viewBoxScaleX
    const y = (groupTranslateY + localY * groupScale) * viewBoxScaleY
    
    const fill = textEl.getAttribute('fill') || '#000000'
    const baseFontSize = parseFloat(textEl.getAttribute('font-size') || '16')
    const fontSize = baseFontSize * groupScale * viewBoxScaleX
    const fontWeight = textEl.getAttribute('font-weight') || 'normal'
    const fontFamily = textEl.getAttribute('font-family') || 'Arial, sans-serif'
    const textAnchor = textEl.getAttribute('text-anchor') || 'start'
    const textClass = textEl.getAttribute('class') || ''
    const textId = textEl.getAttribute('id') || ''
    
    // Check if this is a name text element (should use Cinzel font)
    const isNameText = textClass.includes('name-fnt') || 
                       textId.startsWith('name1') || 
                       textId.startsWith('name2') || 
                       textId === 'name-separator' ||
                       textEl.getAttribute('data-is-name-text') === 'true'
    
    let cleanFontFamily: string
    if (isNameText && cinzelFontLoaded) {
      // Use our loaded Cinzel font for name text
      cleanFontFamily = `"${CINZEL_CANVAS_FONT}", "Cinzel Decorative", Georgia, serif`
    } else {
      // Clean up font family for canvas - replace web fonts with system fonts
      cleanFontFamily = fontFamily
        .replace(/['"]?Lato['"]?/gi, 'Arial')
        .replace(/['"]?Playfair[^'"]*['"]?/gi, '"Times New Roman"')
        .replace(/['"]?Montserrat['"]?/gi, 'Arial')
        .replace(/['"]?Cinzel[^'"]*['"]?/gi, '"Times New Roman"')
    }
    
    ctx.fillStyle = fill
    ctx.font = `${fontWeight} ${fontSize}px ${cleanFontFamily}`
    ctx.textAlign = textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'right' : 'left'
    ctx.textBaseline = 'alphabetic'
    
    const text = textEl.textContent || ''
    if (text.trim()) {
      ctx.fillText(text, x, y)
      console.log(`📝 Drew text: "${text}" at (${x.toFixed(0)}, ${y.toFixed(0)}) size ${fontSize.toFixed(1)}px, font: ${cleanFontFamily.substring(0, 30)}...`)
    }
  }
  
  /**
   * Helper to draw a single image to canvas
   */
  function drawImageToCanvas(
    ctx: CanvasRenderingContext2D, 
    src: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'))
      }, 10000)
      
      img.onload = () => {
        clearTimeout(timeout)
        try {
          ctx.drawImage(img, x, y, width, height)
          resolve()
        } catch (e) {
          reject(e)
        }
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('Failed to load image'))
      }
      
      img.src = src
    })
  }

  /**
   * Export with automatic format detection
   */
  async function exportSVG(
    svgElement: SVGSVGElement,
    images: SVGImage[],
    options: Partial<ExportOptions> = {}
  ): Promise<void> {
    const config = { ...DEFAULT_EXPORT_OPTIONS, ...options }

    if (config.format === 'png') {
      await exportAsPNG(svgElement, images, options)
    } else {
      await exportAsSVG(svgElement, images, options)
    }
  }

  /**
   * Get SVG preview as data URL
   */
  async function getSVGPreviewDataUrl(
    svgElement: SVGSVGElement,
    images: SVGImage[]
  ): Promise<string> {
    try {
      // Clone and embed images
      const exportSVG = embedImagesInSVG(svgElement, images)

      // Serialize to string
      const svgString = serializeSVG(exportSVG)

      // Convert to data URL
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read blob'))
        reader.readAsDataURL(svgBlob)
      })

      return dataUrl
    } catch (error) {
      console.error('❌ Failed to get SVG preview:', error)
      throw error
    }
  }

  /**
   * Validate SVG before export
   */
  function validateSVG(svgElement: SVGSVGElement): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if SVG element exists
    if (!svgElement) {
      errors.push('SVG element not found')
      return { valid: false, errors }
    }

    // Check if SVG has viewBox
    if (!svgElement.getAttribute('viewBox')) {
      errors.push('SVG missing viewBox attribute')
    }

    // Check if SVG has content
    if (svgElement.children.length === 0) {
      errors.push('SVG has no content')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  return {
    exportSVG,
    exportAsSVG,
    exportAsPNG,
    getSVGPreviewDataUrl,
    validateSVG
  }
}

